// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.2'
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'

Deno.serve(async (req) => {
  console.log(`Function "create-profile-directory" up and running!`)

  console.log(`Received request: ${req.method} ${req.url}`)
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  try {
    const { userId } = await req.json()

    if (!userId) {
      return new Response('Missing user ID in payload', { status: 400 })
    }

    // Initialize Supabase client for Storage
    // Use the service role key for direct access to storage,
    // or configure RLS policies appropriately for bucket access.
    // For this use case (creating a directory via a backend function),
    // using the service role key is common.
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', // Ensure this is set in your Supabase project secrets
    )

    const bucketName = 'public-profile-pictures'
    const directoryPath = `${userId}/.keep` // Upload a dummy file to create the "directory"

    // Upload an empty blob to create the path
    const { data, error } = await supabase.storage.from(bucketName).upload(directoryPath, new Blob(['']), {
      cacheControl: '3600',
      upsert: false, // Do not overwrite if it already exists
    })

    if (error) {
      // If the error is due to the file already existing, it's fine.
      // Otherwise, log the error.
      if (error.message.includes('The resource already exists')) {
        console.log(`Directory for user ${userId} already exists or .keep file already uploaded.`)
        return new Response(`Directory for user ${userId} already exists.`, { status: 200 })
      }
      console.error('Error uploading dummy file:', error)
      return new Response(`Error creating directory: ${error.message}`, { status: 500 })
    }

    console.log(`Directory for user ${userId} created successfully in bucket ${bucketName}.`)
    return new Response(`Directory for user ${userId} created.`, { status: 200 })
  } catch (error) {
    console.error('General error in Edge Function:', error)
    return new Response(`Internal Server Error: ${error.message}`, { status: 500 })
  }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/create-profile-directory' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
