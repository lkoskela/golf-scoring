import { frontNineFrom, backNineFrom } from '../../src/utils/course'
import { Course, HoleRating, TeeRating } from "../../src/types";


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

export const tapiolaGolf: Course = {
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

export const tapiolaGolfFrontNine: Course = frontNineFrom(tapiolaGolf)

export const tapiolaGolfBackNine: Course = backNineFrom(tapiolaGolf)

export const talmaPar3: Course = {
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
export const belmont12holes: Course = {
    name: 'Belmont Golf Course',
    tees: [
        tee('black',  [143, 143, 0], [projectFromFrontCR(36.5) || 65.5, 36.5, 0], [0, 146, 0], [projectFromFrontCR(39.8), 39.8, 0]),
        tee('green',  [133, 133, 0], [projectFromFrontCR(35.9) || 64.8, 35.9, 0], [0, 142, 0], [projectFromFrontCR(39.1), 39.1, 0]),
        tee('blue',   [130, 130, 0], [projectFromFrontCR(35.2) || 62.2, 35.2, 0], [0, 139, 0], [projectFromFrontCR(38.2), 38.2, 0]),
        tee('yellow', [126, 126, 0], [projectFromFrontCR(33.8) || 60.2, 33.8, 0], [0, 128, 0], [projectFromFrontCR(36.7), 36.7, 0]),
        tee('red',    [103, 103, 0], [projectFromFrontCR(31.6) || 57.3, 31.6, 0], [0, 116, 0], [projectFromFrontCR(33.2), 33.2, 0]),
    ],
    holes: [
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
}

/**
 * Shiskine Golf & Tennis Club is a 12-hole course that publishes its ratings for an 18-hole
 * round but also provides a handicap table for both 12-hole (par 42) and 18-hole rounds (par 65).
 */
const shiskineAdjustFor12Holes = (value: number): number => Math.round(value * (42/65) * 10) / 10
export const shiskine12holes: Course = {
    name: 'Shiskine Golf & Tennis Club',
    tees: [
        tee('white',  [ 99,  99,  99], [shiskineAdjustFor12Holes(63.3), 0, 0], [  0,   0,   0], [   0, 0, 0]),
        tee('yellow', [ 97,  97,  97], [shiskineAdjustFor12Holes(62.0), 0, 0], [  0,   0,   0], [   0, 0, 0]),
        tee('red',    [  0,   0,   0], [   0, 0, 0], [107, 107, 107], [shiskineAdjustFor12Holes(66.8), 0, 0]),
    ],
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
    // holes for ladies (red tees and ladies playing yellows): [
    //     hole( 1, 4,  5),
    //     hole( 2, 4,  1),
    //     hole( 3, 3,  9),
    //     hole( 4, 3, 11),
    //     hole( 5, 4,  7),
    //     hole( 6, 4,  3),
    //     hole( 7, 3, 10),
    //     hole( 8, 4,  6),
    //     hole( 9, 5,  2),
    //     hole(10, 3, 12),
    //     hole(11, 4,  4),
    //     hole(12, 3,  8),
    // ]
}
