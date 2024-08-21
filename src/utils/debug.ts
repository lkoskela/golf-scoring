import { Scorecard } from "../types"
import { CalculateStablefordOptions } from "../scoring/stableford/types"
import { routing } from "./scorecard"

const DEBUG_ENABLED = true
const DEBUG_DATE: string|undefined = undefined
const DEBUG_HCP: number|undefined = undefined
const DEBUG_STROKES: number|undefined = undefined
const DEBUG_TEE: string|undefined = 'Hogan (Blue)'
const DEBUG_CR: number|undefined = undefined
const DEBUG_METHOD: 'gamebook'|'standard'|undefined = undefined

export type Debugger = {
    log: (message: string) => void,
    flush: () => void
}

const nullDebugger = {
    log: () => {},
    flush: () => {}
}

/* istanbul ignore next */
export const debug = (scorecard: Scorecard, options: CalculateStablefordOptions): Debugger => {
    if (DEBUG_ENABLED) {
        if (DEBUG_DATE && DEBUG_DATE !== scorecard.date) {
            return nullDebugger
        }
        if (DEBUG_STROKES) {
            const actualStrokes = scorecard.strokes.reduce((acc, s) => acc + s, 0)
            if (actualStrokes !== DEBUG_STROKES) return nullDebugger
        }
        if (DEBUG_HCP && DEBUG_HCP !== scorecard.hcp) {
            return nullDebugger
        }
        if (DEBUG_TEE && DEBUG_TEE !== scorecard.tee) {
            return nullDebugger
        }
        if (DEBUG_METHOD && DEBUG_METHOD !== options.method) {
            return nullDebugger
        }
        if (DEBUG_CR && DEBUG_CR !== routing(scorecard).rating.full.cr) {
            return nullDebugger
        }

        return ((): Debugger => {
            let messages: string[] = []
            return {
                log: (message: string) => messages.push(message),
                flush: () => {
                    console.log(messages.join('\n'))
                    messages = []
                }
            }
        })()
    }
    return nullDebugger
}
