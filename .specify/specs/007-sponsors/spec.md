# Feature Specification: Event Sponsors

**Feature Branch**: `007-sponsors`
**Created**: 2025-11-12
**Status**: Draft
**Input**: User description: "I need backend and front end support for adding sponsors to an event. The sponsor should include name and logo, optional fields include website, an enum for logo size (xsmall,small,medium,large (default),xlarge), a text field for sponsor level, sponsor contact name, email, phone number, and address (street address 1, street address 2, city, State, Zip County), donation ammount, and notes. From the front ends, there needs to be a tab on the event for adding sponsors. the list of sponsors shoudl include a thumbnail of the logo."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Add Basic Sponsor Information (Priority: P1)

Event organizers need to add sponsors to their events with essential information (name and logo) to acknowledge financial support and meet sponsorship agreement requirements.

**Why this priority**: This is the core functionality that delivers immediate value - the ability to track and display sponsors. Without this, no sponsor management is possible.

**Independent Test**: Can be fully tested by creating an event, adding a sponsor with name and logo, and verifying the sponsor appears in the event's sponsor list with thumbnail.

**Acceptance Scenarios**:

1. **Given** an event organizer is viewing their event, **When** they navigate to the Sponsors tab, **Then** they see an interface to add new sponsors
2. **Given** an organizer is adding a sponsor, **When** they provide a sponsor name and upload a logo, **Then** the sponsor is saved and appears in the sponsor list
3. **Given** a sponsor list exists, **When** the organizer views it, **Then** each sponsor displays with a thumbnail of their logo and name
4. **Given** an organizer uploads a logo file, **When** the file is larger than 5MB, **Then** the system displays an error message requesting a smaller file
5. **Given** an organizer uploads a logo, **When** the file format is not an image (PNG, JPG, JPEG, SVG, WebP), **Then** the system rejects the file with a descriptive error

---

### User Story 2 - Configure Sponsor Display Preferences (Priority: P2)

Event organizers need to control how sponsor logos are displayed (size, level/tier) to meet sponsorship tier agreements and maintain consistent event branding.

**Why this priority**: Once basic sponsor tracking exists, organizers need to differentiate between sponsor tiers visually, which is often contractually required.

**Independent Test**: Can be tested by adding a sponsor and setting logo size to different values (xsmall through xlarge), then verifying the display reflects the chosen size. Can verify sponsor level text displays correctly.

**Acceptance Scenarios**:

1. **Given** an organizer is adding a sponsor, **When** they select a logo size (xsmall, small, medium, large, xlarge), **Then** the sponsor logo displays at the appropriate size
2. **Given** a sponsor has no logo size specified, **When** viewing the sponsor, **Then** the logo displays at large size (default)
3. **Given** an organizer is adding a sponsor, **When** they enter a sponsor level (e.g., "Gold", "Platinum", "Title Sponsor"), **Then** the level text appears alongside the sponsor information
4. **Given** multiple sponsors exist with different sizes, **When** viewing the sponsor list, **Then** sponsors are displayed in order with larger logos more prominent

---

### User Story 3 - Add Sponsor Contact Information (Priority: P3)

Event organizers need to store sponsor contact details (contact name, email, phone, address) for communication, follow-up, and reporting purposes.

**Why this priority**: While important for relationship management, this information is primarily for internal use and doesn't affect public sponsor display, making it lower priority than visible sponsor acknowledgment.

**Independent Test**: Can be tested by adding a sponsor with complete contact information and verifying all fields are saved and retrievable.

**Acceptance Scenarios**:

1. **Given** an organizer is adding a sponsor, **When** they provide contact information (name, email, phone), **Then** the information is saved with the sponsor record
2. **Given** an organizer is adding a sponsor, **When** they provide an address (street address 1, street address 2, city, state, zip, country), **Then** all address fields are saved
3. **Given** a sponsor has contact information, **When** the organizer views sponsor details, **Then** all contact information is displayed for reference
4. **Given** an organizer enters an invalid email format, **When** saving the sponsor, **Then** the system displays a validation error

---

### User Story 4 - Track Sponsor Financial Information (Priority: P3)

Event organizers need to record donation amounts and notes about sponsor agreements for financial tracking and reporting purposes.

**Why this priority**: Financial tracking is important for internal records but doesn't affect the public-facing sponsor display, making it a lower priority feature.

**Independent Test**: Can be tested by adding a sponsor with donation amount and notes, then verifying both fields are saved and viewable.

