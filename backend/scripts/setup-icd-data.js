require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function createICDTable() {
  console.log('Creating ICD-10 table...');
  
  try {
    // Drop existing table if it exists
    const { error: dropError } = await supabase.rpc('exec_sql', { 
      sql: 'DROP TABLE IF EXISTS icd_codes CASCADE;' 
    });
    
    // Generate column definitions for V1-V1000
    const vectorColumns = Array.from({length: 1000}, (_, i) => `v${i+1} FLOAT`).join(', ');
    
    const createTableSQL = `
      CREATE TABLE icd_codes (
        id SERIAL PRIMARY KEY,
        code VARCHAR(10) NOT NULL UNIQUE,
        description TEXT NOT NULL,
        ${vectorColumns},
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      CREATE INDEX idx_icd_codes_code ON icd_codes(code);
      CREATE INDEX idx_icd_codes_description ON icd_codes USING gin(to_tsvector('english', description));
    `;
    
    const { error: createError } = await supabase.rpc('exec_sql', { sql: createTableSQL });
    
    if (createError) {
      console.error('Error creating table:', createError);
      return false;
    }
    
    console.log('ICD-10 table created successfully!');
    return true;
  } catch (error) {
    console.error('Error in createICDTable:', error);
    return false;
  }
}

async function parseAndInsertCSV() {
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
  
  // Process in smaller batches to avoid memory issues
  const batchSize = 50;
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < dataLines.length; i += batchSize) {
    const batch = dataLines.slice(i, i + batchSize);
    const batchData = [];
    
    for (const line of batch) {
      try {
        // Parse CSV line (handling quoted descriptions)
        const values = parseCSVLine(line);
        
        if (values.length >= 1002) {
          const record = {
            code: values[0],
            description: values[1].replace(/^"|"$/g, ''), // Remove quotes
          };
          
          // Add vector values V1-V1000
          for (let j = 2; j < 1002; j++) {
            record[`v${j-1}`] = parseFloat(values[j]) || 0;
          }
          
          batchData.push(record);
        }
      } catch (error) {
        console.error(`Error parsing line: ${line.substring(0, 50)}...`, error.message);
        errorCount++;
      }
    }
    
    if (batchData.length > 0) {
      try {
        const { error } = await supabase
          .from('icd_codes')
          .insert(batchData);
        
        if (error) {
          console.error(`Error inserting batch ${Math.floor(i/batchSize) + 1}:`, error);
          errorCount += batchData.length;
        } else {
          successCount += batchData.length;
          console.log(`Inserted batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(dataLines.length/batchSize)} (${successCount} total records)`);
        }
      } catch (error) {
        console.error(`Error inserting batch ${Math.floor(i/batchSize) + 1}:`, error);
        errorCount += batchData.length;
      }
    }
    
    // Small delay to avoid overwhelming the database
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log(`\nInsertion complete!`);
  console.log(`Successfully inserted: ${successCount} records`);
  console.log(`Errors: ${errorCount} records`);
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
  
  // Add the last value
  if (current) {
    values.push(current);
  }
  
  return values;
}

async function setupICDData() {
  try {
    console.log('Starting ICD-10 data setup...');
    console.log('Supabase URL:', supabaseUrl);
    
    // Test connection
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.log('Testing connection with a simple query...');
    } else {
      console.log('Supabase connection successful!');
    }
    
    // Create table
    const tableCreated = await createICDTable();
    if (!tableCreated) {
      console.error('Failed to create table. Exiting.');
      return;
    }
    
    // Insert data
    await parseAndInsertCSV();
    
    console.log('\nICD-10 data setup completed successfully!');
    
    // Verify insertion
    const { count, error: countError } = await supabase
      .from('icd_codes')
      .select('*', { count: 'exact', head: true });
    
    if (!countError) {
      console.log(`Total records in database: ${count}`);
    }
    
  } catch (error) {
    console.error('Error setting up ICD data:', error);
  }
}

// Run the setup
setupICDData();