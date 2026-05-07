# Sport Badges Spec

## ADDED Requirements

### Requirement: Sport lifestyle badge model
The product SHALL support sport lifestyle badges tied to the pilot sport lifestyle interests.

Badge categories SHALL include at minimum:
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

#### Scenario: User selects an interest
- **WHEN** a user selects a sport lifestyle interest
- **THEN** the system can suggest relevant sport lifestyle badges for that interest.

### Requirement: Five badge tiers
Every sport lifestyle badge SHALL support exactly five progression tiers:
- Bronze,
- Silver,
- Gold,
- Diamond,
- Elite.

#### Scenario: Badge is displayed
- **WHEN** a sport lifestyle badge appears in the product
- **THEN** it includes one of the five supported tiers
- **AND** no sport lifestyle badge uses an unsupported tier label.

### Requirement: Tier meaning
Sport lifestyle badge tiers SHALL use the following meanings:
- Bronze = started / entry proof,
- Silver = basic consistency,
- Gold = strong consistency,
- Diamond = high-signal lifestyle,
- Elite = exceptional / ambassador-level / career-worthy lifestyle proof.

#### Scenario: User views tier explanation
- **WHEN** a user opens badge tier details
- **THEN** the explanation maps each tier to the defined lifestyle reputation meaning.

### Requirement: Badge earning from proof and challenges
The product SHALL award or upgrade sport lifestyle badges based on proof submission/simulation, repeated verified behavior, personal challenge progress, and referral contribution where applicable.

#### Scenario: User submits first proof
- **WHEN** a user submits or simulates valid entry-level proof for a selected sport lifestyle interest
- **THEN** the user can receive a Bronze badge for that interest.

#### Scenario: User demonstrates consistency
- **WHEN** a user repeatedly submits valid proofs or completes relevant personal challenges
- **THEN** the system can progress the related badge toward Silver, Gold, Diamond, or Elite according to configured thresholds.

### Requirement: Badges are not generic rewards
Sport lifestyle badges SHALL represent lifestyle reputation and not function as generic coupons, generic loyalty stamps, or generic voucher entitlements.

#### Scenario: Badge is earned
- **WHEN** a user earns a badge
- **THEN** the product frames it as sport lifestyle reputation
- **AND** does not present it primarily as a voucher or discount instrument.
