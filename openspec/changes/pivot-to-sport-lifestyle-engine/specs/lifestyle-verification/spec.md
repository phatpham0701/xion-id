# Lifestyle Verification Spec

## ADDED Requirements

### Requirement: Verification begins from Dashboard CTA
The lifestyle verification flow SHALL be accessible from the Dashboard primary CTA: “Verify your lifestyle”.

#### Scenario: User clicks CTA
- **WHEN** the user clicks “Verify your lifestyle”
- **THEN** the product starts a guided verification flow for sport lifestyle interests, proof types, and badge targets.

### Requirement: Proof type suggestions
The product SHALL suggest proof types based on selected sport lifestyle interests.

Proof types MAY include manual entry, image upload, activity screenshot, event participation, gear ownership/use, recovery routine, wellness habit, supplement routine, referral proof, or demo simulation where production verification is not yet available.

#### Scenario: User selects Running
- **WHEN** the user selects Running
- **THEN** the system suggests proof types relevant to running activity, events, consistency, gear, or recovery.

### Requirement: Proof simulation for pilot
The product SHALL allow proof simulation during the pilot when live integrations or production-grade verification are unavailable.

#### Scenario: Integration is unavailable
- **WHEN** a production verification source is not connected
- **THEN** the user can submit simulated proof clearly marked as simulated or demo proof
- **AND** simulated proof can drive pilot badge and ranking behavior without being represented as production-verified data.

### Requirement: Verification result
The verification flow SHALL produce a clear result that explains whether proof was accepted, simulated, rejected, or needs review.

#### Scenario: Proof is accepted
- **WHEN** the submitted or simulated proof meets the configured requirement
- **THEN** the user receives confirmation
- **AND** the relevant badge, challenge, passport, and rank state are updated.

#### Scenario: Proof is rejected or needs review
- **WHEN** proof does not meet configured requirements or needs manual review
- **THEN** the product explains the next step without awarding unearned badge progress.

### Requirement: Verification integrity
The product SHALL distinguish simulated proof, user-submitted proof, and verified proof in data and user-facing status.

#### Scenario: User views proof history
- **WHEN** proof history is displayed
- **THEN** each proof item indicates its status as simulated, submitted, verified, rejected, or needs review.
