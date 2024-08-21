import { cloneCourse } from "../../src/utils/course";
import { HoleRating, Course, CourseRouting, FullCourseRating, Gender } from "../../src/types";

type TeeAdderFunction = (name: string, gender: Gender, rating: FullCourseRating) => void
type TeeBuilderFunction = (addTee: TeeAdderFunction) => void
const courseWithFixedHoleRouting = (name: string, holes: Array<HoleRating>, builder: TeeBuilderFunction): Course => {
    const par = holes.reduce((acc, hole) => acc + hole.par, 0)
    const tees: Array<CourseRouting> = []
    builder((name: string, gender: Gender, rating: FullCourseRating) => {
        tees.push({ name, gender, rating, par, holes })
    })
    return { name, tees }
}

const hole = (hole: number, par: number, hcp: number): HoleRating => ({ hole, par, hcp })

const switchFrontAndBackRatings = (course: Course): Course => {
    const swapped = cloneCourse(course)
    swapped.tees.forEach(tee => {
        const { front, back } = tee.rating
        tee.rating.front = back
        tee.rating.back = front
    })
    return swapped
}

/**
 * Tapiola Golf is a 18-hole course with a par of 72.
 */
export const tapiolaGolf = courseWithFixedHoleRouting(
    'Tapiola Golf',
    [
        hole( 1, 5, 14),
        hole( 2, 3, 18),
        hole( 3, 4, 12),
        hole( 4, 3,  8),
        hole( 5, 5,  6),
        hole( 6, 4, 10),
        hole( 7, 4,  4),
        hole( 8, 4, 16),
        hole( 9, 4,  2),
        hole(10, 4,  3),
        hole(11, 5, 17),
        hole(12, 4, 11),
        hole(13, 3,  9),
        hole(14, 4, 15),
        hole(15, 4,  1),
        hole(16, 4,  7),
        hole(17, 4, 13),
        hole(18, 4,  5),
    ],
    (addTee: TeeAdderFunction) => {
        addTee('61', 'male', {
            full: { slope: 127, cr: 72.8 },
            front: { slope: 119, cr: 35.8 },
            back: { slope: 135, cr: 37.0 },
        })
        addTee('57', 'male', {
            full: { slope: 123, cr: 70.5 },
            front: { slope: 115, cr: 34.7 },
            back: { slope: 131, cr: 35.8 },
        })
        addTee('57', 'female', {
            full: { slope: 135, cr: 75.5 },
            front: { slope: 127, cr: 37.0 },
            back: { slope: 143, cr: 38.5 },
        })
        addTee('52', 'male', {
            full: { slope: 118, cr: 68.1 },
            front: { slope: 110, cr: 33.6 },
            back: { slope: 126, cr: 34.5 },
        })
        addTee('52', 'female', {
            full: { slope: 128, cr: 72.5 },
            front: { slope: 120, cr: 35.6 },
            back: { slope: 136, cr: 36.9 },
        })
        addTee('46', 'male', {
            full: { slope: 113, cr: 65.5 },
            front: { slope: 105, cr: 32.3 },
            back: { slope: 120, cr: 33.2 },
        })
        addTee('46', 'female', {
            full: { slope: 122, cr: 69.3 },
            front: { slope: 114, cr: 34.0 },
            back: { slope: 130, cr: 35.3 },
        })
        addTee('35', 'male', {
            full: { slope: 101, cr: 59.7 },
            front: { slope: 93, cr: 29.3 },
            back: { slope: 109, cr: 30.4 },
        })
        addTee('35', 'female', {
            full: { slope: 107, cr: 62.2 },
            front: { slope: 98, cr: 30.3 },
            back: { slope: 116, cr: 31.9 },
        })
    }
)


/**
 * Golf Talma Par3 is a 9-hole course with a par of 27.
 */
