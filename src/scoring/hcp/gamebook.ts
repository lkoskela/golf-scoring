import { playingHandicap } from '../../handicap/handicap'
import { HoleRating, Scorecard } from '../../types'
import { routing } from '../../utils/scorecard'
import { debug } from '../../utils/debug'
import { CalculateStablefordOptions } from '../stableford/types'


const resolveSlopeAndCourseRating = (scorecard: Scorecard): { slope: number, cr: number } => {
    const tee = routing(scorecard)
    if (scorecard.strokes.length === 18) {
        return { slope: tee.rating.full.slope, cr: tee.rating.full.cr }
    } else if (scorecard.strokes.length === 9 && tee.holes.length === 18) {
        return { slope: tee.rating.full.slope, cr: tee.rating.full.cr }
    } else if (scorecard.strokes.length === 9 && tee.holes.length === 9) {
        return {
            slope: tee.rating.front?.slope || tee.rating.full.slope,
            cr: tee.rating.front?.cr || tee.rating.full.cr/2
        }
    } else if (scorecard.strokes.length === 12 && tee.holes.length === 12) {
        return { slope: tee.rating.full.slope, cr: tee.rating.full.cr }
    }
    throw new Error(`Cannot resolve slope and course rating for ${scorecard.course.name} with strokes for ${scorecard.strokes.length} holes when the course has ${tee.holes.length} holes [Gamebook logic]`)
}

export const applyHandicapStrokeAllocation = (scorecard: Scorecard, options: CalculateStablefordOptions, phcp: number, holes: Array<HoleRating>): Array<number> => {
    const log = debug(scorecard, options)
    const tee = routing(scorecard)
    const adjustedPars = holes.map(hole => {
        const constantAdjustment = Math.floor(phcp / tee.holes.length)
        const remainingStrokes = Math.floor(phcp - (tee.holes.length * constantAdjustment))
        const variableAdjustment = remainingStrokes >= hole.hcp ? 1 : 0
        log.log(`[gamebook] applyHandicapStrokeAllocation: Hole #${hole.hole}\tHCP ${hole.hcp}\t PHCP=${phcp} => stroke allocation: ${constantAdjustment} + ${variableAdjustment} = ${constantAdjustment + variableAdjustment} strokes`)
        return hole.par + constantAdjustment + variableAdjustment
    })
    log.flush()
    return adjustedPars
}

/**
 * Resolve the playing handicap to be used for allocating handicap strokes.
 * This is where the standard (USGA, R&A compliant) and gamebook implementations differ!
 *
 * @param scorecard Scorecard
 * @returns Playing handicap (always a whole number)
 */
export const resolvePlayingHandicap = (scorecard: Scorecard, options: CalculateStablefordOptions): { phcp: number, slope: number, cr: number } => {
    let { slope, cr } = resolveSlopeAndCourseRating(scorecard)
    const tee = routing(scorecard)

    const hcpAllowance = options.hcpAllowance || 1
    const playedHoles = tee.holes.slice(scorecard.startingHole - 1, scorecard.startingHole - 1 + scorecard.strokes.length)
    const wholeCoursePar = tee.holes.reduce((acc, hole) => acc + hole.par, 0)
    const playedCoursePar = playedHoles.reduce((acc, hole) => acc + hole.par, 0)

    if (tee.holes.length === 18) {
        if (scorecard.strokes.length === tee.holes.length) {
            const phcp = playingHandicap(scorecard.hcp * hcpAllowance, slope, cr, wholeCoursePar)
            if (phcp < 0) console.warn(`B playingHandicap(${scorecard.hcp * hcpAllowance}, ${slope}, ${cr}, ${wholeCoursePar}) => negative playing handicap (${phcp}) - ${scorecard.strokes.length}/${tee.holes.length} holes played, starting on ${scorecard.startingHole}. CR=${cr}. SLOPE=${slope}. Course par is ${wholeCoursePar}. Played holes' par is ${playedCoursePar}. [Gamebook logic]`)
            return { phcp, slope, cr }
        } else if (scorecard.strokes.length === 9) {
            const phcp = playingHandicap(scorecard.hcp * hcpAllowance, slope, cr, wholeCoursePar)
            if (phcp < 0) console.warn(`A playingHandicap(${scorecard.hcp * hcpAllowance}, ${slope}, ${cr}, ${wholeCoursePar}) => negative playing handicap (${phcp}) - ${scorecard.strokes.length}/${tee.holes.length} holes played, starting on ${scorecard.startingHole}. CR=${cr}. SLOPE=${slope}. Course par is ${wholeCoursePar}. Played holes' par is ${playedCoursePar}. [Gamebook logic] Scorecard:\n${JSON.stringify(scorecard, null, 2)}`)
            return { phcp, slope, cr }
        }
    }

    if (tee.holes.length === 9) {
        if (scorecard.strokes.length === tee.holes.length) {
            const phcp = playingHandicap(scorecard.hcp * hcpAllowance/2, slope, cr, wholeCoursePar)
            if (phcp < 0) console.warn(`C playingHandicap(${scorecard.hcp * hcpAllowance/2}, ${slope}, ${cr}, ${wholeCoursePar}) => negative playing handicap (${phcp}) - ${scorecard.strokes.length}/${tee.holes.length} holes played, starting on ${scorecard.startingHole}. CR=${cr}. SLOPE=${slope}. Course par is ${wholeCoursePar}. Played holes' par is ${playedCoursePar}. [Gamebook logic]`)
            return { phcp, slope, cr }
        } else /* istanbul ignore next */ if (scorecard.strokes.length === tee.holes.length * 2) {
            console.warn(`Execution should never reach here – the course for a scorecard should've been expanded to 18 holes before this point!`)
            const phcp = playingHandicap(scorecard.hcp * hcpAllowance, slope, cr * 2, wholeCoursePar * 2)
            if (phcp < 0) console.warn(`D playingHandicap(${scorecard.hcp * hcpAllowance}, ${slope}, ${cr * 2}, ${wholeCoursePar * 2}) => negative playing handicap (${phcp}) - ${scorecard.strokes.length}/${tee.holes.length} holes played, starting on ${scorecard.startingHole}. CR=${cr}. SLOPE=${slope}. Course par is ${wholeCoursePar}. Played holes' par is ${playedCoursePar}. [Gamebook logic]`)
            return { phcp, slope, cr }
        }
    }

    if (tee.holes.length === 12) {
        if (scorecard.strokes.length === tee.holes.length) {
            if (Math.abs(cr - wholeCoursePar) > 10) {
                console.warn(`${scorecard.course.name} has CR ${cr} and PAR ${wholeCoursePar} (${Math.abs(cr - wholeCoursePar)} difference) - this may be a 12-hole course with 18-hole ratings!?`)
                cr = cr * (tee.holes.length/18)
            }
            return { slope, cr, phcp: playingHandicap(scorecard.hcp * hcpAllowance * (12/18), slope, cr, wholeCoursePar) }
        }
    }

    /* istanbul ignore next */
    throw new Error(`Cannot resolve playing handicap for ${scorecard.course.name} with scores for ${scorecard.strokes.length} holes on a course with ${tee.holes.length} holes [Gamebook logic]`)
}
