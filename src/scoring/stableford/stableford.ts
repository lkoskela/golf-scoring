import { Scorecard, HoleRating } from "../../types"
import { debug } from "../../utils/debug"
import { cloneScorecard, routing } from "../../utils/scorecard"
import { StablefordScore, CalculateStablefordOptions } from "./types"
import { applyHandicapStrokeAllocation as applyHandicapStrokeAllocationWithStandardRules } from "../hcp/standard"
import { applyHandicapStrokeAllocation as applyHandicapStrokeAllocationWithGamebookRules } from "../hcp/gamebook"
import { calculatePlayingHandicap } from "../hcp/handicap"
import { prepareScorecard } from "../common/scorecard"


const defaultStablefordOptions: CalculateStablefordOptions = {
    method: 'standard',
    hcpAllowance: 1.0,   // Default to a full 100% handicap allowance
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
    const [score, effectivePlayingHandicap] = calculatePointsAndEffectivePlayingHandicap(scorecard, options, adjustedPars)

    log.flush()
    return { score, strokes, phcp: effectivePlayingHandicap, scorecard }
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