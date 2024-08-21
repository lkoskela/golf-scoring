import { Scorecard, HoleRating } from "../../types"
import { full18From } from "../../utils/course"
import { debug } from "../../utils/debug"
import { cloneScorecard, routing } from "../../utils/scorecard"
import { StablefordScore, CalculateStablefordOptions } from "./types"
import { resolvePlayingHandicap as resolvePlayingHandicapWithStandardRules, applyHandicapStrokeAllocation as applyHandicapStrokeAllocationWithStandardRules } from "./standard"
import { resolvePlayingHandicap as resolvePlayingHandicapWithGamebookRules, applyHandicapStrokeAllocation as applyHandicapStrokeAllocationWithGamebookRules } from "./gamebook"


const defaultStablefordOptions: CalculateStablefordOptions = {
    method: 'standard',
    hcpAllowance: 1.0,   // Default to a full 100% handicap allowance
}

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
 * @param options CalculateStablefordOptions
 * @param slope number
 * @param cr number
 * @returns number
 */
const calculatePlayingHandicap = (scorecard: Scorecard, options: CalculateStablefordOptions): { phcp: number, slope: number, cr: number } => {
    type PlayingHandicapResolutionImplementation = (scorecard: Scorecard, options: CalculateStablefordOptions) => { phcp: number, slope: number, cr: number }
    const selectImplementation = (options: CalculateStablefordOptions): PlayingHandicapResolutionImplementation => {
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

const applyHandicapStrokeAllocation = (scorecard: Scorecard, options: CalculateStablefordOptions, phcp: number, holes: Array<HoleRating>): Array<number> => {
    type StrokeAllocationImplementation = (scorecard: Scorecard, options: CalculateStablefordOptions, phcp: number, holes: Array<HoleRating>) => Array<number>
    const selectImplementation = (options: CalculateStablefordOptions): StrokeAllocationImplementation => {
        if (options.method === 'standard') {
            return applyHandicapStrokeAllocationWithStandardRules
        } else if (options.method === 'gamebook') {
            return applyHandicapStrokeAllocationWithGamebookRules
        } else {
            throw new Error(`Unknown Stableford calculation method: ${options.method}`)
        }
    }
    return selectImplementation(options)(scorecard, options, phcp, holes)
}

/**
 * Calculate Stableford points for a scorecard
 *
 * @param scorecard The scorecard to calculate points for
 * @returns An array of StablefordScore objects
 */
export const calculateStableford = (scorecard: Scorecard, options: CalculateStablefordOptions = defaultStablefordOptions): StablefordScore => {
    options = { ...defaultStablefordOptions, ...options }
    const clonedScorecard = cloneScorecard(scorecard)
    const preparedScorecard = prepareScorecard(clonedScorecard, options)
    return calculateStablefordScore(preparedScorecard, options)
}

const prepareScorecard = (scorecard: Scorecard, options: CalculateStablefordOptions): Scorecard => {
    const log = debug(scorecard, options)
    log.log(`Starting to prepare scorecard's course:\n${JSON.stringify(scorecard.course, null, 2)}`)

    const tee = routing(scorecard)
    scorecard.course.tees = [tee]  // trim irrelevant hole routings

    // If the scorecard suggests the player has played more holes than the course has, we'll
    // extrapolate the full 18-hole course from the 9-hole course by simply repeating it twice.
    if (tee.holes.length < scorecard.strokes.length) {
        if (tee.holes.length === 9 && scorecard.strokes.length === 18) {
            scorecard.course = full18From(scorecard.course)
        } else {
            throw new Error(`${scorecard.course.name} has only ${tee.holes.length} holes, but strokes were recorded for ${scorecard.strokes.length} holes!`)
        }
    }

    if (options.method !== 'gamebook') {
        if (tee.holes.length === 9) {
            const maxHcp = Math.max(...tee.holes.map(h => h.hcp))
            if (maxHcp > 9) {
                if (tee.holes.find(h => h.hcp === 2)) {
                    tee.holes = tee.holes.map(h => ({ ...h, hcp: Math.round(h.hcp / 2) }))
                } else {
                    tee.holes = tee.holes.map(h => ({ ...h, hcp: Math.round((h.hcp + 1) / 2) }))
                }
            }
        }
    }
    if (tee.holes.length === 12) {
        const maxHcp = Math.max(...tee.holes.map(h => h.hcp))
        if (maxHcp > 12) {
            // The course's HCP ratings are "sparse" meaning there are gaps in the HCP values
            // and some of them are missing. We'll adjust the HCP values to be relative to each
            // other, so that the lowest HCP value is 1 and the highest is 12.
            tee.holes = tee.holes.map(hole => {
                let relativeHcp = tee.holes.filter(h => h.hcp <= hole.hcp).length
                return { ...hole, hcp: relativeHcp }
            })
        }
    }

    log.log(`Finished preparing scorecard's course:\n${JSON.stringify(scorecard.course, null, 2)}`)
    log.flush()
    return scorecard
}

const calculateStablefordScore = (scorecard: Scorecard, options: CalculateStablefordOptions): StablefordScore => {
    const log = debug(scorecard, options)

    log.log(`Scorecard for ${scorecard.course.name} on ${JSON.stringify(scorecard.date)} ${scorecard.date}:\n${JSON.stringify(scorecard, null, 2)}`);

    const tee = routing(scorecard)
    const playedHoles = tee.holes.slice(scorecard.startingHole - 1, scorecard.startingHole - 1 + scorecard.strokes.length)
    const coursePar = playedHoles.reduce((acc, hole) => acc + hole.par, 0)

    const { phcp, slope, cr } = calculatePlayingHandicap(scorecard, options)
    log.log(`Player's handicap index is ${scorecard.hcp} and course handicap for SR=${slope}, CR=${cr}, PAR=${coursePar} is ${phcp}`)

    const adjustedPars = applyHandicapStrokeAllocation(scorecard, options, phcp, playedHoles)

    log.log(`Stableford points for ${scorecard.course.name} (${scorecard.tee}) on ${scorecard.date} with playing handicap ${phcp}:`)
    const strokes = scorecard.strokes.reduce((acc, s) => acc + s, 0)
    const [points, effectivePlayingHandicap] = calculatePointsAndEffectivePlayingHandicap(scorecard, options, adjustedPars)

    log.flush()
    return { points, strokes, phcp: effectivePlayingHandicap, scorecard }
}

const calculatePointsAndEffectivePlayingHandicap = (scorecard: Scorecard, options: CalculateStablefordOptions, adjustedPars: number[]): [number, number] => {
    const log = debug(scorecard, options)
    const tee = routing(scorecard)
    let effectivePlayingHandicap = 0
    const points = scorecard.strokes.map((strokes, index) => {
        const i = scorecard.startingHole < tee.holes.length ? index + (scorecard.startingHole - 1) : index
        const adjustedPar = adjustedPars[index]
        const strokesAllocated = adjustedPar - tee.holes[i].par
        effectivePlayingHandicap += strokesAllocated
        const adjustmentSymbol = strokesAllocated > 0 ? '+' : strokesAllocated < 0 ? '-' : ''
        const adjustedParIndicator = adjustmentSymbol.repeat(Math.abs(strokesAllocated))
        const differenceToPar = 2 + adjustedPar - strokes
        const stablefordPoints = Math.max(0, differenceToPar)
        log.log(`#${(i+1).toString().padEnd(2)}\thcp=${tee.holes[i].hcp.toString().padEnd(2)}\tpar=${tee.holes[i].par}${adjustedParIndicator}\t=> ${adjustedPar}\tstrokes=${strokes}\tpts=${stablefordPoints}`)
        return stablefordPoints
    }).reduce((acc, p) => acc + p, 0);
    log.flush()
    return [points, effectivePlayingHandicap]
}