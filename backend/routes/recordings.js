const express = require('express')
const { createClient } = require('@supabase/supabase-js')
const multer = require('multer')
const fs = require('fs')
const path = require('path')
const router = express.Router()

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

const upload = multer({ dest: 'uploads/' })

// Save recording to Supabase
router.post('/save-recording', upload.single('audio'), async (req, res) => {
  try {
    const { patientName, duration } = req.body
    const audioFile = req.file

    if (!audioFile) {
      return res.status(400).json({ error: 'No audio file provided' })
    }

    // Create permanent filename
    const fileName = `${Date.now()}_${patientName || 'recording'}.wav`
    const permanentPath = path.join('uploads', fileName)
    
    // Move uploaded file to permanent location with proper name
    fs.renameSync(audioFile.path, permanentPath)
    
    // Save recording metadata to database
    const { data: recording, error: dbError } = await supabase
      .from('voice_recordings')
      .insert({
        patient_name: patientName || 'Unknown Patient',
        audio_url: `${process.env.API_BASE_URL || 'http://localhost:5003'}/uploads/${fileName}`,
        duration: parseInt(duration) || 0,
        file_size: audioFile.size,
        status: 'completed'
      })
      .select()
      .single()

    if (dbError) {
      throw dbError
    }

    res.json({ 
      success: true, 
      recording: recording,
      message: 'Recording saved successfully' 
    })

  } catch (error) {
    console.error('Error saving recording:', error)
    res.status(500).json({ error: 'Failed to save recording' })
  }
})

// Get all recordings
router.get('/recordings', async (req, res) => {
  try {
    const { data: recordings, error } = await supabase
      .from('voice_recordings')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    res.json({ recordings })
  } catch (error) {
    console.error('Error fetching recordings:', error)
    res.status(500).json({ error: 'Failed to fetch recordings' })
  }
})

// Save EMR record
router.post('/save-emr', async (req, res) => {
  try {
    const { recordingId, emrData } = req.body

    const { data: emrRecord, error } = await supabase
      .from('emr_records')
      .insert({
        recording_id: recordingId,
        patient_info: emrData.patientInfo,
        provider_info: emrData.providerInfo,
        subjective: emrData.subjective,
        objective: emrData.objective,
        assessment: emrData.assessment,
        plan: emrData.plan
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    res.json({ success: true, emrRecord })
  } catch (error) {
    console.error('Error saving EMR:', error)
    res.status(500).json({ error: 'Failed to save EMR record' })
  }
})

// Update transcription for recording
router.post('/update-transcription', async (req, res) => {
  try {
    const { recordingId, transcription } = req.body

    const { data, error } = await supabase
      .from('voice_recordings')
      .update({ transcription })
      .eq('id', recordingId)
      .select()
      .single()

    if (error) {
      throw error
    }

    res.json({ success: true, recording: data })
  } catch (error) {
    console.error('Error updating transcription:', error)
    res.status(500).json({ error: 'Failed to update transcription' })
  }
})

// Delete recording
router.delete('/delete-recording/:id', async (req, res) => {
  try {
    const { id } = req.params

    // First delete associated EMR records
    await supabase
      .from('emr_records')
      .delete()
      .eq('recording_id', id)

    // Then delete the recording
    const { error } = await supabase
      .from('voice_recordings')
      .delete()
      .eq('id', id)

    if (error) {
      throw error
    }

    res.json({ success: true, message: 'Recording deleted successfully' })
  } catch (error) {
    console.error('Error deleting recording:', error)
    res.status(500).json({ error: 'Failed to delete recording' })
  }
})

module.exports = router