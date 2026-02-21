'use client'

import { ProtectedRoute } from '@/components/ProtectedRoute'
import { DashboardLayout } from '@/components/DashboardLayout'
import { Card } from '@/components/Card'
import { Mic, Brain, FileText, Stethoscope, Globe, Shield, Zap, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  const features = [
    { icon: <Mic size={28} />, title: 'Voice-First System', desc: 'Convert clinician dictation into structured EMR entries', color: 'bg-green-500' },
    { icon: <Brain size={28} />, title: 'AI-Powered Analysis', desc: 'Extract key vitals, symptoms, and diagnosis from documents', color: 'bg-emerald-500' },
    { icon: <FileText size={28} />, title: 'ICD Code Mapping', desc: 'Auto-tag conditions and recommend medications', color: 'bg-teal-500' },
    { icon: <Stethoscope size={28} />, title: 'Patient Summaries', desc: 'Translate medical jargon into understandable plans', color: 'bg-cyan-500' },
    { icon: <Globe size={28} />, title: 'Multilingual Support', desc: 'Support diverse patient populations worldwide', color: 'bg-green-600' },
    { icon: <Shield size={28} />, title: 'Compliance Ready', desc: 'Audit-ready records generation and security', color: 'bg-emerald-600' },
  ]

  const useCases = [
    { title: 'Faster Documentation', desc: 'Streamline consultations with voice-to-text' },
    { title: 'Telehealth Support', desc: 'Transcription and diagnosis for remote care' },
    { title: 'Emergency Triage', desc: 'Quick documentation in critical situations' },
    { title: 'EMR Integration', desc: 'Lightweight plug-in for existing systems' },
  ]

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="max-w-7xl mx-auto">
          <div className="relative text-center py-20 px-4 animate-fade-in overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-20 left-10 w-72 h-72 bg-green-400/20 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}} />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-400/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}} />
            </div>

            <div className="relative z-10">
              <div className="inline-block mb-6 px-6 py-3 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-full text-green-600 dark:text-green-400 text-sm font-semibold animate-slide-down shadow-lg hover:scale-105 transition-transform duration-300">
                🏥 Smart EMR & Diagnostic Assistant
              </div>
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-extrabold mb-8 animate-slide-up">
                <span className="clinivo-text-gradient">
                  Clinivo
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-10 max-w-3xl mx-auto animate-slide-up leading-relaxed" style={{animationDelay: '0.2s'}}>
                Transform clinician-patient interactions into structured data, diagnoses, and actionable insights—
                <span className="font-semibold text-green-600 dark:text-green-400"> streamlining documentation </span>
                and
                <span className="font-semibold text-emerald-600 dark:text-emerald-400"> improving care quality</span>
              </p>
              <div className="flex flex-wrap gap-4 justify-center animate-slide-up" style={{animationDelay: '0.3s'}}>
                <Link href="/dashboard" className="group relative px-8 py-4 clinivo-gradient text-white rounded-xl font-semibold shadow-2xl shadow-green-500/50 hover:shadow-green-500/70 hover:scale-110 transition-all duration-300 flex items-center gap-2 overflow-hidden">
                  <span className="relative z-10">Start Diagnosis</span>
                  <ArrowRight size={20} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                </Link>
                <a href="#features" className="group px-8 py-4 bg-white dark:bg-gray-800 border-2 border-green-200 dark:border-gray-700 hover:border-green-500 dark:hover:border-green-500 text-gray-900 dark:text-white rounded-xl font-semibold hover:scale-110 hover:shadow-xl transition-all duration-300 relative overflow-hidden">
                  <span className="absolute inset-0 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative z-10">Learn More</span>
                </a>
              </div>
            </div>
          </div>

          <div id="features" className="mb-20">
            <div className="text-center mb-12 animate-slide-up">
              <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">Key Features</h2>
              <p className="text-gray-600 dark:text-gray-400 text-lg">Advanced AI-powered healthcare documentation</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, idx) => (
                <div key={idx} className="group animate-slide-up" style={{animationDelay: `${0.5 + idx * 0.1}s`}}>
                  <div className="h-full p-6 bg-white/80 backdrop-blur-sm dark:bg-gray-800/80 rounded-2xl border border-green-100 dark:border-gray-700 hover:border-green-500 dark:hover:border-green-500 hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                    <div className={`inline-flex p-3 ${feature.color} bg-opacity-10 rounded-xl text-white mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <div className={`${feature.color} bg-opacity-100 rounded-lg p-2`}>
                        {feature.icon}
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{feature.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-20 animate-slide-up">
            <Card>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Use Cases</h2>
                <p className="text-gray-600 dark:text-gray-400">Transforming healthcare workflows</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {useCases.map((useCase, idx) => (
                  <div key={idx} className="p-6 bg-green-50 dark:bg-green-900/20 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30 hover:scale-105 transition-all duration-200">
                    <div className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{useCase.title}</div>
                    <div className="text-gray-600 dark:text-gray-400">{useCase.desc}</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="text-center py-16 px-4 clinivo-gradient rounded-3xl mb-12 animate-scale-in">
            <h2 className="text-4xl font-bold text-white mb-4">Ready to Transform Healthcare?</h2>
            <p className="text-green-100 text-lg mb-8 max-w-2xl mx-auto">
              Join healthcare professionals using AI-powered documentation
            </p>
            <Link href="/dashboard" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-green-600 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200">
              Start Your Journey <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
