# Matching algorithm

Each job requirement carries a weight (2.0 required, 1.0 optional). For every requirement the candidate earns
full credit when their level meets the minimum, and loses 0.4 per level of shortfall. Assessment-verified
skills get a 10% bonus (capped at full credit). The weighted sum is divided by total weight. If the job
specifies minimum years and the candidate is short, the score is multiplied by 0.85.

The result is persisted as `Application.matchScore` and drives ranking on the employer dashboard.
