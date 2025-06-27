import createUserFormAction from './action'
import CreateUserForm from './form'

interface CreateUserPageProps {}

export default function CreateUserPage(props: CreateUserPageProps) {
  return (
    <main className="flex-1 flex min-h-screen flex-col gap-4 p-8 -mt-20 pt-28">
      <section className="container flex flex-col items-center justify-center gap-4">
        <div className="card bg-base-200 w-full max-w-lg shrink-0 shadow-2xl p-8">
          <h1 className="card-title text-3xl font-bold justify-center">Create New User</h1>
          <div className="card-body w-full max-w-xl">
            <CreateUserForm
              action={createUserFormAction}
            />
          </div>
        </div>
      </section>
    </main>
  )
}
