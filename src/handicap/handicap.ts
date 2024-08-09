
/**
 * Handicap Index x (Slope Rating/113) + (Course Rating – Par)
 *
 * @param hcp The player's WHS handicap index (max 54.0, can be negative)
 * @param sr Slope Rating (typically between 100-140)
 * @param cr Course Rating (typically close to the course's par)
 * @param par Par (typically around 72)
 * @returns The player's playing handicap for the course
 */
export function playingHandicap(hcp: number, sr: number, cr: number, par: number): number {
    // Ref: https://www.usga.org/content/usga/home-page/handicapping/world-handicap-system/whs-articles/only-time-for-nine-you-can-still-post-your-score-21474870775.html
    //const adjustedHcp = (par <= 36 && cr >= 45) ? hcp/2 : hcp;
    return Math.round(hcp * (sr / 113) + (cr - par));
}
