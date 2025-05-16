'use client';

import { useState, useEffect } from "react";
import { ChevronDown, Download, Search, Loader2, AlertCircle } from "lucide-react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

export default function EstudianteDashboard() {
  const [asignatura, setAsignatura] = useState("matematicas");
  const [isAsignaturaOpen, setIsAsignaturaOpen] = useState(false);
  const [apiKey, setApiKey] = useState('alumno-5678');
  const [apiKeyError, setApiKeyError] = useState(false);
  const [archivos, setArchivos] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [downloadingFile, setDownloadingFile] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [ejecutando, setEjecutando] = useState(false);
  
  const API_ENDPOINT = 'https://tbk7w2ivb0.execute-api.us-east-2.amazonaws.com/dev/';

  const asignaturas = [
    "matematicas", 
    "fisica", 
    "quimica", 
    "historia", 
    "lengua", 
    "biologia"
  ];

  // Fetch files when asignatura changes or component loads
  useEffect(() => {
    fetchArchivos();
  }, [asignatura]);

  const validateApiKey = () => {
    if (!apiKey || apiKey.trim() === '') {
      setApiKeyError(true);
      setErrorMessage("API Key es obligatorio");
      return false;
    }
    setApiKeyError(false);
    return true;
  };

  const fetchArchivos = async () => {
    if (!validateApiKey()) return;
    
    setIsLoading(true);
    setErrorMessage("");
    
    try {
      const response = await axios.get(
        `${API_ENDPOINT}?asignatura=${asignatura}`,
        {
          headers: {
            'X-API-Key': apiKey
          }
        }
      );
      
      setArchivos(response.data.archivos || []);
    } catch (error) {
      console.error('Error obteniendo archivos:', error);
      let message = 'Error desconocido';
      interface AxiosErrorResponse {
        response?: {
          data?: {
            message?: string;
          };
        };
        message?: string;
      }
      const axiosError = error as AxiosErrorResponse;
      if (typeof error === 'object' && error !== null) {
        if (
          axiosError.response &&
          axiosError.response.data &&
          typeof axiosError.response.data.message === 'string'
        ) {
          message = axiosError.response.data.message;
        } else if (typeof axiosError.message === 'string') {
          message = axiosError.message;
        }
      }
      setErrorMessage('Error al obtener los archivos: ' + message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDescargarArchivo = async (nombreArchivo: string) => {
    if (!validateApiKey()) return;
    
    setDownloadingFile(nombreArchivo);
    setErrorMessage("");
    
    try {
      const response = await axios.get(
        `${API_ENDPOINT}download?asignatura=${asignatura}&archivo=${nombreArchivo}`,
        {
          headers: {
            'X-API-Key': apiKey
          }
        }
      );
      
      // Create a link element and trigger download
      const downloadUrl = response.data.url;
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', nombreArchivo);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('Error descargando archivo:', error);
      let message = 'Error desconocido';
      if (typeof error === 'object' && error !== null) {
        const err = error as { response?: { data?: { message?: string } }, message?: string };
        if (err.response?.data?.message) {
          message = err.response.data.message;
        } else if (err.message) {
          message = err.message;
        }
      }
      setErrorMessage('Error al descargar el archivo: ' + message);
    } finally {
      setDownloadingFile(null);
    }
  };

  const handleAsignaturaChange = (value: string) => {
    setAsignatura(value);
    setIsAsignaturaOpen(false);
  };

  const handleEjecutarListamiento = () => {
    setEjecutando(true);
    fetchArchivos();
    setTimeout(() => setEjecutando(false), 1000); // Simular finalización de ejecución
  };

  // Filter files based on search term
  const filteredArchivos = archivos.filter(archivo => 
    archivo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white text-black font-['Poppins',sans-serif]">
      {/* Top navigation bar */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-6 shadow-md rounded-b-3xl"
      >
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.href = '/'}
              className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg transition-all duration-300 flex items-center"
            >
              <ChevronDown className="transform rotate-90 mr-1" size={16} />
              Volver
            </motion.button>
            <h1 className="text-2xl font-bold">Área de Estudiantes</h1>
          </div>
          
          <div className="flex space-x-4">
            {/* Dropdown para estudiante - se puede adaptar si se necesita un selector de estudiante */}
            <div className="relative">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center border border-gray-300 rounded-lg px-4 py-2 focus:outline-none hover:border-gray-400 transition-all duration-300"
              >
                <span>Estudiante</span>
                <motion.div>
                  <ChevronDown className="ml-2 h-4 w-4" />
                </motion.div>
              </motion.button>
            </div>
            
            {/* API Key input */}
            <div className={`border ${apiKeyError ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-2 transition-all duration-300 hover:border-gray-400 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500`}>
              <input 
                type="text" 
                placeholder="API KEY"
                className="focus:outline-none w-full"
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  if (e.target.value) setApiKeyError(false);
                }}
              />
            </div>
            
            {/* Dropdown para asignatura */}
            <div className="relative">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center border border-gray-300 rounded-lg px-4 py-2 focus:outline-none hover:border-gray-400 transition-all duration-300"
                onClick={() => setIsAsignaturaOpen(!isAsignaturaOpen)}
              >
                <span>Asignatura: {asignatura}</span>
                <motion.div
                  animate={{ rotate: isAsignaturaOpen ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown className="ml-2 h-4 w-4" />
                </motion.div>
              </motion.button>
              
              <AnimatePresence>
                {isAsignaturaOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white z-50"
                  >
                    <div className="rounded-md ring-1 ring-black ring-opacity-5 py-1">
                      {asignaturas.map((item) => (
                        <motion.button
                          key={item}
                          whileHover={{ backgroundColor: "#f3f4f6" }}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700"
                          onClick={() => handleAsignaturaChange(item)}
                        >
                          {item}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Botón para ejecutar listamiento */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleEjecutarListamiento}
              className="bg-black hover:bg-gray-800 text-white p-2 rounded-lg transition-all duration-300"
              disabled={ejecutando}
            >
              {ejecutando ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13 19L22 12L13 5V19Z" fill="currentColor" />
                  <path d="M2 19L11 12L2 5V19Z" fill="currentColor" />
                </svg>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
      
      {/* Main content area */}
      <div className="container mx-auto p-6 mt-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white p-8 rounded-3xl border-2 border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          {/* Search and title */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Nombre del archivo:</h2>
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar archivo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
          </div>
          
          {/* ASIGNATURA Header */}
          <div className="bg-gray-100 p-4 rounded-t-lg border border-gray-200 mb-2">
            <h3 className="text-center font-medium text-gray-700 uppercase tracking-wide">ASIGNATURA</h3>
          </div>
          
          {/* File listing */}
          <div className="space-y-2 mb-6">
            {isLoading ? (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
              </div>
            ) : filteredArchivos.length > 0 ? (
              filteredArchivos.map((archivo, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="flex justify-between items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-300"
                >
                  <span className="font-medium text-gray-700">{archivo}</span>
                  <div className="flex items-center">
                    <span className="text-gray-500 mr-4">{asignatura}</span>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDescargarArchivo(archivo)}
                      disabled={downloadingFile === archivo}
                      className="text-gray-700 hover:text-blue-600 transition-colors duration-300"
                    >
                      {downloadingFile === archivo ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Download className="h-5 w-5" />
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-10 text-gray-500">
                No se encontraron archivos para esta asignatura
              </div>
            )}
          </div>
          
          {/* Error message */}
          <AnimatePresence>
            {errorMessage && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start"
              >
                <AlertCircle className="mr-2 h-5 w-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Error</p>
                  <p className="text-sm">{errorMessage}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}