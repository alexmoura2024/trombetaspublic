import React, { useState } from 'react';
import { UserPlus, AlertCircle, Loader2, Lock, CheckCircle2, X } from 'lucide-react';
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
  const [group, setGroup] = useState('Grupo 1');
  const [visitors, setVisitors] = useState<Visitor[]>([
    { name: '', phone: '' },
    { name: '', phone: '' },
    { name: '', phone: '' }
  ]);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successData, setSuccessData] = useState<{memberName: string, visitors: Visitor[]} | null>(null);

  const sortedMembers = getSortedMembers();
  const sortedGroups = getSortedGroups();

  const handleAddVisitor = () => {
    if (visitors.length < 20) {
      setVisitors([...visitors, { name: '', phone: '' }]);
    } else {
      toast.error('Máximo de 20 visitantes permitido');
    }
  };

  const handleMemberSelect = (selectedName: string) => {
    setMemberName(selectedName);
    const selectedMember = sortedMembers.find(m => m.name === selectedName);
    if (selectedMember) {
      setGroup(selectedMember.group);
    }
  };

  const handleVisitorChange = (index: number, field: keyof Visitor, value: string) => {
    const newVisitors = [...visitors];
    newVisitors[index][field] = value;
    setVisitors(newVisitors);
  };

  const validateForm = () => {
    if (!memberName) {
      setError('Por favor, insira o nome do membro.');
      return false;
    }

    // Filter out empty visitor entries
    const filledVisitors = visitors.filter(v => v.name !== '' || v.phone !== '');
    
    if (filledVisitors.length === 0) {
      setError('Por favor, preencha os dados de pelo menos um visitante.');
      return false;
    }

    // Check if any filled visitor has missing information
    if (filledVisitors.some(v => !v.name || !v.phone)) {
      setError('Por favor, preencha todos os dados dos visitantes preenchidos.');
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
      // Filter out empty visitor entries before submitting
      const filledVisitors = visitors.filter(v => v.name !== '' && v.phone !== '');

      const registration: Registration = {
        memberName,
        assistanceGroup: group,
        visitors: filledVisitors,
        timestamp: new Date(),
      };

      await addDoc(collection(db, 'registrations'), registration);
      setSuccessData({ memberName, visitors: filledVisitors });
      setShowSuccess(true);
    } catch (err) {
      console.error('Error adding document: ', err);
      toast.error('Erro ao salvar o registro. Por favor, tente novamente.');
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    window.close();
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 py-6 sm:py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 text-center">
            <div className="flex justify-center mb-6">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Cadastro Realizado!
            </h2>
            
            <div className="mb-6 text-left">
              <p className="text-gray-600 mb-4">
                <span className="font-semibold">Membro:</span> {successData?.memberName}
              </p>
              
              <div className="space-y-2">
                <p className="font-semibold text-gray-600">Visitantes:</p>
                {successData?.visitors.map((visitor, index) => (
                  <p key={index} className="text-gray-600 pl-4">
                    • {visitor.name}
                  </p>
                ))}
              </div>
            </div>

            <button
              onClick={handleClose}
              className="w-full bg-red-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-red-700 transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <X size={20} />
              Fechar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-red-700 mb-2">
                {churchConfig.name}
              </h1>
              <h2 className="text-lg sm:text-xl text-gray-600">{churchConfig.unit}</h2>
              <h3 className="text-base sm:text-lg text-gray-500">{churchConfig.event}</h3>
              <h4 className="text-sm sm:text-md text-gray-500 mt-1">{churchConfig.formTitle}</h4>
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
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Visitantes</h2>
                  <p className="text-sm text-gray-500">Preencha os dados de 1 a 20 visitantes</p>
                </div>
                <button
                  type="button"
                  onClick={handleAddVisitor}
                  className="inline-flex items-center gap-2 text-sm text-red-600 hover:text-red-700"
                  disabled={visitors.length >= 20}
                >
                  <UserPlus size={20} />
                  Adicionar Visitante
                </button>
              </div>

              {visitors.map((visitor, index) => (
                <VisitorForm
                  key={index}
                  visitor={visitor}
                  index={index}
                  onChange={handleVisitorChange}
                  required={false}
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-red-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-red-700 transition-colors duration-200 disabled:bg-red-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Cadastrando...
                </>
              ) : (
                'Cadastrar'
              )}
            </button>
          </form>
        </div>
      </div>
      <Toaster position="top-right" />
    </div>
  );
}