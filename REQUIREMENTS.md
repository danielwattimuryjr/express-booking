# Hotel Booking System — REST API Contract

## 1. Overview

This document defines the REST API contract for the Hotel Booking System.

The system supports:

- Hotel/property management
- Room type management
- Individual room management
- Amenities
- Rate plans
- Pricing
- Room inventory
- Availability search
- Guest management
- Hotel reservations
- Reservation lifecycle
- Room assignment
- Check-in / check-out
- Payments
- Cancellation and refunds
- Notifications
- Audit logging
- Administration
- Reporting

The API is developed progressively through multiple phases.

---

# 2. API Conventions

## 2.1 Base URL

```text
/api/v1
```

---

## 2.2 Authentication

Protected endpoints require:

```http
Authorization: Bearer <access_token>
```

---

## 2.3 Content Type

Requests containing a body must use:

```http
Content-Type: application/json
```

---

## 2.4 Success Response

```json
{
    "status": 200,
    "message": "Success message",
    "data": {}
}
```

The `status` field must match the HTTP status code.

---

## 2.5 Error Response

```json
{
    "status": 401,
    "message": "Human-readable error message",
    "data": {}
}
```

The `status` field must match the HTTP status code.

---

## 2.6 Pagination

Collection endpoints use:

```text
?page=1&limit=20
```

Response:

```json
{
    "status": 200,
    "message": "Success message",
    "data": [],
    "pagination": {
        "page": 1,
        "limit": 20,
        "total": 100,
        "totalPages": 5
    }
}
```

---

## 2.7 Date & Time

Date-only values use:

```text
2026-09-10
```

Date-time values use ISO-8601:

```text
2026-09-10T14:00:00Z
```

Hotel check-in and check-out values use date-only values because they represent hotel nights.

---

## 2.8 Business Status vs HTTP Status

The `status` property at the root level represents the HTTP status.

Example:

```json
{
    "status": 200,
    "message": "Reservation retrieved successfully",
    "data": {
        "id": "uuid",
        "status": "CONFIRMED"
    }
}
```

In this example:

- Root `status`: HTTP status
- `data.status`: Reservation business status

These values must not be treated as the same concept.

---

# Phase 0 — Foundation & Infrastructure

This phase establishes the API infrastructure before implementing hotel-specific business logic.

---

## 0.1 Health

### GET `/health`

Returns basic application health.

**Authentication:** Public

**Response `200 OK`:**

```json
{
    "status": 200,
    "message": "Application is healthy",
    "data": {
        "status": "ok"
    }
}
```

---

### GET `/health/live`

Liveness check.

**Authentication:** Public

**Response `200 OK`:**

```json
{
    "status": 200,
    "message": "Application is alive",
    "data": {
        "status": "alive"
    }
}
```

---

### GET `/health/ready`

Readiness check.

The endpoint should verify critical dependencies such as the database.

**Authentication:** Public

**Response `200 OK`:**

```json
{
    "status": 200,
    "message": "Application is ready",
    "data": {
        "status": "ready",
        "dependencies": {
            "database": "up"
        }
    }
}
```

---

# Phase 1 — Authentication & Users

This phase manages authentication and system user accounts.

---

## 1.1 Authentication

### POST `/auth/login`

Authenticate a user and issue an access/refresh token pair.

**Authentication:** Public

**Request:**

```json
{
    "email": "admin@example.com",
    "password": "password"
}
```

**Response `200 OK`:**

```json
{
    "status": 200,
    "message": "Login successful",
    "data": {
        "accessToken": "<access_token>",
        "refreshToken": "<refresh_token>",
        "expiresIn": 900,
        "user": {
            "id": "uuid",
            "email": "admin@example.com",
            "firstName": "John",
            "lastName": "Doe"
        }
    }
}
```

---

### POST `/auth/refresh`

Rotate the refresh token and issue a new token pair.

**Authentication:** Refresh token

**Request:**

```json
{
    "refreshToken": "<refresh_token>"
}
```

**Response `200 OK`:**

```json
{
    "status": 200,
    "message": "Token refreshed successfully",
    "data": {
        "accessToken": "<access_token>",
        "refreshToken": "<refresh_token>",
        "expiresIn": 900
    }
}
```

---

### POST `/auth/logout`

Revoke the current refresh token/session.

**Authentication:** Required

**Response `204 No Content`**

---

## 1.2 Current User

### GET `/me`

Return the currently authenticated user.

**Authentication:** Required

**Response `200 OK`:**

```json
{
    "status": 200,
    "message": "User retrieved successfully",
    "data": {
        "id": "uuid",
        "email": "john@example.com",
        "firstName": "John",
        "lastName": "Doe"
    }
}
```

