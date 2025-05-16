// apiService.js

interface CreateFileResponse {
  statusCode: number;
  body: string;
}

interface ListFilesResponse {
  archivos: string[];
}

interface DownloadFileResponse {
  url: string;
}

export const createFileSpace = async (
  asignatura: string,
  nombre_archivo: string,
  tipo_contenido: string
): Promise<string> => {
  try {
    console.log(`Creating file space for: ${asignatura}/${nombre_archivo} (${tipo_contenido})`);
    
    const response = await fetch('https://tbk7w2ivb0.execute-api.us-east-2.amazonaws.com/dev/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'profe-1234'
      },
      body: JSON.stringify({
        asignatura,
        nombre_archivo,
        tipo_contenido
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API returned status ${response.status}: ${errorText}`);
      throw new Error(`Error en la creación del espacio: ${response.status}`);
    }

    const data = await response.json() as CreateFileResponse;
    
    // The API returns a response where the URL is in the body property as a string
    // But the string itself might contain "{url:actualUrl}" format
    // We need to extract the actual URL
    let uploadUrl = data.body.replace(/"/g, '').trim();
    
    // Check if the URL is in the format "{url:actualUrl}" and extract the actual URL
    if (uploadUrl.startsWith('{url:')) {
      uploadUrl = uploadUrl.substring(5, uploadUrl.length - 1);
    }
    
    console.log(`Got upload URL: ${uploadUrl}`);
    return uploadUrl;
  } catch (error) {
    console.error('Error creando el espacio para el archivo:', error);
    throw error;
  }
};

export const uploadFile = async (url: string, file: File, contentType: string): Promise<void> => {
  try {
    // Make sure the URL is properly formatted
    if (!url.startsWith('http')) {
      throw new Error('URL inválida para subir el archivo');
    }
    
    console.log(`Uploading file to ${url}`);
    console.log(`File type: ${file.type}, Size: ${file.size} bytes, Content-Type header: ${contentType}`);
    
    // Read the file as an ArrayBuffer first
    const fileBuffer = await file.arrayBuffer();
    
    // Create a binary blob with the correct content type
    const blob = new Blob([fileBuffer], { type: contentType });
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': contentType
      },
      body: blob
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Upload failed with status ${response.status}: ${errorText}`);
      throw new Error(`Error al subir el archivo: ${response.status}`);
    }
    
    console.log('File uploaded successfully');
  } catch (error) {
    console.error('Error subiendo el archivo:', error);
    throw error;
  }
};

export const listFiles = async (asignatura: string): Promise<string[]> => {
  try {
    const response = await fetch(`https://tbk7w2ivb0.execute-api.us-east-2.amazonaws.com/dev/?asignatura=${asignatura}`, {
      method: 'GET',
      headers: {
        'X-API-Key': 'alumno-5678'
      }
    });

    if (!response.ok) {
      throw new Error(`Error al listar archivos: ${response.status}`);
    }

    const data = await response.json() as ListFilesResponse;
    return data.archivos;
  } catch (error) {
    console.error('Error listando archivos:', error);
    throw error;
  }
};

export const getDownloadUrl = async (asignatura: string, archivo: string): Promise<string> => {
  try {
    const response = await fetch(`https://tbk7w2ivb0.execute-api.us-east-2.amazonaws.com/dev/download?asignatura=${asignatura}&archivo=${archivo}`, {
      method: 'GET',
      headers: {
        'X-API-Key': 'alumno-5678'
      }
    });

    if (!response.ok) {
      throw new Error(`Error al obtener URL de descarga: ${response.status}`);
    }

    const data = await response.json() as DownloadFileResponse;
    return data.url;
  } catch (error) {
    console.error('Error obteniendo URL de descarga:', error);
    throw error;
  }
};

export const downloadFile = async (url: string, fileName: string): Promise<void> => {
  try {
    console.log(`Downloading file from ${url}`);
    
    // Fetch the file as a blob
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Error al descargar el archivo: ${response.status}`);
    }
    
    // Convert to a blob
    const blob = await response.blob();
    
    // Create a temporary download link
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = fileName;
    
    // Append to body, trigger click to download, and clean up
    document.body.appendChild(link);
    link.click();
    window.URL.revokeObjectURL(downloadUrl);
    document.body.removeChild(link);
    
    console.log('File download successful');
  } catch (error) {
    console.error('Error descargando el archivo:', error);
    throw error;
  }
};