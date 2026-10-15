
import { useState } from 'react'
import { Pencil, X } from 'lucide-react'
import { MATERIALS } from './materials'
import { calculateVessel } from './calculations'
import type {
  CalculatorInputs,
  CalculatorResults,
  MaterialKey,
} from './types'

type FormState = {
  pressure: string
  designTemperature: string
  diameter: string
  height: string
  shellMaterial: MaterialKey
  dishMaterial: MaterialKey
  strainerThickness: string
  miscellaneousWeight: string
  efficiency: string
  kFactor: string
}

const initialForm: FormState = {
  pressure: '',
  designTemperature: '',
  diameter: '',
  height: '',
  shellMaterial: 'SA-516 Gr 70',
  dishMaterial: 'SA-516 Gr 70',
  strainerThickness: '',
  miscellaneousWeight: '1000',
  efficiency: '1',
  kFactor: '0.9',
}

const materialOptions = Object.keys(MATERIALS) as MaterialKey[]

function numberValue(value: string, label: string): number {
  if (value.trim() === '') {
    throw new Error(`${label} is required.`)
  }

  const parsed = Number(value)

  if (!Number.isFinite(parsed)) {
    throw new Error(`${label} must be a valid number.`)
  }

  return parsed
}

function formatNumber(value: number, decimals = 2): string {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  })
}

function Field({
  label,
  value,
  onChange,
  unit,
  type = 'number',
  step = 'any',
  min,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  unit?: string
  type?: string
  step?: string
  min?: string
}) {
  return (
    <label className="calculator-field">
      <span className="field-label">{label}</span>
      <span className="field-control">
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          step={step}
          min={min}
          required
        />
        {unit && <span className="field-unit">{unit}</span>}
      </span>
    </label>
  )
}

function MaterialField({
  label,
  value,
  onChange,
}: {
  label: string
  value: MaterialKey
  onChange: (value: MaterialKey) => void
}) {
  return (
    <label className="calculator-field">
      <span className="field-label">{label}</span>
      <select
        className="material-select"
        value={value}
        onChange={(event) => onChange(event.target.value as MaterialKey)}
      >
        {materialOptions.map((material) => (
          <option key={material} value={material}>
            {material}
          </option>
        ))}
      </select>
    </label>
  )
}

function ThicknessResult({
  label,
  minimum,
  selected,
}: {
  label: string
  minimum: number
  selected: number | null
}) {
  return (
    <div className="thickness-result">
      <span className="result-label">{label}</span>
      <div className="thickness-values">
        <div>
          <span className="result-caption">Minimum</span>
          <strong>{formatNumber(minimum)} mm</strong>
        </div>
        <div>
          <span className="result-caption">Selected</span>
          <strong>{selected === null ? 'Not available' : `${selected} mm`}</strong>
        </div>
      </div>
    </div>
  )
}

function WeightRow({
  label,
  value,
}: {
  label: string
  value: number | null
}) {
  return (
    <div className="weight-row">
      <span>{label}</span>
      <strong>{value === null ? '—' : `${formatNumber(value)} kg`}</strong>
    </div>
  )
}

