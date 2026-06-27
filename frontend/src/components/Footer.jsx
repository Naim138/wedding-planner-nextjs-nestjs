import React from 'react'
import { FaFacebook, FaGithub, FaYoutube } from 'react-icons/fa'

const Footer = () => {
  return (
    <>
     <footer className="text-gray-600 body-font bg-zinc-50 border-t border-zinc-200">
  <div className="container px-5 py-12 mx-auto">
    <div className="flex flex-col md:flex-row justify-between items-center">
      <div className="mb-6 md:mb-0 text-center md:text-left">
        <h2 className="text-2xl font-bold text-zinc-900 mb-2">Nur Mohammad Naim</h2>
        <p className="text-sm text-gray-500">Full Stack Developer</p>
      </div>
      
      <div className="flex space-x-6">
        <a 
          href="https://www.facebook.com/share/19676kLqJR/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-gray-500 hover:text-blue-600 transition-colors"
          title="Facebook"
        >
          <FaFacebook className="w-6 h-6" />
        </a>
        <a 
          href="https://github.com/Naim138" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-gray-500 hover:text-gray-900 transition-colors"
          title="GitHub"
        >
          <FaGithub className="w-6 h-6" />
        </a>
        <a 
          href="https://youtube.com/@nurmohammadnaim8587?si=3kCyVGT5DejmtGiO" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-gray-500 hover:text-red-600 transition-colors"
          title="YouTube"
        >
          <FaYoutube className="w-6 h-6" />
        </a>
      </div>
    </div>
    
    <div className="mt-8 pt-8 border-t border-zinc-200 text-center">
      <p className="text-sm text-gray-500">
        © {new Date().getFullYear()} Wedding Planner. Developed by <span className="font-semibold text-zinc-900">Nur Mohammad Naim</span>
      </p>
    </div>
  </div>
</footer>

    </>
  )
}

export default Footer