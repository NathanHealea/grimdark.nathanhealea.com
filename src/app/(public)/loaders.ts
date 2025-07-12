'use server';

import { createClient } from '@/lib/supabase/admin';

/**
 * Load members from the Supabase database.
 * This function fetches active members, including their armies, and orders them by last name, first name, and username.
 * 
 * @returns {Promise<Array>} A promise that resolves to an array of members with their armies.
 * @throws Will throw an error if there is an issue fetching members or if no members are found.
 */
export default async function loadMembers() {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from('users')
      .select('*, user_armies(*, armies(name))')
      .eq('status', 'active') // Only fetch active members
      .order('last_name', { ascending: false }) // Order by most recent
      .order('first_name', { ascending: true }) // Then by first name
      .order('username', { ascending: true }); // Then by username

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      throw new Error('No members found');
    }

    // Flatten army information to single array.
    for (const user of data) {
      /* @ts-ignore - user_armies is an array of objects, adding new property army */
      user.armies = user.user_armies.map((userArmy: any) => ({
        id: userArmy.id,
        name: userArmy.armies.name,
        imageUrl: userArmy.armies.image_url,
        isPrimary: userArmy.is_primary,
      }));
    }

    return data;
  } catch (error) {
    console.error('Error fetching members:', error);
    throw error;
  }
}


