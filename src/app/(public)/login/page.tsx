import DiscordButton from '@/components/buttons/DiscordButton/DiscordButton'
import LoginFormAction from './action'
import LoginForm from './form'

interface LoginPageProps {}

export default function LoginPage(props: LoginPageProps) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center -mt-20 pt-20">
      <section className="container flex flex-col items-center justify-center gap-4">
        <div className="card bg-base-200 w-full max-w-lg shrink-0 shadow-2xl p-8">
          <h1 className="card-title text-3xl font-bold justify-center">Login</h1>
          <div className="card-body w-full max-w-xl">
            <LoginForm
              action={LoginFormAction}
              displayAbove={
                <>
                  <DiscordButton />
                </>
              }
            />
          </div>
        </div>
      </section>
    </main>
  )
}
