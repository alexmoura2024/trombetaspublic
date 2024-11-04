import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Registration } from '../types';
import { Member } from '../data/members';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface GroupedRegistration {
  memberName: string;
  assistanceGroup: string;
  visitors: { name: string; phone: string }[];
  timestamps: Date[];
}

const groupRegistrationsByMember = (registrations: (Registration & { id: string })[]) => {
  const grouped = registrations.reduce((acc: { [key: string]: GroupedRegistration }, curr) => {
    if (!acc[curr.memberName]) {
      acc[curr.memberName] = {
        memberName: curr.memberName,
        assistanceGroup: curr.assistanceGroup,
        visitors: [],
        timestamps: []
      };
    }
    
    curr.visitors.forEach(visitor => {
      const visitorExists = acc[curr.memberName].visitors.some(
        v => v.name === visitor.name
      );
      if (!visitorExists) {
        acc[curr.memberName].visitors.push(visitor);
      }
    });
    
    acc[curr.memberName].timestamps.push(curr.timestamp.toDate());
    
    return acc;
  }, {});

  return Object.values(grouped);
};

export const generatePDF = (data: (Registration & { id: string })[], group: string) => {
  const doc = new jsPDF();
  const groupedData = groupRegistrationsByMember(data);

  doc.setFontSize(16);
  doc.text(
    `Relatório de Visitantes - ${group === 'all' ? 'Todos os Grupos' : group}`,
    14,
    15
  );

  doc.setFontSize(10);
  doc.text(`Gerado em: ${new Date().toLocaleDateString()}`, 14, 25);

  const tableData = groupedData.map(registration => [
    registration.memberName,
    registration.assistanceGroup,
    registration.visitors.map(v => `${v.name} (${v.phone})`).join('\n'),
    registration.timestamps
      .sort((a, b) => b.getTime() - a.getTime())
      .map(t => t.toLocaleDateString())
      .join('\n')
  ]);

  doc.autoTable({
    startY: 35,
    head: [['Membro', 'Grupo', 'Visitantes', 'Datas de Registro']],
    body: tableData,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: 40 },
      1: { cellWidth: 25 },
      2: { cellWidth: 85 },
      3: { cellWidth: 25 }
    },
    headStyles: {
      fillColor: [220, 38, 38],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    didDrawPage: (data) => {
      doc.setFontSize(8);
      doc.text(
        `Página ${data.pageNumber}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }
  });

  doc.save(`relatorio-visitantes-${group.toLowerCase().replace(' ', '-')}.pdf`);
};

export const generatePrayerListPDF = (data: (Registration & { id: string })[], group: string) => {
  const doc = new jsPDF();
  const groupedData = groupRegistrationsByMember(data);

  doc.setFontSize(16);
  doc.text(
    `Lista de Oração - ${group === 'all' ? 'Todos os Grupos' : group}`,
    14,
    15
  );

  doc.setFontSize(10);
  doc.text(`Gerado em: ${new Date().toLocaleDateString()}`, 14, 25);

  const tableData = groupedData.map(registration => [
    registration.memberName,
    registration.visitors.map(v => v.name).join('; ')
  ]);

  doc.autoTable({
    startY: 35,
    head: [['Membro', 'Visitantes']],
    body: tableData,
    theme: 'grid',
    styles: { fontSize: 10, cellPadding: 4 },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 110 }
    },
    headStyles: {
      fillColor: [220, 38, 38],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    didDrawPage: (data) => {
      doc.setFontSize(8);
      doc.text(
        `Página ${data.pageNumber}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }
  });

  doc.save(`lista-de-oracao-${group.toLowerCase().replace(' ', '-')}.pdf`);
};

export const generateMissingMembersPDF = (missingMembers: Member[], group: string) => {
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text(
    `Membros sem Registro de Visitantes - ${group === 'all' ? 'Todos os Grupos' : group}`,
    14,
    15
  );

  doc.setFontSize(10);
  doc.text(`Gerado em: ${new Date().toLocaleDateString()}`, 14, 25);

  const tableData = missingMembers.map(member => [
    member.name,
    member.group,
    member.category
  ]);

  doc.autoTable({
    startY: 35,
    head: [['Membro', 'Grupo', 'Categoria']],
    body: tableData,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 30 },
      2: { cellWidth: 65 }
    },
    headStyles: {
      fillColor: [220, 38, 38],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    didDrawPage: (data) => {
      doc.setFontSize(8);
      doc.text(
        `Página ${data.pageNumber}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }
  });

  doc.save(`relatorio-membros-sem-registro-${group.toLowerCase().replace(' ', '-')}.pdf`);
};