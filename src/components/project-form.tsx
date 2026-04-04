'use client'

import { cn } from '@/lib/utils'
import type { Project } from '@/types'

export type ProjectFormData = {
  title: string
  description: string
  requirements: string
  type: 'PFE' | 'PFA' | 'internship'
  status: 'open' | 'closed' | 'filled'
  location: string
  is_remote: boolean
  duration: string
  stipend: string
  slots: number
  deadline: string
  tags: string
}

export const defaultFormData: ProjectFormData = {
  title: '',
  description: '',
  requirements: '',
  type: 'PFE',
  status: 'open',
  location: '',
  is_remote: false,
  duration: '',
  stipend: '',
  slots: 1,
  deadline: '',
  tags: '',
}

type Props = {
  data: ProjectFormData
  onChange: (data: ProjectFormData) => void
  onSubmit: (e: React.FormEvent) => void
  loading: boolean
  error: string | null
  submitLabel: string
}

export default function ProjectForm({
  data, onChange, onSubmit, loading, error, submitLabel
}: Props) {

  function set(field: keyof ProjectFormData, value: string | boolean | number) {
    onChange({ ...data, [field]: value })
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={data.title}
          onChange={e => set('title', e.target.value)}
          required
          placeholder="e.g. Web Developer PFE - React & Node.js"
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
        />
      </div>

      {/* Type + Status */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Type</label>
          <select
            value={data.type}
            onChange={e => set('type', e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition bg-white"
          >
            <option value="PFE">PFE</option>
            <option value="PFA">PFA</option>
            <option value="internship">Internship</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
          <select
            value={data.status}
            onChange={e => set('status', e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition bg-white"
          >
            <option value="open">Open</option>
            <option value="closed">Closed</option>
            <option value="filled">Filled</option>
          </select>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          value={data.description}
          onChange={e => set('description', e.target.value)}
          required
          rows={4}
          placeholder="Describe the project, goals, and what students will work on..."
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition resize-none"
        />
      </div>

      {/* Requirements */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Requirements
        </label>
        <textarea
          value={data.requirements}
          onChange={e => set('requirements', e.target.value)}
          rows={3}
          placeholder="Required skills, knowledge, or qualifications..."
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition resize-none"
        />
      </div>

      {/* Location + Remote */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Location</label>
          <input
            type="text"
            value={data.location}
            onChange={e => set('location', e.target.value)}
            placeholder="Tunis, Tunisia"
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Duration</label>
          <input
            type="text"
            value={data.duration}
            onChange={e => set('duration', e.target.value)}
            placeholder="e.g. 4 months"
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
          />
        </div>
      </div>

      {/* Remote checkbox */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="is_remote"
          checked={data.is_remote}
          onChange={e => set('is_remote', e.target.checked)}
          className="rounded border-gray-300 text-blue-600"
        />
        <label htmlFor="is_remote" className="text-sm text-gray-700">
          Remote work available
        </label>
      </div>

      {/* Slots + Stipend + Deadline */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Slots</label>
          <input
            type="number"
            value={data.slots}
            onChange={e => set('slots', parseInt(e.target.value))}
            min={1}
            max={20}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Stipend</label>
          <input
            type="text"
            value={data.stipend}
            onChange={e => set('stipend', e.target.value)}
            placeholder="e.g. 400 TND/mo"
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Deadline</label>
          <input
            type="date"
            value={data.deadline}
            onChange={e => set('deadline', e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
          />
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Tags
          <span className="ml-1 text-xs text-gray-400">(comma separated)</span>
        </label>
        <input
          type="text"
          value={data.tags}
          onChange={e => set('tags', e.target.value)}
          placeholder="React, Node.js, PostgreSQL"
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className={cn(
          'rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition',
          loading ? 'opacity-60 cursor-not-allowed' : 'hover:bg-blue-700'
        )}
      >
        {loading ? 'Saving...' : submitLabel}
      </button>
    </form>
  )
}