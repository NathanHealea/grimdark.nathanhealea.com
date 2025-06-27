


export default function DashboardPage() {
  return (
    <main className="flex-1 flex min-h-screen flex-col items-center justify-center -mt-20 pt-20">
      <section className="container flex flex-col items-center justify-center gap-4">
        <div className="card bg-base-200 w-full max-w-lg shrink-0 shadow-2xl p-8">
          <h1 className="card-title text-3xl font-bold justify-center">Dashboard</h1>
          <div className="card-body w-full max-w-xl text-center">
            <p>Welcome to the dashboard!</p>
          </div>
        </div>
      </section>
    </main>
  )
}