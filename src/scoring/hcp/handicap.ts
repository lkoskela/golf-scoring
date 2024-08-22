import { Scorecard, CommonScoringOptions } from "../../types"
import { resolvePlayingHandicap as resolvePlayingHandicapWithStandardRules, applyHandicapStrokeAllocation as applyHandicapStrokeAllocationWithStandardRules } from "../hcp/standard"
import { resolvePlayingHandicap as resolvePlayingHandicapWithGamebookRules, applyHandicapStrokeAllocation as applyHandicapStrokeAllocationWithGamebookRules } from "../hcp/gamebook"

/**
 * Calculate the playing handicap (course handicap) for a given scorecard.
 *
 * The way the playing handicap is calculated depends on the method chosen in the options:
 * - 'standard' (default): USGA, R&A compliant method
 * - 'gamebook': uses the method implemented by the Golf Gamebook application, using the
 *               full 18-hole HCP and stroke allocation to determine strokes given for a
 *               given 9-hole stretch when playing 9 holes on an 18-hole course.
 *
 * @param scorecard Scorecard
 * @param options CommonScoringOptions
 * @param slope number
 * @param cr number
 * @returns number
 */
export const calculatePlayingHandicap = (scorecard: Scorecard, options: CommonScoringOptions): { phcp: number, slope: number, cr: number } => {
    type PlayingHandicapResolutionImplementation = (scorecard: Scorecard, options: CommonScoringOptions) => { phcp: number, slope: number, cr: number }
    const selectImplementation = (options: CommonScoringOptions): PlayingHandicapResolutionImplementation => {
        if (options.method === 'standard') {
            return resolvePlayingHandicapWithStandardRules
        } else if (options.method === 'gamebook') {
            return resolvePlayingHandicapWithGamebookRules
        } else {
            throw new Error(`Unknown Stableford calculation method: ${options.method}`)
        }
    }
    return selectImplementation(options)(scorecard, options)
}
