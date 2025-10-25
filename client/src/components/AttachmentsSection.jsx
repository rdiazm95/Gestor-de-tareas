import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AttachmentsSection = ({ task, onTaskUpdate }) => {
  const [attachments, setAttachments] = useState(task.attachments || []);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Sincroniza los adjuntos cuando el task se actualiza externamente
  useEffect(() => {
    if (JSON.stringify(task.attachments) !== JSON.stringify(attachments)) {
      setAttachments(task.attachments || []);
    }
  }, [task.attachments]);

  // SUBIR ARCHIVO
  const handleFileUpload = async (file) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error('El archivo es demasiado grande. Máximo 10MB');
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const token = localStorage.getItem('token');

      const response = await axios.post(
        `http://localhost:5000/api/tasks/${task._id}/attachments`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      const updatedTask = response.data.task;
      setAttachments(updatedTask.attachments || []);
      toast.success('Archivo subido correctamente');
      if (onTaskUpdate) onTaskUpdate(updatedTask);
    } catch (error) {
      console.error('Error al subir archivo:', error);
      toast.error('Error al subir archivo');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAttachment = async (attachmentId) => {
    if (!window.confirm('¿Estás seguro de eliminar este archivo?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(
        `http://localhost:5000/api/tasks/${task._id}/attachments/${attachmentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updatedTask = response.data.task;
      setAttachments(updatedTask.attachments || []);
      toast.success('Archivo eliminado correctamente');
      if (onTaskUpdate) onTaskUpdate(updatedTask);
    } catch (error) {
      console.error('Error al eliminar archivo:', error);
      toast.error('Error al eliminar archivo');
    }
  };

  const handleSelectFile = (e) => {
    const selected = e.target.files[0];
    if (selected) handleFileUpload(selected);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const getFileIcon = (fileType) => {
    const icons = {
      image: '🖼️',
      document: '📄',
      pdf: '📚',
      other: '📎',
    };
    return icons[fileType] || '📎';
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'Hace unos segundos';
    if (seconds < 3600) return `Hace ${Math.floor(seconds / 60)} min`;
    if (seconds < 86400) return `Hace ${Math.floor(seconds / 3600)} h`;
    return `Hace ${Math.floor(seconds / 86400)} días`;
  };

  // DESCARGA de archivos (forzada)
  const handleDownload = async (attachment) => {
    try {
      const response = await fetch(attachment.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = attachment.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al descargar:', error);
      toast.error('No se pudo descargar el archivo');
    }
  };

  return (
    <div className="mt-6 border-t border-gray-200 pt-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
          />
        </svg>
        Archivos Adjuntos ({attachments.length})
      </h3>

      {/* Zona de subida */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 mb-4 transition-colors ${
          dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="text-center">
          {uploading ? (
            <div>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Subiendo archivo...</p>
            </div>
          ) : (
            <>
              <svg
                className="w-12 h-12 text-gray-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p className="text-gray-700 mb-2">
                Arrastra un archivo aquí o haz click para seleccionar
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Imágenes, PDFs, documentos (Máx. 10MB)
              </p>
              <label className="inline-block">
                <input
                  type="file"
                  className="hidden"
                  onChange={handleSelectFile}
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"
                />
                <span className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 cursor-pointer transition-colors">
                  Seleccionar archivo
                </span>
              </label>
            </>
          )}
        </div>
      </div>

      {/* Lista de archivos */}
      {attachments && attachments.length > 0 ? (
        <div className="space-y-3">
          {attachments.map((a) => (
            <div
              key={a._id || a.publicId}
              className="bg-gray-50 rounded-lg p-4 flex items-center justify-between hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="text-3xl">{getFileIcon(a.fileType)}</span>
                <div className="flex-1 min-w-0">
                  <a
                    href={a.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-blue-600 hover:text-blue-800 block truncate"
                  >
                    {a.filename}
                  </a>
                  <div className="text-xs text-gray-500 mt-1">
                    {formatFileSize(a.size)} • {getTimeAgo(a.uploadedAt)}
                  </div>
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-2 ml-2">
                <button
                  onClick={() => handleDownload(a)}
                  className="p-2 text-green-600 hover:bg-green-100 rounded transition-colors"
                  title="Descargar"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                </button>

                <button
                  onClick={() => handleDeleteAttachment(a._id)}
                  className="p-2 text-red-600 hover:bg-red-100 rounded transition-colors"
                  title="Eliminar"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-4">
          No hay archivos adjuntos. Sube el primero.
        </p>
      )}
    </div>
  );
};

export default AttachmentsSection;
