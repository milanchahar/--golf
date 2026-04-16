'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { GolfScore } from '@/types'
import { formatScoreDate, getOldestScore, MAX_SCORES, willExceedLimit } from '@/lib/scores'
import { cn } from '@/lib/utils'

// ─── Icons (inline SVG so no extra dep) ──────────────────────────────────────

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  )
}

function MinusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
    </svg>
  )
}

function PencilIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a4 4 0 01-2.829 1.172H7v-2a4 4 0 011.172-2.828L9 13z" />
    </svg>
  )
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" />
    </svg>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  )
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

// ─── Reusable stepper input ───────────────────────────────────────────────────

interface ScoreStepperProps {
  value: number
  onChange: (v: number) => void
  id?: string
}

function ScoreStepper({ value, onChange, id }: ScoreStepperProps) {
  const decrement = () => onChange(Math.max(1, value - 1))
  const increment = () => onChange(Math.min(45, value + 1))

  return (
    <div className="flex items-center rounded-lg border border-slate-700 bg-slate-800/60 overflow-hidden h-11">
      <button
        type="button"
        id={id ? `${id}-dec` : undefined}
        onClick={decrement}
        className="flex items-center justify-center w-11 h-full text-slate-300 hover:bg-slate-700 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-blue"
        aria-label="Decrease score"
      >
        <MinusIcon className="w-4 h-4" />
      </button>

      <input
        id={id}
        type="number"
        min={1}
        max={45}
        value={value}
        onChange={(e) => {
          const v = parseInt(e.target.value, 10)
          if (!isNaN(v)) onChange(Math.min(45, Math.max(1, v)))
        }}
        className="w-14 text-center bg-transparent text-white text-lg font-semibold focus:outline-none tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        aria-label="Score value"
      />

      <button
        type="button"
        id={id ? `${id}-inc` : undefined}
        onClick={increment}
        className="flex items-center justify-center w-11 h-full text-slate-300 hover:bg-slate-700 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-blue"
        aria-label="Increase score"
      >
        <PlusIcon className="w-4 h-4" />
      </button>
    </div>
  )
}

// ─── Today's date in YYYY-MM-DD (local) ──────────────────────────────────────

function todayISO() {
  const d = new Date()
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-')
}

// ─── Score card ───────────────────────────────────────────────────────────────

interface ScoreCardProps {
  score: GolfScore
  index: number
  onDelete: (id: string) => Promise<void>
  onSave: (id: string, newScore: number) => Promise<void>
}

