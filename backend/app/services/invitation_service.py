"""
Invitation service for managing NPO team invitations.

Handles invitation lifecycle:
- Creating invitations with tokens
- Validating and accepting invitations
- Revoking invitations
- Automatic expiry handling
"""

import uuid
from datetime import UTC, datetime, timedelta

import jwt
from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_invitation_token, decode_token, hash_password
from app.models.invitation import Invitation, InvitationStatus
from app.models.npo_member import MemberRole, MemberStatus, NPOMember
from app.models.user import User
from app.services.audit_service import AuditService


class InvitationService:
    """Service for managing NPO invitations."""

    @staticmethod
    async def create_invitation(
        db: AsyncSession,
        npo_id: uuid.UUID,
        email: str,
        role: str,
        invited_by_user_id: uuid.UUID,
        message: str | None = None,
    ) -> Invitation:
        """
        Create a new invitation.

        Args:
            db: Database session
            npo_id: NPO UUID
            email: Email address to invite
            role: Role to assign (admin, co_admin, staff)
            invited_by_user_id: User creating the invitation
            message: Optional custom message

        Returns:
            Created Invitation

        Raises:
            HTTPException: If user is already a member or validation fails
        """
        # Validate email is not already a member
        user_stmt = select(User).where(User.email == email.lower())
        result = await db.execute(user_stmt)
        existing_user = result.scalar_one_or_none()

        if existing_user:
            # Check if already a member
            member_stmt = select(NPOMember).where(
                NPOMember.npo_id == npo_id,
                NPOMember.user_id == existing_user.id,
                NPOMember.status == MemberStatus.ACTIVE,
            )
            result = await db.execute(member_stmt)
            existing_member = result.scalar_one_or_none()

            if existing_member:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"User with email {email} is already a member of this organization",
                )

        # Check for pending invitation
        pending_stmt = select(Invitation).where(
            Invitation.npo_id == npo_id,
            Invitation.email == email.lower(),
            Invitation.status == InvitationStatus.PENDING,
        )
        result = await db.execute(pending_stmt)
        pending_invitation = result.scalar_one_or_none()

        if pending_invitation:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"An invitation is already pending for {email}",
            )

        # Create invitation (without token yet)
        invitation = Invitation(
            npo_id=npo_id,
            email=email.lower(),
            role=role,
            invited_by_user_id=invited_by_user_id,
            status=InvitationStatus.PENDING,
            expires_at=datetime.now(UTC) + timedelta(days=7),
            token_hash="temp",  # Temporary, will be updated below
        )
        db.add(invitation)
        await db.commit()
        await db.refresh(invitation)

        # Generate JWT token and hash it
        token = create_invitation_token(
            invitation_id=str(invitation.id),
            npo_id=str(npo_id),
            email=email.lower(),
        )
        invitation.token_hash = hash_password(token)
        await db.commit()

        # Store token on invitation object for API response (not persisted)
        invitation.token = token  # type: ignore[attr-defined]

        # Note: Audit logging for invitation_created will be added when email service integration is complete
        # await AuditService.log_npo_invitation_created(...)

        return invitation

    @staticmethod
    async def accept_invitation(
        db: AsyncSession,
        invitation_id: uuid.UUID,
        user_id: uuid.UUID,
    ) -> NPOMember:
        """
        Accept an invitation and create member.

        Args:
            db: Database session
            invitation_id: Invitation UUID (used as token)
            user_id: User accepting the invitation

        Returns:
            Created NPOMember

        Raises:
            HTTPException: If invitation is invalid, expired, or already used
        """
        # Get invitation
        stmt = select(Invitation).where(Invitation.id == invitation_id)
        result = await db.execute(stmt)
        invitation = result.scalar_one_or_none()

        if not invitation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Invitation not found",
            )

        # Check if expired
        if invitation.expires_at < datetime.now(UTC):
            raise HTTPException(
                status_code=status.HTTP_410_GONE,
                detail="Invitation has expired",
            )

        # Check status
        if invitation.status == InvitationStatus.ACCEPTED:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Invitation has already been accepted",
            )

        if invitation.status == InvitationStatus.REVOKED:
            raise HTTPException(
                status_code=status.HTTP_410_GONE,
                detail="Invitation has been revoked",
            )

        # Check if user is already a member
        member_stmt = select(NPOMember).where(
            NPOMember.npo_id == invitation.npo_id,
            NPOMember.user_id == user_id,
            NPOMember.status == MemberStatus.ACTIVE,
        )
        result = await db.execute(member_stmt)
        existing_member = result.scalar_one_or_none()

        if existing_member:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="You are already a member of this organization",
            )

        # Get user for audit logging
        user_stmt = select(User).where(User.id == user_id)
        user_result = await db.execute(user_stmt)
        user = user_result.scalar_one()

        # Create member
        member = NPOMember(
            npo_id=invitation.npo_id,
            user_id=user_id,
            role=MemberRole(invitation.role),
            status=MemberStatus.ACTIVE,
        )
        db.add(member)

        # Update invitation status
        invitation.status = InvitationStatus.ACCEPTED
        invitation.accepted_at = datetime.now(UTC)

        await db.commit()
        await db.refresh(member)

        # Log audit event
        await AuditService.log_npo_member_added(
            db=db,
            npo_id=invitation.npo_id,
            npo_name=invitation.npo.name,
            member_user_id=user_id,
            member_email=user.email,
            role=invitation.role,
            added_by_user_id=invitation.invited_by_user_id,
        )

        return member

    @staticmethod
    async def accept_invitation_by_token(
        db: AsyncSession,
        token: str,
        user_id: uuid.UUID,
    ) -> NPOMember:
        """
        Accept an invitation using JWT token.

        Args:
            db: Database session
            token: JWT invitation token
            user_id: User accepting the invitation

        Returns:
            Created NPOMember

        Raises:
            HTTPException: If token is invalid, expired, or invitation already used
        """
        # Decode and validate JWT token
        try:
            claims = decode_token(token)
        except (jwt.DecodeError, jwt.ExpiredSignatureError, jwt.InvalidTokenError):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Invalid or expired invitation token",
            )

        # Extract invitation ID from token
        invitation_id_str = claims.get("sub")
        if not invitation_id_str:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Invalid invitation token",
            )

        try:
            invitation_id = uuid.UUID(invitation_id_str)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Invalid invitation token",
            )

        # Use existing accept_invitation logic
        return await InvitationService.accept_invitation(
            db=db,
            invitation_id=invitation_id,
            user_id=user_id,
        )

    @staticmethod
    async def revoke_invitation(
        db: AsyncSession,
        invitation_id: uuid.UUID,
        revoked_by_user_id: uuid.UUID,
    ) -> Invitation:
        """
        Revoke a pending invitation.

        Args:
            db: Database session
            invitation_id: Invitation UUID
            revoked_by_user_id: User revoking the invitation

        Returns:
            Updated Invitation

        Raises:
            HTTPException: If invitation not found or cannot be revoked
        """
        stmt = select(Invitation).where(Invitation.id == invitation_id)
        result = await db.execute(stmt)
        invitation = result.scalar_one_or_none()

        if not invitation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Invitation not found",
            )

        if invitation.status != InvitationStatus.PENDING:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only pending invitations can be revoked",
            )

        invitation.status = InvitationStatus.REVOKED
        await db.commit()
        await db.refresh(invitation)

        # Log audit event using existing audit service method
        await AuditService.log_npo_member_removed(
            db=db,
            npo_id=invitation.npo_id,
            npo_name=invitation.npo.name,
            member_user_id=invitation.invited_user_id
            or uuid.UUID(int=0),  # Placeholder if no user yet
            member_email=invitation.email,
            removed_by_user_id=revoked_by_user_id,
            reason="Invitation revoked",
        )

        return invitation

    @staticmethod
    async def get_npo_invitations(
        db: AsyncSession,
        npo_id: uuid.UUID,
        status_filter: InvitationStatus | None = None,
    ) -> list[Invitation]:
        """
        Get all invitations for an NPO.

        Args:
            db: Database session
            npo_id: NPO UUID
            status_filter: Optional status filter

        Returns:
            List of Invitations
        """
        stmt = select(Invitation).where(Invitation.npo_id == npo_id)

        if status_filter:
            stmt = stmt.where(Invitation.status == status_filter)

        stmt = stmt.order_by(Invitation.created_at.desc())

        result = await db.execute(stmt)
        return list(result.scalars().all())
