import React, { useState } from 'react';

const PREDEFINED_TAGS = [
  'Frontend', 'Backend', 'Diseño', 'Bug', 'Feature', 
  'Testing', 'Documentación', 'Urgente', 'Reunión', 'Investigación'
];

const TAG_COLORS = [
  'bg-red-100 text-red-700 border-red-300',
  'bg-blue-100 text-blue-700 border-blue-300',
  'bg-green-100 text-green-700 border-green-300',
  'bg-yellow-100 text-yellow-700 border-yellow-300',
  'bg-purple-100 text-purple-700 border-purple-300',
  'bg-pink-100 text-pink-700 border-pink-300',
  'bg-indigo-100 text-indigo-700 border-indigo-300',
  'bg-orange-100 text-orange-700 border-orange-300',
];

const getTagColor = (tag) => {
  const index = tag.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return TAG_COLORS[index % TAG_COLORS.length];
};

const TagSelector = ({ selectedTags, onChange }) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleAddTag = (tag) => {
    if (tag && !selectedTags.includes(tag)) {
      onChange([...selectedTags, tag]);
      setInputValue('');
      setShowSuggestions(false);
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    onChange(selectedTags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      handleAddTag(inputValue.trim());
    }
  };

  const filteredSuggestions = PREDEFINED_TAGS.filter(
    tag => tag.toLowerCase().includes(inputValue.toLowerCase()) && !selectedTags.includes(tag)
  );

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Etiquetas
      </label>
      
      {/* Etiquetas seleccionadas */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedTags.map(tag => (
            <span
              key={tag}
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getTagColor(tag)}`}
            >
              {tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="hover:opacity-70"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input de búsqueda */}
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          placeholder="Escribe o selecciona una etiqueta..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        {/* Sugerencias */}
        {showSuggestions && inputValue && filteredSuggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto">
            {filteredSuggestions.map(tag => (
              <button
                key={tag}
                type="button"
                onClick={() => handleAddTag(tag)}
                className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Etiquetas predefinidas */}
      <div className="mt-2">
        <p className="text-xs text-gray-500 mb-2">Etiquetas comunes:</p>
        <div className="flex flex-wrap gap-2">
          {PREDEFINED_TAGS.filter(tag => !selectedTags.includes(tag)).slice(0, 5).map(tag => (
            <button
              key={tag}
              type="button"
              onClick={() => handleAddTag(tag)}
              className={`px-2 py-1 rounded-full text-xs font-medium border hover:opacity-80 ${getTagColor(tag)}`}
            >
              + {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TagSelector;
