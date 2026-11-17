# REST API overview

| Method | Path | Description |
|--------|------|-------------|
| POST | /auth/register | Create a candidate account |
| POST | /auth/login | Exchange credentials for a JWT |
| GET | /jobs | Search open jobs (cursor pagination) |
| POST | /applications | Apply to a job; match score computed server-side |
| POST | /assessments/:id/attempts | Submit answers; passing verifies the skill |
| GET | /interviews/slots | Open 45-minute slots for an employer on a date |
| POST | /messages/conversations/:id/messages | Send a message |
| GET | /dashboard/summary | Employer pipeline statistics |
