const express = require('express');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();
const port = process.env.PORT || 3000;
const recipientEmail = 'axel.omcava@gmail.com';
const senderEmail = process.env.EMAIL_FROM || process.env.SMTP_USER || 'no-reply@invitacion.local';
const dataDir = path.join(__dirname, 'data');
const submissionsFile = path.join(dataDir, 'submissions.json');

app.use(express.json());
app.use(express.static(path.join(__dirname)));

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

if (!fs.existsSync(submissionsFile)) {
  fs.writeFileSync(submissionsFile, '[]', 'utf8');
}

function buildEmailText(draft) {
  const optionLabels = {
    cine: 'Ir al cine',
    comer: 'Comer algo',
    parque: 'Ir al parque',
    correr: 'Salir a correr',
    biblioteca: 'Ir a la biblioteca',
    pintar: 'Pintar o hacer manualidades',
    cafe: 'Tomar café o un smoothie',
    caminar: 'Caminar por la ciudad',
    museo: 'Ir a un museo',
    picnic: 'Hacer un picnic',
    atardecer: 'Ver el atardecer',
    cocinar: 'Cocinar juntos',
    antro: 'Ir a un antro o salir a bailar'
  };

  const selectedTitles = (draft.selected || []).map((id) => optionLabels[id] || id);

  const lines = [
    'Vale de cita para Andrea',
    '',
    `Plan: ${selectedTitles.length ? selectedTitles.join(', ') : 'Sin plan seleccionado'}`,
    draft.preference ? `Extra: ${draft.preference}` : '',
    draft.locationChoice ? `Lugar: ${draft.locationChoice.replace(/-/g, ' ')}` : '',
    draft.locationText ? `Ubicación: ${draft.locationText}` : '',
    draft.date ? `Fecha: ${draft.date}` : '',
    draft.time ? `Hora: ${draft.time}` : '',
    draft.transport ? `Transporte: ${draft.transport === 'recojo' ? 'Te recojo' : 'Nos vemos allá'}` : '',
    draft.notes ? `Notas: ${draft.notes}` : ''
  ].filter(Boolean);

  return lines.join('\n');
}

function loadSubmissions() {
  try {
    const raw = fs.readFileSync(submissionsFile, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    return [];
  }
}

function saveSubmission(entry) {
  const submissions = loadSubmissions();
  submissions.push(entry);
  fs.writeFileSync(submissionsFile, JSON.stringify(submissions, null, 2), 'utf8');
  return submissions;
}

function createTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const secure = process.env.SMTP_SECURE === 'true';
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error('Faltan variables de entorno SMTP_HOST, SMTP_USER o SMTP_PASS.');
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass
    }
  });
}

app.post('/send-email', async (req, res) => {
  const draft = req.body;

  if (!draft || typeof draft !== 'object') {
    return res.status(400).send('El cuerpo del mensaje es inválido.');
  }

  const entry = {
    id: `${Date.now()}`,
    createdAt: new Date().toISOString(),
    draft,
    preview: buildEmailText(draft)
  };

  saveSubmission(entry);

  let sent = false;
  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: senderEmail,
      to: recipientEmail,
      subject: 'Vale de cita para Andrea',
      text: entry.preview
    });
    sent = true;
  } catch (error) {
    console.error('No se pudo enviar el correo:', error.message);
  }

  res.json({ success: true, stored: true, sent, recipient: recipientEmail });
});

app.get('/submissions', (req, res) => {
  const submissions = loadSubmissions();
  const html = `<!doctype html>
  <html lang="es">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Submissions</title>
      <style>body{font-family:Arial,sans-serif;padding:24px;line-height:1.5}pre{background:#f5f5f5;padding:16px;border-radius:8px;white-space:pre-wrap}</style>
    </head>
    <body>
      <h1>Vales guardados</h1>
      ${submissions.length ? submissions.map((submission) => `
        <section>
          <h2>#${submission.id} · ${submission.createdAt}</h2>
          <pre>${submission.preview}</pre>
        </section>
      `).join('') : '<p>Aún no hay vale guardado.</p>'}
    </body>
  </html>`;
  res.send(html);
});

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Servidor iniciado en http://127.0.0.1:${port}`);
});