---

### PATCH `/me`

Update the authenticated user's profile.

**Authentication:** Required

**Request:**

```json
{
    "firstName": "John",
    "lastName": "Doe"
}
```

---

### POST `/me/change-password`

Change the authenticated user's password.

**Authentication:** Required

**Request:**

```json
{
    "currentPassword": "old-password",
    "newPassword": "new-password"
}
```

---

## 1.3 User Management

### GET `/users`

List system users.

**Permission:** `user:read`

---

### GET `/users/:id`

Get a system user.

**Permission:** `user:read`

---

### POST `/users`

Create a system user.

**Permission:** `user:create`

---

### PATCH `/users/:id`

Update a system user.

**Permission:** `user:update`

---

### DELETE `/users/:id`

Deactivate/delete a system user.

**Permission:** `user:delete`

---

# Phase 2 — Roles & Permissions

This phase establishes role-based access control.

---

## 2.1 Roles

### GET `/roles`

List roles.

**Permission:** `role:read`

---

### GET `/roles/:id`

Get a role.

**Permission:** `role:read`

---

### POST `/roles`

Create a role.

**Permission:** `role:create`

---

### PATCH `/roles/:id`

Update a role.

**Permission:** `role:update`

---

### DELETE `/roles/:id`

Delete a role.

**Permission:** `role:delete`

---

## 2.2 Role Permissions

### GET `/roles/:id/permissions`

List permissions assigned to a role.

**Permission:** `role:read`

---

### PUT `/roles/:id/permissions`

Replace role permissions.

**Permission:** `role:update`

**Request:**

```json
{
    "permissions": ["reservation:read", "reservation:create", "reservation:update", "room:read"]
}
```

---

## 2.3 User Roles

### GET `/users/:id/roles`

List roles assigned to a user.

**Permission:** `user:read`

---

### PUT `/users/:id/roles`

Replace user roles.

**Permission:** `user:update`

**Request:**

```json
{
    "roles": ["ADMIN"]
}
```

---

## 2.4 Permissions

### GET `/permissions`

List available permissions.

**Permission:** `permission:read`

---

### GET `/permissions/:id`

Get a permission.

**Permission:** `permission:read`

---

# Phase 3 — Hotel / Property Management

This phase introduces the hotel/property domain.

The system may support multiple hotels/properties.

---

## 3.1 Hotels

### GET `/hotels`

List hotels.

**Permission:** `hotel:read`

**Response `200 OK`:**

```json
{
    "status": 200,
    "message": "Hotels retrieved successfully",
    "data": [
        {
            "id": "uuid",
            "name": "Example Grand Hotel",
            "status": "ACTIVE"
        }
    ],
    "pagination": {
        "page": 1,
        "limit": 20,
        "total": 1,
        "totalPages": 1
    }
}
```

---

### GET `/hotels/:id`

Get hotel details.

**Permission:** `hotel:read`

---

### POST `/hotels`

Create a hotel.

**Permission:** `hotel:create`

**Request:**

```json
{
    "name": "Example Grand Hotel",
    "description": "A luxury hotel in Bali",
    "address": {
        "addressLine1": "Jl. Example No. 10",
        "city": "Badung",
        "province": "Bali",
        "country": "Indonesia",
        "postalCode": "80361"
    },
    "phone": "+62XXXXXXXXXX",
    "email": "info@example.com"
}
```

**Response `201 Created`:**

```json
{
    "status": 201,
    "message": "Hotel created successfully",
    "data": {
        "id": "uuid",
        "name": "Example Grand Hotel",
        "status": "ACTIVE"
    }
}
```

---

### PATCH `/hotels/:id`

Update hotel information.

**Permission:** `hotel:update`

---

### DELETE `/hotels/:id`

Deactivate a hotel.

**Permission:** `hotel:delete`

---

## 3.2 Hotel Amenities

### GET `/hotels/:id/amenities`

List hotel amenities.

**Permission:** `hotel:read`

---

### PUT `/hotels/:id/amenities`

Replace hotel amenities.

**Permission:** `hotel:update`

**Request:**

```json
{
    "amenities": ["WIFI", "POOL", "GYM", "RESTAURANT", "PARKING"]
}
```

---

# Phase 4 — Room Types & Rooms

A hotel room system contains two distinct concepts:

```text
Room Type
    ↓
Deluxe King
    ↓
Room 201
Room 202
Room 203
```

Guests normally reserve a room type rather than a specific physical room.

---

## 4.1 Room Types

### GET `/hotels/:hotelId/room-types`

List room types.

**Permission:** `room:read`

---