export const talmaPar3: Course = courseWithFixedHoleRouting(
    'Golf Talma Par3',
    [
        hole(1, 3, 9),
        hole(2, 3, 2),
        hole(3, 3, 5),
        hole(4, 3, 3),
        hole(5, 3, 4),
        hole(6, 3, 8),
        hole(7, 3, 7),
        hole(8, 3, 6),
        hole(9, 3, 1),
    ],
    (tee: TeeAdderFunction) => {
        tee('yellow', 'male', {
            full: { slope: 76, cr: 52.7 },
            front: { slope: 76, cr: 26.4 },
            back: { slope: 76, cr: 26.3 },
        })
        tee('yellow', 'female', {
            full: { slope: 81, cr: 54.8 },
            front: { slope: 81, cr: 27.4 },
            back: { slope: 81, cr: 27.4 },
        })
        tee('red', 'male', {
            full: { slope: 73, cr: 51.2 },
            front: { slope: 73, cr: 25.6 },
            back: { slope: 73, cr: 25.6 },
        })
        tee('red', 'female', {
            full: { slope: 78, cr: 53.5 },
            front: { slope: 78, cr: 26.8 },
            back: { slope: 78, cr: 26.7 },
        })
    }
)


/**
 * Note:
 * - Belmont only has 12 holes!
 * - The hole HCP ratings go from 1 to 17 with 4, 6, 8, 14, 16, 18 missing
 * - The "front nine" has all odd HCP ratings, whereas the 3 holes on the "back nine" have even HCP ratings
 * - The "front six" has a par of 26 (with two par-5's), the "back six" has a par of 22 (with 2 par-3's)
 * - There are no ladies' CR/slope ratings
 * - There are no CR or slope ratings for the "front six" or "back six" (which kind of makes sense since
 *   a 6-hole course would not be valid for a handicap round anyway)
 *
 * All in all, these ratings are pretty much screwed up - the CR noted on USGA's database and on the Belmont
 * scorecard on their website (e.g. 64.8 from the "Ross" or "Green" tees) is obviously for an 18-hole round
 * (and par 72) so we'll need to detect this situation and approximate what the CR should be for the 12-hole,
 * par-48 round of golf at Belmont.
 *
 * For the Ross/Green tees, the first nine holes have a CR of 35.9. The last three holes plus the six holes of
 * the "Little Bell" course (par 18) have a combined CR of 28.9. That combination is rated as 64.8 but it is
 * ambiguous as to how much of the 28.9 is contributed by the last three holes of the 12-hole Belmont course.
 *
 * Extrapolating from the first nine holes, we could assume that the last three holes have a CR of (35.9 * 12/9)
 * which is 47.9. That would be similar relative to the Belmont's par of 48 and roughly in line with the course's
 * slope rating of 116.
 *
 * References:
 * - https://playbelmontrva.org/belmont/
 * - https://playbelmontrva.org/little-bell/
 * - https://ncrdb.usga.org/courseTeeInfo?CourseID=31312
 * - https://ncrdb.usga.org/courseTeeInfo?CourseID=31313
 */