export default function PressureVesselCalculator() {
  const [form, setForm] = useState<FormState>(initialForm)
  const [results, setResults] = useState<CalculatorResults | null>(null)
  const [error, setError] = useState('')
  const [kDialogOpen, setKDialogOpen] = useState(false)
  const [dishHeight, setDishHeight] = useState('')

  function updateForm<K extends keyof FormState>(
    key: K,
    value: FormState[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  function handleCalculate(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setResults(null)

    try {
      const inputs: CalculatorInputs = {
        pressure: numberValue(form.pressure, 'Design pressure'),
        designTemperature: numberValue(
          form.designTemperature,
          'Design temperature',
        ),
        diameter: numberValue(form.diameter, 'Shell diameter'),
        height: numberValue(form.height, 'Shell height'),
        shellMaterial: form.shellMaterial,
        dishMaterial: form.dishMaterial,
        strainerThickness: numberValue(
          form.strainerThickness,
          'Strainer plate thickness',
        ),
        miscellaneousWeight: numberValue(
          form.miscellaneousWeight,
          'Miscellaneous weight',
        ),
        efficiency: numberValue(form.efficiency, 'Efficiency'),
        kFactor: numberValue(form.kFactor, 'K factor'),
      }

      const outcome = calculateVessel(inputs)

      if (!outcome.success) {
        setError(outcome.error)
        return
      }

      setResults(outcome.results)
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : 'Please check your inputs.',
      )
    }
  }

  function openKDialog() {
    setDishHeight('')
    setKDialogOpen(true)
  }

  const diameter = Number(form.diameter)
  const h = Number(dishHeight)
  const liveK =
    form.diameter.trim() !== '' &&
    dishHeight.trim() !== '' &&
    Number.isFinite(diameter) &&
    Number.isFinite(h) &&
    diameter > 0 &&
    h > 0
      ? (2 + (diameter / (2 * h)) ** 2) / 6
      : null



  return (
    <section className="calculator-page">
      <h1>Pressure Vessel Calculator</h1>
      <p className="calculator-note">
        Preliminary calculation only. Verify all inputs and results against the
        applicable design code.
      </p>

      <form className="calculator-layout" onSubmit={handleCalculate}>
        <section className="calculator-panel inputs-panel">
          <h2>Inputs</h2>

          <div className="input-grid">
            <Field
              label="Design Pressure"
              value={form.pressure}
              onChange={(value) => updateForm('pressure', value)}
              unit="MPa"
              min="0"
            />
            <Field
              label="Design Temperature"
              value={form.designTemperature}
              onChange={(value) => updateForm('designTemperature', value)}
              unit="°C"
            />
            <Field
              label="Shell Diameter"
              value={form.diameter}
              onChange={(value) => updateForm('diameter', value)}
              unit="mm"
              min="0"
            />
            <Field
              label="Shell Height"
              value={form.height}
              onChange={(value) => updateForm('height', value)}
              unit="mm"
              min="0"
            />

            <MaterialField
              label="Shell Material (MOCS)"
              value={form.shellMaterial}
              onChange={(value) => updateForm('shellMaterial', value)}
            />
            <MaterialField
              label="Dish Material (MOCD)"
              value={form.dishMaterial}
              onChange={(value) => updateForm('dishMaterial', value)}
            />

            <Field
              label="Strainer Plate Thickness"
              value={form.strainerThickness}
              onChange={(value) => updateForm('strainerThickness', value)}
              unit="mm"
              min="0"
            />
            <Field
              label="Miscellaneous Weight"
              value={form.miscellaneousWeight}
              onChange={(value) => updateForm('miscellaneousWeight', value)}
              unit="kg"
              min="0"
            />
            <Field
              label="Efficiency (E)"
              value={form.efficiency}
              onChange={(value) => updateForm('efficiency', value)}
              min="0"
            />

            <label className="calculator-field">
              <span className="field-label">K Factor (K)</span>
              <span className="k-factor-control">
                <input
                  type="number"
                  value={form.kFactor}
                  onChange={(event) => updateForm('kFactor', event.target.value)}
                  step="any"
                  min="0"
                  required
                />
                <button
                  type="button"
                  className="k-edit-button"
                  onClick={openKDialog}
                  aria-label="Edit K factor using dish dimensions"
                  title="Calculate K factor"
                >
                  <Pencil size={15} />
                </button>
              </span>
            </label>
          </div>

          <button className="calculate-button" type="submit">
            Calculate
          </button>
        </section>

        <section className="calculator-panel results-panel" aria-live="polite">
          <h2>Results</h2>

          {error && <p className="calculator-error" role="alert">{error}</p>}

          {!results && !error && (
            <p className="empty-results">Results will appear here after calculation.</p>
          )}

          {results && (
            <div className="results-content">
              <ThicknessResult
                label="Shell Thickness"
                minimum={results.shellThickness.minimum}
                selected={results.shellThickness.selected}
              />
              <ThicknessResult
                label="Dish Thickness"
                minimum={results.dishThickness.minimum}
                selected={results.dishThickness.selected}
              />

              <div className="total-weight">
                <span>Total Weight</span>
                <strong>
                  {results.weights.total === null
                    ? 'Not available'
                    : `${formatNumber(results.weights.total)} kg`}
                </strong>
              </div>

              <div className="weight-breakdown">
                <h3>Weight Breakdown</h3>
                <WeightRow label="Shell" value={results.weights.shell} />
                <WeightRow label="Dish" value={results.weights.dish} />
                <WeightRow
                  label="Strainer Plate"
                  value={results.weights.strainerPlate}
                />
                <WeightRow
                  label="Miscellaneous"
                  value={results.weights.miscellaneous}
                />
                <WeightRow label="Legs" value={results.weights.legs} />
              </div>

              {results.warnings.length > 0 && (
                <ul className="calculator-warnings">
                  {results.warnings.map((warning) => (
                    <li key={warning}>{warning}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </section>
      </form>

      {kDialogOpen && (
        <div
          className="dialog-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setKDialogOpen(false)
            }
          }}
        >
          <section
            className="k-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="k-dialog-title"
          >
            <div className="k-dialog-header">
              <h2 id="k-dialog-title">K Factor</h2>
              <button
                type="button"
                className="k-close-button"
                aria-label="Close dialog"
                onClick={() => setKDialogOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <p className="k-formula">K = (2 + (D / 2h)²) / 6</p>

            <label className="calculator-field">
              <span className="field-label">Shell Diameter (D)</span>
              <span className="field-control">
                <input
                  type="text"
                  value={form.diameter || '—'}
                  readOnly
                  aria-label="Current shell diameter in millimetres"
                />
                <span className="field-unit">mm</span>
              </span>
            </label>

            <div className="k-dialog-field">
              <Field
                label="Dish Height (h)"
                value={dishHeight}
                onChange={setDishHeight}
                unit="mm"
                min="0"
              />
            </div>

            <div className="k-live-result">
              <span>Calculated K</span>
              <strong>{liveK === null ? '—' : formatNumber(liveK, 6)}</strong>
            </div>

            <div className="k-dialog-actions">
              <button
                type="button"
                className="dialog-cancel"
                onClick={() => setKDialogOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="dialog-apply"
                disabled={liveK === null}
                onClick={() => {
                  if (liveK !== null) {
                    updateForm('kFactor', String(liveK))
                    setResults(null)
                    setError('')
                    setKDialogOpen(false)
                  }
                }}
              >
                Apply
              </button>
            </div>
          </section>
        </div>
      )}
    </section>
  )
}
