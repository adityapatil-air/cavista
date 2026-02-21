const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const router = express.Router();

// Initialize Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Search ICD codes by text
router.get('/search', async (req, res) => {
  try {
    const { query, limit = 10 } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }
    
    // Search by code or description
    const { data, error } = await supabase
      .from('icd_codes')
      .select('id, code, description')
      .or(`code.ilike.%${query}%,description.ilike.%${query}%`)
      .limit(parseInt(limit));
    
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    
    res.json({
      success: true,
      results: data,
      count: data.length
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get specific ICD code by code
router.get('/code/:code', async (req, res) => {
  try {
    const { code } = req.params;
    
    const { data, error } = await supabase
      .from('icd_codes')
      .select('*')
      .eq('code', code.toUpperCase())
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'ICD code not found' });
      }
      return res.status(500).json({ error: error.message });
    }
    
    res.json({
      success: true,
      data: data
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all ICD codes with pagination
router.get('/all', async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    const { data, error, count } = await supabase
      .from('icd_codes')
      .select('id, code, description', { count: 'exact' })
      .range(offset, offset + parseInt(limit) - 1);
    
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    
    res.json({
      success: true,
      data: data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / parseInt(limit))
      }
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search by category (first letter of ICD code)
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { limit = 50 } = req.query;
    
    const { data, error } = await supabase
      .from('icd_codes')
      .select('id, code, description')
      .ilike('code', `${category.toUpperCase()}%`)
      .limit(parseInt(limit));
    
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    
    res.json({
      success: true,
      category: category.toUpperCase(),
      results: data,
      count: data.length
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get database statistics
router.get('/stats', async (req, res) => {
  try {
    const { count, error } = await supabase
      .from('icd_codes')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    
    // Get category breakdown
    const { data: categories, error: catError } = await supabase
      .from('icd_codes')
      .select('code')
      .limit(1000);
    
    let categoryStats = {};
    if (!catError && categories) {
      categories.forEach(item => {
        const firstLetter = item.code.charAt(0);
        categoryStats[firstLetter] = (categoryStats[firstLetter] || 0) + 1;
      });
    }
    
    res.json({
      success: true,
      totalCodes: count,
      categories: categoryStats,
      vectorDimensions: 1000
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Batch search multiple codes
router.post('/batch-search', async (req, res) => {
  try {
    const { codes } = req.body;
    
    if (!codes || !Array.isArray(codes)) {
      return res.status(400).json({ error: 'Codes array is required' });
    }
    
    const upperCodes = codes.map(code => code.toUpperCase());
    
    const { data, error } = await supabase
      .from('icd_codes')
      .select('id, code, description')
      .in('code', upperCodes);
    
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    
    res.json({
      success: true,
      results: data,
      found: data.length,
      requested: codes.length
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Advanced search with full-text search
router.get('/search-advanced', async (req, res) => {
  try {
    const { query, limit = 20 } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }
    
    // Use PostgreSQL full-text search
    const { data, error } = await supabase
      .from('icd_codes')
      .select('id, code, description')
      .textSearch('description', query)
      .limit(parseInt(limit));
    
    if (error) {
      // Fallback to ILIKE search if full-text search fails
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('icd_codes')
        .select('id, code, description')
        .ilike('description', `%${query}%`)
        .limit(parseInt(limit));
      
      if (fallbackError) {
        return res.status(500).json({ error: fallbackError.message });
      }
      
      return res.json({
        success: true,
        results: fallbackData,
        count: fallbackData.length,
        searchType: 'fallback'
      });
    }
    
    res.json({
      success: true,
      results: data,
      count: data.length,
      searchType: 'fulltext'
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload ICD data in chunks
router.post('/upload', async (req, res) => {
  try {
    const { data, chunkSize = 100 } = req.body;
    
    if (!data || !Array.isArray(data)) {
      return res.status(400).json({ error: 'Data array is required' });
    }
    
    let totalInserted = 0;
    let errors = [];
    const chunks = [];
    
    // Split data into chunks
    for (let i = 0; i < data.length; i += chunkSize) {
      chunks.push(data.slice(i, i + chunkSize));
    }
    
    // Process each chunk
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      
      try {
        const { data: insertedData, error } = await supabase
          .from('icd_codes')
          .upsert(chunk, { onConflict: 'code' });
        
        if (error) {
          errors.push({ chunk: i + 1, error: error.message });
        } else {
          totalInserted += chunk.length;
        }
      } catch (chunkError) {
        errors.push({ chunk: i + 1, error: chunkError.message });
      }
    }
    
    res.json({
      success: errors.length === 0,
      totalRecords: data.length,
      totalInserted,
      chunksProcessed: chunks.length,
      errors: errors.length > 0 ? errors : undefined
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;