import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export async function generatePDFReport(elementId: string, fileName: string = 'retirement-plan.pdf') {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found`);
    return;
  }

  try {
    // Wait for animations and images
    await new Promise(r => setTimeout(r, 500));

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#0a0a0a',
      logging: false,
      onclone: (clonedDoc) => {
        const clonedElement = clonedDoc.getElementById(elementId);
        if (clonedElement) {
          clonedElement.style.display = 'block';
          clonedElement.style.visibility = 'visible';
          clonedElement.style.height = 'auto';
          clonedElement.style.overflow = 'visible';
          clonedElement.style.padding = '40px';
          clonedElement.style.width = '800px';
        }

        // html2canvas doesn't support oklch, replace with simple hex
        clonedDoc.querySelectorAll('*').forEach((el: any) => {
          const style = clonedDoc.defaultView?.getComputedStyle(el);
          if (style) {
            if (style.color.includes('oklch')) el.style.color = '#ffffff';
            if (style.backgroundColor.includes('oklch')) el.style.backgroundColor = '#14b8a6';
            if (style.borderColor.includes('oklch')) el.style.borderColor = '#262626';
          }
        });
      }
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    let heightLeft = imgHeight;
    let position = 0;

    // First page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;

    // Subsequent pages
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }
    
    pdf.save(fileName);
  } catch (error) {
    console.error('PDF Generation Error:', error);
  }
}
