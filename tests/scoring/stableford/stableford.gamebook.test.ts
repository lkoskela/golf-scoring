import 'jest-extended'

import { frontNineFrom, backNineFrom } from '../../../src/utils/course'
import { calculateStableford } from '../../../src/scoring/stableford/stableford'
import { Scorecard, Course, HoleRating, TeeRating } from "../../../src/types";


const tee = (name: string,
             srMen: [number, number, number],
             crMen: [number, number, number],
             srLadies: [number, number, number],
             crLadies: [number, number, number]
            ): TeeRating => {
    const [srMenFull18, srMenFront, srMenBack] = srMen
    const [srLadiesFull18, srLadiesFront, srLadiesBack] = srLadies
    const [crMenFull18, crMenFront, crMenBack] = crMen
    const [crLadiesFull18, crLadiesFront, crLadiesBack] = crLadies
    return {
        name: name,
        ratings: {
            men: {
                full: {
                    slope: srMenFull18,
                    cr: crMenFull18,
                },
                front: {
                    slope: srMenFront,
                    cr: crMenFront,
                },
                back: {
                    slope: srMenBack,
                    cr: crMenBack,
                },
            },
            ladies: {
                full: {
                    slope: srLadiesFull18,
                    cr: crLadiesFull18,
                },
                front: {
                    slope: srLadiesFront,
                    cr: crLadiesFront,
                },
                back: {
                    slope: srLadiesBack,
                    cr: crLadiesBack,
                },
            }
        }
    }
}

const hole = (hole: number, par: number, hcp: number): HoleRating => {
    return {
        hole: hole,
        par: par,
        hcp: hcp
    }
}

const tapiolaGolf: Course = {
    name: 'Tapiola Golf',
    tees: [
        tee('61', [127, 119, 135], [72.8, 35.8, 37.0], [0, 0, 0], [0, 0, 0]),
        tee('57', [123, 115, 131], [70.5, 34.7, 35.8], [135, 127, 143], [75.5, 37.0, 38.5]),
        tee('52', [118, 110, 126], [68.1, 33.6, 34.5], [128, 120, 136], [72.5, 35.6, 36.9]),
        tee('46', [113, 105, 120], [65.5, 32.3, 33.2], [122, 114, 130], [69.3, 34.0, 35.3]),
        tee('35', [101,  93, 109], [59.7, 29.3, 30.4], [107,  98, 116], [62.2, 30.3, 31.9]),
    ],
    holes: [
        hole(1, 5, 14),
        hole(2, 3, 18),
        hole(3, 4, 12),
        hole(4, 3, 8),
        hole(5, 5, 6),
        hole(6, 4, 10),
        hole(7, 4, 4),
        hole(8, 4, 16),
        hole(9, 4, 2),
        hole(10, 4, 3),
        hole(11, 5, 17),
        hole(12, 4, 11),
        hole(13, 3, 9),
        hole(14, 4, 15),
        hole(15, 4, 1),
        hole(16, 4, 7),
        hole(17, 4, 13),
        hole(18, 4, 5),
    ]
}

const tapiolaGolfFrontNine: Course = frontNineFrom(tapiolaGolf)

const tapiolaGolfBackNine: Course = backNineFrom(tapiolaGolf)

const talmaPar3: Course = {
    name: 'Golf Talma Par3',
    tees: [
        tee('yellow', [76, 76, 76], [52.7, 26.4, 26.3], [81, 81, 81], [54.8, 27.4, 27.4]),
        tee('red',    [73, 73, 73], [51.2, 25.6, 25.6], [78, 78, 78], [53.5, 26.8, 26.7]),
    ],
    holes: [
        hole(1, 3, 9),
        hole(2, 3, 2),
        hole(3, 3, 5),
        hole(4, 3, 3),
        hole(5, 3, 4),
        hole(6, 3, 8),
        hole(7, 3, 7),
        hole(8, 3, 6),
        hole(9, 3, 1),
    ]
}

