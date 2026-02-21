import { Github, Twitter, Linkedin, Mail, Heart, Stethoscope } from 'lucide-react'

export const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-white/80 backdrop-blur-sm dark:bg-gray-800/80 border-t border-green-200 dark:border-gray-700 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 clinivo-gradient rounded-lg flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold clinivo-text-gradient">Clinivo</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Transforming healthcare documentation with AI-powered voice-first EMR system.
            </p>
            <div className="flex gap-3">
              <a href="#" className="p-2 rounded-lg bg-green-100 dark:bg-gray-700 hover:bg-green-200 dark:hover:bg-green-900/30 transition-all hover:scale-110">
                <Github className="w-5 h-5 text-green-600 dark:text-gray-400" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-green-100 dark:bg-gray-700 hover:bg-green-200 dark:hover:bg-green-900/30 transition-all hover:scale-110">
                <Twitter className="w-5 h-5 text-green-600 dark:text-gray-400" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-green-100 dark:bg-gray-700 hover:bg-green-200 dark:hover:bg-green-900/30 transition-all hover:scale-110">
                <Linkedin className="w-5 h-5 text-green-600 dark:text-gray-400" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Features</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors">Voice Transcription</a></li>
              <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors">AI Diagnosis</a></li>
              <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors">ICD Code Mapping</a></li>
              <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors">Patient Summaries</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Healthcare</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors">For Clinics</a></li>
              <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors">For Hospitals</a></li>
              <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors">Telehealth</a></li>
              <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors">Emergency Care</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Stay Updated</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Get healthcare tech updates</p>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="doctor@clinic.com" 
                className="flex-1 px-3 py-2 text-sm rounded-lg border border-green-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 outline-none"
              />
              <button className="p-2 clinivo-gradient text-white rounded-lg transition-all hover:scale-105">
                <Mail className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-green-200 dark:border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
            © {currentYear} Clinivo. Made with <Heart className="w-4 h-4 text-red-500 fill-current" /> for healthcare professionals
          </p>
          <div className="flex gap-6 text-sm">
            <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors">Privacy</a>
            <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors">HIPAA Compliance</a>
            <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
