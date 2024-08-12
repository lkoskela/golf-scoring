import { playingHandicap } from '../../handicap/handicap'
import { Scorecard } from '../../types'

const resolveSlopeAndCourseRating = (scorecard: Scorecard): { slope: number, cr: number } => {
    const tee = scorecard.course.tees.find(t => t.name === scorecard.tee)
    if (!tee) {
        throw new Error(`Tee ${scorecard.tee} not found`)
    }
    if (scorecard.strokes.length === 18) {
        return { slope: tee.ratings.men.full.slope, cr: tee.ratings.men.full.cr }
    } else if (scorecard.strokes.length === 9) {
        if (scorecard.startingHole === 1) {
            return tee.ratings.men.front ? tee.ratings.men.front : tee.ratings.men.full
        } else if (scorecard.startingHole === 10) {
            return tee.ratings.men.back ? tee.ratings.men.back : tee.ratings.men.full
        } else {
            throw new Error(`Cannot resolve slope and course rating for ${scorecard.course.name} with scores for ${scorecard.strokes.length} holes and starting on hole ${scorecard.startingHole}`)
        }
    } else if (scorecard.strokes.length === 12 && scorecard.course.holes.length === 12) {
        return { slope: tee.ratings.men.full.slope, cr: tee.ratings.men.full.cr }
    } else {
        throw new Error(`Cannot resolve slope and course rating for ${scorecard.course.name} with strokes for ${scorecard.strokes.length} holes when the course has ${scorecard.course.holes.length} holes [standard logic]`)
    }
}

/**
 * Resolve the playing handicap to be used for allocating handicap strokes.
 * This is where the standard (USGA, R&A compliant) and gamebook implementations differ!
 *
 * @param scorecard Scorecard
 * @returns Playing handicap (always a whole number)
 */
export const resolvePlayingHandicap = (scorecard: Scorecard): { phcp: number, slope: number, cr: number } => {
    let { slope, cr } = resolveSlopeAndCourseRating(scorecard)

    const coursePar = scorecard.course.holes.reduce((acc, hole) => acc + hole.par, 0)

    if (scorecard.course.holes.length === 18 && (scorecard.strokes.length === 18 || scorecard.strokes.length === 9)) {
        return { slope, cr, phcp: playingHandicap(scorecard.hcp, slope, cr, coursePar) }
    }

    if (scorecard.course.holes.length === 9) {
        if (scorecard.strokes.length === 9) {
            return { slope, cr, phcp: playingHandicap(scorecard.hcp/2, slope, cr, coursePar) }
        } else if (scorecard.strokes.length === 18) {
            return { slope, cr, phcp: playingHandicap(scorecard.hcp, slope, cr * 2, coursePar * 2) }
        }
    }

    if (scorecard.course.holes.length === 12 && scorecard.strokes.length === 12) {
        if (Math.abs(cr - coursePar) > 10) {
            console.warn(`${scorecard.course.name} has CR ${cr} and PAR ${coursePar} (${Math.abs(cr - coursePar)} difference) - this may be a 12-hole course with 18-hole ratings!?`)
            cr *= 12/18
        }
        return { slope, cr, phcp: playingHandicap(scorecard.hcp * (12/18), slope, cr, coursePar) }
    }

    throw new Error(`Cannot resolve playing handicap for ${scorecard.course.name} with scores for ${scorecard.strokes.length} holes on a course with ${scorecard.course.holes.length} holes [standard logic]`)

    // If the scorecard has strokes for just 9 holes, we'll halve the player's handicap index
    // accordingly before calculating their course handicap.
    // const handicapIndexForCourseLength = scorecard.strokes.length === 9 ? scorecard.hcp / 2 : scorecard.hcp
    // return playingHandicap(handicapIndexForCourseLength, slope, cr, coursePar)
}
