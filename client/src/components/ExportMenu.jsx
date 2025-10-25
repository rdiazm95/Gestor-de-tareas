import React, { useState } from 'react';
import { exportToCSV, exportToExcel, exportProjectStats } from '../utils/exportUtils';

const ExportMenu = ({ tasks, projects, selectedProject }) => {
  const [showMenu, setShowMenu] = useState(false);

  const handleExportCSV = () => {
    const projectName = selectedProject?.name || 'Todas';
    exportToCSV(tasks, projectName);
    setShowMenu(false);
  };

  const handleExportExcel = () => {
    const projectName = selectedProject?.name || 'Todas';
    exportToExcel(tasks, projectName);
    setShowMenu(false);
  };

  const handleExportStats = () => {
    const projectName = selectedProject?.name || 'Global';
    exportProjectStats(tasks, projects, projectName);
    setShowMenu(false);
  };

  return (
    <div className="relative">
      <button
  onClick={() => setShowMenu(!showMenu)}
  className="flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors font-medium shadow-md"
>
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
  Exportar
</button>

      {showMenu && (
        <>
          {/* Overlay para cerrar al hacer click fuera */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setShowMenu(false)}
          />
          
          {/* Menú desplegable */}
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-20">
            <div className="p-2">
              <button
                onClick={handleExportCSV}
                className="w-full text-left px-4 py-3 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-3"
              >
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div>
                  <div className="font-medium text-gray-900">Exportar CSV</div>
                  <div className="text-xs text-gray-500">Formato estándar</div>
                </div>
              </button>

              <button
                onClick={handleExportExcel}
                className="w-full text-left px-4 py-3 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-3"
              >
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <div>
                  <div className="font-medium text-gray-900">Exportar Excel</div>
                  <div className="text-xs text-gray-500">Optimizado para Excel</div>
                </div>
              </button>

              <button
                onClick={handleExportStats}
                className="w-full text-left px-4 py-3 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-3"
              >
                <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <div>
                  <div className="font-medium text-gray-900">Estadísticas</div>
                  <div className="text-xs text-gray-500">Resumen del proyecto</div>
                </div>
              </button>
            </div>

            <div className="border-t border-gray-200 p-3 bg-gray-50 rounded-b-lg">
              <p className="text-xs text-gray-600">
                📊 {tasks.length} tareas
                {selectedProject && ` en ${selectedProject.name}`}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ExportMenu;
