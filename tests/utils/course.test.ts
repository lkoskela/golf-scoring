import 'jest-extended'

import { tapiolaGolf, talmaPar3, belmont12holes, belmontFirst9holesWith18holeRating, belmontFirst9holesWithFullAndFront9Rating, woburnDuchess, belmontFirst9holesWithFullAndBack9Rating } from '../fixtures/courses';
import { cloneCourse, full18From, roundToTenth } from '../../src/utils/course'
import { CourseRouting } from '../../src/types';


describe('roundToTenth()', () => {
    it('0.1', () => expect(roundToTenth(0.1)).toBe(0.1))
    it('0.12', () => expect(roundToTenth(0.12)).toBe(0.1))
    it('0.15 gets rounded up', () => expect(roundToTenth(0.19)).toBe(0.2))
    it('0.19 gets rounded up', () => expect(roundToTenth(0.19)).toBe(0.2))
    it('62.2 / 2 == 31.1', () => expect(roundToTenth(62.2/2)).toBe(31.1))
    it('62.3 / 2 == 31.2 (rounds up)', () => expect(roundToTenth(62.3/2)).toBe(31.2))
})

describe('Expanding a 9-hole course into 18 holes', () => {

    describe('Talma Par 3', () => {
        const course = full18From(talmaPar3)

        it('The resulting course name gets a "(18)" suffix', () => {
            expect(course.name).toStrictEqual(`${talmaPar3.name} (18)`)
        })

        it('The resulting course has the same tees as before', () => {
            const serializer = (tee: CourseRouting) => `${tee.name}\t${tee.gender}`
            const expandedTees = course.tees.map(serializer)
            const originalTees = talmaPar3.tees.map(serializer)
            expect(expandedTees).toStrictEqual(originalTees)
        })

        course.tees.forEach((tee, i) => {
            const originalTee = talmaPar3.tees.find(t => t.name === tee.name && t.gender === tee.gender)!

            describe(`${tee.name}/${tee.gender}`, () => {

                it(`has 18 holes`, () => {
                    expect(tee.holes).toHaveLength(18)
                })

                it(`has its par doubled`, () => {
                    expect(tee.par).toBe(originalTee.par * 2)
                })

                it(`has the same CR and slope as the original`, () => {
                    // Talma Par 3 course data has the 18-hole CR rating already so no doubling up required!
                    expect(tee.rating.full).toStrictEqual(originalTee.rating.full)
                })

                it(`has the same front/back ratings as the original`, () => {
                    // Talma Par 3 course data has the 18-hole CR rating already so no doubling up required!
                    expect(tee.rating.front).toStrictEqual(originalTee.rating.front)
                    expect(tee.rating.back).toStrictEqual(originalTee.rating.back)
                })
            })
        })
    })

    describe('Belmont\'s first 9 holes with just the 18-hole CR', () => {
        const course = full18From(belmontFirst9holesWith18holeRating)

        it('The resulting course name gets a "(18)" suffix', () => {
            expect(course.name).toStrictEqual(`${belmontFirst9holesWith18holeRating.name} (18)`)
        })

        it('The resulting course has the same tees as before', () => {
            const serializer = (tee: CourseRouting) => `${tee.name}\t${tee.gender}`
            const expandedTees = course.tees.map(serializer)
            const originalTees = belmontFirst9holesWith18holeRating.tees.map(serializer)
            expect(expandedTees).toStrictEqual(originalTees)
        })

        course.tees.forEach((tee, i) => {
            const originalTee = belmontFirst9holesWith18holeRating.tees.find(t => t.name === tee.name && t.gender === tee.gender)!

            describe(`${tee.name}/${tee.gender}`, () => {

                it(`has 18 holes`, () => {
                    expect(tee.holes).toHaveLength(18)
                })

                it(`has its par doubled`, () => {
                    expect(tee.par).toBe(originalTee.par * 2)
                })

                it(`has the same CR and slope as the original`, () => {
                    expect(tee.rating.full).toStrictEqual(originalTee.rating.full)
                })

                it(`has front/back ratings calculated as 50% of the original 18-hole rating`, () => {
                    const frontCR = roundToTenth(originalTee.rating.full.cr / 2)
                    const backCR = originalTee.rating.full.cr - frontCR
                    expect(tee.rating.front).toStrictEqual({ slope: originalTee.rating.full.slope, cr: frontCR })
                    expect(tee.rating.back).toStrictEqual({ slope: originalTee.rating.full.slope, cr: backCR })
                })
            })
        })
    })

    describe('Belmont\'s first 9 holes with the 18-hole and front-9 CRs', () => {
        const course = full18From(cloneCourse(belmontFirst9holesWithFullAndFront9Rating))

        it('The resulting course name gets a "(18)" suffix', () => {
            expect(course.name).toStrictEqual(`${belmontFirst9holesWithFullAndFront9Rating.name} (18)`)
        })

        it('The resulting course has the same tees as before', () => {
            const serializer = (tee: CourseRouting) => `${tee.name}\t${tee.gender}`
            const expandedTees = course.tees.map(serializer)
            const originalTees = belmontFirst9holesWithFullAndFront9Rating.tees.map(serializer)
            expect(expandedTees).toStrictEqual(originalTees)
        })

        course.tees.forEach((tee, i) => {
            const originalTee = belmontFirst9holesWithFullAndFront9Rating.tees.find(t => t.name === tee.name && t.gender === tee.gender)!

            describe(`${tee.name}/${tee.gender}`, () => {

                it(`has 18 holes`, () => {
                    expect(tee.holes).toHaveLength(18)
                })

                it(`has its par doubled`, () => {
                    expect(tee.par).toBe(originalTee.par * 2)
                })

                it(`has the same CR and slope as the original`, () => {
                    expect(tee.rating.full).toStrictEqual(originalTee.rating.full)
                })
            })
        })

        describe('missing rating for back nine is calculated from the full CR and front nine CR', () => {

            it(`Tillinghast (Black) should split 65.5 into 33.2 and 32.3`, () => {
                const tee = course.tees.find(t => t.name === 'Tillinghast (Black)' && t.gender === 'male')!
                const originalTee = belmontFirst9holesWithFullAndFront9Rating.tees.find(t => t.name === tee.name && t.gender === tee.gender)!
                expect(tee.rating.full).toStrictEqual({ slope: originalTee.rating.full.slope, cr: 65.5 })
                expect(tee.rating.front).toStrictEqual({ slope: originalTee.rating.full.slope, cr: 33.2 })
                expect(tee.rating.back).toStrictEqual({ slope: originalTee.rating.full.slope, cr: 32.3 })
            })

            it(`Ross (Green) should split 64.8 into 32.4 and 32.4`, () => {
                const tee = course.tees.find(t => t.name === 'Ross (Green)' && t.gender === 'male')!
                const originalTee = belmontFirst9holesWithFullAndFront9Rating.tees.find(t => t.name === tee.name && t.gender === tee.gender)!
                expect(tee.rating.full).toStrictEqual({ slope: originalTee.rating.full.slope, cr: 64.8 })
                expect(tee.rating.front).toStrictEqual({ slope: originalTee.rating.full.slope, cr: 32.4 })
                expect(tee.rating.back).toStrictEqual({ slope: originalTee.rating.full.slope, cr: 32.4 })
            })

            it(`Hogan (Blue) should split 62.2 into 31.2 and 31.0`, () => {
                const tee = course.tees.find(t => t.name === 'Hogan (Blue)' && t.gender === 'male')!
                const originalTee = belmontFirst9holesWithFullAndFront9Rating.tees.find(t => t.name === tee.name && t.gender === tee.gender)!
                expect(tee.rating.full).toStrictEqual({ slope: originalTee.rating.full.slope, cr: 62.2 })
                expect(tee.rating.front).toStrictEqual({ slope: originalTee.rating.full.slope, cr: 31.2 })
                expect(tee.rating.back).toStrictEqual({ slope: originalTee.rating.full.slope, cr: 31.0 })
            })
        })
    })

    describe('Belmont\'s first 9 holes with the 18-hole and back-9 CRs', () => {
        const course = full18From(cloneCourse(belmontFirst9holesWithFullAndBack9Rating))

        it('The resulting course name gets a "(18)" suffix', () => {
            expect(course.name).toStrictEqual(`${belmontFirst9holesWithFullAndBack9Rating.name} (18)`)
        })

        it('The resulting course has the same tees as before', () => {
            const serializer = (tee: CourseRouting) => `${tee.name}\t${tee.gender}`
            const expandedTees = course.tees.map(serializer)
            const originalTees = belmontFirst9holesWithFullAndBack9Rating.tees.map(serializer)
            expect(expandedTees).toStrictEqual(originalTees)
        })

        course.tees.forEach((tee, i) => {
            const originalTee = belmontFirst9holesWithFullAndBack9Rating.tees.find(t => t.name === tee.name && t.gender === tee.gender)!

            describe(`${tee.name}/${tee.gender}`, () => {

                it(`has 18 holes`, () => {
                    expect(tee.holes).toHaveLength(18)
                })

                it(`has its par doubled`, () => {
                    expect(tee.par).toBe(originalTee.par * 2)
                })

                it(`has the same CR and slope as the original`, () => {
                    expect(tee.rating.full).toStrictEqual(originalTee.rating.full)
                })
            })
        })

        describe('missing rating for front nine is calculated from the full CR and back nine CR', () => {

            it(`Tillinghast (Black) should split 65.5 into 32.3 and 33.2`, () => {
                const tee = course.tees.find(t => t.name === 'Tillinghast (Black)' && t.gender === 'male')!
                const originalTee = belmontFirst9holesWithFullAndBack9Rating.tees.find(t => t.name === tee.name && t.gender === tee.gender)!
                expect(tee.rating.full).toStrictEqual({ slope: originalTee.rating.full.slope, cr: 65.5 })
                expect(tee.rating.front).toStrictEqual({ slope: originalTee.rating.full.slope, cr: 32.3 })
                expect(tee.rating.back).toStrictEqual({ slope: originalTee.rating.full.slope, cr: 33.2 })
            })

            it(`Ross (Green) should split 64.8 into 32.4 and 32.4`, () => {
                const tee = course.tees.find(t => t.name === 'Ross (Green)' && t.gender === 'male')!
                const originalTee = belmontFirst9holesWithFullAndBack9Rating.tees.find(t => t.name === tee.name && t.gender === tee.gender)!
                expect(tee.rating.full).toStrictEqual({ slope: originalTee.rating.full.slope, cr: 64.8 })
                expect(tee.rating.front).toStrictEqual({ slope: originalTee.rating.full.slope, cr: 32.4 })
                expect(tee.rating.back).toStrictEqual({ slope: originalTee.rating.full.slope, cr: 32.4 })
            })

            it(`Hogan (Blue) should split 62.2 into 31.0 and 31.2`, () => {
                const tee = course.tees.find(t => t.name === 'Hogan (Blue)' && t.gender === 'male')!
                const originalTee = belmontFirst9holesWithFullAndBack9Rating.tees.find(t => t.name === tee.name && t.gender === tee.gender)!
                expect(tee.rating.full).toStrictEqual({ slope: originalTee.rating.full.slope, cr: 62.2 })
                expect(tee.rating.front).toStrictEqual({ slope: originalTee.rating.full.slope, cr: 31.0 })
                expect(tee.rating.back).toStrictEqual({ slope: originalTee.rating.full.slope, cr: 31.2 })
            })
        })
    })
})

describe('Expanding a course with other than exactly 9 holes', () => {
    describe('should throw an error', () => {
        [tapiolaGolf, belmont12holes].forEach(course => {
            const holes = course.tees[0].holes.length
            it(`${course.name} (${holes} holes)`, () => expect(() => full18From(course)).toThrow())
        })
    })
})
