import 'jest-extended'

import { calculateStableford } from '../../../src/scoring/stableford/stableford'
import { Scorecard } from "../../../src/types";
import { tapiolaGolf, tapiolaGolfFrontNine, tapiolaGolfBackNine, talmaPar3, belmont12holes, shiskine12holes } from '../../fixtures/courses';
import { StablefordScore } from '../../../src/scoring/stableford/types';


//
// Reference:
// https://www.usga.org/content/usga/home-page/handicapping/roh/Content/rules/6%201%20Course%20Handicap%20Calculation.htm
//
describe('Calculating Stableford points', () => {

    describe('for a 12-hole round', () => {
        describe('at a 12-hole course', () => {

            describe('HCP 14.0 playing Shiskine Golf Course from white tees', () => {
                const scorecard: Scorecard = {
                    course: shiskine12holes,
                    tee: 'white',
                    date: "2024-05-05",
                    hcp: 14.0,
                    startingHole: 1,
                    strokes: [4, 4, 5, 5, 4, 3, 5, 5, 5, 4, 4, 5]
                }

                describe('with standard USGA/R&A logic', () => {
                    const scoring = (): StablefordScore => calculateStableford(scorecard, { method: 'standard' })

                    it('strokes are calculated for all 12 holes [standard]', () => {
                        expect(scoring().strokes).toBe(53)
                    })

                    it('the course handicap is calculated correctly [standard]', () => {
                        expect(scoring().phcp).toBe(7)
                    })

                    it('Stableford points are calculated correctly [standard]', () => {
                        expect(scoring().points).toBe(20)
                    })
                })

                describe('with Gamebook logic', () => {
                    const scoring = (): StablefordScore => calculateStableford(scorecard, { method: 'gamebook' })

                    it('strokes are calculated for all 12 holes [gamebook]', () => {
                        expect(scoring().strokes).toBe(53)
                    })

                    it('the course handicap is calculated correctly [gamebook]', () => {
                        expect(scoring().phcp).toBe(7)
                    })

                    it('Stableford points are calculated correctly [gamebook]', () => {
                        expect(scoring().points).toBe(20)
                    })
                })
            })

            describe('HCP 14.0 playing Belmont Golf Course from "green" tees', () => {
                const scorecard: Scorecard = {
                    course: belmont12holes,
                    tee: 'green',
                    date: "2024-02-02",
                    hcp: 14.0,
                    startingHole: 1,
                    strokes: [4, 4, 5, 5, 4, 3, 5, 5, 5, 4, 4, 5]
                }

                describe('with standard USGA/R&A logic', () => {
                    const scoring = (): StablefordScore => calculateStableford(scorecard, { method: 'standard' })

                    it('strokes are calculated for all 12 holes [standard]', () => {
                        expect(scoring().strokes).toBe(53)
                    })

                    it('the course handicap is calculated correctly [standard]', () => {
                        expect(scoring().phcp).toBe(11)
                    })

                    it('Stableford points are calculated correctly [standard]', () => {
                        expect(scoring().points).toBe(30)
                    })
                })

                describe('with Gamebook logic', () => {
                    const scoring = (): StablefordScore => calculateStableford(scorecard, { method: 'gamebook' })

                    it('strokes are calculated for all 12 holes [gamebook]', () => {
                        expect(scoring().strokes).toBe(53)
                    })

                    it('the course handicap is calculated correctly [gamebook]', () => {
                        expect(scoring().phcp).toBe(11)
                    })

                    it('Stableford points are calculated correctly [gamebook]', () => {
                        expect(scoring().points).toBe(30)
                    })
                })
            })
        })

        describe('at a 9-hole course', () => {
            const scorecard: Scorecard = {
                course: talmaPar3,
                tee: 'red',
                date: "2024-06-06",
                hcp: 10.0,
                startingHole: 1,
                strokes: [4, 4, 5, 5, 4, 3, 5, 5, 5, 5, 5, 5]
            }

            describe('with standard logic', () => {
                it('yields an error', () => {
                    expect(() => calculateStableford(scorecard, { method: 'standard' })).toThrow(`${talmaPar3.name} has only 9 holes, but strokes were recorded for 12 holes!`)
                })
            })

            describe('with GolfGamebook logic', () => {
                it('yields an error', () => {
                    expect(() => calculateStableford(scorecard, { method: 'gamebook' })).toThrow(`${talmaPar3.name} has only 9 holes, but strokes were recorded for 12 holes!`)
                })
            })
        })

        describe('at an 18-hole course', () => {
            const scorecard: Scorecard = {
                course: tapiolaGolf,
                tee: '52',
                date: "2024-06-07",
                hcp: 10.0,
                startingHole: 1,
                strokes: [4, 4, 5, 5, 4, 3, 5, 5, 5, 5, 5, 5]
            }

            describe('with standard logic', () => {
                it('yields an error', () => {
                    expect(() => calculateStableford(scorecard, { method: 'standard' })).toThrow(`Cannot resolve slope and course rating for ${tapiolaGolf.name} with strokes for 12 holes when the course has 18 holes [standard logic]`)
                })
            })

            describe('with GolfGamebook logic', () => {
                it('yields an error', () => {
                    expect(() => calculateStableford(scorecard, { method: 'gamebook' })).toThrow(`Cannot resolve slope and course rating for ${tapiolaGolf.name} with strokes for 12 holes when the course has 18 holes [Gamebook logic]`)
                })
            })
        })
    })

    describe('for a 9-hole round', () => {

        describe('at a 9-hole course', () => {

            describe('with standard USGA/R&A logic', () => {

                it('15.4 HCP playing Golf Talma Par3 from yellow tees on 2.8.2024', () => {
                    const scorecard: Scorecard = {
                        course: talmaPar3,
                        tee: 'yellow',
                        date: "2024-08-02",
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

                it('15.4 HCP playing Golf Talma Par3 from yellow tees on 3.8.2024', () => {
                    const scorecard: Scorecard = {
                        course: talmaPar3,
                        tee: 'yellow',
                        date: "2024-08-03",
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
                        date: "2024-07-08",
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
                        date: "2024-07-09",
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
                        date: "2024-07-29",
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
                        date: "2024-07-10",
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
                        date: "2024-07-11",
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
                        date: "2024-07-30",
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

        describe('at a 12-hole course', () => {
            const scorecard: Scorecard = {
                course: belmont12holes,
                tee: 'green',
                date: "2024-05-02",
                hcp: 15.4,
                startingHole: 1,
                strokes: [4, 4, 5, 5, 4, 3, 5, 5, 5]
            }

            describe('with standard logic', () => {
                it('yields an error', () => {
                    expect(() => calculateStableford(scorecard, { method: 'standard' })).toThrow(`Cannot resolve playing handicap for ${belmont12holes.name} with scores for 9 holes on a course with 12 holes`)
                })
            })

            describe('with GolfGamebook logic', () => {
                it('yields an error', () => {
                    expect(() => calculateStableford(scorecard, { method: 'gamebook' })).toThrow(`Cannot resolve slope and course rating for ${belmont12holes.name} with strokes for 9 holes when the course has 12 holes`)
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
                        date: "2024-04-01",
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
                        date: "2024-07-31",
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
                        date: "2024-07-04",
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
                        date: "2024-06-15",
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
                        date: "2024-05-19",
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

        describe('at a 12-hole course', () => {
            const scorecard: Scorecard = {
                course: belmont12holes,
                tee: 'black',
                date: "2024-05-03",
                hcp: 15.4,
                startingHole: 1,
                strokes: [4, 4, 5, 5, 4, 3, 5, 5, 5, 4, 4, 5, 5, 4, 3, 5, 5, 5]
            }

            describe('with standard logic', () => {
                it('yields an error', () => {
                    expect(() => calculateStableford(scorecard, { method: 'standard' })).toThrow(`${belmont12holes.name} has only 12 holes, but strokes were recorded for 18 holes!`)
                })
            })

            describe('with GolfGamebook logic', () => {
                it('yields an error', () => {
                    expect(() => calculateStableford(scorecard, { method: 'gamebook' })).toThrow(`${belmont12holes.name} has only 12 holes, but strokes were recorded for 18 holes!`)
                })
            })
        })

    })

    // TODO: What if the scorecard has 18 hole scores, the course has 18 holes, but the starting hole is 10?

})