### GET `/room-types/:id`

Get room type details.

**Permission:** `room:read`

---

### POST `/hotels/:hotelId/room-types`

Create a room type.

**Permission:** `room:create`

**Request:**

```json
{
    "name": "Deluxe King",
    "description": "Deluxe room with king-size bed",
    "capacity": {
        "adults": 2,
        "children": 1
    },
    "bedType": "KING",
    "size": 32,
    "sizeUnit": "SQM"
}
```

**Response `201 Created`:**

```json
{
    "status": 201,
    "message": "Room type created successfully",
    "data": {
        "id": "uuid",
        "name": "Deluxe King"
    }
}
```

---

### PATCH `/room-types/:id`

Update a room type.

**Permission:** `room:update`

---

### DELETE `/room-types/:id`

Deactivate a room type.

**Permission:** `room:delete`

---

## 4.2 Room Type Amenities

### GET `/room-types/:id/amenities`

List amenities assigned to a room type.

**Permission:** `room:read`

---

### PUT `/room-types/:id/amenities`

Replace room type amenities.

**Permission:** `room:update`

---

## 4.3 Individual Rooms

### GET `/hotels/:hotelId/rooms`

List physical rooms.

**Permission:** `room:read`

**Query parameters:**

```text
?page=1&limit=20&roomTypeId=uuid&status=AVAILABLE&floor=2
```

---

### GET `/rooms/:id`

Get an individual room.

**Permission:** `room:read`

---

### POST `/hotels/:hotelId/rooms`

Create a physical room.

**Permission:** `room:create`

**Request:**

```json
{
    "roomNumber": "201",
    "roomTypeId": "uuid",
    "floor": 2
}
```

---

### PATCH `/rooms/:id`

Update a room.

**Permission:** `room:update`

---

### DELETE `/rooms/:id`

Deactivate a room.

**Permission:** `room:delete`

---

## 4.4 Room Status

Possible statuses:

```text
AVAILABLE
OCCUPIED
OUT_OF_ORDER
OUT_OF_SERVICE
CLEANING
```

### PATCH `/rooms/:id/status`

Update operational room status.

**Permission:** `room:update`

**Request:**

```json
{
    "status": "OUT_OF_ORDER",
    "reason": "Air conditioner maintenance"
}
```

---

# Phase 5 — Rate Plans & Pricing

A room type may have multiple pricing plans.

Example:

```text
Deluxe King

Flexible Rate
    IDR 1,500,000
    Free cancellation
    Breakfast included

Non-refundable
    IDR 1,200,000
    No cancellation
```

Pricing should therefore not be stored directly as a single property of `RoomType`.

---

## 5.1 Rate Plans

### GET `/hotels/:hotelId/rate-plans`

List rate plans.

**Permission:** `rate:read`

---

### GET `/rate-plans/:id`

Get a rate plan.

**Permission:** `rate:read`

---

### POST `/hotels/:hotelId/rate-plans`

Create a rate plan.

**Permission:** `rate:create`

**Request:**

```json
{
    "name": "Flexible Rate",
    "description": "Free cancellation before arrival",
    "cancellationPolicyId": "uuid",
    "mealPlan": "BREAKFAST_INCLUDED",
    "refundable": true
}
```

---

### PATCH `/rate-plans/:id`

Update a rate plan.

**Permission:** `rate:update`

---

### DELETE `/rate-plans/:id`

Deactivate a rate plan.

**Permission:** `rate:delete`

---

## 5.2 Room Type Rates

### GET `/room-types/:id/rates`

List rates for a room type.

**Permission:** `rate:read`

**Query parameters:**

```text
?from=2026-09-01&to=2026-09-30
```

---

### POST `/room-types/:id/rates`

Create a rate.

**Permission:** `rate:create`

**Request:**

```json
{
    "ratePlanId": "uuid",
    "date": "2026-09-10",
    "price": 1500000,
    "currency": "IDR"
}
```

---

# Phase 6 — Availability & Inventory

Availability is calculated from:

```text
Room Type Inventory
        +
Physical Room Status
        +
Existing Reservations
        +
Room Blocks
        +
Rate Availability
```

---

## 6.1 Search Availability

### GET `/availability`

Search available room types.

**Authentication:** Public

**Query parameters:**

```text
hotelId=uuid
&checkIn=2026-09-10
&checkOut=2026-09-13
&adults=2
&children=1
&rooms=1
```

**Response `200 OK`:**

