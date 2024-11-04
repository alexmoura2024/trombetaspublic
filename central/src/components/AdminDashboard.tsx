import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Registration } from '../types';
import { Download, Edit2, Save, Trash2, LogOut } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { generatePDF, generateMissingMembersPDF } from '../utils/pdfGenerator';
import { members } from '../data/members';
import BackButton from './BackButton';

export default function AdminDashboard() {
  const [registrations, setRegistrations] = useState<(Registration & { id: string })[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchRegistrations = async () => {
    const querySnapshot = await getDocs(collection(db, 'registrations'));
    const data = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as (Registration & { id: string })[];
    
    setRegistrations(data.sort((a, b) => 
      b.timestamp.toDate().getTime() - a.timestamp.toDate().getTime()
    ));
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('isAdmin');
    navigate('/');
  };

  const handleEdit = (id: string) => {
    setEditingId(id);
  };

  const handleSave = async (registration: Registration & { id: string }) => {
    try {
      await updateDoc(doc(db, 'registrations', registration.id), {
        memberName: registration.memberName,
        assistanceGroup: registration.assistanceGroup,
        visitors: registration.visitors
      });
      setEditingId(null);
      toast.success('Registro atualizado com sucesso!');
      await fetchRegistrations();
    } catch (error) {
      toast.error('Erro ao atualizar registro');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este registro?')) {
      try {
        await deleteDoc(doc(db, 'registrations', id));
        toast.success('Registro excluído com sucesso!');
        await fetchRegistrations();
      } catch (error) {
        toast.error('Erro ao excluir registro');
      }
    }
  };

  const handleGenerateReport = () => {
    const filteredData = selectedGroup === 'all'
      ? registrations
      : registrations.filter(r => r.assistanceGroup === selectedGroup);
    
    generatePDF(filteredData, selectedGroup);
  };

  const handleGenerateMissingReport = () => {
    const registeredMembers = new Set(registrations.map(r => r.memberName));
    const missingMembers = members.filter(member => 
      (selectedGroup === 'all' || member.group === selectedGroup) && 
      !registeredMembers.has(member.name)
    );

    generateMissingMembersPDF(missingMembers, selectedGroup);
  };

  const filteredRegistrations = selectedGroup === 'all'
    ? registrations
    : registrations.filter(r => r.assistanceGroup === selectedGroup);

  const getMissingMembersCount = () => {
    const registeredMembers = new Set(registrations.map(r => r.memberName));
    return members.filter(member => 
      (selectedGroup === 'all' || member.group === selectedGroup) && 
      !registeredMembers.has(member.name)
    ).length;
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Painel Administrativo</h1>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700"
            >
              <LogOut size={20} />
              Sair
            </button>
          </div>

          <div className="flex flex-wrap gap-4 mb-6">
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">Todos os Grupos</option>
              {Array.from(new Set(members.map(m => m.group))).sort().map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>

            <button
              onClick={handleGenerateReport}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <Download size={20} />
              Relatório de Visitantes
            </button>

            <button
              onClick={handleGenerateMissingReport}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
            >
              <Download size={20} />
              Membros sem Registro ({getMissingMembersCount()})
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Membro
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Grupo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Visitantes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRegistrations.map((registration) => (
                  <tr key={registration.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingId === registration.id ? (
                        <select
                          value={registration.memberName}
                          onChange={(e) => {
                            const updated = { ...registration, memberName: e.target.value };
                            const member = members.find(m => m.name === e.target.value);
                            if (member) {
                              updated.assistanceGroup = member.group;
                            }
                            setRegistrations(registrations.map(r => 
                              r.id === registration.id ? updated : r
                            ));
                          }}
                          className="px-2 py-1 border rounded"
                        >
                          {members.map((member) => (
                            <option key={member.name} value={member.name}>
                              {member.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        registration.memberName
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {registration.assistanceGroup}
                    </td>
                    <td className="px-6 py-4">
                      {registration.visitors.map((v, i) => (
                        <div key={i} className="text-sm">
                          {editingId === registration.id ? (
                            <div className="flex gap-2 mb-1">
                              <input
                                type="text"
                                value={v.name}
                                onChange={(e) => {
                                  const updatedVisitors = [...registration.visitors];
                                  updatedVisitors[i] = { ...v, name: e.target.value };
                                  const updated = { ...registration, visitors: updatedVisitors };
                                  setRegistrations(registrations.map(r => 
                                    r.id === registration.id ? updated : r
                                  ));
                                }}
                                className="px-2 py-1 border rounded w-full"
                                placeholder="Nome"
                              />
                              <input
                                type="text"
                                value={v.phone}
                                onChange={(e) => {
                                  const updatedVisitors = [...registration.visitors];
                                  updatedVisitors[i] = { ...v, phone: e.target.value };
                                  const updated = { ...registration, visitors: updatedVisitors };
                                  setRegistrations(registrations.map(r => 
                                    r.id === registration.id ? updated : r
                                  ));
                                }}
                                className="px-2 py-1 border rounded w-full"
                                placeholder="Telefone"
                              />
                            </div>
                          ) : (
                            <div>
                              {v.name} - {v.phone}
                            </div>
                          )}
                        </div>
                      ))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {registration.timestamp.toDate().toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {editingId === registration.id ? (
                        <button
                          onClick={() => handleSave(registration)}
                          className="text-green-600 hover:text-green-900 mr-4"
                        >
                          <Save size={20} />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleEdit(registration.id)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          <Edit2 size={20} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(registration.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <BackButton />
      <Toaster position="top-right" />
    </div>
  );
}