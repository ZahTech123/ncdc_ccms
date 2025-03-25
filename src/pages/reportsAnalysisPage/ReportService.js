// utils/reportService.js
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const generateDashboardReport = async (dashboardRefs, fileName = 'dashboard-report', filters = {}) => {
  try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    let position = 20;
    
    // Add professional cover page
    pdf.setFontSize(24);
    pdf.setTextColor(40);
    pdf.text('Complaint Dashboard Report', 105, 30, { align: 'center' });
    
    // Add logo if available (replace with your actual logo path)
    // const logo = await loadImage('/path/to/logo.png');
    // pdf.addImage(logo, 'PNG', 80, 40, 50, 50);
    
    // Report metadata
    pdf.setFontSize(14);
    pdf.text(`Generated: ${new Date().toLocaleString()}`, 105, 90, { align: 'center' });
    
    // Filter information section
    pdf.setFontSize(16);
    pdf.text('Report Filters', 105, 110, { align: 'center' });
    
    pdf.setFontSize(12);
    pdf.text(`Date Range: ${filters.startDate ? new Date(filters.startDate).toLocaleDateString() : 'None'} to ${filters.endDate ? new Date(filters.endDate).toLocaleDateString() : 'None'}`, 105, 120, { align: 'center' });
    pdf.text(`Total Tickets: ${filters.resultsCount || 0}`, 105, 130, { align: 'center' });
    pdf.text(`User Role: ${filters.role || 'All'}`, 105, 140, { align: 'center' });
    
    pdf.addPage();

    // Capture each section with improved quality
    for (const ref of dashboardRefs) {
      if (!ref.current) continue;
      
      const canvas = await html2canvas(ref.current, {
        scale: 3, // Higher scale for better quality
        useCORS: true,
        allowTaint: true,
        logging: true,
        backgroundColor: '#4B5563' // Match your dashboard background
      });
      
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 190; // A4 width - margins
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Add new page if needed
      if (position + imgHeight > 270) {
        pdf.addPage();
        position = 20;
      }
      
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      position += imgHeight + 15;
    }

    // Add footer to each page
    const pageCount = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(10);
      pdf.setTextColor(150);
      pdf.text(`Page ${i} of ${pageCount}`, 105, 287, { align: 'center' });
      pdf.text('Confidential', 200, 287, { align: 'right' });
    }

    // Save the PDF with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    pdf.save(`${fileName}-${timestamp}.pdf`);
    
    return true;
  } catch (error) {
    console.error('Error generating report:', error);
    return false;
  }
};