**Acceptance Scenarios**:

1. **Given** an organizer is adding a sponsor, **When** they enter a donation amount, **Then** the amount is saved with the sponsor record
2. **Given** an organizer is adding a sponsor, **When** they enter notes about the sponsorship agreement, **Then** the notes are saved and viewable in sponsor details
3. **Given** multiple sponsors exist, **When** viewing a financial summary, **Then** total sponsorship amounts are calculated correctly
4. **Given** a sponsor has a donation amount entered, **When** viewing the amount, **Then** it displays in currency format with two decimal places

---

### User Story 5 - Link Sponsors to External Resources (Priority: P4)

Event organizers and attendees need the ability to link sponsor logos to sponsor websites, allowing attendees to learn more about supporting organizations.

**Why this priority**: While useful for sponsor visibility, this is an enhancement to the core sponsor display functionality and can be added after basic sponsor management is working.

**Independent Test**: Can be tested by adding a sponsor with a website URL, then verifying clicking the sponsor logo or name navigates to the website.

**Acceptance Scenarios**:

1. **Given** an organizer is adding a sponsor, **When** they provide a website URL, **Then** the URL is saved with the sponsor record
2. **Given** a sponsor has a website URL, **When** a user clicks the sponsor logo or name, **Then** the website opens in a new browser tab
3. **Given** an organizer enters an invalid URL format, **When** saving the sponsor, **Then** the system displays a validation error
4. **Given** a sponsor has no website URL, **When** viewing the sponsor, **Then** the logo and name are displayed without a clickable link

---

### User Story 6 - Edit and Remove Sponsors (Priority: P2)

Event organizers need to update sponsor information or remove sponsors when sponsorship agreements change or need correction.

**Why this priority**: Editing capability is essential for maintaining accurate sponsor information as agreements evolve, making it nearly as important as the initial add functionality.

**Independent Test**: Can be tested by creating a sponsor, editing any field, and verifying changes persist. Can test deletion by removing a sponsor and confirming it no longer appears.

**Acceptance Scenarios**:

1. **Given** a sponsor exists, **When** an organizer edits any sponsor field, **Then** the updated information is saved and displayed
2. **Given** a sponsor exists, **When** an organizer deletes the sponsor, **Then** the sponsor is removed from the event's sponsor list
3. **Given** an organizer attempts to delete a sponsor, **When** they confirm the deletion, **Then** the sponsor and associated logo file are removed
4. **Given** a sponsor logo needs updating, **When** an organizer uploads a new logo, **Then** the old logo is replaced and no longer accessible

---

### Edge Cases

