import React, { useState } from 'react';
import { UserPlus, AlertCircle, Loader2, Lock } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Visitor, Registration } from '../types';
import VisitorForm from './VisitorForm';
import toast, { Toaster } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { getSortedMembers, getSortedGroups } from '../data/members';
import { churchConfig } from '../config/church';

export default function RegistrationForm() {
  const [memberName, setMemberName] = useState('');
  const [group, setGroup] = useState('GRUPO 01');
  const [visitors, setVisitors] = useState<Visitor[]>([
    { name: '', phone: '' },
    { name: '', phone: '' },
    { name: '', phone: '' }
  ]);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const sortedMembers = getSortedMembers();
  const sortedGroups = getSortedGroups();

  const handleMemberSelect = (selectedName: string) => {
    setMemberName(selectedName);
    const selectedMember = sortedMembers.find(m => m.name === selectedName);
    if (selectedMember) {
      setGroup(selectedMember.group);
    }
  };

  const validateForm = () => {
    if (!memberName) {
      setError('Por favor, insira o nome do membro.');
      return false;
    }

    const filledVisitors = visitors.filter(v => v.name !== '' || v.phone !== '');
    
    if (filledVisitors.length === 0) {
      setError('Por favor, insira pelo menos um visitante.');
      return false;
    }

    if (filledVisitors.some(v => !v.name || !v.phone)) {
      setError('Por favor, preencha o nome e telefone dos visitantes iniciados.');
      return false;
    }

    const phoneRegex = /^\([0-9]{2}\) [0-9]{5}-[0-9]{4}$/;
    if (filledVisitors.some(v => !phoneRegex.test(v.phone))) {
      setError('Por favor, insira um número de telefone válido no formato (00) 00000-0000.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const filledVisitors = visitors.filter(v => v.name !== '' && v.phone !== '');
      
      const registration: Registration = {
        memberName,
        assistanceGroup: group,
        visitors: filledVisitors,
        timestamp: new Date(),
      };

      await addDoc(collection(db, 'registrations'), registration);
      
      setShowSuccess(true);
      
      setTimeout(() => {
        setShowSuccess(false);
        setMemberName('');
        setGroup('GRUPO 01');
        setVisitors([
          { name: '', phone: '' },
          { name: '', phone: '' },
          { name: '', phone: '' }
        ]);
      }, 3000);
      
    } catch (err) {
      console.error('Error adding document: ', err);
      toast.error('Erro ao salvar o registro. Por favor, tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-green-600 text-5xl mb-4">✓</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Registro Concluído!</h2>
          <p className="text-gray-600 mb-4">
            {memberName} registrou {visitors.filter(v => v.name !== '').length} visitante(s) com sucesso.
          </p>
          <p className="text-sm text-gray-500">Retornando ao formulário em alguns segundos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-red-700 mb-2">
                {churchConfig.name}
              </h1>
              <h2 className="text-xl text-gray-600">{churchConfig.unit}</h2>
              <h3 className="text-lg text-gray-500">{churchConfig.event}</h3>
              <h4 className="text-md text-gray-500 mt-1">{churchConfig.formTitle}</h4>
            </div>
            <Link
              to="/admin"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
            >
              <Lock size={20} />
              <span className="text-sm">Admin</span>
            </Link>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome do Membro *
              </label>
              <select
                value={memberName}
                onChange={(e) => handleMemberSelect(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              >
                <option value="">Selecione um membro</option>
                {sortedMembers.map((member) => (
                  <option key={member.name} value={member.name}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Grupo de Assistência *
              </label>
              <input
                type="text"
                value={group}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Visitantes</h2>
                <p className="text-sm text-gray-500">Preencha 1, 2 ou 3 visitantes</p>
              </div>

              {visitors.map((visitor, index) => (
                <VisitorForm
                  key={index}
                  visitor={visitor}
                  index={index}
                  onChange={(index, field, value) => {
                    const newVisitors = [...visitors];
                    newVisitors[index][field] = value;
                    setVisitors(newVisitors);
                  }}
                  required={false}
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-red-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-red-700 transition-colors duration-200 disabled:bg-red-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Cadastrando...
                </>
              ) : (
                <>
                  <UserPlus size={20} />
                  Cadastrar
                </>
              )}
            </button>
          </form>
        </div>
      </div>
      <Toaster position="top-right" />
    </div>
  );
}