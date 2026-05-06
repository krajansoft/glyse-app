import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

export const generateClinicalReport = async (data, patientData, medicalStats) => {
  try {
    // 1. Prepare Data
    const dateStr = new Date().toLocaleString('pl-PL', { dateStyle: 'long', timeStyle: 'short' });
    const patientName = patientData ? `${patientData.firstName} ${patientData.lastName}` : 'NIEZIDENTYFIKOWANY PACJENT';
    const birthYear = patientData?.birthYear ? `Rok urodzenia: ${patientData.birthYear}` : '';

    // 2. HTML Template
    const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          @page { size: A4; margin: 10mm; }
          body { 
            font-family: 'Helvetica', 'Arial', sans-serif; 
            color: #1a1a1a; 
            margin: 0; padding: 20px;
            -webkit-print-color-adjust: exact;
          }
          .header { 
            display: flex; justify-content: space-between; align-items: center;
            border-bottom: 4px solid #003355; padding-bottom: 15px; margin-bottom: 25px; 
          }
          .app-name { font-size: 32px; font-weight: 900; color: #003355; letter-spacing: -1px; }
          .report-meta { text-align: right; }
          .report-title { font-size: 20px; font-weight: 800; color: #003355; margin-bottom: 2px; }
          
          .patient-card { 
            background-color: #f4f7f9; border-radius: 10px; padding: 15px; margin-bottom: 30px;
            border-left: 6px solid #005A9C;
          }
          .patient-name { font-size: 24px; font-weight: 700; color: #003355; }

          .dashboard { display: flex; justify-content: space-between; gap: 10px; margin-bottom: 30px; }
          .stat-card { 
            flex: 1; background: #fff; border: 1px solid #e1e8ed; border-radius: 8px; 
            padding: 12px; text-align: center; 
          }
          .stat-val { font-size: 22px; font-weight: 800; color: #005A9C; }
          .stat-desc { font-size: 10px; color: #888; text-transform: uppercase; font-weight: 700; margin-top: 5px; }

          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th { 
            background-color: #003355; color: #ffffff; font-size: 11px; 
            text-transform: uppercase; padding: 10px; text-align: left;
          }
          td { padding: 10px; font-size: 13px; border-bottom: 1px solid #eee; }
          
          .flag { padding: 3px 7px; border-radius: 4px; font-weight: 800; font-size: 10px; display: inline-block; }
          .flag-hypo { background-color: #ffcccc; color: #cc0000; }
          .flag-hyper { background-color: #ffe5cc; color: #cc6600; }
          .flag-normal { background-color: #ccffcc; color: #006600; }

          .footer { margin-top: 50px; font-size: 10px; color: #999; text-align: center; border-top: 1px solid #eee; padding-top: 15px; }
          .signature { margin-top: 40px; display: flex; justify-content: flex-end; }
          .sig-line { width: 200px; border-top: 1px solid #000; text-align: center; font-size: 11px; padding-top: 5px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div style="display: flex; align-items: center;">
            <svg width="40" height="40" viewBox="0 0 24 24" style="margin-right: 12px;">
                <defs>
                    <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#003355;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#005A9C;stop-opacity:1" />
                    </linearGradient>
                </defs>
                <path d="M12,2C6.48,2 2,6.48 2,12s4.48,10 10,10c5.52,0 10,-4.48 10,-10S17.52,2 12,2zM12,18c-3.31,0 -6,-2.69 -6,-6s2.69,-6 6,-6 6,2.69 6,6 -2.69,6 -6,6z" fill="url(#logoGrad)"/>
                <circle cx="12" cy="12" r="1.5" fill="#34D399"/>
            </svg>
            <div class="app-name">GLYSE</div>
          </div>
          <div class="report-meta">
            <div class="report-title">RAPORT KLINICZNY</div>
            <div style="font-size: 12px; color: #666;">${dateStr}</div>
          </div>
        </div>

        <div class="patient-card">
          <div style="font-size: 10px; color: #005A9C; font-weight: 800; text-transform: uppercase;">Pacjent</div>
          <div class="patient-name">${patientName}</div>
          <div style="font-size: 13px; color: #666;">${birthYear}</div>
        </div>

        <div class="dashboard">
          <div class="stat-card">
            <div class="stat-val">${medicalStats.hba1c}%</div>
            <div class="stat-desc">Szac. HbA1c</div>
          </div>
          <div class="stat-card">
            <div class="stat-val">${medicalStats.tir}%</div>
            <div class="stat-desc">W normie (TIR)</div>
          </div>
          <div class="stat-card">
            <div class="stat-val">${medicalStats.tbr}%</div>
            <div class="stat-desc">Hipoglikemia</div>
          </div>
          <div class="stat-card">
            <div class="stat-val">${medicalStats.tar}%</div>
            <div class="stat-desc">Hiperglikemia</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Data i Godzina</th>
              <th>Okoliczności</th>
              <th>Wynik (mg/dL)</th>
              <th>Status Kliniczny</th>
            </tr>
          </thead>
          <tbody>
            ${data.map(item => {
              const d = new Date(item.date);
              const dStr = d.toLocaleDateString('pl-PL') + ' ' + d.toLocaleTimeString('pl-PL', {hour:'2-digit', minute:'2-digit'});
              let f = 'flag-normal', s = 'W NORMIE';
              if(item.sugarLevel < 70) { f='flag-hypo'; s='NIEDOCUKRZENIE'; }
              else if(item.sugarLevel > 180) { f='flag-hyper'; s='HIPERGLIKEMIA'; }
              return `
                <tr>
                  <td>${dStr}</td>
                  <td>${item.mealTime || '-'}</td>
                  <td style="font-weight: bold;">${item.sugarLevel}</td>
                  <td><span class="flag ${f}">${s}</span></td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>

        <div class="signature">
          <div class="sig-line">Pieczątka i podpis lekarza</div>
        </div>

        <div class="footer">
          Raport wygenerowany przez GLYSE. Dane mają charakter poglądowy.
        </div>
      </body>
    </html>
    `;

    // 3. Print Directly
    if (Platform.OS === 'web') {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(htmlContent);
            printWindow.document.close();
            // Czekamy chwilę na wyrenderowanie stylów przed drukiem
            setTimeout(() => {
                printWindow.print();
            }, 500);
        } else {
            Alert.alert('Błąd', 'Zablokowano wyskakujące okno. Zezwól na wyskakujące okna dla tej strony.');
        }
    } else {
        await Print.printAsync({
            html: htmlContent
        });
    }

    } catch (error) {
    console.error('PDF ERROR:', error);
    throw error;
  }
};
