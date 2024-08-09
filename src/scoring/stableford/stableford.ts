import { DateTime } from "luxon"
import { Scorecard } from "../../types"
import { full18From } from "../../utils/course"
import { StablefordScore, CalculateStablefordOptions } from "./types"
import { resolvePlayingHandicap as resolvePlayingHandicapWithStandardRules } from "./standard"
import { resolvePlayingHandicap as resolvePlayingHandicapWithGamebookRules } from "./gamebook"

const DEBUG_ENABLED = false
const DEBUG_HCP: number|undefined = 15.8
const DEBUG_STROKES: number|undefined = 44
const DEBUG_TEE: string|undefined = '46'
const DEBUG_METHOD: 'gamebook'|'standard'|undefined = 'gamebook'

const isDebug = (scorecard: Scorecard, options: CalculateStablefordOptions): boolean => {
    if (DEBUG_ENABLED) {
        if (DEBUG_STROKES) {
            const actualStrokes = scorecard.strokes.reduce((acc, s) => acc + s, 0)
            if (actualStrokes !== DEBUG_STROKES) return false
        }
        if (DEBUG_HCP && DEBUG_HCP !== scorecard.hcp) {
            return false
        }
        if (DEBUG_TEE && DEBUG_TEE !== scorecard.tee) {
            return false
        }
        if (DEBUG_METHOD && DEBUG_METHOD !== options.method) {
            return false
        }
    }
    return DEBUG_ENABLED
}

const cloneScorecard = (scorecard: Scorecard): Scorecard => {
    const dateserializer = (_key: string, value: any): any => {
        if (value.toISOString) {
            return '###DateISOString###' + (value as Date).toISOString()
        } else {
            return value
        }
    }
    const datereviver = (_key: string, value: any): any => {
        if (typeof value === 'string' && value.startsWith('###DateISOString###')) {
            return new Date(value.substring('###DateISOString###'.length))
        } else {
            return value
        }
    }
    return JSON.parse(JSON.stringify(scorecard, dateserializer), datereviver) as Scorecard
}

const defaultStablefordOptions: CalculateStablefordOptions = {
    method: 'standard',
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
    type PlayingHandicapResolutionImplementation = (scorecard: Scorecard) => { phcp: number, slope: number, cr: number }

    const selectPHCPImplementation = (options: CalculateStablefordOptions): PlayingHandicapResolutionImplementation => {
        if (options.method === 'standard') {
            return resolvePlayingHandicapWithStandardRules
        } else if (options.method === 'gamebook') {
            return resolvePlayingHandicapWithGamebookRules
        } else {
            throw new Error(`Unknown Stableford calculation method: ${options.method}`)
        }
    }
    return selectPHCPImplementation(options)(scorecard)
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
    const DEBUG = isDebug(scorecard, options)
    if (DEBUG) console.log(`Starting to prepare scorecard's course:\n${JSON.stringify(scorecard.course, null, 2)}`)
    // If the scorecard suggests the player has played more holes than the course has, we'll
    // extrapolate the full 18-hole course from the 9-hole course by simply repeating it twice.
    if (scorecard.course.holes.length < scorecard.strokes.length) {
        if (scorecard.course.holes.length === 9 && scorecard.strokes.length === 18) {
            scorecard.course = full18From(scorecard.course)
        } else {
            throw new Error(`Course ${scorecard.course.name} has only ${scorecard.course.holes.length} holes, but ${scorecard.strokes.length} strokes were recorded!`)
        }
    }

    if (options.method !== 'gamebook') {
        if (scorecard.course.holes.length < 18) {
            const maxHcpBefore = Math.max(...scorecard.course.holes.map(h => h.hcp))
            if (maxHcpBefore > 9) {
                if (scorecard.course.holes.find(h => h.hcp === 2)) {
                    scorecard.course.holes = scorecard.course.holes.map(h => ({ ...h, hcp: Math.round(h.hcp / 2) }))
                } else {
                    scorecard.course.holes = scorecard.course.holes.map(h => ({ ...h, hcp: Math.round((h.hcp + 1) / 2) }))
                }
            }
        }
    }

    if (DEBUG) console.log(`Finished preparing scorecard's course:\n${JSON.stringify(scorecard.course, null, 2)}`)
    return scorecard
}

