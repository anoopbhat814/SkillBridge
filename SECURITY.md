# Security Policy

## Supported versions

| Version | Supported |
|---------|-----------|
| 0.4.x   | Yes       |
| 0.3.x   | Security fixes only |
| < 0.3   | No        |

## Reporting a vulnerability

Please report vulnerabilities privately to **security@skillbridge.example**.
Include a description, reproduction steps and the affected component
(`apps/api`, `services/gateway`, etc.). Do not open a public issue.

You can expect:

- An acknowledgement within 3 business days
- A status update within 10 business days
- Credit in the release notes if you wish, once a fix is available

## Scope

In scope: authentication and authorisation flaws, injection, data exposure
(resumes, messages, assessment answers), WebSocket gateway abuse and
dependency vulnerabilities that are reachable in our deployment.

Out of scope: denial of service via volumetric traffic, social engineering,
and findings on third-party services we do not operate.

## Secrets

`JWT_SECRET` and database credentials must be unique per environment. The values in
`.env.example` are placeholders and must never be used in production.
