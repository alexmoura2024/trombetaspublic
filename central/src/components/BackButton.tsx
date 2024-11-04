import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function BackButton() {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate('/')}
      className="absolute top-4 left-4 p-2 text-gray-600 hover:text-gray-800 flex items-center gap-2 transition-colors"
    >
      <ArrowLeft size={20} />
      <span>Voltar</span>
    </button>
  );
}