```json
{
    "status": 200,
    "message": "Availability retrieved successfully",
    "data": [
        {
            "roomType": {
                "id": "uuid",
                "name": "Deluxe King"
            },
            "availableRooms": 3,
            "rates": [
                {
                    "ratePlanId": "uuid",
                    "name": "Flexible Rate",
                    "price": {
                        "amount": 4500000,
                        "currency": "IDR"
                    }
                }
            ]
        }
    ]
}
```

---

## 6.2 Room Type Availability

### GET `/room-types/:id/availability`

Get availability for a specific room type.

**Authentication:** Public

**Query parameters:**

```text
checkIn=2026-09-10&checkOut=2026-09-13
```

---

## 6.3 Room Blocks

Room blocks remove physical rooms from inventory.

Examples:

- Maintenance
- Renovation
- Private use
- Operational restrictions

### GET `/rooms/:id/blocks`

List room blocks.

**Permission:** `inventory:read`

---

### POST `/rooms/:id/blocks`

Create a room block.

**Permission:** `inventory:create`

**Request:**

```json
{
    "startDate": "2026-09-10",
    "endDate": "2026-09-15",
    "reason": "Maintenance"
}
```

---

### DELETE `/room-blocks/:id`

Remove a room block.

**Permission:** `inventory:delete`

---

# Phase 7 — Guest Management

A guest is a hotel customer and is separate from a system user.

A guest may make a reservation without having a system account.

---

## 7.1 Guests

### GET `/guests`

List guests.

**Permission:** `guest:read`

---

### GET `/guests/:id`

Get guest information.

**Permission:** `guest:read`

---

### POST `/guests`

Create a guest.

**Permission:** `guest:create`

**Request:**

```json
{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+62XXXXXXXXXX",
    "nationality": "ID"
}
```

---

### PATCH `/guests/:id`

Update guest information.

**Permission:** `guest:update`

---

### DELETE `/guests/:id`

Deactivate/delete a guest.

**Permission:** `guest:delete`

---

### GET `/guests/:id/reservations`

List reservations belonging to a guest.

**Permission:** `reservation:read`

---

# Phase 8 — Reservation Core

The reservation is the central entity of the hotel booking system.

A reservation contains:

```text
Guest
Hotel
Room Type
Rate Plan
Check-in
Check-out
Number of Rooms
Occupancy
Pricing
Reservation Status
```

A reservation normally reserves inventory for a room type. A physical room may be assigned later.

---

## 8.1 Reservations

### GET `/reservations`

List reservations.

**Permission:** `reservation:read`

**Query parameters:**

```text
?page=1
&limit=20
&hotelId=uuid
&guestId=uuid
&roomTypeId=uuid
&status=CONFIRMED
&checkIn=2026-09-01
&checkOut=2026-09-30
```

**Response `200 OK`:**

```json
{
    "status": 200,
    "message": "Reservations retrieved successfully",
    "data": [
        {
            "id": "uuid",
            "reference": "HTL-20260910-000001",
            "status": "CONFIRMED",
            "checkIn": "2026-09-10",
            "checkOut": "2026-09-13",
            "rooms": 1
        }
    ],
    "pagination": {
        "page": 1,
        "limit": 20,
        "total": 1,
        "totalPages": 1
    }
}
```

---

### GET `/reservations/:id`

Get reservation details.

**Permission:** `reservation:read`

**Response `200 OK`:**

```json
{
    "status": 200,
    "message": "Reservation retrieved successfully",
    "data": {
        "id": "uuid",
        "reference": "HTL-20260910-000001",
        "status": "CONFIRMED",
        "hotelId": "uuid",
        "roomTypeId": "uuid",
        "ratePlanId": "uuid",
        "guestId": "uuid",
        "checkIn": "2026-09-10",
        "checkOut": "2026-09-13",
        "rooms": 1,
        "guests": {
            "adults": 2,
            "children": 1
        },
        "total": {
            "amount": 4500000,
            "currency": "IDR"
        }
    }
}
```

---

### GET `/reservations/by-reference/:reference`

Find a reservation by public reference number.

**Permission:** `reservation:read`

---

## 8.2 Create Reservation

### POST `/reservations`

Create a reservation.

**Permission:** `reservation:create`

**Request:**

```json
{
    "hotelId": "uuid",
    "roomTypeId": "uuid",
    "ratePlanId": "uuid",
    "checkIn": "2026-09-10",
    "checkOut": "2026-09-13",
    "rooms": 1,
    "guests": {
        "adults": 2,
        "children": 1
    },
    "primaryGuest": {
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "phone": "+62XXXXXXXXXX"
    },
    "specialRequests": "Late arrival"
}
```

**Response `201 Created`:**

