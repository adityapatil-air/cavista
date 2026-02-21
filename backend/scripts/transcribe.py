#!/usr/bin/env python3
import sys
import os
from faster_whisper import WhisperModel

def transcribe_audio(audio_path, output_path):
    try:
        # Initialize Faster Whisper model (small model for speed)
        model = WhisperModel("small", device="cpu", compute_type="int8")
        
        # Transcribe the audio file
        segments, info = model.transcribe(audio_path, beam_size=5)
        
        # Combine all segments into full transcription
        transcription = ""
        for segment in segments:
            transcription += segment.text + " "
        
        # Write transcription to output file
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(transcription.strip())
        
        print(f"Transcription completed. Language: {info.language}")
        return True
        
    except Exception as e:
        print(f"Error during transcription: {str(e)}")
        return False

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python transcribe.py <audio_path> <output_path>")
        sys.exit(1)
    
    audio_path = sys.argv[1]
    output_path = sys.argv[2]
    
    if not os.path.exists(audio_path):
        print(f"Error: Audio file {audio_path} not found")
        sys.exit(1)
    
    success = transcribe_audio(audio_path, output_path)
    sys.exit(0 if success else 1)