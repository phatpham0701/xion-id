# Personal Challenges Spec

## ADDED Requirements

### Requirement: Challenge creation
The product SHALL allow users to create personal sport lifestyle challenges tied to one or more selected interests.

A personal challenge includes:
- title,
- sport lifestyle interest/category,
- target behavior or count,
- start date,
- deadline,
- countdown,
- proof requirement,
- badge or rank impact preview.

#### Scenario: User creates challenge
- **WHEN** the user enters valid challenge details
- **THEN** the challenge is created with a deadline and countdown
- **AND** appears in the user's Dashboard and Sport Lifestyle Passport.

### Requirement: Deadline and countdown visibility
The product SHALL show challenge deadline and countdown wherever active challenge progress is displayed.

#### Scenario: Active challenge is displayed
- **WHEN** the user views an active challenge
- **THEN** the deadline and remaining time are visible.

### Requirement: Challenge proof updates progress
The product SHALL update personal challenge progress when a user submits or simulates accepted proof matching the challenge requirements.

#### Scenario: User submits matching proof
- **WHEN** accepted proof matches an active challenge
- **THEN** the product increments challenge progress
- **AND** updates related badge and rank impact where applicable.

### Requirement: Challenge completion
The product SHALL mark a challenge complete when the user reaches the configured target before the deadline.

#### Scenario: User reaches target before deadline
- **WHEN** challenge progress reaches the target before the deadline
- **THEN** the challenge is marked complete
- **AND** related badge/rank progression is applied.

### Requirement: Challenge expiration
The product SHALL mark a challenge expired or incomplete when the deadline passes without meeting the target.

#### Scenario: Deadline passes
- **WHEN** the challenge deadline passes and the target is unmet
- **THEN** the challenge is marked expired or incomplete
- **AND** the product does not grant completion-based badge/rank progression.
