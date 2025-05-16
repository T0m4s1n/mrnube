'use client';

import { useState, useRef, useEffect } from "react";
import { Upload, ChevronDown, Check, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createFileSpace, uploadFile } from "../service/apiService"; // Importamos las funciones del primer archivo

export default function ProfesorDashboard() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [asignatura, setAsignatura] = useState("matematicas");
  const [isAsignaturaOpen, setIsAsignaturaOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [apiKeyError, setApiKeyError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Use state for API key to make it editable
  const [apiKey, setApiKey] = useState('profe-1234');
  const dropAreaRef = useRef<HTMLDivElement>(null);

  const asignaturas = [
    "matematicas", 
    "fisica", 
    "quimica", 
    "historia", 
    "lengua", 
    "biologia"
  ];

  useEffect(() => {
    const dropArea = dropAreaRef.current;
    
    const preventDefaults = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };
    
    const highlight = () => {
      if (dropArea) {
        (dropArea as HTMLElement).classList.add("border-blue-500", "bg-blue-50");
      }
    };
    
    const unhighlight = () => {
      if (dropArea) {
        (dropArea as HTMLElement).classList.remove("border-blue-500", "bg-blue-50");
      }
    };
    
    const handleDrop = (e: DragEvent) => {
      preventDefaults(e);
      unhighlight();
      
      const dt = e.dataTransfer;
      if (!dt) return;
      const files = dt.files;
      
      if (files.length > 0) {
        handleFileSelect(files[0]);
      }
    };
    
    if (dropArea) {
      dropArea.addEventListener('dragenter', preventDefaults, false);
      dropArea.addEventListener('dragover', preventDefaults, false);
      dropArea.addEventListener('dragleave', unhighlight, false);
      dropArea.addEventListener('drop', handleDrop, false);
      dropArea.addEventListener('dragenter', highlight, false);
    }
    
    return () => {
      if (dropArea) {
        dropArea.removeEventListener('dragenter', preventDefaults);
        dropArea.removeEventListener('dragover', preventDefaults);
        dropArea.removeEventListener('dragleave', unhighlight);
        dropArea.removeEventListener('drop', handleDrop);
        dropArea.removeEventListener('dragenter', highlight);
      }
    };
  }, []);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    // Clear any previous errors when selecting a new file
    setErrorMessage("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setErrorMessage("");
    }
  };

  const handleAsignaturaChange = (value: string) => {
    setAsignatura(value);
    setIsAsignaturaOpen(false);
  };

  const validateApiKey = () => {
    if (!apiKey || apiKey.trim() === '') {
      setApiKeyError(true);
      setErrorMessage("API Key es obligatorio");
      return false;
    }
    setApiKeyError(false);
    return true;
  };

  // Simula el progreso de subida ya que el fetch nativo no proporciona eventos de progreso
  const simulateProgress = (startProgress: number, endProgress: number, duration: number) => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsedTime = Date.now() - startTime;
      const progress = startProgress + ((elapsedTime / duration) * (endProgress - startProgress));
      
      if (progress >= endProgress) {
        setUploadProgress(endProgress);
        clearInterval(interval);
      } else {
        setUploadProgress(Math.round(progress));
      }
    }, 100);
    
    return interval;
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    // Validate API key before attempting upload
    if (!validateApiKey()) return;
    
    setIsUploading(true);
    setUploadProgress(10);
    setErrorMessage("");
    
    try {
      // Almacenamos la API key original para restaurarla después
      const originalApiKey = localStorage.getItem('X-API-Key');
      // Modificamos temporalmente el valor en el localStorage
      localStorage.setItem('X-API-Key', apiKey);
      
      console.log('PASO 1: Solicitar URL para subir archivo');
      
      // PASO 1: Obtener la URL de subida usando la función createFileSpace
      let progressInterval = simulateProgress(10, 40, 2000);
      
      const uploadUrl = await createFileSpace(
        asignatura,
        selectedFile.name,
        selectedFile.type
      );
      
      clearInterval(progressInterval);
      setUploadProgress(40);
      
      console.log('URL extraída para subida:', uploadUrl);
      
      // Validar URL antes de intentar subir el archivo
      if (!uploadUrl || typeof uploadUrl !== 'string') {
        throw new Error('No se pudo obtener una URL válida para la subida');
      }
      
      // PASO 2: Subir el archivo binario a la URL pre-firmada
      console.log('PASO 2: Subiendo archivo binario');
      console.log('URL de subida:', uploadUrl);
      console.log('Tipo de archivo:', selectedFile.type);
      console.log('Tamaño de archivo:', selectedFile.size, 'bytes');
      
      // Simulamos el progreso durante la subida
      progressInterval = simulateProgress(40, 99, 3000);
      
      // Usamos la función uploadFile para subir el archivo
      await uploadFile(
        uploadUrl,
        selectedFile,
        selectedFile.type
      );
      
      clearInterval(progressInterval);
      
      console.log('Archivo subido con éxito');
      setUploadProgress(100);
      setUploadSuccess(true);
      
      // Restauramos el valor original de la API key
      if (originalApiKey) {
        localStorage.setItem('X-API-Key', originalApiKey);
      } else {
        localStorage.removeItem('X-API-Key');
      }
      
      // Reset después de 3 segundos
      setTimeout(() => {
        setSelectedFile(null);
        setIsUploading(false);
        setUploadProgress(0);
        setUploadSuccess(false);
      }, 3000);
      
    } catch (error) {
      console.error('Error subiendo archivo:', error);
      setIsUploading(false);
      setUploadProgress(0);

      // Proporcionar mensajes de error detallados
      if (typeof error === "object" && error !== null && "response" in error) {
        const err = error as { response: { status: number; data?: { message?: string }; statusText?: string } };
        // La petición se hizo y el servidor respondió con un código diferente de 2xx
        setErrorMessage(`Error ${err.response.status}: ${err.response.data?.message || err.response.statusText || 'Error en la respuesta del servidor'}`);
      } else if (typeof error === "object" && error !== null && "request" in error) {
        // La petición se hizo pero no se recibió respuesta
        setErrorMessage('No se recibió respuesta del servidor. Verifica tu conexión.');
      } else if (typeof error === "object" && error !== null && "message" in error) {
        // Ocurrió un error al configurar la petición
        setErrorMessage((error as { message?: string }).message || 'Error al subir el archivo');
      } else {
        setErrorMessage('Error al subir el archivo');
      }
    }
  };

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
            <h1 className="text-2xl font-bold">Área de Profesores</h1>
          </div>
          <div className="flex space-x-4">
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
          {/* File upload area */}
          <motion.div 
            ref={dropAreaRef}
            whileHover={{ scale: 1.01, borderColor: "#d1d5db" }}
            className="border-2 border-dashed border-gray-300 rounded-xl h-64 flex flex-col items-center justify-center p-6 cursor-pointer transition-all duration-300"
            onClick={() => { if (fileInputRef.current) fileInputRef.current.click(); }}
          >
            {selectedFile ? (
              <>
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="text-xl font-medium mb-2"
                >
                  {selectedFile.name}
                </motion.div>
                <div className="text-sm text-gray-500 mb-4">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </div>
                {!isUploading && (
                  <motion.button 
                    whileHover={{ scale: 1.05, backgroundColor: "#374151" }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-black text-white px-6 py-2 rounded-full transition-all duration-300"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUpload();
                    }}
                  >
                    Subir Archivo
                  </motion.button>
                )}
                {isUploading && (
                  <div className="w-full max-w-xs">
                    <div className="relative pt-1">
                      <div className="flex mb-2 items-center justify-between">
                        <div>
                          <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-black bg-gray-200">
                            {uploadProgress < 100 ? "Subiendo" : "Completado"}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-semibold inline-block text-black">
                            {uploadProgress}%
                          </span>
                        </div>
                      </div>
                      <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                        <motion.div 
                          initial={{ width: "0%" }}
                          animate={{ width: `${uploadProgress}%` }}
                          transition={{ duration: 0.5 }}
                          className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                            uploadSuccess ? "bg-green-500" : "bg-black"
                          }`}
                        ></motion.div>
                      </div>
                    </div>
                    {uploadSuccess && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex items-center justify-center text-green-500"
                      >
                        <Check className="mr-1" size={16} />
                        <span>Archivo subido con éxito</span>
                      </motion.div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <>
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                >
                  <Upload className="h-16 w-16 text-gray-400 mb-2" />
                </motion.div>
                <p className="text-center text-lg text-gray-600 mb-2">
                  Arrastra y suelta tu archivo aquí
                </p>
                <p className="text-center text-sm text-gray-500">
                  o haz clic para seleccionarlo
                </p>
              </>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileChange}
            />
          </motion.div>
          
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
          
          {/* Brief tooltip for API key */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="mt-6 text-sm text-gray-500 text-center"
          >
            <p>Selecciona un archivo, verifica el API Key y haz clic en Subir Archivo</p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}