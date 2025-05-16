'use client';

import { GraduationCap, BookOpen } from "lucide-react";
import { useState } from "react";

export default function ModeSelector() {
  const [hoveredMode, setHoveredMode] = useState<'profesor' | 'estudiante' | null>(null);
  
  return (
    <div className="h-screen w-screen flex flex-col md:flex-row font-['Poppins',sans-serif]">
      {/* Professor Side - White background with black text */}
      <div 
        className={`relative w-full md:w-1/2 h-1/2 md:h-full flex items-center justify-center transition-all duration-500 ease-in-out bg-white ${
          hoveredMode === 'profesor' ? 'md:w-3/5' : hoveredMode === 'estudiante' ? 'md:w-2/5' : 'md:w-1/2'
        }`}
        onMouseEnter={() => setHoveredMode('profesor')}
        onMouseLeave={() => setHoveredMode(null)}
      >
        {/* Content */}
        <div className="relative z-10 p-8 text-center text-black max-w-md">
          <div className="flex justify-center mb-6">
            <GraduationCap size={80} className="text-amber-500" />
          </div>
          
          <h2 className="text-4xl font-light uppercase tracking-wide mb-6 font-['Poppins',sans-serif]">Profesor Mode</h2>
          
          <div className={`overflow-hidden transition-all duration-500 ${hoveredMode === 'profesor' ? 'max-h-96 opacity-100' : 'max-h-0 md:opacity-0'}`}>
            <p className="mb-8 text-gray-800">
              Manage your classroom, create courses, and track student progress with our comprehensive professor tools.
            </p>
            
            <ul className="space-y-3 mb-8 text-left">
              <li className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-amber-500 mr-3"></div>
                <span>Create and manage courses</span>
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-amber-500 mr-3"></div>
                <span>Track student progress</span>
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-amber-500 mr-3"></div>
                <span>Grade assignments</span>
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-amber-500 mr-3"></div>
                <span>Create quizzes and exams</span>
              </li>
            </ul>
          </div>
          
          <button 
            className="mt-4 px-8 py-3 bg-black hover:bg-gray-800 text-white rounded-full transition-all duration-300 uppercase tracking-wider text-sm font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-['Poppins',sans-serif]"
            onClick={() => window.location.href = '/profesores'}
          >
            Enter as Profesor
          </button>
        </div>
      </div>
      
      {/* Student Side - Black background with white text */}
      <div 
        className={`relative w-full md:w-1/2 h-1/2 md:h-full flex items-center justify-center transition-all duration-500 ease-in-out bg-black ${
          hoveredMode === 'estudiante' ? 'md:w-3/5' : hoveredMode === 'profesor' ? 'md:w-2/5' : 'md:w-1/2'
        }`}
        onMouseEnter={() => setHoveredMode('estudiante')}
        onMouseLeave={() => setHoveredMode(null)}
      >
        {/* Content */}
        <div className="relative z-10 p-8 text-center text-white max-w-md">
          <div className="flex justify-center mb-6">
            <BookOpen size={80} className="text-blue-300" />
          </div>
          
          <h2 className="text-4xl font-light uppercase tracking-wide mb-6 font-['Poppins',sans-serif]">Estudiante Mode</h2>
          
          <div className={`overflow-hidden transition-all duration-500 ${hoveredMode === 'estudiante' ? 'max-h-96 opacity-100' : 'max-h-0 md:opacity-0'}`}>
            <p className="mb-8 text-gray-300">
              Access your courses, submit assignments, and track your learning journey all in one place.
            </p>
            
            <ul className="space-y-3 mb-8 text-left">
              <li className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-blue-300 mr-3"></div>
                <span>Access course materials</span>
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-blue-300 mr-3"></div>
                <span>Submit assignments</span>
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-blue-300 mr-3"></div>
                <span>Take quizzes and exams</span>
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-blue-300 mr-3"></div>
                <span>Track your progress</span>
              </li>
            </ul>
          </div>
          
          <button 
            className="mt-4 px-8 py-3 bg-white hover:bg-gray-200 text-black rounded-full transition-all duration-300 uppercase tracking-wider text-sm font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-['Poppins',sans-serif]"
            onClick={() => window.location.href = '/estudiantes'}
          >
            Enter as Estudiante
          </button>
        </div>
      </div>
      
      {/* Vertical divider for desktop */}
      <div className="hidden md:block absolute left-1/2 top-0 h-full transform -translate-x-1/2 z-20 flex flex-col items-center justify-center">
        <div className="h-full flex flex-col items-center justify-center">
          <div className="w-px h-1/3 bg-gradient-to-b from-transparent via-gray-400 to-gray-500"></div>
          
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-white to-black flex items-center justify-center border border-gray-400 my-6 shadow-lg">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-blue-300 flex items-center justify-center">
              <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                <div className="w-4 h-px bg-gray-800 transform rotate-45"></div>
                <div className="w-4 h-px bg-gray-800 transform -rotate-45"></div>
              </div>
            </div>
          </div>
          
          <div className="w-px h-1/3 bg-gradient-to-t from-transparent via-gray-400 to-gray-500"></div>
        </div>
      </div>
    </div>
  );
}