const projectFromFrontCR = (cr: number): number => Math.round(cr * (12/9) * 10) / 10
const belmont12HolesRouting: Array<HoleRating> = [
    hole( 1, 4, 13),
    hole( 2, 4,  3),
    hole( 3, 5, 17),
    hole( 4, 5, 15),
    hole( 5, 4,  1),
    hole( 6, 4,  7),
    hole( 7, 3, 11),
    hole( 8, 4,  9),
    hole( 9, 4,  5),
    hole(10, 4, 12),
    hole(11, 4, 10),
    hole(12, 3,  2),
]
export const belmont12holes: Course = {
    name: 'Belmont Golf Course',
    tees: [
        {
            name: 'Tillinghast (Black)',
            gender: 'male',
            rating: {
                full: { slope: 143, cr: projectFromFrontCR(36.5) },
                front: { slope: 143, cr: 36.5 },
            },
            holes: belmont12HolesRouting,
            par: 48,
        },
        {
            name: 'Tillinghast (Black)',
            gender: 'female',
            rating: {
                full: { slope: 146, cr: projectFromFrontCR(39.8) },
                front: { slope: 146, cr: 39.8 },
            },
            holes: belmont12HolesRouting,
            par: 48,
        },
        {
            name: 'Ross (Green)',
            gender: 'male',
            rating: {
                full: { slope: 133, cr: projectFromFrontCR(35.9) },
                front: { slope: 133, cr: 35.9 },
            },
            holes: belmont12HolesRouting,
            par: 48,
        },
        {
            name: 'Ross (Green)',
            gender: 'female',
            rating: {
                full: { slope: 142, cr: projectFromFrontCR(39.1) },
                front: { slope: 142, cr: 39.1 },
            },
            holes: belmont12HolesRouting,
            par: 48,
        },
        {
            name: 'Hogan (Blue)',
            gender: 'male',
            rating: {
                full: { slope: 130, cr: projectFromFrontCR(35.2) },
                front: { slope: 130, cr: 35.2 },
            },
            holes: belmont12HolesRouting,
            par: 48,
        },
        {
            name: 'Hogan (Blue)',
            gender: 'female',
            rating: {
                full: { slope: 139, cr: projectFromFrontCR(38.2) },
                front: { slope: 139, cr: 38.2 },
            },
            holes: belmont12HolesRouting,
            par: 48,
        },
        {
            name: 'Snead (Yellow)',
            gender: 'male',
            rating: {
                full: { slope: 126, cr: projectFromFrontCR(33.8) },
                front: { slope: 126, cr: 33.8 },
            },
            holes: belmont12HolesRouting,
            par: 48,
        },
        {
            name: 'Snead (Yellow)',
            gender: 'female',
            rating: {
                full: { slope: 128, cr: projectFromFrontCR(36.7) },
                front: { slope: 128, cr: 36.7 },
            },
            holes: belmont12HolesRouting,
            par: 48,
        },
        {
            name: 'Love (Red)',
            gender: 'male',
            rating: {
                full: { slope: 103, cr: projectFromFrontCR(31.6) },
                front: { slope: 103, cr: 31.6 },
            },
            holes: belmont12HolesRouting,
            par: 48,
        },
        {
            name: 'Love (Red)',
            gender: 'female',
            rating: {
                full: { slope: 116, cr: projectFromFrontCR(33.2) },
                front: { slope: 116, cr: 33.2 },
            },
            holes: belmont12HolesRouting,
            par: 48,
        },
    ],
}

const belmont9HolesRouting = belmont12HolesRouting.slice(0, 9)
export const belmontFirst9holesWith18holeRating: Course = {
    name: 'Belmont Golf Course',
    tees: [
        {
            name: 'Tillinghast (Black)',
            gender: 'male',
            rating: {
                full: { slope: 121, cr: 65.5 }
            },
            holes: belmont9HolesRouting,
            par: 37,
        },
        {
            name: 'Ross (Green)',
            gender: 'male',
            rating: {
                full: { slope: 116, cr: 64.8 }
            },
            holes: belmont9HolesRouting,
            par: 37,
        },
        {
            name: 'Hogan (Blue)',
            gender: 'male',
            rating: {
                full: { slope: 110, cr: 62.2 },
            },
            holes: belmont9HolesRouting,
            par: 37,
        },
        {
            name: 'Snead (Yellow)',
            gender: 'male',
            rating: {
                full: { slope: 106, cr: 60.2 },
            },
            holes: belmont9HolesRouting,
            par: 37,
        },
        {
            name: 'Love (Red)',
            gender: 'male',
            rating: {
                full: { slope: 91, cr: 57.3 },
            },
            holes: belmont9HolesRouting,
            par: 37,
        },
    ],
}
export const belmontFirst9holesWithFullAndFront9Rating: Course = {
    name: 'Belmont Golf Course',
    tees: [
        {
            name: 'Tillinghast (Black)',
            gender: 'male',
            rating: {
                full: { slope: 121, cr: 65.5 },
                front: { slope: 121, cr: 33.2 }  // back should be 32.3
            },
            holes: belmont9HolesRouting,
            par: 37,
        },
        {
            name: 'Ross (Green)',
            gender: 'male',
            rating: {
                full: { slope: 116, cr: 64.8 },
                front: { slope: 116, cr: 32.4 }  // back should be 32.4
            },
            holes: belmont9HolesRouting,
            par: 37,
        },
        {
            name: 'Hogan (Blue)',
            gender: 'male',
            rating: {
                full: { slope: 110, cr: 62.2 },
                front: { slope: 110, cr: 31.2 }  // back should be 31.0
            },
            holes: belmont9HolesRouting,
            par: 37,
        },
        {
            name: 'Snead (Yellow)',
            gender: 'male',
            rating: {
                full: { slope: 106, cr: 60.2 },
                front: { slope: 106, cr: 30.1 }  // back should be 30.1
            },
            holes: belmont9HolesRouting,
            par: 37,
        },
        {
            name: 'Love (Red)',
            gender: 'male',
            rating: {
                full: { slope: 91, cr: 57.3 },
                front: { slope: 91, cr: 28.7 }  // back should be 28.6
            },
            holes: belmont9HolesRouting,
            par: 37,
        },
    ],
}
export const belmontFirst9holesWithFullAndBack9Rating: Course = switchFrontAndBackRatings(belmontFirst9holesWithFullAndFront9Rating)

