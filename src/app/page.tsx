import { getAuthUser } from '@/lib/supabase/auth'
import Link from 'next/link'
import { signOut } from './(auth)/actions'

export default async function Home() {
  const auth = await getAuthUser()
  const user = auth?.user ?? null

  return (
    <div className="min-h-screen">
      <nav className="navbar bg-base-200">
        <div className="flex-1">
          <Link href="/" className="btn btn-ghost text-xl">
            Grimdark League
          </Link>
        </div>
        <div className="flex gap-2">
          {user ? (
            <form action={signOut}>
              <button type="submit" className="btn btn-outline btn-error">
                Sign Out
              </button>
            </form>
          ) : (
            <>
              <Link href="/sign-in" className="btn btn-ghost">
                Sign In
              </Link>
              <Link href="/sign-up" className="btn btn-primary">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>

      <main className="flex flex-col items-center justify-center px-4 py-24">
        <h1 className="text-4xl font-bold">Welcome to the Grimdark League</h1>
        <p className="mt-4 text-lg text-base-content/70">Warhammer 40k league tracking and battle reports.</p>
      </main>
    </div>
  )
}
