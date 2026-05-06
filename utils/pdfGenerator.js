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
            font-family: 'Segoe UI', 'Helvetica', 'Arial', sans-serif; 
            color: #1a1a1a; 
            margin: 0; padding: 20px;
            -webkit-print-color-adjust: exact;
          }
          .header { 
            display: flex; justify-content: space-between; align-items: center;
            border-bottom: 4px solid #003355; padding-bottom: 20px; margin-bottom: 30px; 
          }
          .logo-area { display: flex; align-items: center; }
          .app-name { font-size: 34px; font-weight: 900; color: #003355; letter-spacing: 2px; margin-left: 15px; }
          .report-meta { text-align: right; }
          .report-title { font-size: 22px; font-weight: 800; color: #003355; margin-bottom: 2px; }
          
          .patient-card { 
            background-color: #f8f9fb; border-radius: 12px; padding: 20px; margin-bottom: 35px;
            border-left: 8px solid #005A9C; display: flex; justify-content: space-between; align-items: center;
          }
          .patient-name { font-size: 26px; font-weight: 700; color: #003355; }
          .patient-details { font-size: 14px; color: #555; margin-top: 5px; }

          .dashboard { display: flex; justify-content: space-between; gap: 15px; margin-bottom: 40px; }
          .stat-card { 
            flex: 1; background: #fff; border: 1px solid #e1e8ed; border-radius: 10px; 
            padding: 15px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          }
          .stat-val { font-size: 24px; font-weight: 800; color: #005A9C; }
          .stat-desc { font-size: 10px; color: #666; text-transform: uppercase; font-weight: 700; margin-top: 8px; letter-spacing: 1px; }

          .section-title { font-size: 14px; font-weight: 800; color: #003355; text-transform: uppercase; margin-bottom: 15px; border-left: 4px solid #34D399; padding-left: 10px; }

          table { width: 100%; border-collapse: collapse; margin-top: 10px; border-radius: 8px; overflow: hidden; }
          th { 
            background-color: #003355; color: #ffffff; font-size: 10px; 
            text-transform: uppercase; padding: 12px; text-align: left; letter-spacing: 1px;
          }
          td { padding: 12px; font-size: 12px; border-bottom: 1px solid #eee; vertical-align: middle; }
          tr:nth-child(even) { background-color: #f9f9fb; }
          
          .flag { padding: 4px 8px; border-radius: 6px; font-weight: 800; font-size: 9px; display: inline-block; }
          .flag-hypo { background-color: #fee2e2; color: #b91c1c; }
          .flag-hyper { background-color: #ffedd5; color: #9a3412; }
          .flag-normal { background-color: #f0fdf4; color: #15803d; }

          .context-tag { font-size: 10px; color: #666; font-style: italic; display: block; margin-top: 4px; }
          .activity-tag { font-size: 9px; font-weight: 700; color: #0369a1; background: #e0f2fe; padding: 2px 6px; border-radius: 4px; margin-left: 5px; }

          .footer { margin-top: 60px; font-size: 11px; color: #777; text-align: center; border-top: 1px dotted #ccc; padding-top: 20px; }
          .signature-area { margin-top: 50px; display: flex; justify-content: space-between; }
          .doc-notes { flex: 1; border: 1px solid #e1e8ed; border-radius: 8px; padding: 15px; margin-right: 50px; min-height: 80px; }
          .notes-label { font-size: 10px; font-weight: 800; color: #888; margin-bottom: 10px; text-transform: uppercase; }
          .sig-line { width: 220px; border-top: 2px solid #003355; text-align: center; font-size: 12px; padding-top: 8px; font-weight: 700; align-self: flex-end; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo-area">
            <svg width="50" height="50" viewBox="0 0 100 100">
                <defs>
                    <linearGradient id="prem_grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0" stop-color="#003355" />
                        <stop offset="0.5" stop-color="#005A9C" />
                        <stop offset="1" stop-color="#0077CC" />
                    </linearGradient>
                    <linearGradient id="glow_grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0" stop-color="#34D399" />
                        <stop offset="1" stop-color="#10B981" />
                    </linearGradient>
                </defs>
                <path d="M50,5 C25.1,5 5,25.1 5,50 C5,74.9 25.1,95 50,95 C74.9,95 95,74.9 95,50 C95,25.1 74.9,5 50,5 Z M50,85 C30.7,85 15,69.3 15,50 C15,30.7 30.7,15 50,15 C69.3,15 85,30.7 85,50 C85,69.3 69.3,85 50,85 Z" fill="url(#prem_grad)" />
                <path d="M50,30 C39,30 30,39 30,50 C30,61 39,70 50,70 C61,70 70,61 70,50 C70,39 61,30 50,30 Z M50,62 C43.4,62 38,56.6 38,50 C38,43.4 43.4,38 50,38 C56.6,38 62,43.4 62,50 C62,56.6 56.6,62 50,62 Z" fill="url(#premium_grad)" opacity="0.8" />
                <circle cx="50" cy="50" r="6" fill="url(#glow_grad)" />
            </svg>
            <div class="app-name">GLYSE</div>
          </div>
          <div class="report-meta">
            <div class="report-title">RAPORT KLINICZNY</div>
            <div style="font-size: 13px; color: #555;">Wygenerowano: ${dateStr}</div>
          </div>
        </div>

        <div class="patient-card">
          <div>
            <div style="font-size: 10px; color: #005A9C; font-weight: 800; text-transform: uppercase; margin-bottom: 5px;">Pacjent</div>
            <div class="patient-name">${patientName}</div>
            <div class="patient-details">${birthYear}</div>
          </div>
          <div style="text-align: right; font-size: 12px; color: #666;">
            ID Pacjenta: GLYSE-${Math.random().toString(36).substr(2, 6).toUpperCase()}
          </div>
        </div>

        <div class="section-title">Wskaźniki Glikemiczne</div>
        <div class="dashboard">
          <div class="stat-card">
            <div class="stat-val">${medicalStats.hba1c}%</div>
            <div class="stat-desc">HbA1c (est.)</div>
          </div>
          <div class="stat-card">
            <div class="stat-val">${medicalStats.tir}%</div>
            <div class="stat-desc">W normie (TIR)</div>
          </div>
          <div class="stat-card">
            <div class="stat-val">${medicalStats.tbr}%</div>
            <div class="stat-desc">Poniżej normy</div>
          </div>
          <div class="stat-card">
            <div class="stat-val">${medicalStats.tar}%</div>
            <div class="stat-desc">Powyżej normy</div>
          </div>
        </div>

        <div class="section-title">Szczegółowy Dziennik Pomiarów</div>
        <table>
          <thead>
            <tr>
              <th style="width: 20%;">Data i Godzina</th>
              <th style="width: 15%;">Okoliczności</th>
              <th style="width: 30%;">Contextual IQ (Posiłek/Aktywność)</th>
              <th style="width: 15%;">Wynik</th>
              <th style="width: 20%;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${data.map(item => {
              const d = new Date(item.date);
              const dStr = d.toLocaleDateString('pl-PL') + ' ' + d.toLocaleTimeString('pl-PL', {hour:'2-digit', minute:'2-digit'});
              let f = 'flag-normal', s = 'W NORMIE';
              if(item.sugarLevel < 70) { f='flag-hypo'; s='HIPO'; }
              else if(item.sugarLevel > 180) { f='flag-hyper'; s='HIPER'; }
              
              const contextInfo = item.mealContent ? `<span class="context-tag">${item.mealContent}</span>` : '';
              const activityTag = item.activityLevel ? `<span class="activity-tag">${item.activityLevel}</span>` : '';
              const notesInfo = item.notes ? `<div style="font-size: 9px; color: #888; margin-top: 4px;">Notatki: ${item.notes}</div>` : '';

              return `
                <tr>
                  <td>${dStr}</td>
                  <td><span style="font-weight: 700; color: #003355;">${item.mealTime || '-'}</span></td>
                  <td>
                    <div style="display: flex; flex-direction: column;">
                      <div style="display: flex; align-items: center;">
                        ${item.mealContent ? '🍴' : ''} ${contextInfo} ${activityTag}
                      </div>
                      ${notesInfo}
                    </div>
                  </td>
                  <td style="font-weight: 800; font-size: 16px; color: #005A9C;">${item.sugarLevel} <span style="font-size: 9px; font-weight: 400; color: #666;">mg/dL</span></td>
                  <td><span class="flag ${f}">${s}</span></td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>

        <div class="signature-area">
          <div class="doc-notes">
            <div class="notes-label">Uwagi i Zalecenia Lekarskie</div>
          </div>
          <div class="sig-line">Pieczątka i Podpis Lekarza</div>
        </div>

        <div class="footer">
          Niniejszy raport został wygenerowany automatycznie przez system GLYSE. Dane służą celom informacyjnym i powinny być interpretowane przez wykwalifikowany personel medyczny.
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
