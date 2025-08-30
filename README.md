# STEM Fellowship @ YorkU — Backend API

Production-ready Node/Express API powering the club’s public site and admin dashboard. It accepts student applications, supports admin authentication, provides a paginated search/filter for submissions, and tracks page views.
- Tech Stack: Node.js + Express, Prisma + PostgreSQL, JWT Auth, Supertest/Jest

## Use Case
- **Public**: Students submit applications (email/student ID validation, study year & consent).
- **Admin**: Authenticate and review applications with search, filters, and pagination.
- **Analytics**: Lightweight page-view counter to track visits and the number of applications submitted.

## Key Features
- **Robust input validation** to prevent bad data and duplicates (unique email & student ID).
- **Clean domain model** for Applications and Users; **role-based** admin access.
- **Fast pagination + search** across email, name, student ID; optional filters:
  - `studyYear` → `First | Second | Third | Fourth | Fifth+`
  - `emailConsent` → `true | false`
- **Page view counter**: simple metrics with incrementing on page visits.
- **Consistent JSON errors** for easy frontend handling.
- **Prisma** schema + unique constraints guarantee data integrity.
- **Auth middleware** keeps admin routes secure without session state.
- **Composable query “where” objects** for search & filtering keep code clean and testable.
- **Error middleware** centralizes error formatting and status codes.

## API Routes
- **POST `/application`** → create application (public)
- **GET `/application`** → list (admin; supports `page`, `take`, `search`, `studyYear`, `emailConsent`)
- **GET `/application/count`** → total count (admin)
- **POST `/login`** → JWT for regular users (for potential use in the future)
- **POST `/adminlogin`** → JWT for admins
- **POST `/`** → increment home page views (public)
- **GET `/views`** → current view count (admin)

> Responses are JSON; admin endpoints expect `Authorization: Bearer <token>`.

## Example Payload
**Create Application**
```json
{
  "email": "student@my.yorku.ca",
  "studentId": "123456789",
  "firstName": "Alex",
  "lastName": "Smith",
  "program": "Computer Science",
  "studyYear": "Fifth+",
  "emailConsent": true
}
