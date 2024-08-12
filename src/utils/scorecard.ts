import { Scorecard } from '../types'

export const cloneScorecard = (scorecard: Scorecard): Scorecard => {
    return JSON.parse(JSON.stringify(scorecard)) as Scorecard
}
