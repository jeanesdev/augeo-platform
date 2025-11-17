# Data Model: Event Sponsors

**Feature**: 007-sponsors
**Date**: 2025-11-12
**Status**: Complete

## Overview

This document defines the data model for event sponsor management, including database schema, relationships, validation rules, and state transitions.

## Core Entities

### Sponsor

Represents an organization or individual providing financial or in-kind support to an event.

**Table Name**: `sponsors`

**Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique identifier |
| `event_id` | UUID | FOREIGN KEY → events.id, NOT NULL, INDEX, ON DELETE CASCADE | Event this sponsor belongs to |
| `name` | VARCHAR(200) | NOT NULL | Sponsor organization or individual name |
| `logo_url` | VARCHAR(500) | NOT NULL | Azure Blob Storage URL for full-size logo |
| `logo_blob_name` | VARCHAR(500) | NOT NULL | Azure Blob Storage blob name/path |
| `thumbnail_url` | VARCHAR(500) | NOT NULL | Azure Blob Storage URL for thumbnail (128x128) |
| `thumbnail_blob_name` | VARCHAR(500) | NOT NULL | Azure Blob Storage blob name/path for thumbnail |
| `website_url` | VARCHAR(500) | NULLABLE | Sponsor's website URL (optional) |
| `logo_size` | VARCHAR(20) | NOT NULL, DEFAULT 'large' | Display size: xsmall, small, medium, large, xlarge |
| `sponsor_level` | VARCHAR(100) | NULLABLE | Sponsor tier/level (e.g., "Gold", "Platinum") |
| `contact_name` | VARCHAR(200) | NULLABLE | Primary contact person name |
| `contact_email` | VARCHAR(200) | NULLABLE | Contact email address |
| `contact_phone` | VARCHAR(20) | NULLABLE | Contact phone number |
| `address_line1` | VARCHAR(200) | NULLABLE | Street address line 1 |
| `address_line2` | VARCHAR(200) | NULLABLE | Street address line 2 (optional) |
| `city` | VARCHAR(100) | NULLABLE | City |
| `state` | VARCHAR(100) | NULLABLE | State/province |
| `postal_code` | VARCHAR(20) | NULLABLE | ZIP/postal code |
| `country` | VARCHAR(100) | NULLABLE | Country |
| `donation_amount` | DECIMAL(12, 2) | NULLABLE | Donation/sponsorship amount (USD) |
| `notes` | TEXT | NULLABLE | Internal notes about sponsorship agreement |
| `display_order` | INTEGER | NOT NULL, DEFAULT 0 | Order for displaying sponsors (lower = higher priority) |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Record creation timestamp |
| `updated_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update timestamp |
| `created_by` | UUID | FOREIGN KEY → users.id, NOT NULL | User who created the sponsor |

**Indexes**:

- `idx_sponsors_event_id` ON (event_id) - For event sponsor queries
- `idx_sponsors_display_order` ON (event_id, display_order) - For sorted sponsor lists
- `idx_sponsors_created_by` ON (created_by) - For audit queries

**Constraints**:

- UNIQUE constraint on (event_id, name) - Prevent duplicate sponsor names per event
- CHECK (donation_amount >= 0) - Donation amount must be non-negative
- CHECK (display_order >= 0) - Display order must be non-negative
- CHECK (logo_size IN ('xsmall', 'small', 'medium', 'large', 'xlarge')) - Enum validation

**Relationships**:

- Belongs to one Event (many-to-one)
- Created by one User (many-to-one)

**Lifecycle**:

1. Created via POST /api/v1/events/{event_id}/sponsors
2. Logo uploaded to Azure Blob Storage (two-step: request URL → upload → confirm)
3. Thumbnail generated server-side at confirmation
4. Editable via PATCH /api/v1/events/{event_id}/sponsors/{sponsor_id}
5. Deletable via DELETE /api/v1/events/{event_id}/sponsors/{sponsor_id} (hard delete, cascades to logo blobs)

---

## Enums

### LogoSize

Defines the display size for sponsor logos.

**Values**:

- `xsmall` - Extra small (64px)
- `small` - Small (96px)
- `medium` - Medium (128px)
- `large` - Large (192px, default)
- `xlarge` - Extra large (256px)

**Storage**: VARCHAR(20) in database, Python Enum in backend, TypeScript union type in frontend

**Usage**: Applied as CSS class in frontend for responsive logo sizing

---

## Validation Rules

### Name

- **Required**: Yes
- **Min length**: 1 character
- **Max length**: 200 characters
- **Allowed characters**: Any Unicode (escaped for XSS in frontend)
- **Uniqueness**: Per event (case-sensitive)

### Logo Upload

- **Required**: Yes (on creation)
- **File formats**: PNG, JPEG, JPG, SVG, WebP
- **MIME types**: image/png, image/jpeg, image/jpg, image/svg+xml, image/webp
- **Max file size**: 5 MB (5,242,880 bytes)
- **Min dimensions**: 64x64 pixels (to ensure quality at xsmall size)
- **Max dimensions**: 2048x2048 pixels
- **Magic byte validation**: Yes (prevent file extension spoofing)
- **Total sponsor logos per event**: 50 MB cumulative limit

### Website URL

- **Required**: No
- **Format**: Valid HTTP/HTTPS URL
- **Max length**: 500 characters
- **Validation**: Pydantic HttpUrl type

### Logo Size

- **Required**: Yes
- **Default**: 'large'
- **Allowed values**: xsmall, small, medium, large, xlarge

### Sponsor Level

- **Required**: No
- **Max length**: 100 characters
- **Examples**: "Platinum", "Gold", "Silver", "Bronze", "Title Sponsor"

### Contact Email

- **Required**: No
- **Format**: Valid email address (RFC 5322)
- **Max length**: 200 characters
- **Validation**: Pydantic EmailStr type

### Contact Phone

- **Required**: No
- **Max length**: 20 characters
- **Format**: Free-form (international numbers vary)

### Address Fields

- **Required**: No
- **Max lengths**:
  - address_line1: 200 characters
  - address_line2: 200 characters
  - city: 100 characters
  - state: 100 characters
  - postal_code: 20 characters
  - country: 100 characters

### Donation Amount

- **Required**: No
- **Type**: Decimal (12 digits, 2 decimal places)
- **Min value**: 0.00
- **Max value**: 999,999,999.99
- **Currency**: USD (implicit, no currency field)

### Notes

- **Required**: No
- **Max length**: Unlimited (TEXT type)
- **Usage**: Internal notes, not displayed publicly

### Display Order

- **Required**: Yes
- **Default**: 0
- **Min value**: 0
- **Auto-increment**: New sponsors get max(display_order) + 1

---

## State Transitions

### Sponsor Lifecycle States

Unlike EventMedia (which has UPLOADED → SCANNED states), sponsors do not have explicit status states. The lifecycle is simpler:

1. **Creating**: POST request initiated
2. **Logo Pending Upload**: Sponsor record created, awaiting logo upload
3. **Logo Uploading**: Client uploading to Azure Blob Storage
4. **Active**: Logo upload confirmed, thumbnail generated
5. **Deleted**: Hard delete from database and blob storage

**No status field needed** - logo_url presence indicates upload completion.

---

## Relationships

### Sponsor → Event (Many-to-One)

- Foreign key: `sponsors.event_id` → `events.id`
- Cascade: ON DELETE CASCADE (deleting event deletes all sponsors)
- Indexed: Yes
- Enforced: Database level

### Sponsor → User (Created By, Many-to-One)

- Foreign key: `sponsors.created_by` → `users.id`
- Cascade: No cascade (preserve audit trail if user deleted)
- Indexed: Yes
- Enforced: Database level

### Event → Sponsor (One-to-Many)

- Relationship: Event.sponsors (SQLAlchemy relationship)
- Lazy loading: select (fetch sponsors separately when accessed)
- Order by: display_order ASC, logo_size DESC

---

## Query Patterns

### List Sponsors for Event

```sql
SELECT * FROM sponsors
WHERE event_id = :event_id
ORDER BY display_order ASC, logo_size DESC;
```

**Use case**: Display sponsors on event page
**Expected rows**: 0-50 per event
**Performance**: Indexed on (event_id, display_order)

### Get Sponsor by ID

```sql
SELECT * FROM sponsors
WHERE id = :sponsor_id AND event_id = :event_id;
```

**Use case**: Retrieve single sponsor for edit/delete
**Expected rows**: 0-1
**Performance**: Primary key lookup

### Check Duplicate Sponsor Name

```sql
SELECT COUNT(*) FROM sponsors
WHERE event_id = :event_id AND name = :name AND id != :current_sponsor_id;
```

**Use case**: Prevent duplicate sponsor names per event
**Expected rows**: 0-1
**Performance**: Index scan on (event_id, name) needed

### Calculate Total Logo Size for Event

```sql
SELECT COALESCE(SUM(file_size), 0) FROM sponsors
WHERE event_id = :event_id;
```

**Use case**: Enforce 50MB total logo limit before upload
**Expected rows**: 1 (aggregate)
**Performance**: Table scan (acceptable for low row count)

### Reorder Sponsors

```sql
UPDATE sponsors
SET display_order = :new_order, updated_at = NOW()
WHERE id = :sponsor_id AND event_id = :event_id;
```

**Use case**: Drag-and-drop reordering in frontend
**Expected updates**: 1 per sponsor moved
**Performance**: Primary key update

---

## Audit Logging

### Logged Events

All sponsor mutations are logged in the `audit_logs` table:

- **sponsor.created**: When new sponsor is added
- **sponsor.updated**: When sponsor fields are modified
- **sponsor.logo_updated**: When logo is replaced
- **sponsor.deleted**: When sponsor is removed
- **sponsor.reordered**: When display order changes

**Log Fields**:

- `user_id`: User performing action
- `event_id`: Event context
- `action`: Event type (from above)
- `entity_type`: "sponsor"
- `entity_id`: Sponsor UUID
- `metadata`: JSON with changed fields (for updates)
- `timestamp`: Action timestamp

---

## Data Integrity

### Referential Integrity

- ✅ Foreign keys enforced at database level
- ✅ Cascade delete from events to sponsors
- ✅ Orphan prevention: Cannot create sponsor for non-existent event

### Data Consistency

- ✅ Unique sponsor names per event
- ✅ Non-negative donation amounts
- ✅ Valid logo size enum values
- ✅ Timestamp auto-update on modifications (updated_at trigger)

### File Integrity

- ✅ logo_blob_name matches actual blob in Azure Storage
- ✅ thumbnail_blob_name matches actual thumbnail blob
- ✅ Orphaned blobs cleaned up on sponsor deletion
- ⚠️ Potential orphans: If upload fails after record creation (acceptable, cleaned up manually)

---

## Performance Considerations

### Indexing Strategy

1. **Primary index**: `id` (UUID, PRIMARY KEY)
2. **Event lookup**: `event_id` (most common query)
3. **Sorted listing**: `(event_id, display_order)` (composite index for ORDER BY)
4. **Audit queries**: `created_by` (for user activity tracking)

### Query Optimization

- Fetch all sponsors for event in single query (avoid N+1)
- No joins needed (embedded contact/address fields)
- Paginate if sponsor count exceeds 100 (unlikely, but supported)

### File Serving

- Serve logos via Azure CDN (already configured)
- Use SAS URLs with 24-hour expiry for read access
- Lazy load thumbnails in frontend (IntersectionObserver)

---

## Migration Plan

### Alembic Migration

**File**: `alembic/versions/XXXX_add_sponsors_table.py`

**Upgrade**:

```python
def upgrade() -> None:
    op.create_table(
        'sponsors',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('event_id', sa.UUID(), nullable=False),
        sa.Column('name', sa.String(length=200), nullable=False),
        sa.Column('logo_url', sa.String(length=500), nullable=False),
        sa.Column('logo_blob_name', sa.String(length=500), nullable=False),
        sa.Column('thumbnail_url', sa.String(length=500), nullable=False),
        sa.Column('thumbnail_blob_name', sa.String(length=500), nullable=False),
        sa.Column('website_url', sa.String(length=500), nullable=True),
        sa.Column('logo_size', sa.String(length=20), nullable=False, server_default='large'),
        sa.Column('sponsor_level', sa.String(length=100), nullable=True),
        sa.Column('contact_name', sa.String(length=200), nullable=True),
        sa.Column('contact_email', sa.String(length=200), nullable=True),
        sa.Column('contact_phone', sa.String(length=20), nullable=True),
        sa.Column('address_line1', sa.String(length=200), nullable=True),
        sa.Column('address_line2', sa.String(length=200), nullable=True),
        sa.Column('city', sa.String(length=100), nullable=True),
        sa.Column('state', sa.String(length=100), nullable=True),
        sa.Column('postal_code', sa.String(length=20), nullable=True),
        sa.Column('country', sa.String(length=100), nullable=True),
        sa.Column('donation_amount', sa.Numeric(precision=12, scale=2), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('display_order', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('created_at', sa.TIMESTAMP(), nullable=False, server_default=sa.text('NOW()')),
        sa.Column('updated_at', sa.TIMESTAMP(), nullable=False, server_default=sa.text('NOW()')),
        sa.Column('created_by', sa.UUID(), nullable=False),
        sa.ForeignKeyConstraint(['event_id'], ['events.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['created_by'], ['users.id']),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('event_id', 'name', name='uq_sponsor_name_per_event'),
        sa.CheckConstraint('donation_amount >= 0', name='ck_donation_nonnegative'),
        sa.CheckConstraint('display_order >= 0', name='ck_display_order_nonnegative'),
        sa.CheckConstraint(
            "logo_size IN ('xsmall', 'small', 'medium', 'large', 'xlarge')",
            name='ck_logo_size_enum'
        ),
    )

    # Create indexes
    op.create_index('idx_sponsors_event_id', 'sponsors', ['event_id'])
    op.create_index('idx_sponsors_display_order', 'sponsors', ['event_id', 'display_order'])
    op.create_index('idx_sponsors_created_by', 'sponsors', ['created_by'])
```

**Downgrade**:

```python
def downgrade() -> None:
    op.drop_index('idx_sponsors_created_by', table_name='sponsors')
    op.drop_index('idx_sponsors_display_order', table_name='sponsors')
    op.drop_index('idx_sponsors_event_id', table_name='sponsors')
    op.drop_table('sponsors')
```

---

## TypeScript Types

### Frontend Data Model

```typescript
export enum LogoSize {
  XSMALL = 'xsmall',
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
  XLARGE = 'xlarge',
}

export interface Sponsor {
  id: string;
  event_id: string;
  name: string;
  logo_url: string;
  logo_blob_name: string;
  thumbnail_url: string;
  thumbnail_blob_name: string;
  website_url?: string;
  logo_size: LogoSize;
  sponsor_level?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  donation_amount?: number;
  notes?: string;
  display_order: number;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface SponsorCreateRequest {
  name: string;
  logo_file: File;
  website_url?: string;
  logo_size?: LogoSize;
  sponsor_level?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  donation_amount?: number;
  notes?: string;
}

export interface SponsorUpdateRequest {
  name?: string;
  logo_file?: File;
  website_url?: string | null;
  logo_size?: LogoSize;
  sponsor_level?: string | null;
  contact_name?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  address_line1?: string | null;
  address_line2?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  country?: string | null;
  donation_amount?: number | null;
  notes?: string | null;
}

export interface SponsorLogoUploadRequest {
  file_name: string;
  file_type: string;
  file_size: number;
}

export interface SponsorLogoUploadResponse {
  upload_url: string;
  sponsor_id: string;
  expires_at: string;
}

export interface ReorderSponsorsRequest {
  sponsor_ids: string[];
}
```

---

## Summary

This data model provides:

- ✅ Single table design with embedded contact/address (no unnecessary joins)
- ✅ Logo storage in Azure Blob Storage with thumbnail generation
- ✅ Comprehensive validation rules aligned with feature spec
- ✅ Efficient indexing for common query patterns
- ✅ Audit trail integration
- ✅ Type safety in both backend (Pydantic) and frontend (TypeScript)
- ✅ Referential integrity with cascading deletes
- ✅ Display ordering with manual and automatic sorting
- ✅ Scalable to 50 sponsors per event with <1 second list render
