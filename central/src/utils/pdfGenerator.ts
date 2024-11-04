import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Registration } from '../types';
import { Member } from '../data/members';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export const generatePDF = (data: (Registration & { id: string })[], group: string) => {
  const doc = new jsPDF();

  // Add title
  doc.setFontSize(16);
  doc.text(
    `Relatório de Visitantes - ${group === 'all' ? 'Todos os Grupos' : group}`,
    14,
    15
  );

  // Add date
  doc.setFontSize(10);
  doc.text(`Gerado em: ${new Date().toLocaleDateString()}`, 14, 25);

  const tableData = data.map(registration => [
    registration.memberName,
    registration.assistanceGroup,
    registration.visitors.map(v => `${v.name} (${v.phone})`).join('\n'),
    registration.timestamp.toDate().toLocaleDateString()
  ]);

  doc.autoTable({
    startY: 35,
    head: [['Membro', 'Grupo', 'Visitantes', 'Data']],
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
      // Add footer
      doc.setFontSize(8);
      doc.text(
        `Página ${data.pageNumber}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }
  });

  // Save the PDF
  doc.save(`relatorio-visitantes-${group.toLowerCase().replace(' ', '-')}.pdf`);
};

export const generateMissingMembersPDF = (missingMembers: Member[], group: string) => {
  const doc = new jsPDF();

  // Add title
  doc.setFontSize(16);
  doc.text(
    `Membros sem Registro de Visitantes - ${group === 'all' ? 'Todos os Grupos' : group}`,
    14,
    15
  );

  // Add date
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
      // Add footer
      doc.setFontSize(8);
      doc.text(
        `Página ${data.pageNumber}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }
  });

  // Save the PDF
  doc.save(`relatorio-membros-sem-registro-${group.toLowerCase().replace(' ', '-')}.pdf`);
};