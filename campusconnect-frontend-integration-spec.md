# CampusConnect — Frontend Integration Specification

Status: finalized, no implementation code yet.
Companion document to `campusconnect-backend-design.md` — that file is the API/schema source of truth; this file maps every screen and interaction to it. Organized by the same three phases so the frontend and backend teams stay in lockstep: don't build a Phase 2 screen before the Phase 2 endpoint exists, and vice versa.

---

## 0. Conventions used throughout this document

**API responses** always arrive as:
```json
{ "success": true, "data": { }, "pagination"?: { "page": 1, "limit": 20, "total": 84, "totalPages": 5 } }
```
or on failure:
```json
{ "success": false, "message": "Human-readable summary", "errors"?: [{ "field": "images", "message": "..." }] }
```
Every "Frontend Failure" behavior below assumes: show `message` in a toast by default; if `errors[]` is present, map each to its field for inline display instead.

**Auth header:** every request (except `GET /health` and the Clerk webhook, which the frontend never calls) sends `Authorization: Bearer <clerk_session_token>`, attached automatically by a shared API client — not repeated per-feature below.

**Status codes → generic frontend handling**, so it isn't repeated on every feature:
- `401` → force sign-out, redirect to Sign In (token expired/invalid)
- `403` → toast "You don't have permission to do that" + redirect back
- `404` → dedicated not-found state on the page, not a toast
- `429` → toast "You're doing that too much — try again in a bit"
- `500` → toast "Something went wrong, please try again" + retry affordance

---

## 1. Shared components (build once, reuse everywhere)

| Component | Used by | Behavior |
|---|---|---|
| `ProtectedRoute` | every page except Sign In/Sign Up | Redirects to Sign In if unauthenticated; redirects to Complete Profile if `phone` is null; redirects away from `/admin/*` if `role !== 'admin'` |
| `LoadingSkeleton` | every list/detail page | Shown while the initial fetch is in flight |
| `EmptyState` | Browse, My Listings, My Requests, Notifications | Illustration + message + optional CTA, distinct from a loading or error state |
| `ErrorState` | every fetch | Message + "Retry" button that re-fires the query |
| `ConfirmDialog` | Delete Listing, Cancel Request, Reject Request, Suspend User, Remove Item | Generic yes/no dialog with a customizable warning message |
| `Toast` system | every mutation | Success (green) / error (red) / info (neutral), auto-dismiss ~4s |
| `RequestStatusBadge` | Item cards, Request cards, Request Detail | Maps `BorrowRequest.status` → color + label (`pending`=amber, `countered`=amber, `approved`=blue, `active`=blue, `return_pending`=blue, `completed`=green, `rejected`/`cancelled`=gray) |
| `ImageUploader` | Create/Edit Listing, Edit Profile | Calls `POST /api/uploads/sign`, uploads directly to Cloudinary client-side, returns the resulting URL(s) to the parent form |

---

## 2. Feature specifications — Phase 1

### 2.1 Sign Up / Log In
**Page:** Auth
**Components:** Clerk `<SignIn />`, Clerk `<SignUp />`, helper text ("Use your college email address")
**API:** None directly — Clerk owns the auth flow client-side. Backend sync happens via `POST /api/webhooks/clerk`, which the frontend never calls.
**Request / Response:** N/A
**Frontend Success:** On Clerk redirect, call `GET /api/users/me`. If `phone` is null → Complete Profile. Else → Browse Items.
**Frontend Failure:** Clerk renders its own inline errors (e.g. non-college email domain rejected at sign-up).
**Loading states:** Clerk's built-in loading state.
**Validation rules:** Email domain restriction enforced by Clerk configuration, not custom frontend code.
**Roles:** Public (unauthenticated).
**Navigation flow:** → Complete Profile (first time) or → Browse Items.

---

