'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import type { Role } from '@/types'

export default function RegisterPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<Role>('student')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    // Enforce @enetcom.tn for students
  if (role === 'student' && !email.endsWith('@enetcom.tn')) {
    setError('Students must use their official @enetcom.tn email address.')
    return
  }

  // Enforce company domain format: must end with .tn and not be a free email
  if (role === 'company') {
    const domain = email.split('@')[1] ?? ''
    const localPart = email.split('@')[0] ?? ''

    if (!domain.endsWith('.tn')) {
      setError('Companies must use a Tunisian email address ending in .tn')
      return
    }

    if (domain === 'enetcom.tn') {
      setError('Companies cannot use @enetcom.tn — that is reserved for students.')
      return
    }

    // domain must match pattern: something.tn (no free providers)
    // local part (before @) must match the domain name
    // e.g. companyname@companyname.tn → localPart contains "companyname", domain is "companyname.tn"
    const domainName = domain.replace('.tn', '') // "companyname" from "companyname.tn"
    if (!domain.includes(localPart) && !localPart.includes(domainName)) {
      setError('Company email must match your company domain (e.g. companyname@companyname.tn)')
      return
    }
  }

    setLoading(true)
    const supabase = createClient()

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role,
        },
      },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    if (data.user) {
      router.push(`/${role}`)
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">ENET&apos;Com PFE</h1>
          <p className="mt-2 text-gray-600">Create your account</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <form onSubmit={handleRegister} className="space-y-5">

            {/* Error */}
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Role Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                I am a...
              </label>
              <div className="grid grid-cols-2 gap-3">
                {(['student', 'company'] as Role[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={cn(
                      'rounded-lg border-2 py-2.5 text-sm font-medium capitalize transition',
                      role === r
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    )}
                  >
                    {r === 'student' ? '🎓 Student' : '🏢 Company'}
                  </button>
                ))}
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Full name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={role === 'student' ? 'you@enetcom.tn' : 'contact@yourcompany.tn'}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
              />
              {role === 'student' && (
                <p className="mt-1.5 text-xs text-gray-500">
                  ⚠️ Must be your official @enetcom.tn address
                </p>
              )}
              {role === 'company' && (
                <p className="mt-1.5 text-xs text-gray-500">
                  ⚠️ Must be a professional Tunisian email (e.g. contact@yourcompany.tn)
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                required
                minLength={6}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={cn(
                'w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition',
                loading ? 'opacity-60 cursor-not-allowed' : 'hover:bg-blue-700'
              )}
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/auth/login" className="font-medium text-blue-600 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}