function ScoreCard({ score, index, onDelete, onSave }: ScoreCardProps) {
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState(score.score)
  const [savingEdit, setSavingEdit] = useState(false)
  const [editError, setEditError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Close inline edit on Escape
  const cardRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setEditing(false)
        setConfirmDelete(false)
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [])

  async function handleSave() {
    if (editValue < 1 || editValue > 45) {
      setEditError('Score must be between 1 and 45.')
      return
    }
    setSavingEdit(true)
    setEditError('')
    await onSave(score.id, editValue)
    setSavingEdit(false)
    setEditing(false)
  }

  async function handleDelete() {
    setDeleting(true)
    await onDelete(score.id)
    setDeleting(false)
    setConfirmDelete(false)
  }

  return (
    <div
      ref={cardRef}
      className={cn(
        'relative rounded-2xl border bg-slate-900/70 backdrop-blur-sm p-5 shadow-lg transition-all duration-300',
        'animate-fade-in',
        'hover:border-slate-600',
        confirmDelete
          ? 'border-red-500/50 bg-red-950/20'
          : editing
          ? 'border-brand-blue/50 bg-slate-900'
          : 'border-slate-800'
      )}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Top row: date + index badge */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-slate-500 mb-1">Round</p>
          <p className="text-sm font-medium text-slate-300">{formatScoreDate(score.score_date)}</p>
        </div>
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-800 text-xs font-semibold text-slate-400 ring-1 ring-slate-700">
          {index + 1}
        </span>
      </div>

      {/* Score value or edit input */}
      {editing ? (
        <div className="mb-4">
          <p className="text-xs text-slate-500 mb-2">Edit score (date cannot be changed)</p>
          <ScoreStepper value={editValue} onChange={setEditValue} id={`edit-score-${score.id}`} />
          {editError && <p className="text-red-400 text-xs mt-2">{editError}</p>}
        </div>
      ) : (
        <div className="mb-4">
          <span className="text-5xl font-black tabular-nums bg-gradient-to-br from-brand-blue to-blue-400 bg-clip-text text-transparent leading-none">
            {score.score}
          </span>
          <span className="ml-2 text-sm text-slate-500 font-medium">pts</span>
        </div>
      )}

      {/* Action area */}
      {confirmDelete ? (
        <div className="space-y-2">
          <p className="text-sm text-red-300 font-medium">Delete this score?</p>
          <div className="flex gap-2">
            <button
              id={`confirm-delete-${score.id}`}
              onClick={handleDelete}
              disabled={deleting}
              className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-medium transition-colors disabled:opacity-60"
            >
              {deleting ? (
                <span className="animate-pulse">Deleting…</span>
              ) : (
                <>
                  <TrashIcon className="w-4 h-4" />
                  Confirm
                </>
              )}
            </button>
            <button
              id={`cancel-delete-${score.id}`}
              onClick={() => setConfirmDelete(false)}
              className="flex-1 h-9 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : editing ? (
        <div className="flex gap-2">
          <button
            id={`save-edit-${score.id}`}
            onClick={handleSave}
            disabled={savingEdit}
            className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-lg bg-brand-blue hover:bg-blue-500 text-white text-sm font-medium transition-colors disabled:opacity-60"
          >
            {savingEdit ? (
              <span className="animate-pulse">Saving…</span>
            ) : (
              <>
                <CheckIcon className="w-4 h-4" />
                Save
              </>
            )}
          </button>
          <button
            id={`cancel-edit-${score.id}`}
            onClick={() => { setEditing(false); setEditValue(score.score); setEditError('') }}
            className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 text-sm font-medium transition-colors"
          >
            <XIcon className="w-4 h-4" />
            Cancel
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            id={`edit-btn-${score.id}`}
            onClick={() => { setEditing(true); setEditValue(score.score) }}
            className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-lg border border-slate-700 text-slate-300 hover:border-brand-blue hover:text-brand-blue text-sm font-medium transition-colors"
          >
            <PencilIcon className="w-4 h-4" />
            Edit
          </button>
          <button
            id={`delete-btn-${score.id}`}
            onClick={() => setConfirmDelete(true)}
            className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-lg border border-slate-700 text-slate-300 hover:border-red-500/60 hover:text-red-400 text-sm font-medium transition-colors"
          >
            <TrashIcon className="w-4 h-4" />
            Delete
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Scores capacity bar ──────────────────────────────────────────────────────

function CapacityBar({ count }: { count: number }) {
  const pct = (count / MAX_SCORES) * 100
  const colour =
    count >= MAX_SCORES
      ? 'bg-amber-500'
      : count >= 3
      ? 'bg-brand-blue'
      : 'bg-brand-green'

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1.5 rounded-full bg-slate-800 overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-500', colour)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-semibold tabular-nums text-slate-400">
        {count} / {MAX_SCORES}
      </span>
    </div>
  )
}

// ─── Main page component ──────────────────────────────────────────────────────

export default function ScoresPageClient() {
  const [scores, setScores] = useState<GolfScore[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState('')

  // Form state
  const [formDate, setFormDate] = useState(todayISO())
  const [formScore, setFormScore] = useState(18)
  const [submitting, setSubmitting] = useState(false)
  const [dateError, setDateError] = useState('')
  const [scoreError, setScoreError] = useState('')
  const [submitSuccess, setSubmitSuccess] = useState(false)

  // Fetch scores on mount
  const fetchScores = useCallback(async () => {
    setLoading(true)
    setFetchError('')
    try {
      const res = await fetch('/api/scores')
      if (!res.ok) throw new Error('Failed to load scores')
      const data = await res.json()
      setScores(data.scores ?? [])
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchScores()
  }, [fetchScores])

  // Will adding push out the oldest?
  const willEvict = willExceedLimit(scores.length)
  const oldestScore = scores.length > 0 ? getOldestScore(scores) : null

  async function handleAddScore(e: React.FormEvent) {
    e.preventDefault()
    let valid = true

    setDateError('')
    setScoreError('')
    setSubmitSuccess(false)

    // Client-side validation
    if (!formDate) {
      setDateError('Please select a date.')
      valid = false
    }

    if (formScore < 1 || formScore > 45 || !Number.isInteger(formScore)) {
      setScoreError('Score must be a whole number between 1 and 45.')
      valid = false
    }

    if (!valid) return

    setSubmitting(true)

    const res = await fetch('/api/scores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ score: formScore, score_date: formDate }),
    })

    const data = await res.json()

    if (!res.ok) {
      if (res.status === 409) {
        setDateError(data.error)
      } else if (data.error?.toLowerCase().includes('date')) {
        setDateError(data.error)
      } else {
        setScoreError(data.error || 'Something went wrong.')
      }
    } else {
      // Optimistically update the list then refetch to stay in sync
      setSubmitSuccess(true)
      setFormDate(todayISO())
      setFormScore(18)
      await fetchScores()
    }

    setSubmitting(false)
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/scores/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setScores((prev) => prev.filter((s) => s.id !== id))
    }
  }

  async function handleSave(id: string, newScore: number) {
    const res = await fetch(`/api/scores/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ score: newScore }),
    })
    if (res.ok) {
      const data = await res.json()
      setScores((prev) => prev.map((s) => (s.id === id ? data.score : s)))
    }
  }

  return (
    <div className="space-y-8">
      {/* ── Page header ─────────────────────────────────────── */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          My Scores
        </h2>
        <p className="mt-1 text-slate-400 text-sm">
          Track up to {MAX_SCORES} Stableford rounds. Adding a 6th will automatically remove your oldest.
        </p>
      </div>

      {/* ── Section A: Add new score ─────────────────────────── */}
      <section
        id="add-score-section"
        className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm p-6 shadow-xl"
      >
        <h3 className="text-base font-semibold text-slate-100 mb-5 flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-brand-blue/20 border border-brand-blue/30 text-brand-blue">
            <PlusIcon className="w-3.5 h-3.5" />
          </span>
          Add New Score
        </h3>

        {/* Eviction warning */}
        {willEvict && oldestScore && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-950/20 p-4">
            <span className="text-amber-400 text-lg leading-none mt-0.5">⚠</span>
            <p className="text-sm text-amber-300">
              Adding this score will remove your oldest entry —{' '}
              <strong className="font-semibold">
                {oldestScore.score} pts on {formatScoreDate(oldestScore.score_date)}
              </strong>
              .
            </p>
          </div>
        )}

        <form onSubmit={handleAddScore} noValidate>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
            {/* Date input */}
            <div>
              <label
                htmlFor="score-date"
                className="block text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2"
              >
                Round Date
              </label>
              <input
                id="score-date"
                type="date"
                value={formDate}
                max={todayISO()}
                onChange={(e) => { setFormDate(e.target.value); setDateError('') }}
                className={cn(
                  'w-full h-11 rounded-lg border bg-slate-800/60 px-3.5 text-sm text-slate-100 focus:outline-none focus:ring-2 transition-colors',
                  '[color-scheme:dark]',
                  dateError
                    ? 'border-red-500/60 focus:ring-red-500/40'
                    : 'border-slate-700 focus:ring-brand-blue/50 focus:border-brand-blue/50'
                )}
              />
              {dateError && (
                <p id="date-error" className="mt-1.5 text-xs text-red-400">
                  {dateError}
                </p>
              )}
            </div>

            {/* Score stepper */}
            <div>
              <label
                htmlFor="score-input"
                className="block text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2"
              >
                Stableford Score (1–45)
              </label>
              <ScoreStepper value={formScore} onChange={(v) => { setFormScore(v); setScoreError('') }} id="score-input" />
              {scoreError && (
                <p id="score-error" className="mt-1.5 text-xs text-red-400">
                  {scoreError}
                </p>
              )}
            </div>
          </div>

          {submitSuccess && (
            <div className="mb-4 flex items-center gap-2 text-sm text-brand-green">
              <CheckIcon className="w-4 h-4" />
              Score added successfully!
            </div>
          )}

          <button
            id="add-score-btn"
            type="submit"
            disabled={submitting}
            className={cn(
              'inline-flex items-center gap-2 h-11 px-6 rounded-xl font-semibold text-sm transition-all',
              'bg-brand-blue hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20',
              'focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2 focus:ring-offset-slate-900',
              'disabled:opacity-60 disabled:cursor-not-allowed'
            )}
          >
            {submitting ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                Adding…
              </>
            ) : (
              <>
                <PlusIcon className="w-4 h-4" />
                Add Score
              </>
            )}
          </button>
        </form>
      </section>

      {/* ── Section B: Score list ────────────────────────────── */}
      <section id="scores-list-section">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-slate-100">Your Scores</h3>
        </div>

        {/* Capacity bar */}
        <div className="mb-5">
          <CapacityBar count={scores.length} />
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 animate-pulse h-40"
              />
            ))}
          </div>
        )}

        {/* Error state */}
        {!loading && fetchError && (
          <div className="rounded-xl border border-red-500/30 bg-red-950/20 p-4 text-sm text-red-400">
            {fetchError}
          </div>
        )}

        {/* Empty state */}
        {!loading && !fetchError && scores.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 py-16 px-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center text-3xl mb-4">
              ⛳
            </div>
            <p className="text-slate-300 font-medium mb-1">No scores yet</p>
            <p className="text-slate-500 text-sm">
              You haven&apos;t entered any scores yet. Add your first score above.
            </p>
          </div>
        )}

        {/* Score cards grid */}
        {!loading && !fetchError && scores.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {scores.map((score, i) => (
              <ScoreCard
                key={score.id}
                score={score}
                index={i}
                onDelete={handleDelete}
                onSave={handleSave}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
