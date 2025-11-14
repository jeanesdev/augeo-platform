"""API endpoints for auction item media management."""

import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.database import get_db
from app.middleware.auth import get_current_user, get_current_user_optional
from app.models.user import User
from app.schemas.auction_item_media import (
    MediaListResponse,
    MediaReorderRequest,
    MediaResponse,
    MediaUploadConfirmRequest,
    MediaUploadRequest,
    MediaUploadResponse,
)
from app.services.auction_item_media_service import AuctionItemMediaService

router = APIRouter()


@router.post(
    "/events/{event_id}/auction-items/{item_id}/media/upload-url",
    response_model=MediaUploadResponse,
    status_code=status.HTTP_200_OK,
    summary="Generate upload URL for auction item media",
    description="""
    Generate a pre-signed SAS URL for uploading media (image or video) to Azure Blob Storage.

    **Process:**
    1. Call this endpoint to get an upload URL
    2. Upload the file directly to Azure using the upload_url (PUT request)
    3. Call the confirm endpoint with the blob_name to finalize the upload

    **Validation:**
    - Images: JPEG, PNG, WebP | Max 10MB | 200x200 to 4000x4000 pixels
    - Videos: MP4, WebM, MOV | Max 100MB
    - Max 20 images and 5 videos per auction item

    **Permissions:** NPO Admin or Staff for their NPO's events
    """,
)
async def generate_media_upload_url(
    event_id: uuid.UUID,
    item_id: uuid.UUID,
    request: MediaUploadRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> MediaUploadResponse:
    """Generate pre-signed URL for media upload."""
    # Verify auction item belongs to event
    from sqlalchemy import select

    from app.models.auction_item import AuctionItem

    stmt = select(AuctionItem).where(AuctionItem.id == item_id, AuctionItem.event_id == event_id)
    result = await db.execute(stmt)
    auction_item = result.scalar_one_or_none()

    if not auction_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Auction item not found in this event",
        )

    # Generate upload URL
    settings = get_settings()
    media_service = AuctionItemMediaService(settings, db)

    try:
        upload_data = await media_service.generate_upload_url(
            auction_item_id=item_id,
            file_name=request.file_name,
            content_type=request.content_type,
            file_size=request.file_size,
            media_type=request.media_type,
        )
        return MediaUploadResponse(**upload_data)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post(
    "/events/{event_id}/auction-items/{item_id}/media/confirm",
    response_model=MediaResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Confirm media upload",
    description="""
    Confirm that a media file has been uploaded and save metadata to the database.

    For images, this endpoint will:
    - Download the uploaded file
    - Validate image dimensions
    - Generate thumbnails (200x200 and 800x600)
    - Save metadata with thumbnail URLs

    **Note:** This must be called after the file is uploaded to the SAS URL.

    **Permissions:** NPO Admin or Staff for their NPO's events
    """,
)
async def confirm_media_upload(
    event_id: uuid.UUID,
    item_id: uuid.UUID,
    request: MediaUploadConfirmRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> MediaResponse:
    """Confirm media upload and generate thumbnails."""
    # Verify auction item belongs to event
    from sqlalchemy import select

    from app.models.auction_item import AuctionItem

    stmt = select(AuctionItem).where(AuctionItem.id == item_id, AuctionItem.event_id == event_id)
    result = await db.execute(stmt)
    auction_item = result.scalar_one_or_none()

    if not auction_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Auction item not found in this event",
        )

    # Confirm upload and generate thumbnails
    settings = get_settings()
    media_service = AuctionItemMediaService(settings, db)

    try:
        media = await media_service.confirm_media_upload(
            auction_item_id=item_id,
            blob_name=request.blob_name,
            file_name=request.file_name,
            file_size=request.file_size,
            content_type=request.content_type,
            media_type=request.media_type,
            video_url=request.video_url,
        )
        return MediaResponse.model_validate(media)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get(
    "/events/{event_id}/auction-items/{item_id}/media",
    response_model=MediaListResponse,
    status_code=status.HTTP_200_OK,
    summary="List auction item media",
    description="""
    Get all media items for an auction item, ordered by display_order.

    **Public Access:** Anyone can view media for published items
    **Restricted Access:** NPO Admin/Staff can view media for draft items
    """,
)
async def list_media(
    event_id: uuid.UUID,
    item_id: uuid.UUID,
    current_user: User | None = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db),
) -> MediaListResponse:
    """List all media for an auction item."""
    # Verify auction item exists and belongs to event
    from sqlalchemy import select

    from app.models.auction_item import AuctionItem, AuctionItemMedia

    stmt = select(AuctionItem).where(AuctionItem.id == item_id, AuctionItem.event_id == event_id)
    result = await db.execute(stmt)
    auction_item = result.scalar_one_or_none()

    if not auction_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Auction item not found in this event",
        )

    # Check access permissions for draft items
    if auction_item.status == "draft":
        if not current_user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication required to view draft item media",
            )

    # Fetch media items
    media_stmt = (
        select(AuctionItemMedia)
        .where(AuctionItemMedia.auction_item_id == item_id)
        .order_by(AuctionItemMedia.display_order)
    )
    media_result = await db.execute(media_stmt)
    media_items = media_result.scalars().all()

    return MediaListResponse(
        items=[MediaResponse.model_validate(m) for m in media_items],
        total=len(media_items),
    )


@router.patch(
    "/events/{event_id}/auction-items/{item_id}/media/reorder",
    response_model=MediaListResponse,
    status_code=status.HTTP_200_OK,
    summary="Reorder auction item media",
    description="""
    Update the display order of media items (for drag-and-drop functionality).

    **Request Body:** List of media IDs in desired order
    **Validation:** All existing media IDs must be included

    **Permissions:** NPO Admin or Staff for their NPO's events
    """,
)
async def reorder_media(
    event_id: uuid.UUID,
    item_id: uuid.UUID,
    request: MediaReorderRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> MediaListResponse:
    """Reorder media items."""
    # Verify auction item belongs to event
    from sqlalchemy import select

    from app.models.auction_item import AuctionItem

    stmt = select(AuctionItem).where(AuctionItem.id == item_id, AuctionItem.event_id == event_id)
    result = await db.execute(stmt)
    auction_item = result.scalar_one_or_none()

    if not auction_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Auction item not found in this event",
        )

    # Reorder media
    settings = get_settings()
    media_service = AuctionItemMediaService(settings, db)

    try:
        media_items = await media_service.reorder_media(item_id, request.media_order)
        return MediaListResponse(
            items=[MediaResponse.model_validate(m) for m in media_items],
            total=len(media_items),
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete(
    "/events/{event_id}/auction-items/{item_id}/media/{media_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete auction item media",
    description="""
    Delete a media item and its associated files from Azure Blob Storage.

    For images, this will also delete:
    - Small thumbnail (200x200)
    - Large thumbnail (800x600)

    **Permissions:** NPO Admin or Staff for their NPO's events
    """,
)
async def delete_media(
    event_id: uuid.UUID,
    item_id: uuid.UUID,
    media_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    """Delete a media item."""
    # Verify auction item belongs to event
    from sqlalchemy import select

    from app.models.auction_item import AuctionItem

    stmt = select(AuctionItem).where(AuctionItem.id == item_id, AuctionItem.event_id == event_id)
    result = await db.execute(stmt)
    auction_item = result.scalar_one_or_none()

    if not auction_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Auction item not found in this event",
        )

    # Delete media
    settings = get_settings()
    media_service = AuctionItemMediaService(settings, db)

    try:
        await media_service.delete_media(item_id, media_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
