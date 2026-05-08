import { Platform } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export const generateClinicalReport = async (data, patientData, medicalStats) => {
  try {
    const dateStr = new Date().toLocaleString('pl-PL', { dateStyle: 'long', timeStyle: 'short' });
    const patientName = patientData ? `${patientData.firstName} ${patientData.lastName}` : 'PACJENT';
    const birthYear = patientData?.birthYear ? `Rok urodzenia: ${patientData.birthYear}` : '';

    let tableRows = '';
    for (const item of data) {
        const d = new Date(item.date);
        const dStr = d.toLocaleDateString('pl-PL') + ' ' + d.toLocaleTimeString('pl-PL', {hour:'2-digit', minute:'2-digit'});
        const status = item.sugarLevel < 70 ? 'HIPO' : item.sugarLevel > 180 ? 'HIPER' : 'OK';
        const color = item.sugarLevel < 70 ? '#ff4b4b' : item.sugarLevel > 180 ? '#f59e0b' : '#10b981';
        
        tableRows += `
          <tr style="page-break-inside: avoid;">
            <td style="border-bottom: 1px solid #ddd; padding: 8px;">${dStr}</td>
            <td style="border-bottom: 1px solid #ddd; padding: 8px;">${item.mealTime || '-'}</td>
            <td style="border-bottom: 1px solid #ddd; padding: 8px;">${item.mealContent || ''} ${item.activityLevel ? `(${item.activityLevel})` : ''}</td>
            <td style="border-bottom: 1px solid #ddd; padding: 8px; font-weight: bold;">${item.sugarLevel} mg/dL</td>
            <td style="border-bottom: 1px solid #ddd; padding: 8px; color: ${color}; font-weight: bold;">${status}</td>
          </tr>
        `;
    }

    const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Raport Medyczny GLYSE</title>
        <style>
          @page { size: A4; margin: 20mm; }
          body { 
            font-family: 'Arial', sans-serif; 
            margin: 0; padding: 0;
            color: #1a1a1a;
            background: white;
          }
          .header { border-bottom: 3px solid #003355; padding-bottom: 15px; margin-bottom: 30px; }
          .title { font-size: 28px; font-weight: bold; color: #003355; }
          .patient-box { background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 30px; border-left: 10px solid #005A9C; }
          
          .stats { display: flex; justify-content: space-between; margin-bottom: 40px; }
          .stat { text-align: center; border: 1px solid #eee; padding: 15px; border-radius: 8px; width: 22%; display: inline-block; }
          .stat-val { font-size: 22px; font-weight: bold; color: #005A9C; }
          
          table { width: 100%; border-collapse: collapse; }
          th { background: #003355; color: white; padding: 12px; text-align: left; font-size: 11px; text-transform: uppercase; }
          td { font-size: 11px; }
          thead { display: table-header-group; }
          
          .footer { margin-top: 50px; text-align: center; font-size: 10px; color: #777; border-top: 1px solid #eee; padding-top: 20px; page-break-inside: avoid; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">GLYSE - RAPORT MEDYCZNY</div>
          <div style="font-size: 12px;">Data generowania: ${dateStr}</div>
        </div>

        <div class="patient-box">
          <div style="font-size: 20px; font-weight: bold;">${patientName}</div>
          <div style="font-size: 14px; color: #555;">${birthYear}</div>
        </div>

        <div class="stats">
          <div class="stat"><div style="font-size: 10px;">HbA1c (est.)</div><div class="stat-val">${medicalStats.hba1c}%</div></div>
          <div class="stat"><div style="font-size: 10px;">W NORMIE (TIR)</div><div class="stat-val">${medicalStats.tir}%</div></div>
          <div class="stat"><div style="font-size: 10px;">PONIŻEJ (TBR)</div><div class="stat-val">${medicalStats.tbr}%</div></div>
          <div class="stat"><div style="font-size: 10px;">POWYŻEJ (TAR)</div><div class="stat-val">${medicalStats.tar}%</div></div>
        </div>

        <h3 style="color: #003355; border-bottom: 1px solid #eee; padding-bottom: 10px;">PEŁNY DZIENNIK POMIARÓW</h3>
        <table>
          <thead>
            <tr>
              <th>Data i Godzina</th>
              <th>Okoliczności</th>
              <th>Posiłek / Aktywność</th>
              <th>Wynik</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>

        <div class="footer">
          Raport wygenerowany przez system GLYSE. Dane historyczne (${data.length} rekordów).
        </div>
      </body>
    </html>
    `;

    if (Platform.OS === 'web') {
        // WEB SPECIFIC PRINTING - IFRAME METHOD (The only reliable one for browsers)
        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.width = '0px';
        iframe.style.height = '0px';
        iframe.style.border = 'none';
        iframe.style.visibility = 'hidden';
        
        document.body.appendChild(iframe);
        
        const doc = iframe.contentWindow.document;
        doc.open();
        doc.write(htmlContent);
        doc.close();

        setTimeout(() => {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
            setTimeout(() => {
                document.body.removeChild(iframe);
            }, 1000);
        }, 500);
    } else {
        // NATIVE ANDROID/IOS PRINTING
        const { uri } = await Print.printToFileAsync({ html: htmlContent });
        await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    }

  } catch (error) {
    console.error('PDF GENERATION ERROR:', error);
    throw error;
  }
};
