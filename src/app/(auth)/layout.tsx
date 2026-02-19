export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className="flex-1 w-full flex items-center justify-center px-4 py-24">{children}</div>
}
