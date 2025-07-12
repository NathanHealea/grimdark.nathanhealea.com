import LeagueMembersSection from '@/components/sections/LeagueMembersSection'

export default async function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center">
      {/* Hero */}
      <header className="hero bg-base-200 min-h-[50vh]">
        <div className="hero-content text-center">
          <div className="container flex flex-col items-center gap-4">
            <h1 className="text-5xl font-bold">Welcome to the Grimdark League!</h1>
            <p className="">
              A group of Warhammer enthusiasts dedicated to exploring the lore and battles of the Grimdark universe
              located in the <em>Eugene/Springfield, Oregon</em> area.
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <section className="section bg-base-300 section-md">
        <div className="section-content">
          <div className="container flex flex-col gap-4">
            <div className="section-header">
              <h2 className="text-3xl font-bold">Join the Battle!</h2>
            </div>
            <p className="text-lg">
              Whether you&apos;re a seasoned veteran or new to the universe, there&apos;s a place for you here.
            </p>
            <p className="text-lg">
              Check out our{' '}
              <a href="/register" className="link link-primary">
                registration page
              </a>{' '}
              to get started.
            </p>
          </div>
        </div>
      </section>

      {/* Members */}
      <LeagueMembersSection />
    </main>
  )
}
