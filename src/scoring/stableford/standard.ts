import { HoleRating, Scorecard } from '../../types'
import { playingHandicap } from '../../handicap/handicap'
import { CalculateStablefordOptions } from './types'
import { routing } from '../../utils/scorecard'
import { calculatePar } from '../../utils/course'
import { debug } from '../../utils/debug'


const resolveSlopeAndCourseRating = (scorecard: Scorecard): { slope: number, cr: number } => {
    const tee = routing(scorecard)
    if (scorecard.strokes.length === 18) {
        return { slope: tee.rating.full.slope, cr: tee.rating.full.cr }
    } else if (scorecard.strokes.length === 9) {
        if (scorecard.startingHole === 1) {
            return tee.rating.front ? tee.rating.front : tee.rating.full
        } else if (scorecard.startingHole === 10) {
            return tee.rating.back ? tee.rating.back : tee.rating.full
        } else {
            /* istanbul ignore next */
            throw new Error(`Cannot resolve slope and course rating for ${scorecard.course.name} with scores for ${scorecard.strokes.length} holes and starting on hole ${scorecard.startingHole} [standard logic]`)
        }
    } else if (scorecard.strokes.length === 12 && tee.holes.length === 12) {
        return { slope: tee.rating.full.slope, cr: tee.rating.full.cr }
    } else {
        throw new Error(`Cannot resolve slope and course rating for ${scorecard.course.name} with strokes for ${scorecard.strokes.length} holes when the course has ${tee.holes.length} holes [standard logic]`)
    }
}

export const applyHandicapStrokeAllocation = (scorecard: Scorecard, options: CalculateStablefordOptions, phcp: number, holes: Array<HoleRating>): Array<number> => {
    const log = debug(scorecard, options)
    const holesWithRelativeHCP = holes.map(hole => {
        return { ...hole, hcp: holes.filter(h => h.hcp <= hole.hcp).length }
    })
    const adjustedPars = holes.map((hole, index) => {
        const constantAdjustment = Math.floor(phcp / holes.length)
        const remainingStrokes = Math.floor(phcp - (holes.length * constantAdjustment))
        const variableAdjustment = remainingStrokes >= holesWithRelativeHCP[index].hcp ? 1 : 0
        log.log(`[standard] applyHandicapStrokeAllocation: Hole #${hole.hole}\tHCP ${hole.hcp} (${holesWithRelativeHCP[index].hcp})\tstroke allocation: ${constantAdjustment} + ${variableAdjustment} = ${constantAdjustment + variableAdjustment} strokes`)
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
    const log = debug(scorecard, { method: 'standard' })
    let { slope, cr } = resolveSlopeAndCourseRating(scorecard)

    const hcpAllowance = options.hcpAllowance || 1
    const tee = routing(scorecard)
    const coursePar = calculatePar(tee.holes)
    const parForPlayedHoles = calculatePar(tee.holes.slice(scorecard.startingHole - 1, scorecard.startingHole - 1 + scorecard.strokes.length))

    if (tee.holes.length === 18) {
        if (scorecard.strokes.length === 18) {
            const phcp = playingHandicap(scorecard.hcp * hcpAllowance, slope, cr, coursePar)
            log.log(`[standard:1] resolvePlayingHandicap: calculating PHCP with HCP=${scorecard.hcp}, SLOPE=${slope}, CR=${cr}, PAR=${coursePar} => PHCP=${phcp}`)
            log.flush()
            return { slope, cr, phcp }
        } else if (scorecard.strokes.length === 9) {
            const phcp = playingHandicap(scorecard.hcp * hcpAllowance/2, slope, cr, parForPlayedHoles)
            log.log(`[standard:2] resolvePlayingHandicap: calculating PHCP with HCP=${scorecard.hcp}, SLOPE=${slope}, CR=${cr}, PAR=${parForPlayedHoles} => PHCP=${phcp}`)
            log.flush()
            return { slope, cr, phcp }
        }
    }

    if (tee.holes.length === 9) {
        if (scorecard.strokes.length === 9) {
            const phcp = playingHandicap(scorecard.hcp * hcpAllowance/2, slope, cr, coursePar)
            log.log(`[standard:3] resolvePlayingHandicap: calculating PHCP with HCP=${scorecard.hcp/2}, SLOPE=${slope}, CR=${cr}, PAR=${coursePar} => PHCP=${phcp}`)
            log.flush()
            return { slope, cr, phcp }
        } else /* istanbul ignore next */ if (scorecard.strokes.length === 18) {
            console.warn(`Execution should never reach here – the course for a scorecard should've been expanded to 18 holes before this point!`)
            const phcp = playingHandicap(scorecard.hcp * hcpAllowance, slope, cr * 2, coursePar * 2)
            log.log(`[standard:4] resolvePlayingHandicap: calculating PHCP with HCP=${scorecard.hcp}, SLOPE=${slope}, CR=${cr * 2}, PAR=${coursePar * 2} => PHCP=${phcp}`)
            log.flush()
            return { slope, cr, phcp }
        }
    }

    if (tee.holes.length === 12 && scorecard.strokes.length === 12) {
        if (Math.abs(cr - coursePar) > 10) {
            log.log(`[standard:5] resolvePlayingHandicap: ${scorecard.course.name} has CR ${cr} and PAR ${coursePar} (${Math.abs(cr - coursePar)} difference) - this may be a 12-hole course with 18-hole ratings!?`)
            cr *= 12/18
        }
        const phcp = playingHandicap(scorecard.hcp * hcpAllowance * (12/18), slope, cr, coursePar)
        log.log(`[standard:6] resolvePlayingHandicap: calculating PHCP with HCP=${scorecard.hcp * (12/18)}, SLOPE=${slope}, CR=${cr}, PAR=${coursePar} => PHCP=${phcp}`)
        log.flush()
        return { slope, cr, phcp }
    }

    throw new Error(`Cannot resolve playing handicap for ${scorecard.course.name} with scores for ${scorecard.strokes.length} holes on a course with ${tee.holes.length} holes [standard logic]`)
}
