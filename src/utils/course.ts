import { assert } from 'console';
import { Course, TeeRating, HoleRating, CourseRating, FullCourseRating } from '../types';

export const frontNineFrom = (course: Course): Course => {
    // if (course.holes.length < 18) {
    //     throw new Error(`Can't extract a "front nine" from ${JSON.stringify(course.name)} which has ${course.holes.length} holes`);
    // }
    const tees: Array<TeeRating> = course.tees.map((tee: TeeRating): TeeRating => {
        // If the course data has separate ratings for front and back nine, we'll use those.
        if (tee.ratings.men.front) {
            const men: FullCourseRating = { full: tee.ratings.men.front }
            const ladies: FullCourseRating|undefined =
                tee.ratings.ladies?.front
                    ? { full: tee.ratings.ladies.front }
                    : undefined
            return { ...tee, ratings: { men, ladies } }
        }
        // If the course data just has a single rating for the full 18 holes, we'll
        // split that in half and assume each nine is identical in difficulty.
        const men: FullCourseRating = {
            full: {
                slope: tee.ratings.men.full.slope,
                cr: tee.ratings.men.full.cr / 2
            }
        }
        const ladies: FullCourseRating|undefined =
            tee.ratings.ladies?.full
                ? { full: { ...tee.ratings.ladies.full, cr: tee.ratings.ladies.full.cr / 2 } }
                : undefined
        return { ...tee, ratings: { men, ladies } }
    })
    return {
        name: `${course.name} (Front)`,
        tees: tees,
        holes: course.holes.slice(0, 9),
    }
}

export const backNineFrom = (course: Course): Course => {
    // if (course.holes.length < 18) {
    //     throw new Error(`Can't extract a "back nine" from ${JSON.stringify(course.name)} which has ${course.holes.length} holes`);
    // }
    const tees: Array<TeeRating> = course.tees.map((tee: TeeRating): TeeRating => {
        // If the course data has separate ratings for front and back nine, we'll use those.
        if (tee.ratings.men.back) {
            const men: FullCourseRating = { full: tee.ratings.men.back }
            const ladies: FullCourseRating|undefined =
                tee.ratings.ladies?.back
                    ? { full: tee.ratings.ladies.back }
                    : undefined
            return { ...tee, ratings: { men, ladies } }
        }
        // If the course data just has a single rating for the full 18 holes, we'll
        // split that in half and assume each nine is identical in difficulty.
        const men: FullCourseRating = {
            full: {
                slope: tee.ratings.men.full.slope,
                cr: tee.ratings.men.full.cr / 2
            }
        }
        const ladies: FullCourseRating|undefined =
            tee.ratings.ladies?.full
                ? { full: { ...tee.ratings.ladies.full, cr: tee.ratings.ladies.full.cr / 2 } }
                : undefined
        return { ...tee, ratings: { men, ladies } }
    })
    return {
        name: `${course.name} (Back)`,
        tees: tees,
        holes: course.holes.slice(9, 18),
    }
}

const splitFull18CourseRating = (rating: FullCourseRating): [number, number] => {
    const frontNineCR = Math.ceil((rating.full.cr * 10) / 2) / 10
    const backNineCR = rating.full.cr - frontNineCR
    assert(frontNineCR + backNineCR === rating.full.cr)
    return [frontNineCR, backNineCR]
}

const frontNineFromFullCourseRating = (rating: FullCourseRating): CourseRating => {
    const [ front, _ ] = splitFull18CourseRating(rating)
    return rating.front ? rating.front : { slope: rating.full.slope, cr: front }
}

const backNineFromFullCourseRating = (rating: FullCourseRating): CourseRating => {
    const [ _, back ] = splitFull18CourseRating(rating)
    return rating.back ? rating.back : { slope: rating.full.slope, cr: back }
}

const estimateMissingNineHoleRatings = (rating: FullCourseRating): FullCourseRating => {
    return {
        full: {
            slope: rating.full.slope,
            cr: rating.full.cr
        },
        front: frontNineFromFullCourseRating(rating),
        back: backNineFromFullCourseRating(rating),
    }
}

const duplicateNineHoles = (holes: Array<HoleRating>): Array<HoleRating> => {
    const frontNine = holes.map(hole => {
        const adjustedHcp = [1, 3, 5, 7, 9, 11, 13, 15, 17];
        return { ...hole, hcp: adjustedHcp[hole.hcp - 1] }
    });
    const backNine = frontNine.map(hole => {
        return { ...hole, hole: hole.hole + 9, hcp: hole.hcp + 1 }
    });
    return frontNine.concat(backNine)
}

/**
 * Create a full 18-hole round from a 9-hole course definition.
 *
 * This is a common case when playing 18 holes on an 9-hole course.
 * To accommodate, we'll extend the course definition to 18 holes by
 * repeating the front nine as the back nine and adjust the HCP values
 * accordingly with front nine getting odd stroke indexes and the back
 * nine getting even stroke indexes.
 *
 * @param course The 9-hole course definition to extend into 18 holes.
 * @returns A full 18-hole course definition consisting of the 9-hole course played twice.
 */
export const full18From = (course: Course): Course => {
    // if (course.holes.length !== 9) {
    //     throw new Error(`Can't extend ${JSON.stringify(course.name)} which has ${course.holes.length} holes into 18 holes`);
    // }
    const holes = course.holes.length === 9 ? duplicateNineHoles(course.holes) : course.holes
    const tees: Array<TeeRating> = course.tees.map(tee => {
        return {
            ...tee,
            ratings: {
                men: estimateMissingNineHoleRatings(tee.ratings.men),
                ladies: tee.ratings.ladies ? estimateMissingNineHoleRatings(tee.ratings.ladies) : undefined,
            }
        }
    })
    return {
        name: course.name,
        tees: tees,
        holes: holes,
    }

}