- What happens when an organizer uploads an extremely large logo file (e.g., 10MB+)?
- How does the system handle sponsors with no logo uploaded?
- What happens if an organizer tries to add duplicate sponsor names to the same event?
- How does the system display sponsors when mixing different logo sizes in the list?
- What happens when a sponsor logo fails to load or is deleted from storage?
- How does the system handle special characters or very long sponsor names?
- What happens when an event has no sponsors added?
- How does the system validate country codes for international sponsor addresses?
- What happens if an organizer uploads a logo in an unsupported format?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow event organizers to add sponsors to their events with a sponsor name (required, maximum 200 characters)
- **FR-002**: System MUST allow event organizers to upload a logo image file for each sponsor (required, supported formats: PNG, JPG, JPEG, SVG, WebP, maximum 5MB)
- **FR-003**: System MUST store uploaded sponsor logos securely and generate accessible URLs for display
- **FR-004**: System MUST allow event organizers to optionally specify a website URL for each sponsor (validated URL format)
- **FR-005**: System MUST allow event organizers to select a logo size from predefined options: xsmall, small, medium, large (default), xlarge
- **FR-006**: System MUST allow event organizers to optionally specify a sponsor level/tier as free-form text (maximum 100 characters, e.g., "Gold", "Platinum", "Title Sponsor")
- **FR-007**: System MUST allow event organizers to optionally record sponsor contact information including: contact name (maximum 200 characters), email address (validated email format), phone number (maximum 20 characters), and notes (maximum 2000 characters)
- **FR-008**: System MUST allow event organizers to optionally record sponsor address information including: street address line 1 (maximum 200 characters), street address line 2 (maximum 200 characters), city (maximum 100 characters), state/province (maximum 100 characters), postal/zip code (maximum 20 characters), and country (maximum 100 characters)
- **FR-009**: System MUST allow event organizers to optionally record sponsor donation amount as a decimal value with two decimal places
- **FR-010**: System MUST display a list of sponsors for each event showing thumbnail logo images and sponsor names
- **FR-011**: System MUST provide a dedicated Sponsors tab/section within the event management interface
- **FR-012**: System MUST allow event organizers to edit existing sponsor information including replacing logo images
- **FR-013**: System MUST allow event organizers to delete sponsors from events, removing both the sponsor record and associated logo file from storage
- **FR-014**: System MUST validate image file uploads to ensure they meet size and format requirements before accepting
- **FR-015**: System MUST generate thumbnail versions of sponsor logos for display in sponsor lists
- **FR-016**: System MUST display sponsor logos at the size specified by the logo size setting when rendering event sponsor information
- **FR-017**: System MUST ensure sponsor data is isolated per event (sponsors added to one event do not appear on other events)
- **FR-018**: System MUST restrict sponsor management operations to users with appropriate event permissions (event organizer, NPO admin for the event's NPO)
- **FR-019**: System MUST display sponsors in a visually organized manner, grouping or ordering by logo size when multiple sponsors exist
- **FR-020**: System MUST make sponsor logos clickable links to sponsor websites when a website URL is provided

### Key Entities

- **Sponsor**: Represents an organization or individual providing financial or in-kind support to an event
  - Required attributes: name, logo image file
  - Optional attributes: website URL, logo display size (with default), sponsor level/tier text, contact name, contact email, contact phone, contact address (multi-line with street, city, state, postal code, country), donation amount, internal notes
  - Relationships: Belongs to one event, associated with one logo image file in storage
  - Lifecycle: Created by event organizers, editable by event organizers, deletable (hard delete including logo file)

- **Sponsor Logo Image**: The uploaded image file representing a sponsor's brand
  - Attributes: file name, file URL, file size, file format, upload timestamp
  - Relationships: Belongs to one sponsor
  - Storage: Persisted in blob storage (e.g., Azure Blob Storage based on project infrastructure)
  - Lifecycle: Uploaded during sponsor creation, replaceable during sponsor edit, deleted when sponsor is deleted

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Event organizers can add a sponsor with name and logo in under 2 minutes
- **SC-002**: Sponsor list displays all sponsors for an event with thumbnail logos loading in under 1 second
- **SC-003**: 95% of sponsor logo uploads complete successfully on first attempt
- **SC-004**: Event organizers can edit or remove sponsors without errors or data loss
- **SC-005**: System correctly enforces file size limits (5MB) and rejects oversized uploads with clear error messages
- **SC-006**: Sponsor logos display at the correct visual size based on the selected size setting (xsmall through xlarge)
- **SC-007**: 100% of sponsor data is isolated per event with no cross-event sponsor visibility
- **SC-008**: Contact information validation catches invalid email formats with 100% accuracy
- **SC-009**: Event organizers can view and manage up to 50 sponsors per event without performance degradation
- **SC-010**: Deleted sponsors and their logo files are completely removed from storage within 5 minutes

## Assumptions

- The existing event management interface already has a tab-based navigation system where a new "Sponsors" tab can be added
- The project's existing Azure Blob Storage infrastructure (referenced in .github/copilot-instructions.md) will be used for storing sponsor logo images
- Existing authentication and authorization systems will handle sponsor management permissions (event organizers and NPO admins can manage sponsors)
- Logo thumbnail generation will use existing image processing capabilities or standard libraries
- Sponsor display will be part of the public event view, allowing event attendees to see sponsor acknowledgments
- Currency for donation amounts will default to USD (no multi-currency support specified)
- Country field for addresses accepts free-form text (no country code validation specified, but this may be enhanced later)
- Sponsors are specific to individual events and not shared across multiple events (no sponsor library or reusable sponsor concept)
- The frontend already has established patterns for forms, file uploads, and list displays that can be extended for sponsor management

## Out of Scope

- Sponsor reporting or analytics dashboards
- Automated sponsor invoicing or payment processing
- Sponsor portal for self-service sponsor profile management
- Multi-event sponsor packages or contracts
- Sponsor advertisement or promotional content management beyond logo and basic information
- Integration with external CRM or donor management systems
- Sponsor benefit tracking or fulfillment workflows
- Email communication tools specifically for sponsor outreach
- Sponsor search or filtering across multiple events
