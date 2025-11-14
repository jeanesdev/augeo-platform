"""Pydantic schemas for auction item media."""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field, field_validator

from app.models.auction_item import MediaType


class MediaUploadRequest(BaseModel):
    """Schema for media upload request."""

    media_type: MediaType
    file_name: str = Field(..., min_length=1, max_length=255)
    mime_type: str = Field(..., pattern=r"^(image|video)/[a-zA-Z0-9\-\+]+$")
    file_size: int = Field(..., gt=0)
    display_order: int | None = Field(None, ge=0)
    video_url: str | None = Field(None, max_length=500)

    # Note: Cross-field validation (file_size/mime_type matching media_type)
    # is handled in the service layer for better error messages and business logic.

    model_config = {"from_attributes": True}


class MediaResponse(BaseModel):
    """Schema for media response."""

    id: UUID
    auction_item_id: UUID
    media_type: MediaType
    file_path: str
    file_name: str
    file_size: int
    mime_type: str
    display_order: int
    thumbnail_path: str | None
    video_url: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


class MediaReorderRequest(BaseModel):
    """Schema for reordering media items."""

    media_order: list[UUID] = Field(..., min_length=1, description="Ordered list of media IDs")

    @field_validator("media_order")
    @classmethod
    def validate_unique_ids(cls, v: list[UUID]) -> list[UUID]:
        """Ensure all media IDs are unique."""
        if len(v) != len(set(v)):
            raise ValueError("Duplicate media IDs found in reorder list")
        return v

    model_config = {"from_attributes": True}


class MediaListResponse(BaseModel):
    """Schema for list of media items."""

    items: list[MediaResponse]
    total: int

    model_config = {"from_attributes": True}
