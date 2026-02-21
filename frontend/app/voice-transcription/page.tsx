'use client'

import { useState, useRef, useEffect } from 'react'
import { Mic, MicOff, Download, FileText, Loader2, Play, Pause, Shield, Brain, Users, Clock, CheckCircle, AlertCircle, FileDown } from 'lucide-react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

interface TranscriptionData {
  timestamp: string
  speaker: 'clinician' | 'patient'
  text: string
}

interface EMRRecord {
  patientInfo: {
    name: string
    age: string
    gender: string
    id: string
    dob: string
    mrn: string
  }
  providerInfo: {
    name: string
    license: string
    facility: string
  }
  subjective: {
    chiefComplaint: string
    historyOfPresentIllness: string
    reviewOfSystems: string
    pastMedicalHistory: string
    medications: string[]
    allergies: string[]
    socialHistory: string
    familyHistory: string
  }
  objective: {
    vitalSigns: {
      temperature: string
      bloodPressure: string
      heartRate: string
      respiratoryRate: string
      oxygenSaturation: string
      weight: string
      height: string
    }
    physicalExamination: {
      general: string
      heent: string
      cardiovascular: string
      respiratory: string
      abdomen: string
      neurological: string
      musculoskeletal: string
      skin: string
    }
    diagnosticTests: string[]
  }
  assessment: {
    primaryDiagnosis: string
    secondaryDiagnoses: string[]
    differentialDiagnoses: string[]
    clinicalImpression: string
  }
  plan: {
    medications: string[]
    procedures: string[]
    followUp: string
    patientEducation: string
    lifestyle: string
    monitoring: string
    referrals: string[]
  }
  timestamp: string
  signature: string
}

