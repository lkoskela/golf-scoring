import { Scorecard, CommonScoringOptions } from "../../types"
import { full18From } from "../../utils/course"
import { debug } from "../../utils/debug"
import { cloneScorecard, routing } from "../../utils/scorecard"

export const prepareScorecard = (originalScorecard: Scorecard, options: CommonScoringOptions): Scorecard => {
    const log = debug(originalScorecard, options)
    log.log(`Starting to prepare scorecard's course:\n${JSON.stringify(originalScorecard.course, null, 2)}`)

    const scorecard = cloneScorecard(originalScorecard)
    const tee = routing(scorecard)

    // Trim irrelevant hole routings
    scorecard.course.tees = [tee]

    // Nobody can have a handicap higher than 54.0 and even professionals wouldn't have a handicap lower than -10.0...
    if (scorecard.hcp < -10) throw new Error(`Player's handicap index (${scorecard.hcp}) cannot be lower than -10.0.`)
    if (scorecard.hcp > 54) throw new Error(`Player's handicap index (${scorecard.hcp}) cannot be higher than 54.0.`)

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
