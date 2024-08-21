export type CourseRating = {
    slope: number,
    cr: number,
}

export type FullCourseRating = {
    full: CourseRating,
    front?: CourseRating,
    back?: CourseRating,
}

export type TeeRating = {
    name: string,
    ratings: {
        men: FullCourseRating,
        ladies?: FullCourseRating
    }
}

export type HoleRating = {
    hole: number,
    par: number,
    hcp: number,
}

export type Gender = 'male'|'female';

export type CourseRouting = {
    name: string,
    gender: Gender,
    holes: Array<HoleRating>,
    par: number,
    rating: FullCourseRating,
}

export type Course = {
    name: string,
    tees: Array<CourseRouting>,
};

type AnyDigit = '0'|'1'|'2'|'3'|'4'|'5'|'6'|'7'|'8'|'9';
type DateStringYear = `20${AnyDigit}${AnyDigit}`;
type DateStringMonth = '01'|'02'|'03'|'04'|'05'|'06'|'07'|'08'|'09'|'10'|'11'|'12';
type DateStringDay = '01'|'02'|'03'|'04'|'05'|'06'|'07'|'08'|'09'|'10'|'11'|'12'|'13'|'14'|'15'|'16'|'17'|'18'|'19'|'20'|'21'|'22'|'23'|'24'|'25'|'26'|'27'|'28'|'29'|'30'|'31'
type DateString = `${DateStringYear}-${DateStringMonth}-${DateStringDay}`;

export type Scorecard = {
    date: DateString,
    course: Course,
    tee: string,
    hcp: number,
    gender: Gender,
    startingHole: number,
    strokes: Array<number>,
};

// Internally, as soon as we've calculated the playing handicap, identified the tee, the
// applicable course rating and slope used for calculating the playing handicap, we could
// instantiate a "trimmed" scorecard that contains the key information directly as values
// and doesn't contain extraneous data such as the other tees, holes not played, etc.
//
// type TrimmedScorecard = {
//     course: string,            // just the course name
//     holes: Array<HoleRating>,  // just the holes played (with HCP values adjusted to 1-9 for nine hole rounds?)
//     tee: TeeRating,            // the specific tee played from
//     date: Date,                // as before
//     hcp: number,               // the player's official Handicap Index
//     phcp: number,              // the effective playing handicap for the round (much smaller than hcp for 9-hole rounds)
//     cr: number,                // the effective CR for the part of the course actually played
//     slope: number,             // the effective slope rating for the part of the course actually played
//     startingHole: number,      // starting hole for the round (either 1 or 10)
//     strokes: Array<number>,    // scores for each hole played
// }