```json
{
    "status": 201,
    "message": "Reservation created successfully",
    "data": {
        "id": "uuid",
        "reference": "HTL-20260910-000001",
        "status": "PENDING",
        "hotelId": "uuid",
        "roomTypeId": "uuid",
        "ratePlanId": "uuid",
        "checkIn": "2026-09-10",
        "checkOut": "2026-09-13",
        "rooms": 1,
        "guests": {
            "adults": 2,
            "children": 1
        },
        "total": {
            "amount": 4500000,
            "currency": "IDR"
        }
    }
}
```

---

## 8.3 Update Reservation

### PATCH `/reservations/:id`

Update reservation fields that are allowed by the reservation lifecycle.

**Permission:** `reservation:update`

Example:

```json
{
    "specialRequests": "Airport pickup requested"
}
```

Changes to dates, room type, rate plan, occupancy, or room count must be validated by the reservation domain.

---

# Phase 9 — Reservation Lifecycle

Reservation status must not be freely mutable by clients.

---

## 9.1 Reservation Statuses

```text
PENDING
CONFIRMED
CHECKED_IN
CHECKED_OUT
CANCELLED
NO_SHOW
EXPIRED
```

---

## 9.2 Confirm Reservation

### POST `/reservations/:id/confirm`

Confirm a pending reservation.

**Permission:** `reservation:confirm`

Transition:

```text
PENDING → CONFIRMED
```

**Response `200 OK`:**

```json
{
    "status": 200,
    "message": "Reservation confirmed successfully",
    "data": {
        "id": "uuid",
        "status": "CONFIRMED"
    }
}
```

---

## 9.3 Cancel Reservation

### POST `/reservations/:id/cancel`

Cancel a reservation.

**Permission:** `reservation:cancel`

**Request:**

```json
{
    "reason": "Guest requested cancellation"
}
```

Possible transitions:

```text
PENDING → CANCELLED
CONFIRMED → CANCELLED
```

The cancellation policy must be evaluated before cancellation.

---

## 9.4 Expire Reservation

### POST `/reservations/:id/expire`

Expire an unpaid or unconfirmed reservation.

**Permission:** `reservation:manage`

Transition:

```text
PENDING → EXPIRED
```

This may eventually become an internal/system operation instead of a public endpoint.

---

## 9.5 No-show

### POST `/reservations/:id/no-show`

Mark a reservation as no-show.

**Permission:** `reservation:manage`

Transition:

```text
CONFIRMED → NO_SHOW
```

---

# Phase 10 — Room Assignment

A reservation reserves inventory while room assignment determines the physical room.

```text
Reservation
    ↓
Deluxe King
    ↓
Room 203
```

---

## 10.1 Assign Room

### POST `/reservations/:id/room`

Assign a physical room.

**Permission:** `reservation:update`

**Request:**

```json
{
    "roomId": "uuid"
}
```

The room must:

- Belong to the correct hotel
- Match the reserved room type
- Be operational
- Not be blocked
- Not conflict with another reservation

---

## 10.2 Change Assigned Room

### PUT `/reservations/:id/room`

Change the assigned room.

**Permission:** `reservation:update`

---

## 10.3 Remove Room Assignment

### DELETE `/reservations/:id/room`

Remove the assigned room.

**Permission:** `reservation:update`

---

# Phase 11 — Check-in & Check-out

This phase introduces front-desk operations.

---

## 11.1 Check-in

### POST `/reservations/:id/check-in`

Check a guest into the hotel.

**Permission:** `frontdesk:checkin`

**Request:**

```json
{
    "identityDocument": {
        "type": "PASSPORT",
        "number": "XXXXXXX"
    }
}
```

Transition:

```text
CONFIRMED → CHECKED_IN
```

Requirements may include:

- Valid reservation
- Valid assigned room
- Guest identity verification
- Payment/deposit verification

---

## 11.2 Check-out

### POST `/reservations/:id/check-out`

Check a guest out.

**Permission:** `frontdesk:checkout`

Transition:

```text
CHECKED_IN → CHECKED_OUT
```

---

## 11.3 Hotel Occupancy

### GET `/hotels/:hotelId/occupancy`

Return current hotel occupancy.

**Permission:** `hotel:read`

**Response `200 OK`:**

```json
{
    "status": 200,
    "message": "Hotel occupancy retrieved successfully",
    "data": {
        "totalRooms": 100,
        "occupiedRooms": 72,
        "availableRooms": 20,
        "outOfOrderRooms": 8,
        "occupancyRate": 72
    }
}
```

---

# Phase 12 — Cancellation Policies & Refunds

---

## 12.1 Cancellation Policies

### GET `/cancellation-policies`

List cancellation policies.

**Permission:** `policy:read`

---

### GET `/cancellation-policies/:id`

