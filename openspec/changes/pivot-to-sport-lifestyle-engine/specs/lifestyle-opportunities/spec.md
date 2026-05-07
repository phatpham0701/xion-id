# Lifestyle Opportunities Spec

## ADDED Requirements

### Requirement: Opportunities are matched to lifestyle profile
The product SHALL show lifestyle opportunities matched to a user's interests, proof history, badge tiers, challenge progress, and rank.

Opportunity types MAY include brand ambassador leads, event invites, gear testing, supplement trials, creator collaborations, coaching paths, community roles, wellness programs, or future income/career pathways.

#### Scenario: User has Running and Marathon interests
- **WHEN** the product shows opportunities
- **THEN** opportunities can prioritize running events, race communities, gear tests, or endurance-related brand matches.

### Requirement: Opportunities are not generic vouchers
The product SHALL not present opportunities as a generic voucher marketplace, generic coupon wall, or generic loyalty catalog.

#### Scenario: User views opportunities
- **WHEN** opportunities are displayed
- **THEN** each opportunity is framed as relevant to the user's sport lifestyle identity or verified behavior
- **AND** not as an unrelated generic discount.

### Requirement: Opportunity eligibility explanation
Each opportunity SHOULD explain why it is matched to the user.

#### Scenario: Matched opportunity is displayed
- **WHEN** a user views an opportunity card
- **THEN** the card can explain matching reasons such as selected interests, earned badge tiers, proof consistency, active/completed challenges, or leaderboard rank.

### Requirement: Opportunity readiness levels
The product SHALL support opportunity readiness levels that map to lifestyle reputation strength.

Readiness levels MAY include:
- Explore = relevant but low proof requirement,
- Apply = user appears eligible to submit interest,
- Qualified = user meets specified lifestyle proof or badge criteria,
- Ambassador-ready = user has high-signal Diamond or Elite reputation.

#### Scenario: User earns Elite badge
- **WHEN** a user earns an Elite badge in a relevant category
- **THEN** ambassador-level opportunities can be marked as more relevant or ambassador-ready when other criteria are met.

### Requirement: Pilot-safe opportunity status
The product SHALL distinguish demo, simulated, waitlist, and live opportunities during the pilot.

#### Scenario: Opportunity is not live
- **WHEN** an opportunity is demo, simulated, or waitlist-only
- **THEN** the product clearly labels that status
- **AND** does not imply guaranteed brand compensation, sponsorship, employment, or income.
