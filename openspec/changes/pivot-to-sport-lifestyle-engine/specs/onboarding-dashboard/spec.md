# Onboarding Dashboard Spec

## ADDED Requirements

### Requirement: Supported sign-in options
The product SHALL support the intended sign-in entry points for Google, Email, Apple, and Passkey when available in the deployed auth stack.

#### Scenario: User starts authentication
- **WHEN** a signed-out user begins onboarding
- **THEN** the interface presents available supported sign-in options
- **AND** unavailable providers are hidden, disabled, or clearly marked as not yet available.

### Requirement: Basic identity completion
The product SHALL require a signed-in user to complete basic identity before entering the main sport lifestyle experience.

Basic identity includes:
- username,
- display name,
- avatar,
- optional AI/3D avatar placeholder if feasible.

#### Scenario: User has incomplete identity
- **WHEN** a signed-in user is missing required basic identity fields
- **THEN** the user is guided to complete username, display name, and avatar
- **AND** optional AI/3D avatar functionality does not block completion.

#### Scenario: User completes identity
- **WHEN** the user saves valid basic identity
- **THEN** the profile is marked ready for the sport lifestyle Dashboard
- **AND** the user is routed to Dashboard.

### Requirement: Dashboard-first landing
The product SHALL route a signed-in user with completed basic identity directly to Dashboard.

#### Scenario: Returning user signs in
- **WHEN** a returning user signs in and already has completed basic identity
- **THEN** the user lands directly on Dashboard
- **AND** does not enter a generic rewards or voucher landing page.

### Requirement: Primary lifestyle verification CTA
The Dashboard SHALL make “Verify your lifestyle” the primary call to action.

#### Scenario: User opens Dashboard
- **WHEN** the Dashboard loads
- **THEN** the primary CTA reads “Verify your lifestyle”
- **AND** the CTA starts the sport lifestyle verification flow.

### Requirement: Sport lifestyle interest selection
The lifestyle verification flow SHALL allow the user to select sport lifestyle interests from the pilot taxonomy.

The pilot taxonomy includes:
- Running,
- Gym / Strength,
- Cycling,
- Swimming,
- Hybrid Athlete,
- Marathon / Events,
- Recovery,
- Wellness,
- Sports Gear,
- Supplements.

#### Scenario: User selects interests
- **WHEN** the user selects one or more sport lifestyle interests
- **THEN** the system saves those interests to the user lifestyle profile
- **AND** uses them to personalize badges, challenges, proof types, and opportunities.
