require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

console.log('Testing Supabase Connection...\n');
console.log('URL:', supabaseUrl);
console.log('Key length:', supabaseKey?.length);
console.log('Key starts with:', supabaseKey?.substring(0, 10));

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    // Test auth
    const { data, error } = await supabase.auth.signUp({
      email: 'test@example.com',
      password: 'testpassword123'
    });
    
    if (error) {
      console.log('\n❌ Supabase Error:', error.message);
      console.log('\n⚠️  Your Supabase keys are INCORRECT!');
      console.log('Please check FIX-KEYS.md for instructions.\n');
    } else {
      console.log('\n✅ Supabase connection working!');
    }
  } catch (err) {
    console.log('\n❌ Connection Error:', err.message);
    console.log('\n⚠️  Check your Supabase credentials in server/.env\n');
  }
}

testConnection();