### 2.2 Complete Profile
**Page:** Complete Profile (onboarding gate, shown once)
**Components:** Full Name input (prefilled from Clerk), Phone input, Continue button
**API:** `PATCH /api/users/me`
**Request:**
```json
{ "phone": "+919876543210" }
```
**Response `200`:**
```json
{ "success": true, "data": { "id": "...", "fullName": "...", "phone": "+919876543210", "email": "...", "role": "student" } }
```
**Frontend Success:** Redirect to Browse Items.
**Frontend Failure:** Inline error under the Phone field from `errors[]`; toast for anything else.
**Loading states:** Continue button spinner, form disabled while submitting.
**Validation rules:** Phone required, 10–15 digits with optional `+` prefix.
**Roles:** Any authenticated user with an incomplete profile.
**Navigation flow:** → Browse Items.

---

### 2.3 Edit Profile / Settings
**Page:** My Profile → Settings
**Components:** Full Name input, Phone input, Profile Image (`ImageUploader`), Save button
**API:** `PATCH /api/users/me`
**Request:**
```json
{ "fullName"?: string, "phone"?: string, "profileImageUrl"?: string }
```
**Response `200`:** updated `User` object.
**Frontend Success:** Toast "Profile updated."; fields reflect saved values.
**Frontend Failure:** Field-level errors inline; toast otherwise.
**Loading states:** Save button spinner.
**Validation rules:** Same as Complete Profile; `fullName` 2–50 chars if provided.
**Roles:** Authenticated (self only — there's no endpoint to edit anyone else).
**Navigation flow:** Stays on page.

---

### 2.4 Browse & Filter Items
**Page:** Home / Browse Items
**Components:** Search input (debounced), Category filter dropdown, Condition filter, "Available only" toggle, Sort dropdown (`newest`/`oldest`), Item Card grid, Pagination controls, `EmptyState`, `LoadingSkeleton`, persistent "+ List an item" button
**API:** `GET /api/items`
**Request:** query params — `category?, condition?, search?, availableOnly?, page, limit, sort`
**Response `200`:**
```json
{
  "success": true,
  "data": [{
    "id": "...", "title": "Scientific Calculator (Casio fx-991ES)",
    "condition": "like_new", "images": ["https://res.cloudinary.com/.../calc1.jpg"],
    "totalQuantity": 3, "availableQuantity": 1,
    "category": { "id": "...", "name": "Electronics", "iconName": "calculator" },
    "owner": { "id": "...", "fullName": "Aditi Sharma", "ratingAsLender": { "average": 4.8, "count": 12 } }
  }],
  "pagination": { "page": 1, "limit": 20, "total": 84, "totalPages": 5 }
}
```
**Frontend Success:** Render grid; sync filters to URL query params so results are shareable/bookmarkable.
**Frontend Failure:** `ErrorState` with retry; empty result set shows `EmptyState` ("No items match your filters"), distinct from a genuinely empty catalog.
**Loading states:** Skeleton cards on first load; subtle inline spinner on filter change (don't blank the whole grid).
**Validation rules:** N/A (read-only).
**Roles:** Any authenticated student.
**Navigation flow:** Card click → Item Details. "+ List an item" → Create Listing.

---

### 2.5 View Item Details
**Page:** Item Details
**Components:** Image carousel, Title/description, Condition badge, Category chip, Owner mini-profile (photo, name, rating, link), Availability indicator ("1 of 3 available" or "Currently fully booked — you can still request"), Borrow button, Report button *(added Phase 2)*
**API:** `GET /api/items/:id`
**Response `200`:** full `Item` + owner summary. `404` if not found or `status:'removed'`.
**Frontend Success:** Render page.
**Frontend Failure:** `404` → "This listing is no longer available" + link back to Browse.
**Loading states:** Skeleton.
**Validation rules:** N/A.
**Roles:** Any authenticated student. Borrow button is hidden entirely if the viewer is the item's owner.
**Navigation flow:** Owner name/photo → their public Profile. Borrow button → Borrow Request Modal.

---

### 2.6 Send Borrow Request
**Page:** Item Details
**Components:** Borrow Button, Borrow Request Modal, Duration Input (days), Start Date Input (optional), Optional Message Input, Submit Button
**API:** `POST /api/items/:itemId/requests`
**Request:**
```json
{ "requestedDurationDays": 3, "requestedStartDate": "2026-07-12", "message": "Need it for tomorrow's exam" }
```
**Response `201`:**
```json
{ "success": true, "data": { "id": "...", "status": "pending", "requestedDurationDays": 3, "itemId": "...", "createdAt": "..." } }
```
**Frontend Success:** Close modal, toast "Request sent", Item Details' Borrow button becomes "Request pending."
**Frontend Failure:** Keep modal open, show inline error — most commonly `409` ("You already have an open request for this item") or `400` (duration exceeds the item's cap).
**Loading states:** Submit button spinner, inputs disabled.
**Validation rules:** `requestedDurationDays` required, integer > 0, and ≤ `item.maxDurationDays` if the item has one set (show the cap in the form's helper text). Message ≤ 300 chars, optional.
**Roles:** Authenticated, complete profile, not suspended. Not shown to the item's own owner.
**Navigation flow:** Stays on Item Details, or offers a "View request" link to Request Detail.

---

### 2.7 Create Listing
**Page:** Create Listing
**Components:** Title input, Description textarea, Category select (populated from `GET /api/categories`), Condition select, Quantity stepper, Max Duration input (optional), `ImageUploader` (1–6 images required), Submit button
**API:** `POST /api/uploads/sign` (per image) then `POST /api/items`
**Request (`POST /api/items`):**
```json
{
  "title": "Scientific Calculator (Casio fx-991ES)",
  "description": "Barely used, works perfectly.",
  "categoryId": "...", "condition": "like_new",
  "images": ["https://res.cloudinary.com/.../calc1.jpg"],
  "totalQuantity": 3, "maxDurationDays": 14
}
```
**Response `201`:** created `Item`, `availableQuantity = totalQuantity`, `status:'active'`.
**Frontend Success:** Toast "Listing created", redirect to My Listings.
**Frontend Failure:** Field-level errors (e.g. "At least one image is required"); toast for network/upload failures.
**Loading states:** Per-image upload progress bar; Submit button spinner; form disabled while any image is uploading.
**Validation rules:** Title 3–100 chars · description 10–1000 chars · category required · condition required · images.length 1–6 · totalQuantity integer ≥ 1 · maxDurationDays optional, integer > 0 if set.
**Roles:** Authenticated with a complete profile (phone set).
**Navigation flow:** → My Listings.

---

### 2.8 Edit Listing
**Page:** Edit Listing (same form as Create, pre-filled)
**Components:** Same as Create Listing, plus a secondary "Deactivate listing" action
**API:** `PATCH /api/items/:id`
**Request:** any subset of the create fields.
**Response `200`:** updated `Item`.
**Frontend Success:** Toast "Listing updated", redirect to My Listings.
**Frontend Failure:** Inline error if `totalQuantity` is reduced below the number currently on loan (backend returns `400` with a clear message — surface it as-is).
**Loading states:** Save button spinner.
**Validation rules:** Same as Create Listing.
**Roles:** Owner only.
**Navigation flow:** → My Listings.

---

### 2.9 Delete / Deactivate Listing
**Page:** My Listings (inline action) or Edit Listing
**Components:** "Remove listing" button, `ConfirmDialog` ("This hides it from Browse. Existing requests are unaffected.")
**API:** `DELETE /api/items/:id`
**Response:** `204`, no body.
**Frontend Success:** Remove card from My Listings, toast "Listing removed."
**Frontend Failure:** Toast with error message; item stays in the list.
**Loading states:** Spinner inside the confirm dialog's action button.
**Validation rules:** Confirmation required before the request fires.
**Roles:** Owner or admin.
**Navigation flow:** Stays on My Listings.

---

### 2.10 View My Listings
**Page:** My Listings
**Components:** Status filter tabs, Listing Card (with `pendingRequestsCount` badge), `EmptyState` ("You haven't listed anything yet" + CTA), "+ New Listing" button
**API:** `GET /api/items/mine`
**Request:** query — `status?, page, limit`
**Response `200`:** paginated `Item[]`, each with `pendingRequestsCount`.
**Frontend Success:** Render list.
**Frontend Failure:** `ErrorState` + retry.
**Loading states:** Skeleton list.
**Validation rules:** N/A.
**Roles:** Authenticated.
**Navigation flow:** Card → Edit Listing. `pendingRequestsCount` badge → Incoming Requests filtered to that item.

---

### 2.11 View My Requests — Outgoing (as borrower)
**Page:** My Requests → "Outgoing" tab
**Components:** Status filter chips, Request Card (item thumbnail, lender name, `RequestStatusBadge`, due date if active), `EmptyState`
**API:** `GET /api/requests?role=borrower`
**Request:** query — `status?, page, limit`
**Response `200`:** paginated `BorrowRequest[]` with item + counterpart summaries; `contactInfo` included only when status ≥ `approved`.
**Frontend Success:** Render list.
**Frontend Failure:** `ErrorState` + retry.
**Loading states:** Skeleton list.
**Validation rules:** N/A.
**Roles:** Authenticated.
**Navigation flow:** Card → Request Detail.

---

### 2.12 View Incoming Requests (as lender)
**Page:** My Requests → "Incoming" tab
**Components:** Status filter chips, Request Card (item thumbnail, borrower name + rating, requested duration, inline Approve/Reject for `pending` ones), `EmptyState`
**API:** `GET /api/requests?role=lender`
**Response `200`:** same shape as Outgoing.
**Frontend Success / Failure / Loading:** Same pattern as 2.11.
**Roles:** Authenticated.
**Navigation flow:** Card → Request Detail. Inline Approve/Reject buttons fire the same actions described in 2.13 without leaving the list.

---

### 2.13 Request Detail (the lifecycle hub)
**Page:** Request Detail
**Components:** Status timeline, item summary card, counterpart mini-profile, Contact Info block *(shown only once status is `approved` or later)*, and contextual action buttons:

| Viewer role | Status | Action(s) shown |
|---|---|---|
| Lender | `pending` | Approve · Counter (opens modal with Duration Input) · Reject (opens dialog with optional reason) |
| Borrower | `countered` | Accept Counter · Cancel |
| Either | `pending`/`countered`/`approved` | Cancel (via `ConfirmDialog`, optional reason) |
| Either | `approved` | Confirm Handover |
| Either | `active`/`return_pending` | Confirm Return |
| Either | `completed` | Rate *(Phase 2)* |

**APIs (all on this page):**
- `GET /api/requests/:id` — load
- `POST /api/requests/:id/approve`
- `POST /api/requests/:id/counter` — Request: `{ "counterDurationDays": number }`
- `POST /api/requests/:id/reject` — Request: `{ "rejectionReason"?: string }`
- `POST /api/requests/:id/accept-counter`
- `POST /api/requests/:id/cancel` — Request: `{ "cancellationReason"?: string }`
- `POST /api/requests/:id/confirm-handover`
- `POST /api/requests/:id/confirm-return`

**Response (every action):** `200` with the updated `BorrowRequest`.
**Frontend Success (every action):** Update local state to the new status in place, toast confirming the action (e.g. "Handover confirmed — waiting on the other side" if only one flag is now true), reveal the Contact Info block the moment status crosses into `approved`.
**Frontend Failure:** Toast with the API message — most notably `409` "No units available" if approving/accepting-counter when stock hit zero elsewhere first.
**Loading states:** Per-button spinner; disable all action buttons while one request is in flight.
**Validation rules:** `counterDurationDays` > 0 and ≤ the item's `maxDurationDays` if set; reason fields optional, ≤ 300 chars.
**Roles:** The request's borrower or lender only (`403` otherwise, and the page shouldn't even be linked to for non-participants). Admin gets read-only visibility here starting Phase 1, with no special actions until Phase 2.
**Navigation flow:** Reject/Cancel → back to the requests list (the thread is closed). All other actions → stay on the page to show the new state.

---

### 2.14 View Public User Profile
**Page:** User Profile (public)
**Components:** Photo, name, member-since, rating summary (Phase 1: renders "No ratings yet" since Ratings is a Phase 2 feature), their active listings grid, Report button *(added Phase 2)*, Ratings tab *(added Phase 2)*
**API:** `GET /api/users/:userId` + `GET /api/items?ownerId=:userId`
**Response `200`:** public profile subset — `{ id, fullName, profileImageUrl, ratingAsBorrower, ratingAsLender, memberSince }` (no email/phone).
**Frontend Success:** Render page.
**Frontend Failure:** `404` → "User not found."
**Loading states:** Skeleton.
**Validation rules:** N/A.
**Roles:** Authenticated.
**Navigation flow:** Listing card → Item Details.

---

## 3. Feature specifications — Phase 2

### 3.1 Rate Completed Loan
**Page:** Request Detail (`status:'completed'`)
**Components:** Rate button, Rating Modal (5-star input, optional comment textarea), Submit button
**API:** `POST /api/requests/:id/rate`
**Request:**
```json
{ "score": 5, "comment": "Returned the calculator in great shape, very responsive!" }
```
**Response `201`:** created `Rating`; the parent request's `borrowerHasRated`/`lenderHasRated` flips to `true`.
**Frontend Success:** Close modal, toast "Rating submitted", Rate button replaced with a static "You rated this ★★★★★."
**Frontend Failure:** `409` → toast "You've already rated this loan" and swap the button to the static state without retrying; other errors → inline modal error.
**Loading states:** Submit spinner.
**Validation rules:** Score required, integer 1–5. Comment optional, ≤ 500 chars.
**Roles:** Borrower or lender on that completed request, once each — gate the button client-side using `borrowerHasRated`/`lenderHasRated` so it never even renders as available twice.
**Navigation flow:** Stays on Request Detail.

---

### 3.2 View Ratings on a Profile
**Page:** User Profile → Ratings tab
**Components:** Rating summary (avg + count, split "as borrower" / "as lender"), Rating list (rater name, score, comment, date), Pagination
**API:** `GET /api/users/:userId/ratings`
**Request:** query — `role?('borrower'|'lender'), page, limit`
**Response `200`:** paginated `{ raterName, score, comment, createdAt, ratedRoleOfRatee }[]`.
**Frontend Success:** Render list.
**Frontend Failure:** `ErrorState` + retry.
**Loading states:** Skeleton rows.
**Validation rules:** N/A.
**Roles:** Authenticated.
**Navigation flow:** In-page only.

---

### 3.3 Report a User / Item / Request
**Page:** Reachable from Item Details, User Profile, and Request Detail
**Components:** "Report" button/icon, Report Modal (Reason select, Description textarea, Submit)
**API:** `POST /api/reports`
**Request:**
```json
{ "targetType": "item", "targetId": "...", "reason": "Item not as described", "description": "Optional extra detail" }
```
**Response `201`:** created `Report`.
**Frontend Success:** Close modal, toast "Report submitted — our team will review it."
**Frontend Failure:** Toast with error message.
**Loading states:** Submit spinner.
**Validation rules:** Reason required, from a fixed dropdown (e.g. "Item not as described," "No-show," "Inappropriate behavior," "Other"); description required (≤ 500 chars) only when reason is "Other."
**Roles:** Any authenticated user.
**Navigation flow:** Stays on the current page.

---

### 3.4 Admin: Reports Queue
**Page:** Admin → Reports
**Components:** Status filter (open/resolved/dismissed), Report Card (reporter, target summary, reason, description, date), "View target" link, Resolve button, Dismiss button
**API:** `GET /api/admin/reports` (list) · `PATCH /api/admin/reports/:id` (action)
**Request (PATCH):**
```json
{ "status": "resolved" }
```
**Response `200`:** updated `Report`.
**Frontend Success:** Card updates status in place, toast confirming.
**Frontend Failure:** Toast with error message.
**Loading states:** Skeleton list; per-card action spinner.
**Validation rules:** N/A (binary action).
**Roles:** Admin only.
**Navigation flow:** "View target" → Item Details / User Profile / Request Detail.

---

### 3.5 Admin: Remove Reported Item
**Page:** Admin → Reports (inline on an item-targeted report)
**Components:** "Remove item" button, `ConfirmDialog`
**API:** `DELETE /api/admin/items/:id`
**Response:** `204`.
**Frontend Success:** Toast "Item removed"; associated report can be marked resolved in the same action or left for a manual Resolve click.
**Frontend Failure:** Toast with error message.
**Loading states:** Dialog confirm spinner.
**Validation rules:** Confirmation required.
**Roles:** Admin only.
**Navigation flow:** Stays on Reports queue.

---

### 3.6 Admin: Suspend Reported / Offending User
**Page:** Admin → Reports (inline on a user-targeted report) or User Profile (admin-only action)
**Components:** "Suspend user" button, Suspend Dialog (duration input, defaults to the configured suspension length)
**API:** `PATCH /api/admin/users/:id/suspend`
**Request:**
```json
{ "isSuspended": true, "suspendedUntil": "2026-07-25" }
```
**Response `200`:** updated `User`.
**Frontend Success:** Toast "User suspended"; suspension badge appears on their profile.
**Frontend Failure:** Toast with error message.
**Loading states:** Dialog spinner.
**Validation rules:** Duration required if suspending; toggling off doesn't need one.
**Roles:** Admin only.
**Navigation flow:** Stays on the current page.

---

## 4. Feature specifications — Phase 3 (lighter detail — build after Phases 1–2 ship)

### 4.1 Notifications
**Page:** Global notification dropdown (top nav) + optional dedicated Notifications page
**Components:** Bell icon with unread badge, notification list item (type icon, message, relative time, read/unread dot), "Mark all read"
**API:** `GET /api/notifications/unread-count` (poll periodically) · `GET /api/notifications` · `PATCH /api/notifications/:id/read` · `PATCH /api/notifications/read-all`
**Frontend Success:** Badge count updates; item dims once read.
**Frontend Failure:** Non-critical — fail silently with a background retry rather than a toast.
**Roles:** Authenticated.
**Navigation flow:** Click a notification → its `relatedRequestId`'s Request Detail page.

### 4.2 Admin: All Users
**Page:** Admin → Users
**Components:** Search input, suspended-only filter, user table, inline suspend/unsuspend
**API:** `GET /api/admin/users` · `PATCH /api/admin/users/:id/suspend`
**Roles:** Admin only.

### 4.3 Admin: Stats Dashboard
**Page:** Admin → Dashboard
**Components:** Stat cards (total users, total items, active loans, overdue loans, open reports, suspended users)
**API:** `GET /api/admin/stats`
**Roles:** Admin only.

### 4.4 Admin: Manage Categories
**Page:** Admin → Categories
**Components:** Category table, "Add category" modal (name, icon), active/inactive toggle
**API:** `GET /api/categories?activeOnly=false` · `POST /api/categories` · `PATCH /api/categories/:id`
**Roles:** Admin only.

**Not specified yet** (postponed at the architecture level, not just the frontend): Favorites/Wishlist, Atlas Search UI, Loan Extension flow. Don't build screens for these until their APIs exist in the backend doc — there's nothing to integrate against yet.

---

## 5. Complete page list

| Page | Purpose | Components | APIs used | Navigation links | User interactions |
|---|---|---|---|---|---|
| Sign In / Sign Up | Authenticate via Clerk | Clerk widgets | — (webhook only) | → Complete Profile / Browse | Enter credentials |
| Complete Profile | Collect phone before any core action | Name/Phone inputs | `PATCH /api/users/me` | → Browse | Submit phone |
| Browse Items | Discover items to borrow | Filters, Item Card grid, pagination | `GET /api/items` | → Item Details, → Create Listing | Search, filter, sort, paginate |
| Item Details | View one item, start a request | Carousel, owner card, Borrow button | `GET /api/items/:id`, `POST /api/items/:itemId/requests` | → Owner Profile, → Request Detail | Open Borrow modal, submit request, report (P2) |
| Create Listing | List an item to lend | Form + `ImageUploader` | `GET /api/categories`, `POST /api/uploads/sign`, `POST /api/items` | → My Listings | Fill form, upload photos, submit |
| Edit Listing | Update or retire a listing | Same form + delete action | `PATCH/DELETE /api/items/:id` | → My Listings | Edit fields, deactivate |
| My Listings | Manage items you're lending | Listing cards w/ pending badge | `GET /api/items/mine` | → Edit Listing, → Incoming Requests | View, edit, remove |
| My Requests | Track your borrow activity, both directions | Outgoing/Incoming tabs, Request Card | `GET /api/requests` | → Request Detail | Filter by status, inline approve/reject |
| Request Detail | Act on a single request through its full lifecycle | Timeline, action buttons, contact info | `GET /api/requests/:id` + all lifecycle actions | → back to My Requests (on close) | Approve/counter/reject/cancel/confirm handover/confirm return, rate (P2) |
| User Profile | View a student's public reputation | Profile card, listings grid, Ratings tab (P2) | `GET /api/users/:userId`, `GET /api/items?ownerId=`, `GET /api/users/:userId/ratings` (P2) | → Item Details | Browse their listings, read ratings |
| My Profile / Settings | Manage your own account | Profile form, `ImageUploader` | `GET/PATCH /api/users/me` | — | Edit and save |
| Admin → Reports | Resolve flagged content | Report Card, resolve/dismiss/remove/suspend actions | `GET/PATCH /api/admin/reports`, `DELETE /api/admin/items/:id`, `PATCH /api/admin/users/:id/suspend` | → target page | Review, act, resolve |
| Notifications *(P3)* | Central activity feed | Bell dropdown / list | `GET /api/notifications*` | → Request Detail | Read, mark read |
| Admin → Users *(P3)* | Oversight of the user base | Search, table | `GET/PATCH /api/admin/users` | → User Profile | Search, suspend |
| Admin → Dashboard *(P3)* | At-a-glance platform health | Stat cards | `GET /api/admin/stats` | — | View only |
| Admin → Categories *(P3)* | Manage the fixed category list | Table, add/edit modal | `GET/POST/PATCH /api/categories` | — | Add, edit, deactivate |

---

## 6. Frontend Development Checklist

### Phase 1
- [ ] Set up Clerk provider + `ProtectedRoute` wrapper
- [ ] Build the shared API client (base URL, auth header injection, envelope parsing, generic error handling per §0)
- [ ] Build shared components: `LoadingSkeleton`, `EmptyState`, `ErrorState`, `ConfirmDialog`, `Toast`, `RequestStatusBadge`, `ImageUploader`
- [ ] Sign In / Sign Up pages
- [ ] Complete Profile gate
- [ ] Browse Items (filters, pagination, cards)
- [ ] Item Details + Borrow Request modal
- [ ] Create Listing + Edit Listing (image upload flow)
- [ ] My Listings
- [ ] My Requests (Outgoing / Incoming tabs)
- [ ] Request Detail with all lifecycle actions (approve, counter, reject, accept-counter, cancel, confirm-handover, confirm-return)
- [ ] User Profile (public, without ratings tab yet)
- [ ] My Profile / Settings

### Phase 2
- [ ] Rating Modal on completed Request Detail + status-flag gating (`borrowerHasRated`/`lenderHasRated`)
- [ ] Ratings tab on User Profile
- [ ] Report Modal (reusable across Item Details, User Profile, Request Detail)
- [ ] Admin → Reports Queue page
- [ ] "Remove item" / "Suspend user" actions wired into the Reports queue

### Phase 3
- [ ] Notifications dropdown + unread badge polling
- [ ] Admin → Users page
- [ ] Admin → Dashboard (stats)
- [ ] Admin → Categories page
- [ ] Revisit postponed items (favorites, search, loan extension) only once their backend specs exist
