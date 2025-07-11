'use client'

import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { LeageMember, LeageMemberArmy } from './types'

export default function Members() {
  const [loading, setLoading] = useState(true)
  const [members, setMembers] = useState<Array<LeageMember>>([])

  const supabase = createClient()

  const fetchMembers = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.from('users').select('*, user_armies(*, armies(name))')

      if (error) {
        throw error
      }
      console.log('Fetched members data:', data)

      if (!data || data.length === 0) {
        throw new Error('No members found')
      }

      // flatten army information to single array.
      for (const user of data) {
        user.armies = user.user_armies.map((userArmy: any) => ({
          id: userArmy.id,
          name: userArmy.armies.name,
          imageUrl: userArmy.armies.image_url,
          isPrimary: userArmy.is_primary,
        }))
      }

      setMembers(data)
      console.log('Fetched members:', data)
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error fetching members:', error.message)
      } else if (typeof error === 'string') {
        console.error('Error fetching members:', error)
      } else {
        console.error('An unexpected error occurred while fetching members:', error)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMembers()
  }, [])

  // Do not dispaly if loading or no members
  if (loading || members.length === 0) {
    return null
  }

  return (
    <section className="section section-md">
      <div className="section-content">
        <div className="content flex flex-col gap-4">
          <div className="section-header text-center">
            <h2 className="text-3xl font-bold">League Members</h2>
            <p className="text-lg">Meet our dedicated players!</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-16">
            {members &&
              members.map((member: LeageMember) => (
                <Link href="/" key={member.id} className="card bg-base-200 shadow-xl">
                  <div className="card-body gap-4">
                    <h3 className="card-title">
                      {member.first_name}
                      {member.last_name && ` ${member.last_name}`}
                    </h3>
                    <p className="text-sm text-gray-500 grow-0">{member.username}</p>
                    {member.profile_picture_url && (
                      <Image
                        width={192}
                        height={240}
                        src={member.profile_picture_url}
                        alt={`${member.first_name} ${member.last_name}'s profile picture`}
                        className="rounded-lg h-60 w-48 object-cover"
                      />
                    )}
                    {!member.profile_picture_url && (
                      <div className="h-60 w-48 bg-base-300 rounded-lg flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="size-10"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                          />
                        </svg>
                      </div>
                    )}

                    <div className="flex flex-col gap-2">
                      <p className="text-sm text-gray-500">Armies:</p>
                      <ul className="list pl-2 text-sm gap-2">
                        {member.armies.map((army: LeageMemberArmy, index: number) => (
                          <li key={index}>{army.name}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </div>
    </section>
  )
}