Get a cancellation policy.

**Permission:** `policy:read`

---

### POST `/cancellation-policies`

Create a cancellation policy.

**Permission:** `policy:create`

---

### PATCH `/cancellation-policies/:id`

Update a cancellation policy.

**Permission:** `policy:update`

---

### DELETE `/cancellation-policies/:id`

Deactivate a cancellation policy.

**Permission:** `policy:delete`

---

## 12.2 Refund

### GET `/reservations/:id/refund`

Get refund information.

**Permission:** `payment:read`

---

### POST `/reservations/:id/refund`

Initiate a refund.

**Permission:** `payment:refund`

**Request:**

```json
{
    "amount": 1000000,
    "reason": "Eligible cancellation"
}
```

---

# Phase 13 — Payment

Payment is modeled separately from reservations.

---

## 13.1 Reservation Payment

### GET `/reservations/:id/payment`

Get payment information.

**Permission:** `payment:read`

---

### POST `/reservations/:id/payment`

Initiate payment.

**Permission:** `payment:create`

**Request:**

```json
{
    "method": "CREDIT_CARD"
}
```

**Response `201 Created`:**

```json
{
    "status": 201,
    "message": "Payment initiated successfully",
    "data": {
        "id": "uuid",
        "status": "PENDING",
        "amount": 4500000,
        "currency": "IDR"
    }
}
```

---

## 13.2 Payments

### GET `/payments`

List payments.

**Permission:** `payment:read`

---

### GET `/payments/:id`

Get payment details.

**Permission:** `payment:read`

---

## 13.3 Payment Webhook

### POST `/payments/webhook`

Receive payment-provider events.

**Authentication:** Provider webhook signature

Possible events:

```text
PAYMENT_CREATED
PAYMENT_PENDING
PAYMENT_SUCCEEDED
PAYMENT_FAILED
PAYMENT_REFUNDED
```

Webhook processing must be idempotent.

---

# Phase 14 — Notifications

Notifications are generated from domain events.

---

## 14.1 Notifications

### GET `/notifications`

List notifications for the authenticated user.

**Authentication:** Required

---

### GET `/notifications/:id`

Get a notification.

**Authentication:** Required

---

### PATCH `/notifications/:id/read`

Mark a notification as read.

**Authentication:** Required

---

## 14.2 Domain Events

Potential domain events:

```text
ReservationCreated
ReservationConfirmed
ReservationCancelled
ReservationExpired
ReservationNoShow
GuestCheckedIn
GuestCheckedOut
PaymentSucceeded
PaymentFailed
RefundCompleted
```

These events may be consumed asynchronously by workers.

---

# Phase 15 — Audit & Administration

---

## 15.1 Audit Logs

### GET `/audit-logs`

List audit logs.

**Permission:** `audit:read`

**Query parameters:**

```text
?page=1
&limit=50
&actorId=uuid
&action=RESERVATION_CREATED
&entity=Reservation
&entityId=uuid
&from=2026-09-01T00:00:00Z
&to=2026-09-30T23:59:59Z
```

**Response `200 OK`:**

```json
{
    "status": 200,
    "message": "Audit logs retrieved successfully",
    "data": [
        {
            "id": "uuid",
            "actorId": "uuid",
            "action": "RESERVATION_CREATED",
            "entity": "Reservation",
            "entityId": "uuid",
            "createdAt": "2026-09-10T10:00:00Z"
        }
    ],
    "pagination": {
        "page": 1,
        "limit": 50,
        "total": 1,
        "totalPages": 1
    }
}
```

---

### GET `/audit-logs/:id`

Get an audit log entry.

**Permission:** `audit:read`

Audit records should be immutable.

---

## 15.2 Administration Dashboard

### GET `/admin/dashboard`

Return administrative metrics.

**Permission:** `admin:dashboard`

**Response `200 OK`:**

```json
{
    "status": 200,
    "message": "Dashboard retrieved successfully",
    "data": {
        "totalHotels": 1,
        "totalRooms": 100,
        "totalRoomTypes": 5,
        "totalReservations": 1200,
        "pendingReservations": 20,
        "confirmedReservations": 900,
        "checkedInReservations": 80,
        "checkedOutReservations": 150,
        "cancelledReservations": 50,
        "occupancyRate": 72,
        "revenue": {
            "amount": 1500000000,
            "currency": "IDR"
        }
    }
}
```

---

# Phase 16 — Reporting

---

## 16.1 Reservation Report

### GET `/reports/reservations`

Generate reservation statistics.

**Permission:** `report:read`

**Query parameters:**

```text
from=2026-09-01
&to=2026-09-30
&hotelId=uuid
```

