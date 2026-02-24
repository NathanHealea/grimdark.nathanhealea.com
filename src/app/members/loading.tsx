export default function MembersLoading() {
  return (
    <main className="flex flex-col items-center -mt-72 pt-72 min-h-screen w-full">
      <div className="w-full px-4 py-12">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8">
            <div className="skeleton h-9 w-48" />
            <div className="skeleton mt-2 h-5 w-80" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card bg-base-200 shadow-sm">
                <div className="card-body flex-col items-center gap-4 p-4">
                  <div className="min-h-24 flex items-center justify-center">
                    <div className="skeleton h-24 w-24 rounded-full" />
                  </div>
                  <div className="flex flex-col items-center gap-2 w-full">
                    <div className="skeleton h-7 w-36" />
                    <div className="skeleton h-5 w-20" />
                    <div className="flex gap-3">
                      <div className="skeleton h-4 w-16" />
                      <div className="skeleton h-4 w-16" />
                    </div>
                    <div className="flex gap-1">
                      <div className="skeleton h-5 w-24 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
