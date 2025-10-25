import React, { useState, useEffect } from 'react';
import { commentService } from '../services/commentService';
import { useAuth } from '../context/AuthContext';
import socket from '../services/socket';
import toast from 'react-hot-toast';

const CommentsSection = ({ taskId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [loading, setLoading] = useState(true);
  
  const { user } = useAuth();

  useEffect(() => {
    loadComments();
    setupSocketListeners();

    return () => {
      socket.off('commentCreated');
      socket.off('commentUpdated');
      socket.off('commentDeleted');
    };
  }, [taskId]);

  const loadComments = async () => {
    try {
      const response = await commentService.getByTask(taskId);
      setComments(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar comentarios:', error);
      toast.error('Error al cargar comentarios');
      setLoading(false);
    }
  };

  const setupSocketListeners = () => {
    socket.on('commentCreated', ({ taskId: commentTaskId, comment }) => {
      if (commentTaskId === taskId) {
        setComments(prev => [comment, ...prev]);
      }
    });

    socket.on('commentUpdated', (updatedComment) => {
      if (updatedComment.task === taskId) {
        setComments(prev =>
          prev.map(c => c._id === updatedComment._id ? updatedComment : c)
        );
      }
    });

    socket.on('commentDeleted', ({ commentId, taskId: commentTaskId }) => {
      if (commentTaskId === taskId) {
        setComments(prev => prev.filter(c => c._id !== commentId));
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await commentService.create(taskId, newComment);
      setNewComment('');
      toast.success('Comentario añadido');
    } catch (error) {
      console.error('Error al crear comentario:', error);
      toast.error('Error al crear comentario');
    }
  };

  const handleEdit = (comment) => {
    setEditingId(comment._id);
    setEditContent(comment.content);
  };

  const handleUpdate = async (commentId) => {
    if (!editContent.trim()) return;

    try {
      await commentService.update(commentId, editContent);
      setEditingId(null);
      setEditContent('');
      toast.success('Comentario actualizado');
    } catch (error) {
      console.error('Error al actualizar comentario:', error);
      toast.error('Error al actualizar comentario');
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este comentario?')) {
      return;
    }

    try {
      await commentService.delete(commentId);
      toast.success('Comentario eliminado');
    } catch (error) {
      console.error('Error al eliminar comentario:', error);
      toast.error('Error al eliminar comentario');
    }
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    if (seconds < 60) return 'Hace unos segundos';
    if (seconds < 3600) return `Hace ${Math.floor(seconds / 60)} minutos`;
    if (seconds < 86400) return `Hace ${Math.floor(seconds / 3600)} horas`;
    return `Hace ${Math.floor(seconds / 86400)} días`;
  };

  if (loading) {
    return <div className="text-center py-4">Cargando comentarios...</div>;
  }

  return (
    <div className="mt-6 border-t border-gray-200 pt-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        Comentarios ({comments.length})
      </h3>

      {/* Formulario para nuevo comentario */}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Escribe un comentario..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            type="submit"
            disabled={!newComment.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Enviar
          </button>
        </div>
      </form>

      {/* Lista de comentarios */}
      {comments.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No hay comentarios aún. ¡Sé el primero en comentar!</p>
      ) : (
        <div className="space-y-4">
          {comments.map(comment => (
            <div key={comment._id} className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="font-medium text-gray-900">{comment.author.name}</span>
                  <span className="text-xs text-gray-500 ml-2">{getTimeAgo(comment.createdAt)}</span>
                  {comment.createdAt !== comment.updatedAt && (
                    <span className="text-xs text-gray-400 ml-1">(editado)</span>
                  )}
                </div>
                
                {comment.author._id === user?._id && (
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(comment)}
                      className="text-blue-600 hover:text-blue-800 p-1"
                      title="Editar"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(comment._id)}
                      className="text-red-600 hover:text-red-800 p-1"
                      title="Eliminar"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>

              {editingId === comment._id ? (
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="flex-1 px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                    autoFocus
                  />
                  <button
                    onClick={() => handleUpdate(comment._id)}
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                  >
                    Guardar
                  </button>
                  <button
                    onClick={() => {
                      setEditingId(null);
                      setEditContent('');
                    }}
                    className="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 text-sm"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <p className="text-gray-700">{comment.content}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentsSection;