---

## 16.2 Revenue Report

### GET `/reports/revenue`

Generate revenue statistics.

**Permission:** `report:read`

---

## 16.3 Occupancy Report

### GET `/reports/occupancy`

Generate occupancy statistics.

**Permission:** `report:read`

Potential metrics:

```text
totalRoomNights
soldRoomNights
availableRoomNights
occupancyRate
```

---

## 16.4 Room Type Performance

### GET `/reports/room-types`

Return room type performance.

**Permission:** `report:read`

Potential metrics:

```text
roomsSold
roomNightsSold
revenue
occupancyRate
averageDailyRate
```

---

# Phase 17 — Production Hardening

This phase focuses on reliability, security, and observability.

## Required Infrastructure

- Structured logging
- Audit logging
- Request ID / correlation ID
- Rate limiting
- Request timeout
- Graceful shutdown
- Database connection management
- Transaction management
- Idempotency
- Retry mechanism
- Queue processing
- Dead-letter handling
- Metrics
- Distributed tracing
- Security headers
- CORS
- Input validation
- API versioning
- Error monitoring

---

# 18. Endpoint Summary

## Authentication

```text
POST   /auth/login
POST   /auth/refresh
POST   /auth/logout

GET    /me
PATCH  /me
POST   /me/change-password
```

## Users

```text
GET    /users
GET    /users/:id
POST   /users
PATCH  /users/:id
DELETE /users/:id

GET    /users/:id/roles
PUT    /users/:id/roles
```

## Roles & Permissions

```text
GET    /roles
GET    /roles/:id
POST   /roles
PATCH  /roles/:id
DELETE /roles/:id

GET    /roles/:id/permissions
PUT    /roles/:id/permissions

GET    /permissions
GET    /permissions/:id
```

## Hotels

```text
GET    /hotels
GET    /hotels/:id
POST   /hotels
PATCH  /hotels/:id
DELETE /hotels/:id

GET    /hotels/:id/amenities
PUT    /hotels/:id/amenities

GET    /hotels/:hotelId/occupancy
```

## Room Types

```text
GET    /hotels/:hotelId/room-types
GET    /room-types/:id
POST   /hotels/:hotelId/room-types
PATCH  /room-types/:id
DELETE /room-types/:id

GET    /room-types/:id/amenities
PUT    /room-types/:id/amenities
GET    /room-types/:id/availability
GET    /room-types/:id/rates
POST   /room-types/:id/rates
```

## Rooms

```text
GET    /hotels/:hotelId/rooms
GET    /rooms/:id
POST   /hotels/:hotelId/rooms
PATCH  /rooms/:id
DELETE /rooms/:id

PATCH  /rooms/:id/status

GET    /rooms/:id/blocks
POST   /rooms/:id/blocks
DELETE /room-blocks/:id
```

## Rate Plans

```text
GET    /hotels/:hotelId/rate-plans
GET    /rate-plans/:id
POST   /hotels/:hotelId/rate-plans
PATCH  /rate-plans/:id
DELETE /rate-plans/:id
```

## Availability

```text
GET    /availability
GET    /room-types/:id/availability
```

## Guests

```text
GET    /guests
GET    /guests/:id
POST   /guests
PATCH  /guests/:id
DELETE /guests/:id

GET    /guests/:id/reservations
```

## Reservations

```text
GET    /reservations
GET    /reservations/:id
GET    /reservations/by-reference/:reference

POST   /reservations
PATCH  /reservations/:id

POST   /reservations/:id/confirm
POST   /reservations/:id/cancel
POST   /reservations/:id/expire
POST   /reservations/:id/no-show

POST   /reservations/:id/room
PUT    /reservations/:id/room
DELETE /reservations/:id/room

POST   /reservations/:id/check-in
POST   /reservations/:id/check-out
```

## Cancellation & Refund

```text
GET    /cancellation-policies
GET    /cancellation-policies/:id
POST   /cancellation-policies
PATCH  /cancellation-policies/:id
DELETE /cancellation-policies/:id

GET    /reservations/:id/refund
POST   /reservations/:id/refund
```

## Payments

```text
GET    /reservations/:id/payment
POST   /reservations/:id/payment

GET    /payments
GET    /payments/:id

POST   /payments/webhook
```

## Notifications

```text
GET    /notifications
GET    /notifications/:id
PATCH  /notifications/:id/read
```

## Audit

```text
GET    /audit-logs
GET    /audit-logs/:id
```

## Administration

```text
GET    /admin/dashboard
```

## Reporting

```text
GET    /reports/reservations
GET    /reports/revenue
GET    /reports/occupancy
GET    /reports/room-types
```

