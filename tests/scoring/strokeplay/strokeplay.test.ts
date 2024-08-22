import 'jest-extended'

import { calculateStrokeplay } from '../../../src/scoring/strokeplay/strokeplay'
import { StrokeplayScore } from '../../../src/scoring/strokeplay/types';
import { Scorecard } from "../../../src/types";
import { tapiolaGolf, talmaPar3, belmont12holes, shiskine12holes } from '../../fixtures/courses';

const forEachScoringMethod = (callback: (method: 'standard' | 'gamebook') => void) => {
    const methods = ['standard', 'gamebook'] as Array<'standard' | 'gamebook'>
    methods.forEach(method => callback(method))
}


describe('Calculating Strokeplay score', () => {

    describe('for a 12-hole round', () => {
        describe('at a 12-hole course', () => {

            describe(`HCP 14.0 playing Shiskine Golf Course from white tees`, () => {
                const scorecard: Scorecard = {
                    course: shiskine12holes,
                    tee: 'white',
                    gender: 'male',
                    date: "2024-05-05",
                    hcp: 14.0,
                    startingHole: 1,
                    strokes: [4, 4, 5, 5, 4, 3, 5, 5, 5, 4, 4, 5]
                }

                forEachScoringMethod(method => {
                    describe(`with ${method} logic`, () => {
                        const scoring = calculateStrokeplay(scorecard, { method: method })

                        it('strokes are calculated for all 12 holes', () => {
                            expect(scoring.strokes).toBe(53)
                        })

                        it('the course handicap is calculated correctly', () => {
                            expect(scoring.phcp).toBe(7)
                        })

                        it('Net strokes are calculated correctly', () => {
                            expect(scoring.score).toBe(46)
                            expect(scoring.relativeToPar).toBe(4)
                        })
                    })
                })
            })

            describe('HCP 14.0 playing Belmont Golf Course from "green" tees', () => {
                const scorecard: Scorecard = {
                    course: belmont12holes,
                    tee: 'Ross (Green)',
                    gender: 'male',
                    date: "2024-02-02",
                    hcp: 14.0,
                    startingHole: 1,
                    strokes: [4, 4, 5, 5, 4, 3, 5, 5, 5, 4, 4, 5]
                }

                forEachScoringMethod(method => {
                    describe(`with ${method} logic`, () => {
                        const scoring = (): StrokeplayScore => calculateStrokeplay(scorecard, { method })

                        it('strokes are calculated for all 12 holes [standard]', () => {
                            expect(scoring().strokes).toBe(53)
                        })

                        it('the course handicap is calculated correctly [standard]', () => {
                            expect(scoring().phcp).toBe(11)
                        })

                        it('Net strokes are calculated correctly [standard]', () => {
                            expect(scoring().score).toBe(42)
                            expect(scoring().relativeToPar).toBe(-6)
                        })
                    })
                })
            })
        })
    })

    describe('for a 9-hole round', () => {

        describe('at a 9-hole course', () => {
            forEachScoringMethod(method => {
                describe(`with ${method} logic`, () => {
                    it('15.4 HCP playing Golf Talma Par3 from yellow tees on 2.8.2024', () => {
                        const scorecard: Scorecard = {
                            course: talmaPar3,
                            tee: 'yellow',
                            gender: 'male',
                            date: "2024-08-02",
                            hcp: 15.4,
                            startingHole: 1,
                            strokes: [4, 4, 4, 4, 4, 3, 4, 3, 3]
                        }
                        const scoring = calculateStrokeplay(scorecard, { method })
                        expect(scoring.strokes).toBe(33)
                        expect(scoring.phcp).toBe(5)
                        expect(scoring.score).toBe(28)
                        expect(scoring.relativeToPar).toBe(+1)
                    })
                })
            })
        })

        describe('at an 18-hole course', () => {
            describe('with standard USGA/R&A logic', () => {

                describe('15.8 HCP playing 44 strokes on Tapiola Golf back nine from "46" tees on 8.7.2024', () => {
                    const scorecard: Scorecard = {
                        course: tapiolaGolf,
                        tee: '46',
                        gender: 'male',
                        date: "2024-07-08",
                        hcp: 15.8,
                        startingHole: 10,
                        strokes: [5, 7, 4, 3, 5, 6, 5, 4, 5]
                    }

                    it('with implicit "standard" mode', () => {
                        const scoring = calculateStrokeplay(scorecard)
                        expect(scoring.strokes).toBe(44)
                        expect(scoring.phcp).toBe(6)
                        expect(scoring.score).toBe(38)
                        expect(scoring.relativeToPar).toBe(+2)
                    })

                    it('with explicit "standard" mode', () => {
                        const scoring = calculateStrokeplay(scorecard, { method: 'standard' })
                        expect(scoring.strokes).toBe(44)
                        expect(scoring.phcp).toBe(6)
                        expect(scoring.score).toBe(38)
                        expect(scoring.relativeToPar).toBe(+2)
                    })
                })

                it('51.0 HCP playing 58 strokes on Tapiola Golf back nine from "46" tees on 8.7.2024', () => {
                    const scorecard: Scorecard = {
                        course: tapiolaGolf,
                        tee: '46',
                        gender: 'male',
                        date: "2024-07-09",
                        hcp: 51.0,
                        startingHole: 10,
                        strokes: [8, 7, 6, 5, 6, 7, 6, 8, 5]
                    }
                    const scoring = calculateStrokeplay(scorecard)
                    expect(scoring.strokes).toBe(58)
                    expect(scoring.phcp).toBe(24)
                    expect(scoring.score).toBe(34)
                    expect(scoring.relativeToPar).toBe(-2)
                })

                describe('15.8 HCP playing 48 strokes on Tapiola Golf front nine from "52" tees on 29.7.2024', () => {
                    const scorecard: Scorecard = {
                        course: tapiolaGolf,
                        tee: '52',
                        gender: 'male',
                        date: "2024-07-29",
                        hcp: 15.8,
                        startingHole: 1,
                        strokes: [7, 4, 5, 4, 8, 5, 6, 5, 4]
                    }

                    it('with implicit "standard" mode', () => {
                        const scoring = calculateStrokeplay(scorecard)
                        expect(scoring.strokes).toBe(48)
                        expect(scoring.phcp).toBe(5)
                        expect(scoring.score).toBe(43)
                        expect(scoring.relativeToPar).toBe(+7)
                    })

                    it('with explicit "standard" mode', () => {
                        const scoring = calculateStrokeplay(scorecard, { method: 'standard' })
                        expect(scoring.strokes).toBe(48)
                        expect(scoring.phcp).toBe(5)
                        expect(scoring.score).toBe(43)
                        expect(scoring.relativeToPar).toBe(+7)
                    })
                })
            })

            describe('with GolfGamebook logic', () => {

                it('15.8 HCP playing 44 strokes on Tapiola Golf back nine from "46" tees', () => {
                    const scorecard: Scorecard = {
                        course: tapiolaGolf,
                        tee: '46',
                        gender: 'male',
                        date: "2024-07-10",
                        hcp: 15.8,
                        startingHole: 10,
                        strokes: [5, 7, 4, 3, 5, 6, 5, 4, 5]
                    }
                    const scoring = calculateStrokeplay(scorecard, { method: 'gamebook' })
                    expect(scoring.strokes).toBe(44)
                    expect(scoring.phcp).toBe(5)
                    expect(scoring.score).toBe(39)
                    expect(scoring.relativeToPar).toBe(+3)
                })

                it('15.8 HCP playing 36 strokes on Tapiola Golf front nine from "46" tees', () => {
                    const scorecard: Scorecard = {
                        course: tapiolaGolf,
                        tee: '46',
                        gender: 'male',
                        date: "2024-07-11",
                        hcp: 15.8,
                        startingHole: 1,
                        strokes: [5, 3, 4, 3, 5, 4, 4, 4, 4]
                    }
                    const scoring = calculateStrokeplay(scorecard, { method: 'gamebook' })
                    expect(scoring.strokes).toBe(36)
                    expect(scoring.phcp).toBe(4)
                    expect(scoring.score).toBe(32)
                    expect(scoring.relativeToPar).toBe(-4)
                })

                it('15.8 HCP playing 48 strokes on Tapiola Golf front nine from "52" tees on 30.7.2024', () => {
                    const scorecard: Scorecard = {
                        course: tapiolaGolf,
                        tee: '52',
                        gender: 'male',
                        date: "2024-07-30",
                        hcp: 15.8,
                        startingHole: 1,
                        strokes: [7, 4, 5, 4, 8, 5, 6, 5, 4]
                    }
                    const scoring = calculateStrokeplay(scorecard, { method: 'gamebook' })
                    expect(scoring.strokes).toBe(48)
                    expect(scoring.phcp).toBe(6)
                    expect(scoring.score).toBe(42)
                    expect(scoring.relativeToPar).toBe(+6)
                })
            })
        })
    })

    describe('for an 18-hole round', () => {

        describe('at a 9-hole course', () => {
            describe('Golf Talma', () => {
                describe('15.6 HCP playing Talma Par 3 twice from yellow tees', () => {
                    const scorecard: Scorecard = {
                        course: talmaPar3,
                        tee: 'yellow',
                        gender: 'male',
                        date: "2024-01-01",
                        hcp: 15.6,
                        startingHole: 1,
                        strokes: [4, 3, 4, 4, 3, 3, 4, 5, 4, 3, 3, 4, 4, 4, 5, 3, 3, 5]
                    }

                    forEachScoringMethod(method => {
                        describe(`with ${method} logic`, () => {
                            const scoring = calculateStrokeplay(scorecard, { method })
                            const routing = scoring.scorecard.course.tees.find(t => t.name === 'yellow')

                            describe('the 9-hole course is extended to 18', () => {

                                describe('holes are extended to 18', () => {
                                    it('there are 18 holes instead of 9', () => {
                                        expect(routing!.holes.length).toBe(18)
                                    })
                                    it('hole numbers run from 1-18', () => {
                                        expect(routing!.holes.map(h => h.hole)).toStrictEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18])
                                    })
                                })

                                describe('stroke indexes are allocated correctly between front and back nine', () => {
                                    const indexes = routing!.holes.map(h => h.hcp)
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

                                it('Net strokes are calculated correctly', () => {
                                    expect(scoring.score).toBe(59)
                                    expect(scoring.relativeToPar).toBe(+5)
                                })
                            })
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
                        gender: 'male',
                        date: "2024-07-31",
                        hcp: 15.7,
                        startingHole: 1,
                        strokes: [4, 3, 4, 4, 6, 5, 4, 5, 4, 5, 6, 7, 4, 4, 5, 4, 6, 6]
                    }
                    const scoring = calculateStrokeplay(scorecard)
                    expect(scoring.strokes).toBe(86)
                    expect(scoring.phcp).toBe(16)
                    expect(scoring.score).toBe(70)
                    expect(scoring.relativeToPar).toBe(-2)
                })

                it('16.3 HCP playing Tapiola Golf yellow (57) tees on 4.7.2024', () => {
                    const scorecard: Scorecard = {
                        course: tapiolaGolf,
                        tee: '57',
                        gender: 'male',
                        date: "2024-07-04",
                        hcp: 16.3,
                        startingHole: 1,
                        strokes: [6, 6, 3, 4, 5, 4, 6, 5, 4, 5, 6, 5, 4, 4, 6, 4, 5, 4]
                    }
                    const scoring = calculateStrokeplay(scorecard)
                    expect(scoring.strokes).toBe(86)
                    expect(scoring.phcp).toBe(16)
                    expect(scoring.score).toBe(70)
                    expect(scoring.relativeToPar).toBe(-2)
                })

                it('15.3 HCP playing Tapiola Golf yellow (57) tees on 15.6.2024', () => {
                    const scorecard: Scorecard = {
                        course: tapiolaGolf,
                        tee: '57',
                        gender: 'male',
                        date: "2024-06-15",
                        hcp: 15.3,
                        startingHole: 1,
                        strokes: [7, 5, 3, 4, 5, 5, 6, 5, 5, 5, 5, 5, 5, 6, 5, 5, 5, 5]
                    }
                    const scoring = calculateStrokeplay(scorecard)
                    expect(scoring.strokes).toBe(91)
                    expect(scoring.phcp).toBe(15)
                    expect(scoring.score).toBe(76)
                    expect(scoring.relativeToPar).toBe(+4)
                })

                it('51.9 HCP playing Tapiola Golf red (46) tees on 19.5.2024', () => {
                    const scorecard: Scorecard = {
                        course: tapiolaGolf,
                        tee: '46',
                        gender: 'male',
                        date: "2024-05-19",
                        hcp: 51.9,
                        startingHole: 1,
                        strokes: [6, 5, 8, 3, 8, 6, 9, 7, 10, 8, 7, 6, 5, 6, 7, 8, 7, 6]
                    }
                    const scoring = calculateStrokeplay(scorecard)
                    expect(scoring.strokes).toBe(122)
                    expect(scoring.phcp).toBe(45)
                    expect(scoring.score).toBe(77)
                    expect(scoring.relativeToPar).toBe(+5)
                })

                it('51.9 HCP playing Tapiola Golf red (46) tees on 19.5.2024 with 75% handicap allowance using standard logic', () => {
                    const scorecard: Scorecard = {
                        course: tapiolaGolf,
                        tee: '46',
                        gender: 'male',
                        date: "2024-05-19",
                        hcp: 51.9,
                        startingHole: 1,
                        strokes: [6, 5, 8, 3, 8, 6, 9, 7, 10, 8, 7, 6, 5, 6, 7, 8, 7, 6]
                    }
                    const scoring = calculateStrokeplay(scorecard, { method: 'standard', hcpAllowance: 0.75 })
                    expect(scoring.strokes).toBe(122)
                    expect(scoring.phcp).toBe(32)
                    expect(scoring.score).toBe(90)
                    expect(scoring.relativeToPar).toBe(+18)
                })

                it('51.9 HCP playing Tapiola Golf red (46) tees on 19.5.2024 with 75% handicap allowance using gamebook logic', () => {
                    const scorecard: Scorecard = {
                        course: tapiolaGolf,
                        tee: '46',
                        gender: 'male',
                        date: "2024-05-19",
                        hcp: 51.9,
                        startingHole: 1,
                        strokes: [6, 5, 8, 3, 8, 6, 9, 7, 10, 8, 7, 6, 5, 6, 7, 8, 7, 6]
                    }
                    const scoring = calculateStrokeplay(scorecard, { method: 'gamebook', hcpAllowance: 0.75 })
                    expect(scoring.strokes).toBe(122)
                    expect(scoring.phcp).toBe(32)
                    expect(scoring.score).toBe(90)
                    expect(scoring.relativeToPar).toBe(+18)
                })
            })
        })
    })


    describe('unsupported scorecards', () => {
        forEachScoringMethod(method => {
            describe(`with ${method} logic`, () => {
                it('playing 13 holes on an 18-hole course', () => {
                    const scorecard: Scorecard = {
                        course: talmaPar3,
                        tee: 'yellow',
                        gender: 'male',
                        date: "2023-01-01",
                        hcp: 19.1,
                        startingHole: 1,
                        strokes: [4, 3, 4, 4, 3, 3, 4, 5, 4, 3, 3, 4, 4]
                    }
                    expect(() => calculateStrokeplay(scorecard, { method })).toThrow()
                })

                it('playing 18 holes on an 12-hole course', () => {
                    const scorecard: Scorecard = {
                        course: belmont12holes,
                        tee: 'Tillinghast (Black)',
                        gender: 'male',
                        date: "2024-05-03",
                        hcp: 15.4,
                        startingHole: 1,
                        strokes: [4, 4, 5, 5, 4, 3, 5, 5, 5, 4, 4, 5, 5, 4, 3, 5, 5, 5]
                    }
                    expect(() => calculateStrokeplay(scorecard, { method })).toThrow()
                })

                it('playing 16 holes on an 12-hole course', () => {
                    const scorecard: Scorecard = {
                        course: belmont12holes,
                        tee: 'yellow',
                        gender: 'male',
                        date: "2023-01-01",
                        hcp: 19.1,
                        startingHole: 1,
                        strokes: [4, 3, 4, 4, 3, 3, 4, 5, 4, 3, 3, 4, 4, 4, 5, 3, 3, 5].slice(0, 16)
                    }
                    expect(() => calculateStrokeplay(scorecard, { method })).toThrow()
                })

                it('playing 9 holes at a 12-hole course', () => {
                    const scorecard: Scorecard = {
                        course: belmont12holes,
                        tee: 'Ross (Green)',
                        gender: 'male',
                        date: "2024-05-02",
                        hcp: 15.4,
                        startingHole: 1,
                        strokes: [4, 4, 5, 5, 4, 3, 5, 5, 5]
                    }
                    // What exactly can't be resolved depends on the method.
                    // Hence, the message is left open-ended in this assertion:
                    expect(() => calculateStrokeplay(scorecard, { method })).toThrow(`Cannot resolve`)
                })

                it('playing 12 holes at a 9-hole course', () => {
                    const scorecard: Scorecard = {
                        course: talmaPar3,
                        tee: 'red',
                        gender: 'male',
                        date: "2024-06-06",
                        hcp: 10.0,
                        startingHole: 1,
                        strokes: [4, 4, 5, 5, 4, 3, 5, 5, 5, 5, 5, 5]
                    }
                    expect(() => calculateStrokeplay(scorecard, { method })).toThrow(`${talmaPar3.name} has only 9 holes, but strokes were recorded for 12 holes!`)
                })

                it('playing 12 holes at an 18-hole course', () => {
                    const scorecard: Scorecard = {
                        course: tapiolaGolf,
                        tee: '52',
                        gender: 'male',
                        date: "2024-06-07",
                        hcp: 10.0,
                        startingHole: 1,
                        strokes: [4, 4, 5, 5, 4, 3, 5, 5, 5, 5, 5, 5]
                    }
                    expect(() => calculateStrokeplay(scorecard, { method: 'standard' })).toThrow(`Cannot resolve slope and course rating for ${tapiolaGolf.name} with strokes for 12 holes when the course has 18 holes [standard logic]`)
                })
            })
        })
    })
})
