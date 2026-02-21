require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

function generateCreateTableSQL() {
  // Generate column definitions for V1-V1000
  const vectorColumns = Array.from({length: 1000}, (_, i) => `v${i+1} FLOAT`).join(',\n  ');
  
  return `
-- Drop existing table if it exists
DROP TABLE IF EXISTS icd_codes CASCADE;

-- Create ICD codes table
CREATE TABLE icd_codes (
  id SERIAL PRIMARY KEY,
  code VARCHAR(10) NOT NULL UNIQUE,
  description TEXT NOT NULL,
  ${vectorColumns},
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_icd_codes_code ON icd_codes(code);
CREATE INDEX idx_icd_codes_description ON icd_codes USING gin(to_tsvector('english', description));

-- Enable Row Level Security (optional)
ALTER TABLE icd_codes ENABLE ROW LEVEL SECURITY;

-- Create policy to allow read access (adjust as needed)
CREATE POLICY "Allow read access to icd_codes" ON icd_codes FOR SELECT USING (true);
`;
}

async function processCSVInChunks() {
  console.log('📖 Processing CSV file in chunks...');
  
  const csvPath = path.join(__dirname, '../../icd-10-cm-2022-1000.csv');
  
  if (!fs.existsSync(csvPath)) {
    console.error('❌ CSV file not found at:', csvPath);
    return false;
  }
  
  const fileStream = fs.createReadStream(csvPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  
  let lineNumber = 0;
  let batch = [];
  const batchSize = 50;
  let successCount = 0;
  let errorCount = 0;
  let isFirstLine = true;
  
  for await (const line of rl) {
    lineNumber++;
    
    // Skip header line
    if (isFirstLine) {
      isFirstLine = false;
      continue;
    }
    
    // Skip empty lines
    if (!line.trim()) continue;
    
    try {
      const values = parseCSVLine(line);
      
      if (values.length >= 1002) {
        const record = {
          code: values[0],
          description: values[1].replace(/^"|"$/g, ''),
        };
        
        // Add vector values V1-V1000
        for (let j = 2; j < 1002; j++) {
          record[`v${j-1}`] = parseFloat(values[j]) || 0;
        }
        
        batch.push(record);
        
        // Process batch when it reaches the desired size
        if (batch.length >= batchSize) {
          const result = await insertBatch(batch, Math.floor(successCount / batchSize) + 1);
          if (result.success) {
            successCount += result.count;
          } else {
            errorCount += result.count;
          }
          batch = [];
        }
      }
    } catch (error) {
      console.error(`❌ Error parsing line ${lineNumber}: ${error.message}`);
      errorCount++;
    }
  }
  
  // Process remaining records in the last batch
  if (batch.length > 0) {
    const result = await insertBatch(batch, Math.floor(successCount / batchSize) + 1);
    if (result.success) {
      successCount += result.count;
    } else {
      errorCount += result.count;
    }
  }
  
  console.log(`\n📊 Processing Summary:`);
  console.log(`✅ Successfully inserted: ${successCount} records`);
  console.log(`❌ Errors: ${errorCount} records`);
  console.log(`📄 Total lines processed: ${lineNumber}`);
  
  return successCount > 0;
}

async function insertBatch(batchData, batchNumber) {
  try {
    const { error } = await supabase
      .from('icd_codes')
      .insert(batchData);
    
    if (error) {
      console.error(`❌ Error inserting batch ${batchNumber}:`, error.message);
      return { success: false, count: batchData.length };
    } else {
      console.log(`✅ Inserted batch ${batchNumber} (${batchData.length} records)`);
      return { success: true, count: batchData.length };
    }
  } catch (error) {
    console.error(`❌ Error inserting batch ${batchNumber}:`, error.message);
    return { success: false, count: batchData.length };
  }
}

function parseCSVLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
      current += char;
    } else if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  if (current) {
    values.push(current);
  }
  
  return values;
}

async function createTableFirst() {
  console.log('🏗️  Creating ICD codes table...');
  
  try {
    // First, let's try to create a simple test to see if we can connect
    const { data, error } = await supabase
      .from('icd_codes')
      .select('count')
      .limit(1);
    
    if (!error) {
      console.log('✅ Table already exists, checking if we should recreate...');
      
      const { count } = await supabase
        .from('icd_codes')
        .select('*', { count: 'exact', head: true });
      
      if (count > 0) {
        console.log(`📊 Found ${count} existing records`);
        return true;
      }
    }
    
    // If we get here, either table doesn't exist or is empty
    console.log('📝 Table needs to be created. Please run the SQL manually first.');
    return false;
    
  } catch (error) {
    console.log('📝 Table needs to be created. Please run the SQL manually first.');
    return false;
  }
}

async function main() {
  console.log('🏥 ICD-10 Healthcare Data Setup (Optimized)');
  console.log('===========================================');
  
  try {
    // Generate SQL file for manual execution
    const sqlContent = generateCreateTableSQL();
    const sqlPath = path.join(__dirname, 'create-icd-table.sql');
    fs.writeFileSync(sqlPath, sqlContent);
    console.log(`📄 SQL file created: ${sqlPath}`);
    
    console.log('\n🔗 Connecting to Supabase...');
    console.log(`URL: ${supabaseUrl}`);
    
    // Check if table exists
    const tableReady = await createTableFirst();
    
    if (!tableReady) {
      console.log('\n⚠️  Please create the table first:');
      console.log('1. Go to your Supabase dashboard');
      console.log('2. Open the SQL editor');
      console.log(`3. Execute the SQL from: ${sqlPath}`);
      console.log('4. Run this script again');
      return;
    }
    
    // Process CSV data
    const success = await processCSVInChunks();
    
    if (success) {
      // Verify the data
      const { count, error } = await supabase
        .from('icd_codes')
        .select('*', { count: 'exact', head: true });
      
      if (!error) {
        console.log(`\n🎉 Setup completed! Total records in database: ${count}`);
        
        // Show a few sample records
        const { data: samples } = await supabase
          .from('icd_codes')
          .select('code, description')
          .limit(5);
        
        if (samples && samples.length > 0) {
          console.log('\n📋 Sample ICD codes:');
          samples.forEach(record => {
            console.log(`  ${record.code}: ${record.description}`);
          });
        }
        
        console.log('\n✅ ICD-10 data is now ready for healthcare applications!');
      }
    }
    
  } catch (error) {
    console.error('\n❌ Error during setup:', error.message);
    console.log('\n💡 Troubleshooting:');
    console.log('1. Check your Supabase credentials in .env file');
    console.log('2. Ensure the CSV file exists');
    console.log('3. Check your internet connection');
    console.log('4. Make sure the table is created first');
  }
}

// Run the setup
main();