import { Scorecard, CourseRouting } from '../types'

export const cloneScorecard = (scorecard: Scorecard): Scorecard => {
    return JSON.parse(JSON.stringify(scorecard)) as Scorecard
}

export const routing = (scorecard: Scorecard): CourseRouting => {
    const tee = scorecard.course.tees.find(t => t.name === scorecard.tee && t.gender === scorecard.gender)
    if (tee) {
        return tee
    }
    throw new Error(`Tee ${scorecard.tee}/${scorecard.gender} not found`)
}