//
// Reference:
// https://www.usga.org/content/usga/home-page/handicapping/roh/Content/rules/6%201%20Course%20Handicap%20Calculation.htm
//
describe('Calculating Stableford points', () => {

    describe('for a 9-hole round', () => {

        describe('at a 9-hole course', () => {

            describe('with standard USGA/R&A logic', () => {

                // 2.8.2024 at Golf Talma playing the Par-3 course with hcp 15.4 (pchp 9)
                it('15.4 HCP playing Golf Talma Par3 from yellow tees on 2.8.2024', () => {
                    const scorecard: Scorecard = {
                        course: talmaPar3,
                        tee: 'yellow',
                        date: new Date(Date.parse("2024-08-02")),
                        hcp: 15.4,
                        startingHole: 1,
                        strokes: [4, 4, 4, 4, 4, 3, 4, 3, 3]
                    }
                    const scoring = calculateStableford(scorecard)
                    expect(scoring.strokes).toBe(33)
                    expect(scoring.phcp).toBe(5)
                    expect(scoring.points).toBe(17)
                })
            })

            describe('with Gamebook logic', () => {

                // 2.8.2024 at Golf Talma playing the Par-3 course with hcp 15.4 (pchp 9)
                it('15.4 HCP playing Golf Talma Par3 from yellow tees on 2.8.2024', () => {
                    const scorecard: Scorecard = {
                        course: talmaPar3,
                        tee: 'yellow',
                        date: new Date(Date.parse("2024-08-02")),
                        hcp: 15.4,
                        startingHole: 1,
                        strokes: [4, 4, 4, 4, 4, 3, 4, 3, 3]
                    }
                    const scoring = calculateStableford(scorecard, { method: 'gamebook' })
                    expect(scoring.strokes).toBe(33)
                    expect(scoring.phcp).toBe(5)
                    expect(scoring.points).toBe(17)
                })
            })
        })

        describe('at an 18-hole course', () => {

            describe('with standard USGA/R&A logic', () => {

                describe('15.8 HCP playing Tapiola Golf back nine from "46" tees on 8.7.2024', () => {
                    const scorecard: Scorecard = {
                        course: tapiolaGolfBackNine,
                        tee: '46',
                        date: new Date(Date.parse("2024-07-08")),
                        hcp: 15.8,
                        startingHole: 10,
                        strokes: [5, 7, 4, 3, 5, 6, 5, 4, 5]
                    }

                    it('with implicit "standard" mode', () => {
                        const scoring = calculateStableford(scorecard)
                        expect(scoring.strokes).toBe(44)
                        expect(scoring.phcp).toBe(6)
                        expect(scoring.points).toBe(16)
                    })

                    it('with explicit "standard" mode', () => {
                        const scoring = calculateStableford(scorecard, { method: 'standard' })
                        expect(scoring.strokes).toBe(44)
                        expect(scoring.phcp).toBe(6)
                        expect(scoring.points).toBe(16)
                    })
                })

                it('51.0 HCP playing Tapiola Golf back nine from "46" tees on 8.7.2024', () => {
                    const scorecard: Scorecard = {
                        course: tapiolaGolfBackNine,
                        tee: '46',
                        date: new Date(Date.parse("2024-07-08")),
                        hcp: 51.0,
                        startingHole: 10,
                        strokes: [8, 7, 6, 5, 6, 7, 6, 8, 5]
                    }
                    const scoring = calculateStableford(scorecard)
                    expect(scoring.strokes).toBe(58)
                    expect(scoring.phcp).toBe(24)
                    expect(scoring.points).toBe(20)
                })

                describe('15.8 HCP playing Tapiola Golf front nine from "52" tees on 29.7.2024', () => {
                    const scorecard: Scorecard = {
                        course: tapiolaGolfFrontNine,
                        tee: '52',
                        date: new Date(Date.parse("2024-07-29")),
                        hcp: 15.8,
                        startingHole: 1,
                        strokes: [7, 4, 5, 4, 8, 5, 6, 5, 4]
                    }

                    it('with implicit "standard" mode', () => {
                        const scoring = calculateStableford(scorecard)
                        expect(scoring.strokes).toBe(48)
                        expect(scoring.phcp).toBe(5)
                        expect(scoring.points).toBe(11)
                    })

                    it('with explicit "standard" mode', () => {
                        const scoring = calculateStableford(scorecard, { method: 'standard' })
                        expect(scoring.strokes).toBe(48)
                        expect(scoring.phcp).toBe(5)
                        expect(scoring.points).toBe(11)
                    })
                })
            })

            describe('with GolfGamebook logic', () => {

                it('15.8 HCP playing Tapiola Golf back nine from "46" tees', () => {
                    const scorecard: Scorecard = {
                        course: tapiolaGolf,
                        tee: '46',
                        date: new Date(Date.parse("2024-07-08")),
                        hcp: 15.8,
                        startingHole: 10,
                        strokes: [5, 7, 4, 3, 5, 6, 5, 4, 5]
                    }
                    const scoring = calculateStableford(scorecard, { method: 'gamebook' })
                    expect(scoring.strokes).toBe(44)
                    expect(scoring.phcp).toBe(5)
                    expect(scoring.points).toBe(15)
                })

                it('15.8 HCP playing Tapiola Golf front nine from "46" tees', () => {
                    const scorecard: Scorecard = {
                        course: tapiolaGolf,
                        tee: '46',
                        date: new Date(Date.parse("2024-07-08")),
                        hcp: 15.8,
                        startingHole: 1,
                        strokes: [5, 3, 4, 3, 5, 4, 4, 4, 4]
                    }
                    const scoring = calculateStableford(scorecard, { method: 'gamebook' })
                    expect(scoring.strokes).toBe(36)
                    expect(scoring.phcp).toBe(4)
                    expect(scoring.points).toBe(22)
                })

                it('15.8 HCP playing Tapiola Golf front nine from "52" tees on 30.7.2024', () => {
                    const scorecard: Scorecard = {
                        course: tapiolaGolf,
                        tee: '52',
                        date: new Date(Date.parse("2024-07-30")),
                        hcp: 15.8,
                        startingHole: 1,
                        strokes: [7, 4, 5, 4, 8, 5, 6, 5, 4]
                    }
                    const scoring = calculateStableford(scorecard, { method: 'gamebook' })
                    expect(scoring.strokes).toBe(48)
                    expect(scoring.phcp).toBe(6)
                    expect(scoring.points).toBe(12)
                })
            })
        })
    })

    describe('for an 18-hole round', () => {

        describe('at a 9-hole course', () => {
            describe('Golf Talma', () => {
                describe('15.8 HCP playing Talma Par 3 twice from yellow tees', () => {
                    const scorecard: Scorecard = {
                        course: talmaPar3,
                        tee: 'yellow',
                        date: new Date(Date.parse("2024-04-01")),
                        hcp: 15.6,
                        startingHole: 1,
                        strokes: [4, 3, 4, 4, 3, 3, 4, 5, 4, 3, 3, 4, 4, 4, 5, 3, 3, 5]
                    }
                    const scoring = calculateStableford(scorecard)

                    describe('the 9-hole course is extended to 18', () => {

                        describe('holes are extended to 18', () => {

                            it('there are 18 holes instead of 9', () => {
                                expect(scoring.scorecard.course.holes.length).toBe(18)
                            })

                            it('hole numbers run from 1-18', () => {
                                expect(scoring.scorecard.course.holes.map(h => h.hole)).toStrictEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18])
                            })
                        })

                        describe('stroke indexes are allocated correctly between front and back nine', () => {
                            const indexes = scoring.scorecard.course.holes.map(h => h.hcp)
                            const frontNineIndexes = indexes.slice(0, 9)
                            const backNineIndexes = indexes.slice(9, 18)

                            it('there are 18 unique stroke indexes', () => {
                                expect([...new Set(indexes)].length).toBe(18)
                            })

                            it('the front nine has odd HCP indexes from 1 to 17', () => {
                                expect(frontNineIndexes).toContainAllValues([1, 3, 5, 7, 9, 11, 13, 15, 17])
                            })

                            it('the back nine has even HCP indexes from 2 to 18', () => {
                                expect(backNineIndexes).toContainAllValues([2, 4, 6, 8, 10, 12, 14, 16, 18])
                            })
                        })
                    })

                    describe('scores are correct', () => {
                        it('strokes are calculated for all 18 holes', () => {
                            expect(scoring.strokes).toBe(68)
                        })

                        it('the course handicap is calculated correctly', () => {
                            expect(scoring.phcp).toBe(9)
                        })

                        it('Stableford points are calculated correctly', () => {
                            expect(scoring.points).toBe(31)
                        })
                    })
                })
            })
        })

        describe('at an 18-hole course', () => {

            describe('Tapiola Golf', () => {
                it('15.4 HCP playing Tapiola Golf yellow (57) tees on 31.7.2024', () => {
                    const scorecard: Scorecard = {
                        course: tapiolaGolf,
                        tee: '57',
                        date: new Date(Date.parse("2024-07-31")),
                        hcp: 15.7,
                        startingHole: 1,
                        strokes: [4, 3, 4, 4, 6, 5, 4, 5, 4, 5, 6, 7, 4, 4, 5, 4, 6, 6]
                    }
                    const scoring = calculateStableford(scorecard)
                    expect(scoring.strokes).toBe(86)
                    expect(scoring.points).toBe(38)
                })

                it('16.3 HCP playing Tapiola Golf yellow (57) tees on 4.7.2024', () => {
                    const scorecard: Scorecard = {
                        course: tapiolaGolf,
                        tee: '57',
                        date: new Date(Date.parse("2024-07-04")),
                        hcp: 16.3,
                        startingHole: 1,
                        strokes: [6, 6, 3, 4, 5, 4, 6, 5, 4, 5, 6, 5, 4, 4, 6, 4, 5, 4]
                    }
                    const scoring = calculateStableford(scorecard)
                    expect(scoring.strokes).toBe(86)
                    expect(scoring.points).toBe(39)
                })

                it('15.3 HCP playing Tapiola Golf yellow (57) tees on 15.6.2024', () => {
                    const scorecard: Scorecard = {
                        course: tapiolaGolf,
                        tee: '57',
                        date: new Date(Date.parse("2024-06-15")),
                        hcp: 15.3,
                        startingHole: 1,
                        strokes: [7, 5, 3, 4, 5, 5, 6, 5, 5, 5, 5, 5, 5, 6, 5, 5, 5, 5]
                    }
                    const scoring = calculateStableford(scorecard)
                    expect(scoring.strokes).toBe(91)
                    expect(scoring.points).toBe(32)
                })

                it('51.9 HCP playing Tapiola Golf red (46) tees on 19.5.2024', () => {
                    const scorecard: Scorecard = {
                        course: tapiolaGolf,
                        tee: '46',
                        date: new Date(Date.parse("2024-05-19")),
                        hcp: 51.9,
                        startingHole: 1,
                        strokes: [6, 5, 8, 3, 8, 6, 9, 7, 10, 8, 7, 6, 5, 6, 7, 8, 7, 6]
                    }
                    const scoring = calculateStableford(scorecard)
                    expect(scoring.strokes).toBe(122)
                    expect(scoring.points).toBe(32)
                })
            })
        })

    })

    // TODO: What if the scorecard has 18 hole scores, the course has 18 holes, but the starting hole is 10?

})
