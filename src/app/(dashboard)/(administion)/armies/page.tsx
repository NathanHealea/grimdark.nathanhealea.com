import { createClient } from '@/lib/supabase/server'
import { Army } from '@/types/army.types';
import Link from 'next/link'
import { Fragment } from 'react';

export default async function ArmiesPage({
  searchParams,
}: {
  searchParams: Promise<{ message: string; status: string }>
}) {
  const { message: armyActionMessage, status: armyActionStatus } = await searchParams

  const supabase = await createClient()

  const { data: parentArmies, error: parentArmiesErrors } = await supabase
    .from('armies')
    .select('*')
    .is('parent_army_id', null).overrideTypes<Army[]>()
  const { data: childArmies } = await supabase.from('armies').select('*').not('parent_army_id', 'is', null).overrideTypes<Army[]>()

  // Add child armies to their parent armies

  if(parentArmies && childArmies)
  for(const army of parentArmies) {
    army.list = childArmies.filter(child => child.parent_army_id === army.id)
  }

  

  return (
    <main className="flex-1 flex min-h-screen flex-col gap-4 p-8 -mt-20 pt-28 ">
      {/* Army Action Error  */}
      {armyActionStatus === 'error' && (
        <div className="relative top-0 right-0 p-4">
          <div role="alert" className="alert alert-error">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 shrink-0 stroke-current"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{armyActionMessage ? armyActionMessage : 'Unknown error occurred'}</span>
          </div>
        </div>
      )}

      {/* Army Action Success */}
      {armyActionStatus === 'success' && (
        <div className="relative top-0 right-0 p-4">
          <div role="alert" className="alert alert-success">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 shrink-0 stroke-current"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{armyActionMessage ? armyActionMessage : 'Action was completed successfully'}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full">
        {/* Header - Content */}
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">Army Management</h1>
          <p className="text-sm">Manage your armys, roles, and permissions.</p>
          <div className="breadcrumbs text-sm">
            <ul>
              <li>
                <Link href="/dashboard">Dashboard</Link>
              </li>
              <li>Armies</li>
            </ul>
          </div>
        </div>

        {/* Header - Actions */}
        <div className="flex md:justify-end gap-2">
          <Link href="/armies/create" className="btn btn-primary">
            Create Army
          </Link>
        </div>
      </header>

      <section>
        <div className="container mx-auto">
          <div className="card bg-base-100 shadow-md">
            <div className="card-body">
              <h2 className="card-title">Armys</h2>
              <p className="text-sm">List of all armys in the system.</p>

              {parentArmiesErrors && <p className="text-red-500">Error loading armys: {parentArmiesErrors.message}</p>}
              {parentArmies && parentArmies.length === 0 && <p className="text-gray-500">No armys found.</p>}

              {parentArmies && parentArmies.length !== 0 && (
                <ul className="list">
                  {parentArmies.map((army) => (
                    <Fragment key={army.id}>
                      {/* Parent Army */}
                      <li  className="list-row">
                        {/* Army Details */}
                        <div>
                          <h3 className="text-lg font-semibold">{army.name}</h3>
                          <p className="text-sm text-gray-500">{army.description}</p>
                        </div>
                        <div className="flex-1"></div>
                        {/* Army Actions */}
                        <div className="flex gap-2">
                          <Link href={`/armies/edit/${army.id}`} className="btn btn-accent btn-sm">
                            Edit
                          </Link>
                          <Link href={`/armies/delete/${army.id}`} className="btn btn-error btn-sm">
                            Delete
                          </Link>
                        </div>
                      </li>
                      {/* Child Armies */}
                      {army.list && army.list.length > 0 && (
                        <ul className="list list-inside list-disc pl-4">
                          {army.list.map((childArmy) => (
                            <li key={childArmy.id} className="list-row">
                              <div>
                                <h4 className="text-md font-semibold">{childArmy.name}</h4>
                                <p className="text-sm text-gray-500">{childArmy.description}</p>
                              </div>
                              <div className="flex-1"></div>
                              <div className="flex gap-2">
                                <Link href={`/armies/edit/${childArmy.id}`} className="btn btn-accent btn-sm">
                                  Edit
                                </Link>
                                <Link href={`/armies/delete/${childArmy.id}`} className="btn btn-error btn-sm">
                                  Delete
                                </Link>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </Fragment>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
