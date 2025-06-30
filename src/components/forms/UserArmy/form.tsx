'use client'

import { createClient } from '@/lib/supabase/client'
import { Army } from '@/types/army.types'
import { useEffect, useRef, useState } from 'react'
import { UserArmy, UserArmyFormState } from './types'

interface UserArmyFormProps {
  userId: string | null
}

export default function UserArmyForm(props: UserArmyFormProps) {
  const { userId } = props

  // States to manage the army selection and search
  const [armies, setArmies] = useState<Army[]>([])
  const [armySearchValue, setArmySearchValue] = useState('')
  const [armySuggestions, setArmySuggestions] = useState<Army[]>([])
  const [isArmySearchFocused, setIsArmySearchFocused] = useState(false)
  const [isArmiesLoading, setIsArmiesLoading] = useState(false)
  const armySearchRef = useRef<HTMLInputElement>(null)
  const armySuggestionRef = useRef<HTMLDivElement>(null)

  // State to manage the user armies
  const [userArmies, setUserArmies] = useState<UserArmy[]>([])
  const [loadingUserAuthRoles, setLoadingUserAuthRoles] = useState<boolean>(true)

  const [state, setState] = useState<UserArmyFormState>({} as UserArmyFormState)

  const supabase = createClient()

  // Helper function to fetch user armies from the database
  const fetchUserArmies = async () => {
    try {
      setLoadingUserAuthRoles(true)
      if (!userId) {
        throw new Error('User ID is required to fetch armies.')
      }

      const { data, error } = await supabase
        .from('user_armies')
        .select('*, Armies(*)')
        .eq('user_id', userId)
        .order('is_primary', { ascending: false })
        .overrideTypes<UserArmy[]>()

      if (error) {
        throw error
      }

      if (!data || data.length === 0) {
        throw new Error(`No armies found for user id: ${userId}.`)
      }
      setUserArmies(data)
    } catch (error) {
      setUserArmies([])
    } finally {
      setLoadingUserAuthRoles(false)
    }
  }

  // Helper function to fetch all armies from the database
  // This includes both parent armies and their child armies
  const fetchArmies = async () => {
    try {
      const { data: parentArmies, error: parentArmiesErrors } = await supabase
        .from('armies')
        .select('*')
        .is('parent_army_id', null)
        .overrideTypes<Army[]>()

      if (parentArmiesErrors) {
        throw parentArmiesErrors
      }

      if (!parentArmies || parentArmies.length === 0) {
        throw new Error('No armies found.')
      }

      const { data: childArmies } = await supabase
        .from('armies')
        .select('*')
        .not('parent_army_id', 'is', null)
        .overrideTypes<Army[]>()

      // Add child armies to their parent armies

      if (parentArmies && childArmies)
        for (const army of parentArmies) {
          army.list = childArmies.filter((child) => child.parent_army_id === army.id)
        }

      setArmies(parentArmies)

      if (armySuggestions.length === 0) {
        setArmySuggestions(parentArmies)
      }
    } catch (error) {
      setArmies([])
    }
  }

  // Initialize user armies from the userId prop
  useEffect(() => {
    if (state.success === true) {
      fetchUserArmies()
      // Reset state after successful action
      setState({} as UserArmyFormState)
      setSelectedArmy('')
    }
  }, [state])

  // Fetch user armies when the component mounts
  useEffect(() => {
    if (userId) {
      fetchUserArmies()
    }

    if (!armies || armies.length === 0) {
      fetchArmies()
    }

    if (armySearchRef.current) {
      armySearchRef.current.focus()
    }
  }, [])

  // Effect to handle clicks outside the component to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        armySearchRef.current &&
        !armySearchRef.current.contains(event.target) &&
        armySuggestionRef.current &&
        !armySuggestionRef.current.contains(event.target)
      ) {
        setIsArmySearchFocused(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Handle the army search input change
  const handleArmySearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Search value changed:', event.target.value)
    setArmySearchValue(event.target.value)
  }

  // Handle the army search input focus
  const handleArmySearchFocus = () => {
    setIsArmySearchFocused(true)
  }

  // Handle the army search input blue
  const handleArmySearchBlur = (e) => {
    console.log('Search input blurred:', e.target, armySearchRef.current, armySuggestionRef.current, armySuggestionRef.current.contains(e.target))
    // Only blur if the related target is not a suggestion item
    // This allows clicking on suggestions without immediately hiding them
    if (!e.relatedTarget || !armySuggestionRef.current.contains(e.target)) {
      setIsArmySearchFocused(false)
    }
  }

  // Handle the army suggestion click
  const handleArmySuggestionClick = (army: Army) => () => {
    console.log('Selected army:', army)
    setArmySearchValue(army.name)
    setArmySuggestions([]) // Clear suggestions after selection
    setIsArmySearchFocused(false) // Hide suggestions
  }

  if (!userId) {
    return (
      <div className="flex flex-col gap-4">
        {/* Armies Input Wrapper */}
        <div className="flex flex-col gap-1 w-full">
          <label htmlFor="armies" className={`label ${state.errors?.armies ? 'text-error' : ''}`}>
            <span className="label-text">User Armies</span>
          </label>
          <div className="text-error">
            <p>User does not have an user Id. Armies cannot be assigned.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Armies Input Wrapper */}
      <div className="flex flex-col gap-1 w-full">
        <label htmlFor="army" className={`label ${state.errors?.armies ? 'text-error' : ''}`}>
          <span className="label-text">User Armies</span>
        </label>
        {/* Army Search */}
        <div className="relative">
          <input
            ref={armySearchRef}
            id="army"
            name="army"
            type="text"
            placeholder="Search armies..."
            className="input w-full"
            onChange={handleArmySearchChange}
            onFocus={handleArmySearchFocus}
            onBlur={handleArmySearchBlur}
            value={armySearchValue}
          />

          {/* Suggestions Dropdown */}
          {isArmySearchFocused && (armies.length > 0 || isArmiesLoading) && (
            <div
              ref={armySuggestionRef}
              className="absolute z-10 w-full mt-2 bg-base-200 rounded-lg shadow-lg max-h-60 overflow-y-auto custom-scrollbar"
              role="listbox"
            >
              {isArmiesLoading ? (
                <div className="flex items-center justify-center p-4 ">
                  <span className="loading loading-spinner loading-xs mr-2"></span>
                  <span>Loading...</span>
                </div>
              ) : (
                <ul className="list">
                  {armySuggestions.map((army) => (
                    <li
                      key={army.id}
                      className="list-row cursor-pointer"
                      onClick={handleArmySuggestionClick(army)}
                      role="option"
                      aria-selected={army.name === armySearchValue}
                    >
                      {army.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
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
        {loadingUserAuthRoles && (
          <li className="list-row">
            <p className="text-sm text-gray-500">
              Loading user armies <span className="loading loading-dots loading-xs" />
            </p>
          </li>
        )}
        {userArmies.length === 0 && !loadingUserAuthRoles && (
          <li className="list-row">
            <p className="text-sm text-gray-500">No user armies found. Please add a army using the form above.</p>
          </li>
        )}

        {userArmies.map((army, index) => (
          <li className="list-row" key={index}>
            <div>
              <p className="capitalize">{army.army}</p>
            </div>
            <div className="flex-1"></div>
            <button
              type="button"
              className="btn btn-error btn-square"
              // onClick={handleRemoveRole(army.army)}
            >
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
        ))}
      </ul>
    </div>
  )
}
