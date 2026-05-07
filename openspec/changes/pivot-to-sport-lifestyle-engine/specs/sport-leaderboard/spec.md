# Sport Leaderboard Spec

## ADDED Requirements

### Requirement: Rank is based on lifestyle signal
The sport lifestyle leaderboard SHALL rank users based on repeated proof, challenge completion, badge tier progression, and referrals where applicable.

#### Scenario: User builds consistent proof
- **WHEN** a user submits repeated accepted proofs and completes challenges
- **THEN** their rank can improve based on configured ranking weights.

### Requirement: Leaderboards are sport lifestyle scoped
The product SHALL support leaderboard views scoped by sport lifestyle interest/category and optionally global sport lifestyle rank.

#### Scenario: User selects Running leaderboard
- **WHEN** the user views the Running leaderboard
- **THEN** rankings prioritize Running-related proofs, badges, and challenges.

### Requirement: Rank explanation
The product SHALL explain the primary contributors to a user's rank.

#### Scenario: User views rank details
- **WHEN** a user opens their rank details
- **THEN** the product shows understandable contributors such as accepted proofs, completed challenges, badge tiers, streak/consistency, and referrals.

### Requirement: Anti-generic-points framing
The leaderboard SHALL not frame XIONID as a generic points farm, generic loyalty ranking, or voucher leaderboard.

#### Scenario: User views leaderboard copy
- **WHEN** leaderboard explanations are shown
- **THEN** copy frames rank as verified sport lifestyle reputation
- **AND** avoids primary messaging around generic rewards, vouchers, or coupon status.

### Requirement: Tie and integrity handling
The leaderboard SHALL define deterministic handling for ties and distinguish simulated/demo proof from production-verified proof where needed.

#### Scenario: Users have equal rank score
- **WHEN** two users have the same rank score
- **THEN** the system applies deterministic tie handling such as higher verified proof count, higher badge tier, earlier achievement time, or a stable fallback order.
