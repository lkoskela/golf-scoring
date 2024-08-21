import { assert } from 'console';
import { Course, HoleRating, FullCourseRating, CourseRouting } from '../types';


export const calculatePar = (holes: Array<HoleRating>): number => holes.reduce((acc, hole) => acc + hole.par, 0)


const splitFull18CourseRating = (rating: FullCourseRating): [number, number] => {
    const frontNineCR = roundToTenth(roundToTenth(rating.full.cr) / 2)
    const backNineCR = roundToTenth(rating.full.cr) - frontNineCR
    assert(frontNineCR + backNineCR === rating.full.cr, `front + back = full => ${frontNineCR} + ${backNineCR} = ${rating.full.cr} = ${frontNineCR + backNineCR}`)
    return [frontNineCR, backNineCR]
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

export const roundToTenth = (value: number): number => Math.round(value * 10) / 10

const extrapolate18HoleCourseRating = (rating: FullCourseRating, par: number): FullCourseRating => {
    if (rating.front?.cr && rating.back?.cr) {
        // If we already have a full rating with an 18-hole CR and front/back nine ratings,
        // we'll simply return everything as is.
        return rating
    } else if (rating.front?.cr) {
        // If we only have the front nine rating, we'll calculate the back nine rating
        // by subtracting the front nine rating from the full 18-hole rating.
        const back = {
            slope: rating.front.slope,
            cr: roundToTenth(roundToTenth(rating.full.cr) - roundToTenth(rating.front.cr))
        }
        return { ...rating, back }
    } else if (rating.back?.cr) {
        // If we only have the back nine rating (VERY unusual), we'll calculate the missing
        // front nine rating by subtracting the back nine rating from the full 18-hole rating.
        const front = {
            slope: rating.back.slope,
            cr: roundToTenth(roundToTenth(rating.full.cr) - roundToTenth(rating.back.cr))
        }
        return { ...rating, front }
    } else {
        // If we're missing both front and back nine ratings, we'll allocate the full 18-hole
        // CR evenly across both, giving the front nine the higher CR when there's a remainder.
        const [ front, back ] = splitFull18CourseRating(rating)
        return {
            ...rating,
            front: { slope: rating.full.slope, cr: front },
            back: { slope: rating.full.slope, cr: back }
        }
    }
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
    const tees = cloneCourse(course).tees.map(tee => {
        if (tee.holes.length !== 9) {
            throw new Error(`Can't extend ${JSON.stringify(course.name)} which has ${tee.holes.length} holes into 18 holes`);
        }
        const holes = duplicateNineHoles(tee.holes)
        const par = tee.par * 2
        const rating = extrapolate18HoleCourseRating(tee.rating, par)
        return { ...tee, holes, par, rating }
    })
    return {
        name: `${course.name} (18)`,
        tees: tees,
    }
}

export const cloneCourseRating = (rating: FullCourseRating): FullCourseRating => {
    return {
        ...rating,
        full: { ...rating.full },
        front: rating.front ? { ...rating.front } : undefined,
        back: rating.back ? { ...rating.back } : undefined
    }
}

export const cloneCourseRouting = (routing: CourseRouting): CourseRouting => {
    return {
        ...routing,
        holes: routing.holes.map(h => ({ ...h })),
        rating: cloneCourseRating(routing.rating)
    }
}

export const cloneCourse = (course: Course): Course => {
    return {
        ...course,
        tees: course.tees.map(cloneCourseRouting)
    }
}