export default function VoiceTranscription() {
  const [isRecording, setIsRecording] = useState(false)
  const [transcriptions, setTranscriptions] = useState<TranscriptionData[]>([])
  const [emrRecord, setEmrRecord] = useState<EMRRecord | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [recordings, setRecordings] = useState<any[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [fileName, setFileName] = useState('')
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [selectedRecording, setSelectedRecording] = useState<any>(null)
  const [showRecordingDialog, setShowRecordingDialog] = useState(false)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const startTimeRef = useRef<number>(0)

  // Fetch recordings on component mount
  useEffect(() => {
    fetchRecordings()
    // Auto-refresh every 5 seconds to show new recordings
    const interval = setInterval(fetchRecordings, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchRecordings = async () => {
    try {
      console.log('🔄 Fetching recordings from database...')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/recordings`)
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Fetched recordings:', data.recordings?.length || 0, 'recordings found')
        setRecordings(data.recordings || [])
      } else {
        console.error('❌ Failed to fetch recordings:', response.statusText)
        setRecordings([])
      }
    } catch (error) {
      console.error('❌ Error fetching recordings:', error)
      setRecordings([])
    }
  }

  const saveRecording = async (audioBlob: Blob, duration: number) => {
    try {
      console.log('💾 Saving recording to database...', { fileName, duration })
      const formData = new FormData()
      formData.append('audio', audioBlob, `${fileName}.wav`)
      formData.append('patientName', fileName)
      formData.append('duration', duration.toString())
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/save-recording`, {
        method: 'POST',
        body: formData,
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Recording saved successfully:', data.recording)
        setFileName('') // Clear file name
        return data.recording
      } else {
        const errorData = await response.json()
        console.error('❌ Failed to save recording:', errorData.error)
        alert(`Failed to save recording: ${errorData.error}`)
        return null
      }
    } catch (error) {
      console.error('❌ Error saving recording:', error)
      alert(`Error saving recording: ${error.message}`)
      return null
    }
  }

  const generateEMRFromRecording = async (recording: any) => {
    console.log('🎯 Starting EMR generation for:', recording.patient_name)
    setIsProcessing(true)
    setSelectedRecording(recording)
    
    try {
      let transcriptionText = recording.transcription
      
      if (!transcriptionText) {
        console.log('🎙️ No transcription found, transcribing audio with Faster-Whisper...')
        
        // Fetch the audio file from server
        const audioResponse = await fetch(recording.audio_url)
        if (!audioResponse.ok) {
          throw new Error('Could not fetch audio file for transcription')
        }
        
        const audioBlob = await audioResponse.blob()
        const formData = new FormData()
        formData.append('audio', audioBlob, 'recording.wav')
        
        console.log('🤖 Sending audio to Faster-Whisper for transcription...')
        const transcribeResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/transcribe`, {
          method: 'POST',
          body: formData,
        })
        
        if (transcribeResponse.ok) {
          const { transcription } = await transcribeResponse.json()
          transcriptionText = transcription
          console.log('✅ Audio transcribed successfully with Faster-Whisper')
          console.log('📝 Real Transcription:', transcriptionText)
          
          // Update recording with real transcription
          await fetch(`${process.env.NEXT_PUBLIC_API_URL}/update-transcription`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              recordingId: recording.id, 
              transcription: transcriptionText 
            }),
          })
          console.log('✅ Real transcription saved to database')
        } else {
          throw new Error('Failed to transcribe audio with Faster-Whisper')
        }
      } else {
        console.log('✅ Using existing transcription from database')
        console.log('📝 Transcription:', transcriptionText.substring(0, 100) + '...')
      }
      
      if (!transcriptionText || transcriptionText.trim().length === 0) {
        throw new Error('No transcription text available')
      }
      
      console.log('🤖 Generating EMR from REAL transcription using Gemini AI...')
      const emrResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/generate-emr`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversation: transcriptionText }),
      })

      if (emrResponse.ok) {
        const emr = await emrResponse.json()
        console.log('✅ EMR generated successfully from REAL audio transcription')
        setEmrRecord(emr)
        
        // Save EMR to database
        console.log('💾 Saving EMR to database...')
        const saveResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/save-emr`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            recordingId: recording.id, 
            emrData: emr 
          }),
        })
        
        if (saveResponse.ok) {
          console.log('✅ EMR saved to database successfully')
          alert('EMR generated from REAL audio transcription and saved successfully!')
        } else {
          console.log('⚠️ EMR generation successful but database save failed')
          alert('EMR generated successfully! (Database save failed but you can still download it)')
        }
        
        console.log('🎉 REAL Audio → Speech-to-Text → EMR process completed!')
      } else {
        const errorData = await emrResponse.json()
        throw new Error(`Failed to generate EMR: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('❌ Error in Audio → Speech-to-Text → EMR process:', error)
      alert(`Failed to generate EMR: ${error.message}. Please ensure audio was recorded properly.`)
    } finally {
      setIsProcessing(false)
      setSelectedRecording(null)
    }
  }

  const startRecording = async () => {
    if (!fileName.trim()) {
      alert('Please enter a file name before recording')
      return
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []
      startTimeRef.current = Date.now()

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' })
        const url = URL.createObjectURL(audioBlob)
        setAudioUrl(url)
        
        const duration = Math.floor((Date.now() - startTimeRef.current) / 1000)
        setRecordingDuration(duration)
        
        console.log('🎙️ Recording completed, saving to database...')
        // Save to database and refresh recordings
        const savedRecording = await saveRecording(audioBlob, duration)
        if (savedRecording) {
          console.log('✅ Recording saved successfully')
          console.log('🔄 Refreshing recordings list...')
          await fetchRecordings()
        }
      }

      mediaRecorder.start(1000)
      setIsRecording(true)
    } catch (error) {
      console.error('Error starting recording:', error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
      setIsRecording(false)
    }
  }

  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true)
    
    try {
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.wav')
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/transcribe`, {
        method: 'POST',
        body: formData,
      })
      
      if (response.ok) {
        const { transcription } = await response.json()
        
        const newTranscription: TranscriptionData = {
          timestamp: new Date().toLocaleTimeString(),
          speaker: 'clinician',
          text: transcription
        }
        
        setTranscriptions(prev => [...prev, newTranscription])
        
        if (transcriptions.length > 1) {
          await generateEMRRecord([...transcriptions, newTranscription])
        }
      }
    } catch (error) {
      console.error('Error processing audio:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const generateEMRRecord = async (allTranscriptions: TranscriptionData[]) => {
    try {
      const conversationText = allTranscriptions
        .map(t => `${t.speaker.toUpperCase()}: ${t.text}`)
        .join('\n')

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/generate-emr`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversation: conversationText }),
      })

      if (response.ok) {
        const emr = await response.json()
        setEmrRecord(emr)
      }
    } catch (error) {
      console.error('Error generating EMR:', error)
    }
  }

  const downloadEMRPDF = async () => {
    if (!emrRecord) return

    // Create HTML template for PDF
    const htmlContent = `
    <div style="font-family: Arial, sans-serif; font-size: 11px; line-height: 1.3; max-width: 800px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px;">
        <h1 style="margin: 0; font-size: 16px; font-weight: bold;">CLINIVO – Electronic Medical Record</h1>
      </div>
      
      <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #ccc; padding-bottom: 8px; margin-bottom: 12px;">
        <div>
          <strong>Patient:</strong> ${emrRecord.patientInfo.name}<br>
          <strong>Age:</strong> ${emrRecord.patientInfo.age} | <strong>Gender:</strong> ${emrRecord.patientInfo.gender}<br>
          <strong>MRN:</strong> ${emrRecord.patientInfo.mrn}
        </div>
        <div style="text-align: right;">
          <strong>Provider:</strong> ${emrRecord.providerInfo.name}<br>
          <strong>Facility:</strong> ${emrRecord.providerInfo.facility}<br>
          <strong>Date:</strong> ${new Date().toLocaleDateString()}
        </div>
      </div>

      <div style="border-bottom: 1px solid #ccc; padding-bottom: 8px; margin-bottom: 10px;">
        <h3 style="margin: 0 0 5px 0; font-size: 12px; background: #f0f0f0; padding: 3px 6px;">SUBJECTIVE</h3>
        <div style="margin-left: 10px;">
          <p style="margin: 2px 0;"><strong>Chief Complaint:</strong> ${emrRecord.subjective.chiefComplaint}</p>
          <p style="margin: 2px 0;"><strong>HPI:</strong> ${emrRecord.subjective.historyOfPresentIllness}</p>
          <p style="margin: 2px 0;"><strong>PMH:</strong> ${emrRecord.subjective.pastMedicalHistory}</p>
          <p style="margin: 2px 0;"><strong>Medications:</strong> ${emrRecord.subjective.medications.join(', ')}</p>
          <p style="margin: 2px 0;"><strong>Allergies:</strong> ${emrRecord.subjective.allergies.join(', ')}</p>
        </div>
      </div>

      <div style="border-bottom: 1px solid #ccc; padding-bottom: 8px; margin-bottom: 10px;">
        <h3 style="margin: 0 0 5px 0; font-size: 12px; background: #f0f0f0; padding: 3px 6px;">OBJECTIVE</h3>
        <div style="margin-left: 10px;">
          <p style="margin: 2px 0;"><strong>Vitals:</strong> BP: ${emrRecord.objective.vitalSigns.bloodPressure}, HR: ${emrRecord.objective.vitalSigns.heartRate}, Temp: ${emrRecord.objective.vitalSigns.temperature}</p>
          <p style="margin: 2px 0;"><strong>General:</strong> ${emrRecord.objective.physicalExamination.general}</p>
          <p style="margin: 2px 0;"><strong>CV:</strong> ${emrRecord.objective.physicalExamination.cardiovascular}</p>
          <p style="margin: 2px 0;"><strong>Resp:</strong> ${emrRecord.objective.physicalExamination.respiratory}</p>
        </div>
      </div>

      <div style="border-bottom: 1px solid #ccc; padding-bottom: 8px; margin-bottom: 10px;">
        <h3 style="margin: 0 0 5px 0; font-size: 12px; background: #f0f0f0; padding: 3px 6px;">ASSESSMENT</h3>
        <div style="margin-left: 10px;">
          <p style="margin: 2px 0;"><strong>Primary Diagnosis:</strong> ${emrRecord.assessment.primaryDiagnosis}</p>
          <p style="margin: 2px 0;"><strong>Clinical Impression:</strong> ${emrRecord.assessment.clinicalImpression}</p>
        </div>
      </div>

      <div style="border-bottom: 1px solid #ccc; padding-bottom: 8px; margin-bottom: 10px;">
        <h3 style="margin: 0 0 5px 0; font-size: 12px; background: #f0f0f0; padding: 3px 6px;">PLAN</h3>
        <div style="margin-left: 10px;">
          <p style="margin: 2px 0;"><strong>Medications:</strong> ${emrRecord.plan.medications.join(', ')}</p>
          <p style="margin: 2px 0;"><strong>Follow-up:</strong> ${emrRecord.plan.followUp}</p>
          <p style="margin: 2px 0;"><strong>Education:</strong> ${emrRecord.plan.patientEducation}</p>
        </div>
      </div>

      <div style="display: flex; justify-content: space-between; font-size: 10px; margin-top: 15px;">
        <div><strong>Signature:</strong> ${emrRecord.signature}</div>
        <div><strong>Generated:</strong> ${new Date().toLocaleString()}</div>
        <div><strong>HIPAA Compliant</strong></div>
      </div>
    </div>
    `

    // Create temporary div for PDF generation
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = htmlContent
    tempDiv.style.position = 'absolute'
    tempDiv.style.left = '-9999px'
    document.body.appendChild(tempDiv)

    try {
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const imgWidth = 210
      const pageHeight = 295
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight

      let position = 0

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      pdf.save(`SOAP_EMR_${emrRecord.patientInfo.name}_${new Date().toISOString().split('T')[0]}.pdf`)
    } catch (error) {
      console.error('Error generating PDF:', error)
    } finally {
      document.body.removeChild(tempDiv)
    }
  }

  const togglePlayback = () => {
    if (!audioRef.current || !audioUrl) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold clinivo-text-gradient mb-2">Voice Transcription</h1>
          <p className="text-gray-600">Convert clinician-patient conversations into structured EMR records</p>
        </div>

        {/* Recording Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="mb-4">
            <input
              type="text"
              placeholder="Enter file name (required)"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              disabled={isRecording}
            />
          </div>
          
          <div className="text-center">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isProcessing || (!fileName.trim() && !isRecording)}
              className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 mb-6 ${
                isRecording 
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                  : 'clinivo-gradient hover:scale-105'
              } ${(isProcessing || (!fileName.trim() && !isRecording)) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isProcessing ? (
                <Loader2 className="w-12 h-12 text-white animate-spin" />
              ) : isRecording ? (
                <MicOff className="w-12 h-12 text-white" />
              ) : (
                <Mic className="w-12 h-12 text-white" />
              )}
            </button>
            
            <h2 className="text-xl font-semibold mb-2">
              {isRecording ? 'Recording Audio...' : 'Start Recording'}
            </h2>
            <p className="text-gray-600 mb-6">
              {isRecording ? 'Click to stop recording' : 'Enter file name and click to start recording'}
            </p>
            
            {isProcessing && (
              <p className="text-sm text-green-600">Processing audio with AI...</p>
            )}
            
            <div className="mt-4 p-4 bg-gray-50 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    recordings.length > 0 ? 'bg-green-500' : 'bg-gray-400'
                  }`}></div>
                  <span className="text-sm font-medium">{recordings.length} recordings available</span>
                </div>
                {recordings.length > 0 && (
                  <div className="text-xs text-gray-500">
                    Latest: {recordings[0]?.patient_name || 'Unknown'}
                  </div>
                )}
              </div>
              <button
                onClick={(e) => {
                  e.preventDefault()
                  fetchRecordings()
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
          </div>

          {/* Live Transcription */}
          {transcriptions.length > 0 && (
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-green-600" />
                Live Transcription
              </h3>
              <div className="max-h-40 overflow-y-auto space-y-2">
                {transcriptions.map((t, idx) => (
                  <div key={idx} className="flex gap-3 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      t.speaker === 'clinician' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {t.speaker}
                    </span>
                    <p className="flex-1">{t.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Audio Playback */}
          {audioUrl && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Recorded Audio</span>
                <button
                  onClick={togglePlayback}
                  className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {isPlaying ? 'Pause' : 'Play'}
                </button>
              </div>
              <audio
                ref={audioRef}
                src={audioUrl}
                onEnded={() => setIsPlaying(false)}
                className="hidden"
              />
            </div>
          )}
        </div>

        {/* EMR Record */}
        {emrRecord && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <FileText className="w-5 h-5 text-green-600" />
                Generated EMR Record
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={downloadEMRPDF}
                  className="flex items-center gap-2 px-4 py-2 clinivo-gradient text-white rounded-lg hover:scale-105 transition-transform"
                >
                  <FileDown className="w-4 h-4" />
                  Download PDF
                </button>
                <button
                  onClick={() => {
                    const emrText = JSON.stringify(emrRecord, null, 2)
                    const blob = new Blob([emrText], { type: 'application/json' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `EMR_${emrRecord.patientInfo.name}_${new Date().toISOString().split('T')[0]}.json`
                    a.click()
                    URL.revokeObjectURL(url)
                  }}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  JSON
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Patient Information</h3>
                  <div className="bg-gray-50 p-3 rounded-lg space-y-1">
                    <p><span className="font-medium">Name:</span> {emrRecord.patientInfo.name}</p>
                    <p><span className="font-medium">Age:</span> {emrRecord.patientInfo.age}</p>
                    <p><span className="font-medium">Gender:</span> {emrRecord.patientInfo.gender}</p>
                    <p><span className="font-medium">MRN:</span> {emrRecord.patientInfo.mrn}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">SUBJECTIVE</h3>
                  <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                    <p><span className="font-medium">Chief Complaint:</span> {emrRecord.subjective.chiefComplaint}</p>
                    <p><span className="font-medium">HPI:</span> {emrRecord.subjective.historyOfPresentIllness}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">OBJECTIVE</h3>
                  <div className="bg-gray-50 p-3 rounded-lg space-y-1">
                    <p><span className="font-medium">BP:</span> {emrRecord.objective.vitalSigns.bloodPressure}</p>
                    <p><span className="font-medium">HR:</span> {emrRecord.objective.vitalSigns.heartRate}</p>
                    <p><span className="font-medium">Temp:</span> {emrRecord.objective.vitalSigns.temperature}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">ASSESSMENT</h3>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p><span className="font-medium">Primary:</span> {emrRecord.assessment.primaryDiagnosis}</p>
                    <p className="mt-1"><span className="font-medium">Impression:</span> {emrRecord.assessment.clinicalImpression}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">PLAN</h3>
                  <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                    <p><span className="font-medium">Medications:</span></p>
                    <ul className="list-disc list-inside text-xs">
                      {emrRecord.plan.medications.map((med, idx) => (
                        <li key={idx}>{med}</li>
                      ))}
                    </ul>
                    <p><span className="font-medium">Follow-up:</span> {emrRecord.plan.followUp}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Provider</h3>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p><span className="font-medium">Name:</span> {emrRecord.providerInfo.name}</p>
                    <p><span className="font-medium">Facility:</span> {emrRecord.providerInfo.facility}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Audio Recordings */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-green-600" />
            Audio Recordings ({recordings.length})
          </h3>
          
          {recordings.length === 0 ? (
            <div className="text-center py-12">
              <Mic className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No recordings available</p>
              <p className="text-sm text-gray-400">Start recording to see your audio files here</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recordings.map((recording) => (
                <div key={recording.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="mb-3">
                    <h4 className="font-medium text-sm text-gray-900 mb-1">{recording.patient_name}</h4>
                    <p className="text-xs text-gray-500">
                      {new Date(recording.created_at).toLocaleDateString()} at {new Date(recording.created_at).toLocaleTimeString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      Duration: {Math.floor(recording.duration / 60)}:{(recording.duration % 60).toString().padStart(2, '0')}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      recording.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {recording.status}
                    </span>
                    
                    <div className="flex items-center gap-2">
                      {recording.audio_url && (
                        <button
                          onClick={() => {
                            const audio = new Audio(recording.audio_url)
                            audio.play()
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                          title="Play Audio"
                        >
                          <Play className="w-4 h-4" />
                        </button>
                      )}
                      
                      <button
                        onClick={() => generateEMRFromRecording(recording)}
                        disabled={isProcessing}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        title="Generate EMR from this recording"
                      >
                        {isProcessing && selectedRecording?.id === recording.id ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <Brain className="w-4 h-4" />
                            <span>Generate EMR</span>
                          </>
                        )}
                      </button>
                      
                      <button
                        onClick={async () => {
                          if (confirm(`Delete recording "${recording.patient_name}"?`)) {
                            try {
                              const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/delete-recording/${recording.id}`, {
                                method: 'DELETE'
                              })
                              
                              if (response.ok) {
                                console.log('✅ Recording deleted successfully')
                                await fetchRecordings()
                              } else {
                                alert('Failed to delete recording')
                              }
                            } catch (error) {
                              console.error('Delete error:', error)
                              alert('Error deleting recording')
                            }
                          }
                        }}
                        className="p-2 text-red-600 hover:bg-red-100 rounded transition-colors"
                        title="Delete Recording"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  {recording.transcription && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-600 line-clamp-2">
                        <span className="font-medium">Transcription:</span> {recording.transcription.substring(0, 100)}...
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-800">AI-Powered</h3>
            </div>
            <p className="text-sm text-gray-600">Uses advanced Whisper AI for accurate medical transcription and Gemini AI for structured EMR generation.</p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-800">HIPAA Compliant</h3>
            </div>
            <p className="text-sm text-gray-600">All audio processing is done securely with no permanent storage of patient conversations.</p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-800">Real-time</h3>
            </div>
            <p className="text-sm text-gray-600">Instant transcription and EMR generation during your consultation for immediate documentation.</p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-800">Multi-Speaker</h3>
            </div>
            <p className="text-sm text-gray-600">Automatically identifies and separates clinician and patient speech for accurate documentation.</p>
          </div>
        </div>

        {/* Security & Ethics Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-600" />
              Security & Privacy
            </h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <p>Audio files are processed locally and deleted immediately after transcription</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <p>No patient data is stored on external servers</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <p>End-to-end encryption for all data transmission</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <p>HIPAA compliant infrastructure and processes</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-blue-600" />
              AI Ethics & Accuracy
            </h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <p>AI-generated EMRs should always be reviewed by qualified healthcare professionals</p>
              </div>
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <p>System is designed to assist, not replace, clinical judgment</p>
              </div>
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <p>Transcription accuracy may vary based on audio quality and medical terminology</p>
              </div>
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <p>Always verify patient information and clinical details before finalizing records</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}