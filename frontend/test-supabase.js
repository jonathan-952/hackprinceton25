// Test Supabase connection
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  console.log('\n📝 Please create frontend/.env.local with:')
  console.log('   NEXT_PUBLIC_SUPABASE_URL=<your-url>')
  console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-key>')
  console.log('\n💡 Check API_KEYS_LOCAL.txt for your actual keys\n')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  console.log('🔍 Testing Supabase connection...\n')

  try {
    // Test 1: Check if we can connect
    console.log('1. Testing basic connection...')
    const { data, error } = await supabase.from('claims').select('count')

    if (error) {
      console.log('   ⚠️  Table might not exist yet:', error.message)
      console.log('   📝 You need to run the database schema in Supabase SQL Editor')
      console.log('   📄 Schema file: /home/user/hackprinceton25/database-schema.sql\n')
      return false
    }

    console.log('   ✅ Connection successful!\n')

    // Test 2: Try to fetch demo claim
    console.log('2. Looking for demo claim (C-DEMO-2025)...')
    const { data: demoData, error: demoError } = await supabase
      .from('claims')
      .select('*')
      .eq('claim_id', 'C-DEMO-2025')
      .single()

    if (demoError) {
      console.log('   ⚠️  Demo claim not found')
      console.log('   💡 Run the SQL schema to create it\n')
    } else {
      console.log('   ✅ Demo claim found!')
      console.log('   📋 Claim ID:', demoData.claim_id)
      console.log('   📍 Status:', demoData.status)
      console.log('   📅 Created:', new Date(demoData.created_at).toLocaleDateString())
      console.log()
    }

    // Test 3: List all claims
    console.log('3. Listing all claims...')
    const { data: allClaims, error: listError } = await supabase
      .from('claims')
      .select('claim_id, status, created_at')
      .order('created_at', { ascending: false })

    if (listError) {
      console.log('   ❌ Error:', listError.message)
    } else {
      console.log(`   ✅ Found ${allClaims.length} claim(s)`)
      allClaims.forEach(claim => {
        console.log(`      • ${claim.claim_id} (${claim.status})`)
      })
      console.log()
    }

    console.log('✅ All tests passed! Your Supabase connection is working!\n')
    return true

  } catch (err) {
    console.log('❌ Error testing connection:', err.message)
    console.log('\n🔧 Troubleshooting:')
    console.log('   1. Make sure you ran the SQL schema in Supabase SQL Editor')
    console.log('   2. Check that your API keys in .env.local are correct')
    console.log('   3. Verify your Supabase project is active\n')
    return false
  }
}

testConnection()
