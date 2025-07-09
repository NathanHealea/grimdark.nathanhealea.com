'use client'
import { createClient } from '@/lib/supabase/client'
import { Army } from '@/types/army.types'
import { Fragment, useCallback, useEffect, useState } from 'react'
import { addUserArmyAction, removeUserArmyAction } from './actions'
import { UserArmy, UserArmyFormState } from './types'

type ArmyOption = Omit<Army, 'list'> & {
  isAssociated: boolean
  list?: ArmyOption[]
}
type ArmyOptions = ArmyOption[]

interface UserArmyProps {
  userId: number | null
}

export default function UserArmyForm(props: UserArmyProps) {
  const { userId } = props

  const [armies, setArmies] = useState<Army[]>([])
  const [armiesFlatten, setArmiesFlatten] = useState<Army[]>([])
  const [armyOptions, setArmyOptions] = useState<ArmyOptions>([])
  const [loadingArmies, setLoadingArmies] = useState<boolean>(true)

  const [selectedArmy, setSelectedArmy] = useState<string>('')
  const [userArmies, setUserArmies] = useState<UserArmy[]>([])
  const [loadingUserArmies, setLoadingUserArmies] = useState<boolean>(true)

  const [state, setState] = useState<UserArmyFormState>({} as UserArmyFormState)

  const supabase = createClient()

  // Helper function to fetch user armies from the database
  const fetchUserArmies = async () => {
    try {
      setLoadingUserArmies(true)
      if (!userId) {
        throw new Error('User ID is required to fetch armies.')
      }

      const { data, error } = await supabase
        .from('user_armies')
        .select('*')
        .eq('user_id', userId)
        .order('army_id', { ascending: false })
        .overrideTypes<UserArmy[]>()

      // throw the error from the database query
      if (error) {
        throw error
      }

      // throw an error if no armies are found
      if (!data || data.length === 0) {
        throw new Error(`No armies found for user id: ${userId}.`)
      }

      setUserArmies(data)
    } catch (error) {
      setUserArmies([])
    } finally {
      setLoadingUserArmies(false)
    }
  }

  // Helper function to fetch all armies from the database
  // This includes both parent armies and child armies.
  const fetchArmies = async () => {
    setLoadingArmies(true)
    try {
      const { data: parentArmies, error: parentArmiesErrors } = await supabase
        .from('armies')
        .select('*')
        .is('parent_army_id', null)
        .overrideTypes<Army[]>()
      const { data: childArmies } = await supabase
        .from('armies')
        .select('*')
        .not('parent_army_id', 'is', null)
        .overrideTypes<Army[]>()

      // Add child armies to their parent armies

      if (parentArmies && childArmies) {
        // Constrtuct armies and Flatten armies lists
        let flattenedArmies: Army[] = []
        for (const army of parentArmies) {
          army.list = childArmies.filter((child) => child.parent_army_id === army.id)

          flattenedArmies.push(army)
          flattenedArmies = flattenedArmies.concat(army.list || [])
        }
        setArmiesFlatten(flattenedArmies || [])
      }
      setArmies(parentArmies || [])
    } catch (error) {
      console.error('Error fetching armies:', error)
      setArmies([])
    } finally {
      setLoadingArmies(false)
    }
  }

  const getArmyOptions = useCallback(() => {
    const options: ArmyOptions = armies.map((army) => {
      // Get the child armies of the current army.
      let childOptions = [] as ArmyOptions
      if (army.list && army.list.length > 0) {
        childOptions = army.list.map(
          (child) =>
            ({
              ...child,
              isAssociated: userArmies.some((userArmy) => userArmy.army_id === child.id),
            }) as ArmyOption
        )
      }

      return {
        ...army,
        isAssociated: userArmies.some((userArmy) => userArmy.army_id === army.id),
        list: childOptions,
      }
    })

    setArmyOptions(options)
  }, [armies, userArmies])

  // Initializes the component state and fetches user armies and all armies when the component mounts.
  useEffect(() => {
    // Fetch user armies when the component mounts or userId changes
    fetchUserArmies()
    // Fetch all armies when the component mounts
    fetchArmies()
  }, [])

  // Initialize user armies from the userId prop
  useEffect(() => {
    if (state.success == true) {
      fetchUserArmies()
      // Reset state after successful action
      setState({} as UserArmyFormState)
      setSelectedArmy('')
    }
  }, [state])

  // Update the army options whenever the armies or userArmies change
  useEffect(() => {
    if (armies.length > 0) {
      getArmyOptions()
    }
  }, [armies.length, userArmies.length, getArmyOptions])

  // useEffect(() => {
  //   // Reset the selected army when the userArmies change
  //   if (userArmies.length > 0) {
  //     setSelectedArmy('')
  //   }
  // }, [selectedArmy])

  // Handles army selection change.
  const handleUserArmyChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedArmy(event.target.value)
  }

  // Handles adding a new army to the user.
  const handleAddUserArmy = async () => {
    const formData = new FormData()
    formData.append('userId', userId?.toString() || '')
    formData.append('armyId', selectedArmy)

    const newState = await addUserArmyAction(state, formData)
    setState(newState)
    setSelectedArmy('')
  }

  // Handles removing a army from the user.
  const handleRemoveUserArmy = (armyID: number) => async () => {
    const formData = new FormData()
    formData.append('userId', userId?.toString() || '')
    formData.append('armyId', armyID.toString())

    const newState = await removeUserArmyAction(state, formData)
    setState(newState)
    setSelectedArmy('')
  }

  // Returns error message if no userId is provided.
  if (!userId || isNaN(Number(userId))) {
    return (
      <div className="flex flex-col gap-4">
        {/* Armies Input Wrapper */}
        <div className="flex flex-col gap-1 w-full">
          <label htmlFor="armies" className={`label ${state.errors?.armies ? 'text-error' : ''}`}>
            <span className="label-text">User Armies</span>
          </label>
          <div className="text-error">
            <p>User does not have an auntenticed user Id. Armies cannot be assigned.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Armies Input Wrapper */}
      <div className="flex flex-col gap-1 w-full">
        <label htmlFor="armies" className={`label ${state.errors?.armies ? 'text-error' : ''}`}>
          <span className="label-text">User Armies</span>
        </label>
        {/* UserArmy Search */}
        <div className="flex gap-2">
          <select
            id="armies"
            name="army"
            className={`select select-bordered w-full ${state.errors?.armies ? 'select-error' : ''}`}
            value={selectedArmy}
            onChange={handleUserArmyChange}
          >
            <option value="" disabled>
              Select an army
            </option>
            {(loadingArmies || loadingUserArmies) && (
              <option value="" disabled>
                Loading armies...
              </option>
            )}
            {armyOptions.length === 0 && (
              <option value="" disabled>
                Armies could not be loaded... Please try again later.
              </option>
            )}
            {armyOptions.length > 0 &&
              armyOptions.map((army) => (
                <Fragment key={army.id}>
                  {/* Only show parent armies and disable non-primary armies */}
                  <option key={army.id} value={army.name} disabled={army.name !== 'Space Marines' || army.isAssociated}>
                    {army.name}
                  </option>
                  {army.list &&
                    army.list.map((childArmy) => (
                      <option key={childArmy.id} value={childArmy.id} disabled={childArmy.isAssociated}>
                        &nbsp;&nbsp;&nbsp;{childArmy.name}
                      </option>
                    ))}
                </Fragment>
              ))}
          </select>
          <button type="button" className="btn btn-primary" onClick={handleAddUserArmy}>
            Add Army
          </button>
        </div>
        {/* Armies Errors */}
        {state.errors?.form && (
          <ul className="list text-error">
            {state.errors.form.map((error, index) => (
              <li className="list-row" key={index}>
                {error}
              </li>
            ))}
          </ul>
        )}
        {state.errors?.armies && (
          <ul className="list text-error">
            {state.errors.armies.map((error, index) => (
              <li className="list-row" key={index}>
                {error}
              </li>
            ))}
          </ul>
        )}
        {/* Armies List */}
        <ul className="list">
          {loadingUserArmies && (
            <li className="list-row">
              <p className="text-sm text-gray-500">
                Loading user armies <span className="loading loading-dots loading-xs" />
              </p>
            </li>
          )}
          {userArmies.length === 0 && !loadingUserArmies && (
            <li className="list-row">
              <p className="text-sm text-gray-500">No user armies found. Please add a army using the form above.</p>
            </li>
          )}

          {userArmies.map((army, index) => {
            const armyName = armiesFlatten.find((a) => a.id === army.army_id)?.name || null

            if (!armyName) {
              return null
            }

            return (
              <li className="list-row" key={index}>
                <div>
                  <p className="capitalize">{armyName}</p>
                </div>
                <div className="flex-1"></div>
                <button type="button" className="btn btn-error btn-square" onClick={handleRemoveUserArmy(army.army_id)}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                    />
                  </svg>
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
