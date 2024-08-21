import 'jest-extended'

import { playingHandicap } from '../../src/handicap/handicap'


describe('Playing Handicap', () => {

    describe('is calculated as Handicap Index x (Slope Rating/113) + (Course Rating – Par)', () => {

        /**
         * Reference:  https://support.golfgamebook.com/hc/en-us/articles/14828576432796-How-are-course-and-playing-handicaps-calculated
         */
        describe('Examples from Golf Gamebook', () => {

            it('12.5 × (138 / 113) + (71.3 - 72) = 14.57 → 15', () => {
                expect(playingHandicap(12.5, 138, 71.3, 72)).toBe(15)
            })

            it('7.2 × (124 / 113) + (71.4 - 72) = 7.30 → 7', () => {
                expect(playingHandicap(7.2, 124, 71.4, 72)).toBe(7)
            })
        })
    })

    describe('for an 18-hole round', () => {

        describe('on a 9-hole course', () => {
            describe('at Golf Talma', () => {
                // Reference:  https://ncrdb.usga.org/courseTeeInfo?CourseID=34223
                const crYellow = 52.7
                const slYellow = 76
                const crRed = 51.2
                const slRed = 73

                // 2.8.2024 at Golf Talma playing the Par-3 course with hcp 15.4
                // Reference:  https://www.usga.org/handicap-calculator/course-handicap-table.html?cr=52.7&sr=76&par=54
                it('15.4 HCP playing Golf Talma Par-3 course from the yellows has a course handicap of 9', () => {
                    expect(playingHandicap(15.4, slYellow, crYellow, 54)).toBe(9)
                })

                // 2.8.2024 at Golf Talma playing the Par-3 course with hcp 46.7
                // Reference:  https://www.usga.org/handicap-calculator/course-handicap-table.html?cr=52.7&sr=76&par=54
                it('46.7 HCP playing Golf Talma Par-3 course from the yellows has a course handicap of 30', () => {
                    expect(playingHandicap(46.7, slYellow, crYellow, 54)).toBe(30)
                })

                // 2.8.2024 at Golf Talma playing the Par-3 course with hcp 54.0
                // Reference:  https://www.usga.org/handicap-calculator/course-handicap-table.html?cr=51.2&sr=73&par=54
                it('54.0 HCP playing Golf Talma Par-3 course from the reds has a course handicap of 32', () => {
                    expect(playingHandicap(54.0, slRed, crRed, 54)).toBe(32)
                })

                it('54.0 HCP playing Golf Talma Par-3 course from the reds has a course handicap of 23 when handicap allowance is set at 75%', () => {
                    expect(playingHandicap(54.0 * 0.75, slRed, crRed, 54)).toBe(23)
                })
            })
        })

        describe('on an 18-hole course', () => {
            describe('at Tapiola Golf', () => {
                const par = 72

                describe('from yellow (57) tees', () => {
                    const slope = 123
                    const cr = 70.5

                    it('15.4 HCP', () => expect(playingHandicap(15.4, slope, cr, par)).toBe(15))
                    it('15.7 HCP', () => expect(playingHandicap(15.7, slope, cr, par)).toBe(16))
                    it('16.3 HCP', () => expect(playingHandicap(16.3, slope, cr, par)).toBe(16))
                })

                describe('from white (61) tees', () => {
                    const slope = 127
                    const cr = 72.8

                    it('15.4 HCP', () => expect(playingHandicap(15.4, slope, cr, par)).toBe(18))
                    it('15.7 HCP', () => expect(playingHandicap(15.7, slope, cr, par)).toBe(18))
                    it('16.3 HCP', () => expect(playingHandicap(16.3, slope, cr, par)).toBe(19))
                })
            })
        })
    })

    describe('for a 9-hole round', () => {

        describe('on a 9-hole course', () => {
            describe('at Golf Talma', () => {
                // Reference:  https://ncrdb.usga.org/courseTeeInfo?CourseID=34223
                const crYellow = 26.4
                const slYellow = 76
                const crRed = 25.6
                const slRed = 73

                // 2.8.2024 at Golf Talma playing the Par-3 course with hcp 15.4
                it('15.4 HCP playing from the yellows gets 5 strokes', () => {
                    expect(playingHandicap(15.4/2, slYellow, crYellow, 27)).toBe(5)
                })

                // 2.8.2024 at Golf Talma playing the Par-3 course with hcp 46.7
                it('46.7 HCP playing from the yellows gets 15 strokes', () => {
                    expect(playingHandicap(46.7/2, slYellow, crYellow, 27)).toBe(15)
                })

                // 2.8.2024 at Golf Talma playing the Par-3 course with hcp 54.0
                it('54.0 HCP playing from the reds gets 16 strokes', () => {
                    expect(playingHandicap(54.0/2, slRed, crRed, 27)).toBe(16)
                })
            })
        })

        describe('on an 18-hole course', () => {
            describe('at Tapiola Golf', () => {
                describe('front nine', () => {
                    // 30.7.2024 Tapiola Golf playing the front nine from '46' with hcp 15.8 (phcp 9 for 18 holes, phcp 4 for just the front nine)
                    // Reference:  https://www.usga.org/handicap-calculator/course-handicap-table.html?cr=32.3&sr=105&par=36
                    it('15.8 HCP playing Tapiola Golf front nine from "46" has a course handicap of 4', () => {
                        expect(playingHandicap(15.8/2, 105, 32.3, 36)).toBe(4)
                    })

                    // Reference:  https://www.usga.org/handicap-calculator/course-handicap-table.html?cr=33.6&sr=110&par=36
                    it('15.8 HCP playing Tapiola Golf front nine from "52" has a course handicap of 5', () => {
                        expect(playingHandicap(15.8/2, 110, 33.6, 36)).toBe(5)
                    })

                    // Reference:  https://www.usga.org/handicap-calculator/course-handicap-table.html?cr=34.7&sr=115&par=36
                    it('15.8 HCP playing Tapiola Golf front nine from "57" has a course handicap of 7', () => {
                        expect(playingHandicap(15.8/2, 115, 34.7, 36)).toBe(7)
                    })

                    // Reference:  https://www.usga.org/handicap-calculator/course-handicap-table.html?cr=35.8&sr=119&par=36
                    it('15.8 HCP playing Tapiola Golf front nine from "61" has a course handicap of 8', () => {
                        expect(playingHandicap(15.8/2, 119, 35.8, 36)).toBe(8)
                    })
                })

                describe('back nine', () => {
                    // 8.7.2024 at Tapiola Golf playing the back nine from '46' with hcp 15.8 (phcp 9 for 18 holes, phcp 6 for just the back nine)
                    // Reference:  https://www.usga.org/handicap-calculator/course-handicap-table.html?cr=33.2&sr=120&par=36
                    it('15.8 HCP playing Tapiola Golf back nine from "46" has a course handicap of 6', () => {
                        expect(playingHandicap(15.8/2, 120, 33.2, 36)).toBe(6)
                    })

                    // Reference:  https://www.usga.org/handicap-calculator/course-handicap-table.html?cr=34.5&sr=126&par=36
                    it('15.8 HCP playing Tapiola Golf back nine from "52" has a course handicap of 7', () => {
                        expect(playingHandicap(15.8/2, 126, 34.5, 36)).toBe(7)
                    })

                    // Reference:  https://www.usga.org/handicap-calculator/course-handicap-table.html?cr=35.8&sr=131&par=36
                    it('15.8 HCP playing Tapiola Golf back nine from "57" has a course handicap of 9', () => {
                        expect(playingHandicap(15.8/2, 131, 35.8, 36)).toBe(9)
                    })

                    // Reference:  https://www.usga.org/handicap-calculator/course-handicap-table.html?cr=37.0&sr=135&par=36
                    it('15.8 HCP playing Tapiola Golf back nine from "61" has a course handicap of 10', () => {
                        expect(playingHandicap(15.8/2, 135, 37.0, 36)).toBe(10)
                    })
                })
            })
        })
    })

})
