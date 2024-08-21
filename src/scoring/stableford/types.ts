import { Scorecard } from "../../types"

export type CalculateStablefordOptions = {
    method?: 'standard'|'gamebook',

    // The handicap allowance. Default is 1.0 (100%).
    hcpAllowance?: number,
}

export type StablefordScore = {
    // The player's playing handicap for the course
    phcp: number,

    // The total number of strokes taken
    strokes: number,

    // The number of Stableford points scored
    points: number,

    // The scorecard used to calculate the points (including adjustments
    // to e.g. extend a 9-hole course to 18 holes)
    scorecard: Scorecard,
}
