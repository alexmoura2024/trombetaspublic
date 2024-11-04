import React from 'react';
import { Visitor } from '../types';

interface VisitorFormProps {
  visitor: Visitor;
  index: number;
  onChange: (index: number, field: keyof Visitor, value: string) => void;
  required?: boolean;
}

export default function VisitorForm({ visitor, index, onChange, required = true }: VisitorFormProps) {
  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    onChange(index, 'phone', formatted);
  };

  return (
    <div className="p-4 bg-gray-50 rounded-lg space-y-4">
      <h3 className="font-medium text-gray-700">Visitante {index + 1}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome {required && '*'}
          </label>
          <input
            type="text"
            value={visitor.name}
            onChange={(e) => onChange(index, 'name', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            required={required}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Telefone {required && '*'}
          </label>
          <input
            type="tel"
            value={visitor.phone}
            onChange={handlePhoneChange}
            placeholder="(00) 00000-0000"
            maxLength={15}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            required={required}
          />
        </div>
      </div>
    </div>
  );
}