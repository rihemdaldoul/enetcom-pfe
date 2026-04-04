import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-blue-600 px-2.5 py-1 text-sm font-bold text-white">EN</div>
              <span className="font-semibold text-gray-900">ENET&apos;Com PFE</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/auth/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                Sign in
              </Link>
              <Link href="/auth/register" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                Get started
              </Link>
            </div>
          </div>
        </div>
      </nav>
      <main className="mx-auto max-w-4xl px-4 py-24 text-center">
        <h1 className="text-5xl font-bold tracking-tight text-gray-900">
          Find your perfect<br />
          <span className="text-blue-600">PFE opportunity</span>
        </h1>
        <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
          Connecting ENET&apos;Com students with top companies for internships and final year projects.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link href="/auth/register" className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition">
            Get started →
          </Link>
          <Link href="/auth/login" className="rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition">
            Sign in
          </Link>
        </div>
      </main>
    </div>
  )
}