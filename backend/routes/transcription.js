const express = require('express')
const multer = require('multer')
const { spawn } = require('child_process')
const fs = require('fs')
const path = require('path')
const router = express.Router()

const upload = multer({ dest: 'uploads/' })

// Transcribe audio using Faster Whisper
router.post('/transcribe', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' })
    }

    const audioPath = req.file.path
    const outputPath = path.join('uploads', `transcript_${Date.now()}.txt`)

    // Run Faster Whisper Python script
    const pythonProcess = spawn('/Users/darshanpatil/Documents/Cavista/cavista/backend/whisper_env/bin/python', [
      path.join(__dirname, '../scripts/transcribe.py'),
      audioPath,
      outputPath
    ])

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        // Read transcription result
        fs.readFile(outputPath, 'utf8', (err, data) => {
          if (err) {
            return res.status(500).json({ error: 'Failed to read transcription' })
          }

          // Clean up files
          fs.unlinkSync(audioPath)
          fs.unlinkSync(outputPath)

          res.json({ transcription: data.trim() })
        })
      } else {
        fs.unlinkSync(audioPath)
        res.status(500).json({ error: 'Transcription failed' })
      }
    })

    pythonProcess.stderr.on('data', (data) => {
      console.error('Transcription error:', data.toString())
    })

  } catch (error) {
    console.error('Transcription error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Generate SOAP EMR record using Gemini API
router.post('/generate-emr', async (req, res) => {
  try {
    const { conversation } = req.body

    const prompt = `Convert the following clinician-patient conversation into a structured SOAP format EMR record:

${conversation}

Return a JSON object with this exact SOAP structure:
{
  "patientInfo": {
    "name": "Extract patient name or 'Patient Name'",
    "age": "Extract age or 'Not specified'",
    "gender": "Extract gender or 'Not specified'",
    "id": "EMR-${Date.now()}",
    "dob": "Extract DOB or 'Not specified'",
    "mrn": "MRN-${Date.now()}"
  },
  "providerInfo": {
    "name": "Dr. [Extract or 'Provider Name']",
    "license": "[Extract or 'License #']",
    "facility": "[Extract or 'Medical Facility']"
  },
  "subjective": {
    "chiefComplaint": "Main reason for visit",
    "historyOfPresentIllness": "Current symptoms and timeline",
    "reviewOfSystems": "Relevant system review",
    "pastMedicalHistory": "Previous conditions",
    "medications": ["Current medications"],
    "allergies": ["Known allergies"],
    "socialHistory": "Smoking, alcohol, etc.",
    "familyHistory": "Relevant family history"
  },
  "objective": {
    "vitalSigns": {
      "temperature": "Extract or 'Not recorded'",
      "bloodPressure": "Extract or 'Not recorded'",
      "heartRate": "Extract or 'Not recorded'",
      "respiratoryRate": "Extract or 'Not recorded'",
      "oxygenSaturation": "Extract or 'Not recorded'",
      "weight": "Extract or 'Not recorded'",
      "height": "Extract or 'Not recorded'"
    },
    "physicalExamination": {
      "general": "General appearance",
      "heent": "Head, eyes, ears, nose, throat",
      "cardiovascular": "Heart examination",
      "respiratory": "Lung examination",
      "abdomen": "Abdominal examination",
      "neurological": "Neurological examination",
      "musculoskeletal": "MSK examination",
      "skin": "Skin examination"
    },
    "diagnosticTests": ["Lab results, imaging, etc."]
  },
  "assessment": {
    "primaryDiagnosis": "Main diagnosis with ICD-10 code",
    "secondaryDiagnoses": ["Additional diagnoses with ICD-10 codes"],
    "differentialDiagnoses": ["Possible alternative diagnoses"],
    "clinicalImpression": "Overall clinical assessment"
  },
  "plan": {
    "medications": ["Prescribed medications with dosage"],
    "procedures": ["Planned procedures"],
    "followUp": "Follow-up instructions",
    "patientEducation": "Education provided",
    "lifestyle": "Lifestyle recommendations",
    "monitoring": "What to monitor",
    "referrals": ["Specialist referrals"]
  },
  "timestamp": "${new Date().toISOString()}",
  "signature": "Electronically signed by [Provider Name]"
}

Ensure all fields are filled with extracted information or appropriate defaults.`

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=AIzaSyAskpbG9l6WDVUHfCxG6kv3A7KNi4n979Q`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
      })
    })

    const data = await response.json()
    
    if (!data.candidates || !data.candidates[0]) {
      throw new Error('No response from Gemini API')
    }
    
    const generatedText = data.candidates[0].content.parts[0].text

    // Extract JSON from response
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const emrRecord = JSON.parse(jsonMatch[0])
      res.json(emrRecord)
    } else {
      throw new Error('Failed to parse EMR record')
    }

  } catch (error) {
    console.error('EMR generation error:', error)
    res.status(500).json({ error: 'Failed to generate EMR record' })
  }
})

// Test Gemini API
router.post('/test-gemini', async (req, res) => {
  try {
    const testPrompt = "CLINICIAN: Hello, what brings you in today? PATIENT: I've been having chest pain for the past 2 days. CLINICIAN: Can you describe the pain? PATIENT: It's a sharp pain, gets worse when I breathe deeply."
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=AIzaSyAskpbG9l6WDVUHfCxG6kv3A7KNi4n979Q`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: `Convert this conversation to SOAP EMR format: ${testPrompt}` }]
        }]
      })
    })

    const data = await response.json()
    res.json({ success: true, response: data })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router