# Changelog

All notable changes to this project are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Shared `retry` and date helpers in `@skillbridge/utils`.
- Loading and error boundaries for candidate-facing pages.

### Fixed
- API matcher client now calls `/v1/match/score`, matching the matcher service route.

## [0.4.0] - 2024-03-28

### Added
- Real-time messaging: Go gateway with Redis pub/sub fan-out, conversation and message tables.
- Employer dashboard with pipeline statistics.
- Browser extension 0.2.0 with a shortlist stored in `chrome.storage`.

### Changed
- Worker retries failed jobs up to five times before moving them to the dead-letter list.

## [0.3.0] - 2024-02-20

### Added
- Interview scheduling with proposed, confirmed, completed and cancelled states.
- Email notifications for interview invitations and application updates.

## [0.2.0] - 2024-01-30

### Added
- Skill assessments with weighted questions and automatic skill verification.
- Resume parsing and skill alias normalisation in the matcher service.

## [0.1.0] - 2024-01-08

### Added
- Initial release: authentication, job search, applications and candidate profiles.
