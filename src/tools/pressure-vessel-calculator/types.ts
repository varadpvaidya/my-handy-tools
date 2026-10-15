
export type MaterialKey =
  | 'SA-516 Gr 70'
  | 'IS-2062 Gr B'
  | 'SA-240 Gr 316'
  | 'SA-240 Gr 316L'

export interface Material {
  name: MaterialKey
  allowableStress: number // MPa; preliminary value
  density: number // kg/m³
}

export interface CalculatorInputs {
  pressure: number // MPa
  designTemperature: number // °C
  diameter: number // mm
  height: number // mm
  shellMaterial: MaterialKey
  dishMaterial: MaterialKey
  strainerThickness: number // mm
  miscellaneousWeight: number // kg
  efficiency: number
  kFactor: number
}

export interface ThicknessResult {
  minimum: number // mm
  selected: number | null // mm; null if no listed thickness is sufficient
}

export interface WeightBreakdown {
  shell: number | null
  dish: number | null
  strainerPlate: number
  miscellaneous: number
  legs: number | null
  total: number | null
}

export interface CalculatorResults {
  shellThickness: ThicknessResult
  dishThickness: ThicknessResult
  weights: WeightBreakdown
  warnings: string[]
}

export type CalculationOutcome =
  | { success: true; results: CalculatorResults }
  | { success: false; error: string }
