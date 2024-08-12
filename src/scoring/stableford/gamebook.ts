import { playingHandicap } from '../../handicap/handicap'
import { Scorecard } from '../../types'


const resolveSlopeAndCourseRating = (scorecard: Scorecard): { slope: number, cr: number } => {
    const tee = scorecard.course.tees.find(t => t.name === scorecard.tee)
    if (!tee) {
        throw new Error(`Tee ${scorecard.tee} not found`)
    }
    if (scorecard.strokes.length === 18) {
        return { slope: tee.ratings.men.full.slope, cr: tee.ratings.men.full.cr }
    } else if (scorecard.strokes.length === 9 && scorecard.course.holes.length === 18) {
        return { slope: tee.ratings.men.full.slope, cr: tee.ratings.men.full.cr }
    } else if (scorecard.strokes.length === 9 && scorecard.course.holes.length === 9) {
        return {
            slope: tee.ratings.men.front?.slope || tee.ratings.men.full.slope,
            cr: tee.ratings.men.front?.cr || tee.ratings.men.full.cr/2
        }
    } else if (scorecard.strokes.length === 12 && scorecard.course.holes.length === 12) {
        return { slope: tee.ratings.men.full.slope, cr: tee.ratings.men.full.cr }
    }
    throw new Error(`Cannot resolve slope and course rating for ${scorecard.course.name} with strokes for ${scorecard.strokes.length} holes when the course has ${scorecard.course.holes.length} holes [Gamebook logic]`)
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

    const playedHoles = scorecard.course.holes.slice(scorecard.startingHole - 1, scorecard.startingHole - 1 + scorecard.strokes.length)
    const wholeCoursePar = scorecard.course.holes.reduce((acc, hole) => acc + hole.par, 0)
    const playedCoursePar = playedHoles.reduce((acc, hole) => acc + hole.par, 0)

    if (scorecard.course.holes.length === 18) {
        if (scorecard.strokes.length === scorecard.course.holes.length) {
            const phcp = playingHandicap(scorecard.hcp, slope, cr, wholeCoursePar)
            if (phcp < 0) console.warn(`B playingHandicap(${scorecard.hcp}, ${slope}, ${cr}, ${wholeCoursePar}) => negative playing handicap (${phcp}) - ${scorecard.strokes.length}/${scorecard.course.holes.length} holes played, starting on ${scorecard.startingHole}. CR=${cr}. SLOPE=${slope}. Course par is ${wholeCoursePar}. Played holes' par is ${playedCoursePar}. [Gamebook logic]`)
            return { phcp, slope, cr }
        } else if (scorecard.strokes.length === 9) {
            const phcp = playingHandicap(scorecard.hcp, slope, cr, wholeCoursePar)
            if (phcp < 0) console.warn(`A playingHandicap(${scorecard.hcp}, ${slope}, ${cr}, ${wholeCoursePar}) => negative playing handicap (${phcp}) - ${scorecard.strokes.length}/${scorecard.course.holes.length} holes played, starting on ${scorecard.startingHole}. CR=${cr}. SLOPE=${slope}. Course par is ${wholeCoursePar}. Played holes' par is ${playedCoursePar}. [Gamebook logic] Scorecard:\n${JSON.stringify(scorecard, null, 2)}`)
            return { phcp, slope, cr }
        }
    }

    if (scorecard.course.holes.length === 9) {
        if (scorecard.strokes.length === scorecard.course.holes.length) {
            const phcp = playingHandicap(scorecard.hcp/2, slope, cr, wholeCoursePar)
            if (phcp < 0) console.warn(`C playingHandicap(${scorecard.hcp/2}, ${slope}, ${cr}, ${wholeCoursePar}) => negative playing handicap (${phcp}) - ${scorecard.strokes.length}/${scorecard.course.holes.length} holes played, starting on ${scorecard.startingHole}. CR=${cr}. SLOPE=${slope}. Course par is ${wholeCoursePar}. Played holes' par is ${playedCoursePar}. [Gamebook logic]`)
            return { phcp, slope, cr }
        } else if (scorecard.strokes.length === scorecard.course.holes.length * 2) {
            const phcp = playingHandicap(scorecard.hcp, slope, cr * 2, wholeCoursePar * 2)
            if (phcp < 0) console.warn(`D playingHandicap(${scorecard.hcp}, ${slope}, ${cr * 2}, ${wholeCoursePar * 2}) => negative playing handicap (${phcp}) - ${scorecard.strokes.length}/${scorecard.course.holes.length} holes played, starting on ${scorecard.startingHole}. CR=${cr}. SLOPE=${slope}. Course par is ${wholeCoursePar}. Played holes' par is ${playedCoursePar}. [Gamebook logic]`)
            return { phcp, slope, cr }
        }
    }

    if (scorecard.course.holes.length === 12) {
        if (scorecard.strokes.length === scorecard.course.holes.length) {
            if (Math.abs(cr - wholeCoursePar) > 10) {
                console.warn(`${scorecard.course.name} has CR ${cr} and PAR ${wholeCoursePar} (${Math.abs(cr - wholeCoursePar)} difference) - this may be a 12-hole course with 18-hole ratings!?`)
                cr = cr * (scorecard.course.holes.length/18)
            }
            return { slope, cr, phcp: playingHandicap(scorecard.hcp * (12/18), slope, cr, wholeCoursePar) }
        }
    }

    throw new Error(`Cannot resolve playing handicap for ${scorecard.course.name} with scores for ${scorecard.strokes.length} holes on a course with ${scorecard.course.holes.length} holes [Gamebook logic]`)
}