---

# 19. Recommended Development Roadmap

```text
Phase 0
Foundation
    ↓
Phase 1
Authentication & Users
    ↓
Phase 2
Roles & Permissions
    ↓
Phase 3
Hotel Management
    ↓
Phase 4
Room Types & Rooms
    ↓
Phase 5
Rate Plans & Pricing
    ↓
Phase 6
Availability & Inventory
    ↓
Phase 7
Guest Management
    ↓
Phase 8
Reservation Core
    ↓
Phase 9
Reservation Lifecycle
    ↓
Phase 10
Room Assignment
    ↓
Phase 11
Check-in / Check-out
    ↓
Phase 12
Cancellation & Refund
    ↓
Phase 13
Payment
    ↓
Phase 14
Notification
    ↓
Phase 15
Audit & Administration
    ↓
Phase 16
Reporting
    ↓
Phase 17
Production Hardening
```

---

# 20. Core Domain Relationship

```text
Hotel
 │
 ├── RoomType
 │      │
 │      ├── Room
 │      │
 │      └── Rate
 │             │
 │             └── RatePlan
 │
 ├── Amenities
 │
 └── Reservations
          │
          ├── Guest
          ├── RoomType
          ├── RatePlan
          ├── Room
          ├── Payment
          └── Cancellation
```

The core concepts are:

```text
RoomType
    ↓
What the guest reserves

Room
    ↓
The physical room assigned to the guest

Reservation
    ↓
The guest's booking for a room type during a date range

RatePlan
    ↓
Pricing and commercial rules applied to the reservation

Payment
    ↓
Financial transaction associated with the reservation
```

---

# 21. Core Reservation Flow

Normal booking flow:

```text
Search Availability
       ↓
Select Room Type
       ↓
Select Rate Plan
       ↓
Enter Guest Information
       ↓
Create Reservation
       ↓
PENDING
       ↓
Payment
       ↓
CONFIRMED
       ↓
Assign Physical Room
       ↓
CHECKED_IN
       ↓
CHECKED_OUT
```

Cancellation flow:

```text
PENDING
   │
   └────────→ CANCELLED

CONFIRMED
   │
   └────────→ CANCELLED
                   │
                   ↓
                 REFUND
```

No-show flow:

```text
CONFIRMED
    ↓
NO_SHOW
```

The reservation lifecycle and payment lifecycle are separate.

A reservation being `CANCELLED` does not automatically mean the payment is `REFUNDED`. Refund eligibility and processing must follow the applicable cancellation and payment policies.

---

# 22. Important Business Rules

## 22.1 Availability

- Check-in must be before check-out.
- A reservation consumes room inventory for each night.
- A room cannot be assigned to overlapping reservations.
- Out-of-order rooms must not contribute to available inventory.
- Blocked rooms must not contribute to available inventory.
- The requested number of rooms must not exceed available inventory.
- Room type occupancy limits must be respected.

---

## 22.2 Reservation

- A reservation must reference an active hotel.
- A reservation must reference an active room type.
- A reservation must reference a valid rate plan.
- The rate plan must be applicable to the selected room type.
- Reservation status transitions must be validated.
- Reservation pricing must be calculated server-side.
- Clients must not be trusted to provide the final payable amount.

---

## 22.3 Room Assignment

- Assigned room must belong to the selected hotel.
- Assigned room must belong to the reserved room type.
- Assigned room must be operational.
- Assigned room must not be blocked.
- Assigned room must not have an overlapping reservation.

---

## 22.4 Payment

- Payment operations must be idempotent.
- Payment status must not be arbitrarily changed by clients.
- Webhook signatures must be verified.
- Webhook processing must be idempotent.
- Refunds must respect cancellation/refund policies.

---

## 22.5 Concurrency

Creating a reservation must be safe against concurrent requests.

Example:

```text
Available Deluxe rooms = 1

Request A → Book Deluxe
Request B → Book Deluxe
```

The system must guarantee:

```text
Only one request succeeds.
```

The system must not rely solely on:

```text
SELECT availability
       ↓
if available
       ↓
INSERT reservation
```

because this pattern is vulnerable to race conditions.

The booking flow should use appropriate PostgreSQL transaction, locking, constraint, or inventory-allocation strategies.

---

# 23. Future Extensions

Potential future domains:

```text
Promotions
Coupons
Loyalty Programs
Housekeeping
Maintenance
Extra Services
Airport Transfer
Restaurant Reservations
Minibar
Invoices
Taxes
Fees
Multiple Payment Methods
Multi-property Management
Channel Manager
OTA Integration
```

These should be introduced only after the core reservation workflow is stable.
