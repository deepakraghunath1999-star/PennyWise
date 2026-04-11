import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export async function generatePDFReport(elementId: string, fileName: string = 'retirement-plan.pdf') {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found`);
    return;
  }

  try {
    // Wait a tiny bit for any animations to settle
    await new Promise(r => setTimeout(r, 300));

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
          clonedElement.style.padding = '20px';
        }

        // Fix oklch colors which html2canvas doesn't support
        const styleTags = clonedDoc.getElementsByTagName('style');
        for (let i = 0; i < styleTags.length; i++) {
          let css = styleTags[i].innerHTML;
          if (css.includes('oklch')) {
            // Replace oklch with hex fallbacks
            styleTags[i].innerHTML = css
              .replace(/oklch\(0\.796 0\.141 165\.57\)/g, '#2dd4bf') // teal
              .replace(/oklch\(0\.841 0\.141 76\.57\)/g, '#fbbf24')  // amber
              .replace(/oklch\([^)]+\)/g, '#737373');               // fallback gray
          }
        }

        clonedDoc.querySelectorAll('*').forEach((el: any) => {
          if (el.style) {
            el.style.colorScheme = 'dark';
            const styles = ['color', 'backgroundColor', 'borderColor', 'fill', 'stroke'];
            styles.forEach(prop => {
              const val = el.style[prop];
              if (val && val.includes('oklch')) {
                if (val.includes('0.796 0.141 165.57')) el.style[prop] = '#2dd4bf';
                else if (val.includes('0.841 0.141 76.57')) el.style[prop] = '#fbbf24';
                else el.style[prop] = '#737373';
              }
            });
          }
        });
      }
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
    // Multi-page support
    const pageHeight = pdf.internal.pageSize.getHeight();
    let heightLeft = pdfHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - pdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;
    }
    
    pdf.save(fileName);
  } catch (error) {
    console.error('PDF Generation Error:', error);
  }
}
