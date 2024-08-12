import 'jest-extended'

import { Scorecard } from "../../src/types";
import { tapiolaGolf } from '../fixtures/courses';
import { cloneScorecard } from '../../src/utils/scorecard'


describe('Cloning a Scorecard object', () => {

    const scorecard: Scorecard = {
        course: tapiolaGolf,
        tee: '57',
        date: "2024-08-10",
        hcp: 9.0,
        startingHole: 1,
        strokes: [4, 4, 4, 4, 4, 3, 4, 3, 3]
    }
    const clone = cloneScorecard(scorecard)

    it('The resulting clone is equal to the original (has same type and structure)', () => {
        expect(clone).toStrictEqual(scorecard)
    })

    it('The clone itself is not supposed to be the same object', () => {
        expect(clone).not.toBe(scorecard)
    })

    it('The clone\'s fields are not supposed to be the same objects as in the original', () => {
        expect(clone.strokes).not.toBe(scorecard.strokes)
        expect(clone.course).not.toBe(scorecard.course)
        expect(clone.course.holes).not.toBe(scorecard.course.holes)
        expect(clone.course.holes[4]).not.toBe(scorecard.course.holes[4])
    })
})