const calculateStablefordScore = (scorecard: Scorecard, options: CalculateStablefordOptions): StablefordScore => {
    const DEBUG = isDebug(scorecard, options)
    const DEBUG_MSGS: string[] = []

    if (DEBUG) DEBUG_MSGS.push(`Scorecard for ${scorecard.course.name} on ${JSON.stringify(scorecard.date)} ${DateTime.fromJSDate(scorecard.date).toISODate()}:\n${JSON.stringify(scorecard, null, 2)}`);

    const playedHoles = scorecard.course.holes.slice(scorecard.startingHole - 1, scorecard.startingHole - 1 + scorecard.strokes.length)
    const coursePar = playedHoles.reduce((acc, hole) => acc + hole.par, 0)
    const { phcp, slope, cr } = calculatePlayingHandicap(scorecard, options)
    if (DEBUG) DEBUG_MSGS.push(`Player's handicap index is ${scorecard.hcp} and course handicap for SR=${slope}, CR=${cr}, PAR=${coursePar} is ${phcp}`)

    const adjustedPars = scorecard.course.holes.map(hole => {
        const constantAdjustment = Math.floor(phcp / scorecard.course.holes.length)
        const remainingStrokes = Math.floor(phcp - (scorecard.course.holes.length * constantAdjustment))
        const variableAdjustment = remainingStrokes >= hole.hcp ? 1 : 0
        if (DEBUG) DEBUG_MSGS.push(`Hole #${hole.hole} stroke allocation: ${constantAdjustment} + ${variableAdjustment} = ${constantAdjustment + variableAdjustment} strokes`)
        return hole.par + constantAdjustment + variableAdjustment
    })

    if (DEBUG) DEBUG_MSGS.push(`Stableford points for ${scorecard.course.name} (${scorecard.tee}) on ${DateTime.fromJSDate(scorecard.date).toISODate()} with playing handicap ${phcp}:`)
    const strokes = scorecard.strokes.reduce((acc, s) => acc + s, 0)
    const [points, effectivePlayingHandicap] = calculatePointsAndEffectivePlayingHandicap(scorecard, adjustedPars, DEBUG, DEBUG_MSGS)

    if (DEBUG) console.log(DEBUG_MSGS.join('\n'))
    return { points, strokes, phcp: effectivePlayingHandicap, scorecard }
}

const calculatePointsAndEffectivePlayingHandicap = (scorecard: Scorecard, adjustedPars: number[], DEBUG: boolean = false, DEBUG_MSGS: string[] = []): [number, number] => {
    let effectivePlayingHandicap = 0
    const points = scorecard.strokes.map((strokes, index) => {
        const i = scorecard.startingHole < scorecard.course.holes.length ? index + (scorecard.startingHole - 1) : index
        const adjustedPar = adjustedPars[i]
        const strokesAllocated = adjustedPar - scorecard.course.holes[i].par
        effectivePlayingHandicap += strokesAllocated
        const adjustmentSymbol = strokesAllocated > 0 ? '+' : strokesAllocated < 0 ? '-' : ''
        const adjustedParIndicator = adjustmentSymbol.repeat(Math.abs(strokesAllocated))
        const differenceToPar = 2 + adjustedPar - strokes
        const stablefordPoints = Math.max(0, differenceToPar)
        if (DEBUG) DEBUG_MSGS.push(`#${i+1}:  hcp=${scorecard.course.holes[i].hcp}\tpar=${scorecard.course.holes[i].par}${adjustedParIndicator}\t=> ${adjustedPar}\tstrokes=${strokes}\tpts=${stablefordPoints}`)
        return stablefordPoints
    }).reduce((acc, p) => acc + p, 0);
    return [points, effectivePlayingHandicap]
}