/**
 * Shiskine Golf & Tennis Club is a 12-hole course that publishes its ratings for an 18-hole
 * round but also provides a handicap table for both 12-hole (par 42) and 18-hole rounds (par 65).
 *
 * References:
 * - https://ncrdb.usga.org/courseTeeInfo?CourseID=17173
 * - https://www.randa.org/en/course-handicap-calculator (search for course name "Shiskine" within Scotland)
 */
const shiskineAdjustFor12Holes = (value: number): number => Math.round(value * (42/65) * 10) / 10
export const shiskine12holes: Course = {
    name: 'Shiskine Golf & Tennis Club',
    tees: [
        {
            name: 'white',
            gender: 'male',
            rating: {
                full: { slope: 99, cr: shiskineAdjustFor12Holes(63.3) },
                front: { slope: 113, cr: 33.9 },  // 18-hole rating!
                back: { slope: 101, cr: 32.9 },  // 18-hole rating!
            },
            holes: [
                hole( 1, 4,  5),
                hole( 2, 4,  1),
                hole( 3, 3,  9),
                hole( 4, 3, 11),
                hole( 5, 3,  7),
                hole( 6, 4,  3),
                hole( 7, 3, 10),
                hole( 8, 4,  6),
                hole( 9, 5,  2),
                hole(10, 3, 12),
                hole(11, 3,  4),
                hole(12, 3,  8),
            ],
            par: 42
        },
        {
            name: 'yellow',
            gender: 'male',
            rating: {
                full: { slope: 97, cr: shiskineAdjustFor12Holes(62.0) },
                front: { slope: 100, cr: 31.3 },  // 18-hole rating!
                back: { slope: 93, cr: 30.7 },  // 18-hole rating!
            },
            holes: [
                hole( 1, 4,  5),
                hole( 2, 4,  1),
                hole( 3, 3,  9),
                hole( 4, 3, 11),
                hole( 5, 3,  7),
                hole( 6, 4,  3),
                hole( 7, 3, 10),
                hole( 8, 4,  6),
                hole( 9, 5,  2),
                hole(10, 3, 12),
                hole(11, 3,  4),
                hole(12, 3,  8),
            ],
            par: 42
        },
        {
            name: 'yellow',
            gender: 'female',
            rating: {
                full: { slope: 106, cr: shiskineAdjustFor12Holes(66.2) },
                front: { slope: 113, cr: 33.6 },  // 18-hole rating!
                back: { slope: 99, cr: 32.6 },  // 18-hole rating!
            },
            holes: [
                hole( 1, 4,  5),
                hole( 2, 4,  1),
                hole( 3, 3,  9),
                hole( 4, 3, 11),
                hole( 5, 4,  7),
                hole( 6, 4,  3),
                hole( 7, 3, 10),
                hole( 8, 4,  6),
                hole( 9, 5,  2),
                hole(10, 3, 12),
                hole(11, 4,  4),
                hole(12, 3,  8),
            ],
            par: 44
        },
        {
            name: 'red',
            gender: 'female',
            rating: {
                full: { slope: 107, cr: shiskineAdjustFor12Holes(66.8) },
                front: { slope: 113, cr: 33.9 },  // 18-hole rating!
                back: { slope: 101, cr: 32.9 },  // 18-hole rating!
            },
            holes: [
                hole( 1, 4,  5),
                hole( 2, 4,  1),
                hole( 3, 3,  9),
                hole( 4, 3, 11),
                hole( 5, 4,  7),
                hole( 6, 4,  3),
                hole( 7, 3, 10),
                hole( 8, 4,  6),
                hole( 9, 5,  2),
                hole(10, 3, 12),
                hole(11, 4,  4),
                hole(12, 3,  8),
            ],
            par: 44
        },
    ],
}


