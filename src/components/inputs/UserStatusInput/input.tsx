'use client'
import { StatusEnum } from '@/enums/status.enum'
import { Error } from '@/types/form.types'
import { Status } from '@/types/status.types'
import { useEffect, useState } from 'react'

export interface UserStatusInputProps {
  initialStatus: Status
  errors?: Error
}

export default function UserStatusInput(props: UserStatusInputProps) {
  const { initialStatus, errors } = props

  const [value, setValue] = useState<Status>(initialStatus)

  useEffect(() => {
    console.log('UserStatusInput useEffect', initialStatus)
    setValue(initialStatus)
  }, [initialStatus])

  // Handle change event for the select input
  // This updates the state with the selected status
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = event.target.value as Status
    setValue(newValue)
  }

  return (
    <div className="flex flex-col gap-1 w-full">
      <label htmlFor="status" className={`label ${errors ? 'text-error' : ''}`}>
        <span className="label-text">Status</span>
      </label>
      <select
        id="status"
        name="status"
        className={`select select-bordered w-full ${errors ? 'select-error' : ''}`}
        onChange={handleChange}
        value={value}
      >
        <option value="" disabled>
          Select Status
        </option>
        {Object.keys(StatusEnum).map((statusKey) => (
          <option
            key={StatusEnum[statusKey]}
            value={StatusEnum[statusKey]}
          >
            {statusKey}
          </option>
        ))}
      </select>
    </div>
  )
}
