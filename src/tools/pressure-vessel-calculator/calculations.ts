
import { AVAILABLE_THICKNESSES, MATERIALS } from './materials'
import type {
  CalculationOutcome,
  CalculatorInputs,
  CalculatorResults,
  MaterialKey,
} from './types'

const PI = Math.PI

function isValidMaterial(value: string): value is MaterialKey {
  return Object.prototype.hasOwnProperty.call(MATERIALS, value)
}

function selectThickness(minimum: number): number | null {
  return AVAILABLE_THICKNESSES.find(
    (thickness) => thickness >= minimum,
  ) ?? null
}

function getLegWeight(diameter: number): number | null {
  if (diameter < 2000) return 500
  if (diameter < 3000) return 800
  if (diameter < 4000) return 1500
  if (diameter <= 4500) return 2000

  return null
}

export function calculateVessel(
  inputs: CalculatorInputs,
): CalculationOutcome {
  const {
    pressure,
    designTemperature,
    diameter,
    height,
    shellMaterial,
    dishMaterial,
    strainerThickness,
    miscellaneousWeight,
    efficiency,
    kFactor,
  } = inputs

  // Validate numeric inputs.
  const numericInputs: [string, number][] = [
    ['Design pressure', pressure],
    ['Design temperature', designTemperature],
    ['Shell diameter', diameter],
    ['Shell height', height],
    ['Strainer plate thickness', strainerThickness],
    ['Miscellaneous weight', miscellaneousWeight],
    ['Efficiency', efficiency],
    ['K factor', kFactor],
  ]

  for (const [label, value] of numericInputs) {
    if (!Number.isFinite(value)) {
      return { success: false, error: `${label} must be a valid number.` }
    }
  }

  if (pressure <= 0) {
    return { success: false, error: 'Design pressure must be greater than zero.' }
  }

  if (diameter <= 0 || height <= 0) {
    return {
      success: false,
      error: 'Shell diameter and height must be greater than zero.',
    }
  }

  if (strainerThickness <= 0) {
    return {
      success: false,
      error: 'Strainer plate thickness must be greater than zero.',
    }
  }

  if (miscellaneousWeight < 0) {
    return {
      success: false,
      error: 'Miscellaneous weight cannot be negative.',
    }
  }

  if (efficiency <= 0 || efficiency > 1) {
    return {
      success: false,
      error: 'Efficiency must be greater than zero and no greater than 1.',
    }
  }

  if (kFactor <= 0) {
    return { success: false, error: 'K factor must be greater than zero.' }
  }

  if (!isValidMaterial(shellMaterial) || !isValidMaterial(dishMaterial)) {
    return { success: false, error: 'Please select valid shell and dish materials.' }
  }

  const shell = MATERIALS[shellMaterial]
  const dish = MATERIALS[dishMaterial]

  // Minimum required thicknesses (mm).
  const shellDenominator = 2 * shell.allowableStress * efficiency - 0.6 * pressure
  const dishDenominator = 2 * dish.allowableStress * efficiency - 0.2 * pressure

  if (shellDenominator <= 0 || dishDenominator <= 0) {
    return {
      success: false,
      error: 'The calculation denominator is zero or negative. Check the pressure, material and efficiency.',
    }
  }

  const shellMinimum = (pressure * diameter) / shellDenominator
  const dishMinimum = (pressure * diameter * kFactor) / dishDenominator

  if (
    !Number.isFinite(shellMinimum) ||
    !Number.isFinite(dishMinimum) ||
    shellMinimum <= 0 ||
    dishMinimum <= 0
  ) {
    return {
      success: false,
      error: 'The calculated thickness is invalid. Please check the inputs.',
    }
  }

  const shellSelected = selectThickness(shellMinimum)
  const dishSelected = selectThickness(dishMinimum)

  // Convert millimetres to metres before calculating volume and weight.
  const diameterM = diameter / 1000
  const heightM = height / 1000
  const strainerThicknessM = strainerThickness / 1000

  const shellWeight =
    shellSelected === null
      ? null
      : PI *
        diameterM *
        heightM *
        (shellSelected / 1000) *
        shell.density

  const dishDiameterM = 1.25 * diameterM

  const dishWeight =
    dishSelected === null
      ? null
      : (PI / 4) *
        dishDiameterM ** 2 *
        (dishSelected / 1000) *
        dish.density

  const strainerWeight =
    (PI / 4) *
    diameterM ** 2 *
    strainerThicknessM *
    shell.density

  const legWeight = getLegWeight(diameter)

  const warnings: string[] = []

  if (shellSelected === null) {
    warnings.push(
      'Shell minimum thickness exceeds the largest available thickness of 40 mm.',
    )
  }

  if (dishSelected === null) {
    warnings.push(
      'Dish minimum thickness exceeds the largest available thickness of 40 mm.',
    )
  }

  if (legWeight === null) {
    warnings.push(
      'Leg weight is undefined for this diameter. The total weight cannot be calculated.',
    )
  }

  const totalWeight =
    shellWeight === null || dishWeight === null || legWeight === null
      ? null
      : shellWeight +
        dishWeight +
        strainerWeight +
        miscellaneousWeight +
        legWeight

  const results: CalculatorResults = {
    shellThickness: {
      minimum: shellMinimum,
      selected: shellSelected,
    },
    dishThickness: {
      minimum: dishMinimum,
      selected: dishSelected,
    },
    weights: {
      shell: shellWeight,
      dish: dishWeight,
      strainerPlate: strainerWeight,
      miscellaneous: miscellaneousWeight,
      legs: legWeight,
      total: totalWeight,
    },
    warnings,
  }

  return { success: true, results }
}
