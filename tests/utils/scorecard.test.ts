import 'jest-extended'

import { Scorecard } from "../../src/types";
import { tapiolaGolf } from '../fixtures/courses';
import { cloneScorecard, routing } from '../../src/utils/scorecard'


describe('Cloning a Scorecard object', () => {

    const scorecard: Scorecard = {
        date: "2024-08-10",
        course: tapiolaGolf,
        tee: '57',
        hcp: 9.0,
        gender: 'male',
        startingHole: 1,
        strokes: [4, 4, 4, 4, 4, 3, 4, 3, 3]
    }
    const clone = cloneScorecard(scorecard)
    const originalHoles = routing(scorecard).holes
    const clonedHoles = routing(clone).holes

    it('The resulting clone is equal to the original (has same type and structure)', () => {
        expect(clone).toStrictEqual(scorecard)
    })

    it('The clone itself is not supposed to be the same object', () => {
        expect(clone).not.toBe(scorecard)
    })

    it('The clone\'s fields are not supposed to be the same objects as in the original', () => {
        expect(clone.strokes).not.toBe(scorecard.strokes)
        expect(clone.course).not.toBe(scorecard.course)
        expect(clonedHoles).not.toBe(originalHoles)
        expect(clonedHoles[4]).not.toBe(originalHoles[4])
    })
})

describe('Getting the routing for a Scorecard', () => {
    const scorecard = (tee: string): Scorecard => ({
        date: "2024-08-10",
        course: tapiolaGolf,
        tee: tee,
        hcp: 9.0,
        gender: 'male',
        startingHole: 1,
        strokes: [4, 4, 4, 4, 4, 3, 4, 3, 3]
    })

    it('should return the correct tee indicated in the Scorecard', () => {
        const tee = routing(scorecard('57'))
        expect(tee.name).toBe('57')
    })

    it('should throw an error if the indicated tee does not exist', () => {
        expect(() => routing(scorecard('62'))).toThrow()
    })
})