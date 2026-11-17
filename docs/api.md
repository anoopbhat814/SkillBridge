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
| GET | /profile | Candidate profile with education, experience and certifications |
| POST | /profile/educations, /profile/experiences, /profile/certifications | Add a profile entry |
| POST | /offers | Draft an offer (application must be in INTERVIEW or OFFER) |
| POST | /offers/:id/send | Send an offer; application moves to OFFER |
| POST | /offers/:id/respond | Candidate accepts or declines; acceptance marks the application HIRED |
| GET, PUT | /employers/:id/reviews | Rating summary and reviews; candidates who interviewed may write one |
| POST | /referrals | Refer an email address to an open job |
| POST | /candidates/:id/endorsements | Endorse a skill the candidate lists |
| PUT | /interviews/:id/feedback | Employer interview scorecard |
| POST | /alerts, /push-subscriptions | Job alerts and web push registration |
| GET | /notifications | In-app notifications with unread count |
