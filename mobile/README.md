# Smart Transit Kiosk Mobile

A Flutter mobile app for the Smart Transit Kiosk system. It provides an email-based login flow and a ticket history view, including QR codes for digital validation.

## Features

- Email-only login with a 6-digit verification code
- Ticket list filtered by email
- Ticket details (status, validity, amount, payment method)
- QR code display for each ticket

## Requirements

- Flutter SDK (3.10+ recommended)
- A running backend API (see `backend/README.md`)

## Setup

1. Install dependencies:
   ```bash
   flutter pub get
   ```

2. Run the app:
   ```bash
   flutter run
   ```

## Backend API

The mobile app expects the backend to provide:

- `GET /api/purchases?email=user@example.com`
  - Returns a list of purchases with embedded `ticket` data

By default, the app uses `http://10.0.2.2:3333` for Android emulators. Update the base URL in `mobile/lib/repository/ticket_repository.dart` if needed.

## Notes

- The login flow is currently mocked in `mobile/lib/repository/login_repository.dart`. Replace it with real auth endpoints when they are available.
- QR codes are rendered using `qr_flutter`.

## Project Structure

- `lib/pages` - UI screens (login, code verification, ticket list)
- `lib/repository` - Data sources and API clients
- `lib/models` - Ticket and purchase models
- `lib/widgets` - Shared UI components
- `lib/utils` - Theme and styling
