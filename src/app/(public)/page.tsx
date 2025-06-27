import Link from 'next/link'

export default async function HomePage() {
  const players = [
    {
      id: 1,
      title: 'John Doe',
      role: 'Captain',
      list: ['Space Marines', 'Imperial Guard'],
    },
    {
      id: 2,
      title: 'Jane Smith',
      role: 'Tactician',
      list: ['Orks', 'Necrons'],
    },
    {
      id: 3,
      title: 'Alice Johnson',
      role: 'Strategist',
      list: ['Eldar', 'Tau'],
    },
    {
      id: 4,
      title: 'Bob Brown',
      role: 'Scout',
      list: ['Chaos Space Marines', 'Dark Eldar'],
    },
  ]

  return (
    <main className="flex min-h-screen flex-col items-center">
      {/* Hero */}
      <header className="hero bg-base-200 min-h-[50vh]">
        <div className="hero-content text-center">
          <div className="container flex flex-col items-center gap-4">
            <h1 className="text-5xl font-bold">Welcome to the Grimdark League!</h1>
            <p className="">
              {' '}
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
      <section className="section section-md">
        <div className="section-content">
          <div className="content flex flex-col gap-4">
            <div className="section-header text-center">
              <h2 className="text-3xl font-bold">League Members</h2>
              <p className="text-lg">Meet our dedicated players!</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-16">
              {players &&
                players.map((player: any) => (
                  <Link href="/" key={player.id} className="card bg-base-200 shadow-xl">
                    <div className="card-body gap-4">
                      <h3 className="card-title">{player.title}</h3>
                      <div className="skeleton h-60 w-48"></div>
                      <p className="">{player.role}</p>
                      <div className="flex flex-col gap-2">
                        <p className="text-sm text-gray-500">Armies:</p>
                        <ul className="list pl-2 text-sm">
                          {player.list.map((army: string, index: number) => (
                            <li key={index}>{army}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
