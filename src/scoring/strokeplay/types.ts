import { CommonScoringOptions, CommonScore } from "../../types"

export type CalculateStrokeplayOptions = CommonScoringOptions

export type StrokeplayScore = CommonScore &{
    // The net score (strokes minus playing handicap) relative to par
    // (-5 means playing "5 under par", +3 means "3 over par", etc.)
    relativeToPar: number,
}
