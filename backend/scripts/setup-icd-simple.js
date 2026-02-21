require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

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

async function insertDataDirectly() {
  console.log('Reading and parsing CSV file...');
  
  const csvPath = path.join(__dirname, '../../icd-10-cm-2022-1000.csv');
  
  if (!fs.existsSync(csvPath)) {
    console.error('CSV file not found at:', csvPath);
    return;
  }
  
  const csvContent = fs.readFileSync(csvPath, 'utf8');
  const lines = csvContent.split('\n');
  
  // Skip header and empty lines
  const dataLines = lines.slice(1).filter(line => line.trim());
  
  console.log(`Found ${dataLines.length} ICD codes to insert`);
  
  // Process in smaller batches
  const batchSize = 100;
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < dataLines.length; i += batchSize) {
    const batch = dataLines.slice(i, i + batchSize);
    const batchData = [];
    
    for (const line of batch) {
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
          
          batchData.push(record);
        }
      } catch (error) {
        console.error(`Error parsing line: ${line.substring(0, 50)}...`);
        errorCount++;
      }
    }
    
    if (batchData.length > 0) {
      try {
        const { error } = await supabase
          .from('icd_codes')
          .insert(batchData);
        
        if (error) {
          console.error(`Error inserting batch ${Math.floor(i/batchSize) + 1}:`, error.message);
          errorCount += batchData.length;
        } else {
          successCount += batchData.length;
          console.log(`✓ Inserted batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(dataLines.length/batchSize)} (${successCount} total records)`);
        }
      } catch (error) {
        console.error(`Error inserting batch ${Math.floor(i/batchSize) + 1}:`, error.message);
        errorCount += batchData.length;
      }
    }
    
    // Small delay to avoid overwhelming the database
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  
  console.log(`\n📊 Insertion Summary:`);
  console.log(`✅ Successfully inserted: ${successCount} records`);
  console.log(`❌ Errors: ${errorCount} records`);
  
  return successCount > 0;
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

async function main() {
  console.log('🏥 ICD-10 Healthcare Data Setup');
  console.log('================================');
  
  try {
    // Generate SQL file for manual execution
    const sqlContent = generateCreateTableSQL();
    const sqlPath = path.join(__dirname, 'create-icd-table.sql');
    fs.writeFileSync(sqlPath, sqlContent);
    console.log(`📄 SQL file created: ${sqlPath}`);
    
    console.log('\n🔗 Connecting to Supabase...');
    console.log(`URL: ${supabaseUrl}`);
    
    // Test connection by trying to create the table directly
    console.log('\n🏗️  Creating ICD codes table...');
    
    // Try to insert data directly (this will create the table if it doesn't exist)
    const success = await insertDataDirectly();
    
    if (success) {
      // Verify the data
      const { count, error } = await supabase
        .from('icd_codes')
        .select('*', { count: 'exact', head: true });
      
      if (!error) {
        console.log(`\n✅ Setup completed! Total records in database: ${count}`);
        
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
      }
    } else {
      console.log('\n❌ Setup failed. Please check the errors above.');
      console.log('\n💡 Manual setup option:');
      console.log('1. Go to your Supabase dashboard');
      console.log('2. Open the SQL editor');
      console.log(`3. Execute the SQL from: ${sqlPath}`);
      console.log('4. Run this script again to insert data');
    }
    
  } catch (error) {
    console.error('\n❌ Error during setup:', error.message);
    console.log('\n💡 Troubleshooting:');
    console.log('1. Check your Supabase credentials in .env file');
    console.log('2. Ensure the CSV file exists');
    console.log('3. Check your internet connection');
  }
}

// Run the setup
main();