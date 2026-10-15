
import type { Material, MaterialKey } from './types'

export const MATERIALS: Record<MaterialKey, Material> = {
  'SA-516 Gr 70': {
    name: 'SA-516 Gr 70',
    allowableStress: 138,
    density: 7850,
  },
  'IS-2062 Gr B': {
    name: 'IS-2062 Gr B',
    allowableStress: 118,
    density: 7850,
  },
  'SA-240 Gr 316': {
    name: 'SA-240 Gr 316',
    allowableStress: 138,
    density: 8000,
  },
  'SA-240 Gr 316L': {
    name: 'SA-240 Gr 316L',
    allowableStress: 138,
    density: 8000,
  },
}

export const AVAILABLE_THICKNESSES = [
  6, 8, 10, 12, 14, 16, 18, 20,
  22, 25, 28, 30, 32, 34, 36, 40,
] as const

export const DEFAULTS = {
  miscellaneousWeight: 1000,
  efficiency: 1,
  kFactor: 0.9,
} as const