export const woburnDuchess: Course = {
    name: 'Woburn Golf Club - Duchess',
    tees: [
        {
            name: 'white',
            gender: 'male',
            rating: {
                full: { slope: 139, cr: 72.5 },
                front: { slope: 0, cr: 0 },
                back: { slope: 0, cr: 0 },
            },
            holes: [
                hole( 1, 4,  4),
                hole( 2, 3,  7),
                hole( 3, 4, 12),
                hole( 4, 5, 15),
                hole( 5, 4, 14),
                hole( 6, 5, 16),
                hole( 7, 3,  6),
                hole( 8, 4, 10),
                hole( 9, 4,  2),
                hole(10, 5, 13),
                hole(11, 4,  5),
                hole(12, 4,  3),
                hole(13, 3,  8),
                hole(14, 4,  1),
                hole(15, 5, 17),
                hole(16, 3, 18),
                hole(17, 4, 11),
                hole(18, 4,  9),
            ],
            par: 72,
        },
        {
            name: 'yellow',
            gender: 'male',
            rating: {
                full: { slope: 136, cr: 71.5 },
                front: { slope: 0, cr: 0 },
                back: { slope: 0, cr: 0 },
            },
            holes: [
                hole( 1, 4,  4),
                hole( 2, 3,  7),
                hole( 3, 4, 12),
                hole( 4, 5, 15),
                hole( 5, 4, 14),
                hole( 6, 5, 16),
                hole( 7, 3,  6),
                hole( 8, 4, 10),
                hole( 9, 4,  2),
                hole(10, 5, 13),
                hole(11, 4,  5),
                hole(12, 4,  3),
                hole(13, 3,  8),
                hole(14, 4,  1),
                hole(15, 5, 17),
                hole(16, 3, 18),
                hole(17, 4, 11),
                hole(18, 4,  9),
            ],
            par: 72,
        },
        {
            name: 'red',
            gender: 'male',
            rating: {
                full: { slope: 124, cr: 69.2 },
                front: { slope: 0, cr: 0 },
                back: { slope: 0, cr: 0 },
            },
            holes: [
                // different HCP ratings compared to white/yellow tees!
                hole( 1, 4, 11),
                hole( 2, 3, 13),
                hole( 3, 4,  5),
                hole( 4, 5,  9),
                hole( 5, 4,  8),
                hole( 6, 5, 17),
                hole( 7, 3,  7),
                hole( 8, 4, 15),
                hole( 9, 4,  1),
                hole(10, 5,  3),
                hole(11, 4,  2),
                hole(12, 4, 10),
                hole(13, 3, 16),
                hole(14, 4, 14),
                hole(15, 5, 12),
                hole(16, 3, 18),
                hole(17, 4,  4),
                hole(18, 4,  6),
            ],
            par: 72,
        },
        {
            name: 'red',
            gender: 'female',
            rating: {
                full: { slope: 136, cr: 74.5 },
                front: { slope: 0, cr: 0 },
                back: { slope: 0, cr: 0 },
            },
            holes: [
                // ladies (red tees - two par 4's are par 5's for ladies!)
                hole( 1, 5, 11),
                hole( 2, 3, 13),
                hole( 3, 4,  5),
                hole( 4, 5,  9),
                hole( 5, 4,  8),
                hole( 6, 5, 17),
                hole( 7, 3,  7),
                hole( 8, 4, 15),
                hole( 9, 4,  1),
                hole(10, 5,  3),
                hole(11, 4,  2),
                hole(12, 4, 10),
                hole(13, 3, 16),
                hole(14, 5, 14),
                hole(15, 5, 12),
                hole(16, 3, 18),
                hole(17, 4,  4),
                hole(18, 4,  6),
            ],
            par: 74,
        }
    ]
}