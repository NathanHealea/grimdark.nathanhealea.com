export default function LeaderboardLoading() {
  return (
    <main className="page-layout">
      <div className="page-container">
        <div className="page-content">
          <div className="mb-8">
            <div className="skeleton h-9 w-48" />
            <div className="skeleton mt-2 h-5 w-80" />
          </div>

          <div className="skeleton  h-5 w-80" />
          <div className="hidden sm:block overflow-x-auto">
            <table className="table bg-base-200 rounded-box">
              <thead>
                <tr>
                  <th className="w-12">#</th>
                  <th>Player</th>
                  <th className="text-center">GP</th>
                  <th className="text-center">W</th>
                  <th className="text-center">L</th>
                  <th className="text-center">D</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    <td>
                      <div className="skeleton h-5 w-6" />
                    </td>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="skeleton h-10 w-10 rounded-full" />
                        <div className="skeleton h-5 w-32" />
                      </div>
                    </td>
                    <td className="text-center">
                      <div className="skeleton mx-auto h-5 w-8" />
                    </td>
                    <td className="text-center">
                      <div className="skeleton mx-auto h-5 w-8" />
                    </td>
                    <td className="text-center">
                      <div className="skeleton mx-auto h-5 w-8" />
                    </td>
                    <td className="text-center">
                      <div className="skeleton mx-auto h-5 w-8" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-3 sm:hidden">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card bg-base-200 shadow-sm">
                <div className="card-body flex-row items-center gap-4 p-4">
                  <div className="skeleton h-8 w-8 rounded" />
                  <div className="skeleton h-10 w-10 rounded-full" />
                  <div className="flex-1">
                    <div className="skeleton h-5 w-32" />
                    <div className="skeleton mt-1 h-4 w-40" />
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
