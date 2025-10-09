import { Resend } from 'resend';

export interface NotificationPayload {
  companyName?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  filesUploaded?: number;
  sheetName?: string;
  formType?: string;
  mode?: string;
  timestamp?: string;
}

export async function notifySlack(payload: NotificationPayload): Promise<void> {
  try {
    const webhookUrl = process.env.SLACK_WEBHOOK_URL;
    if (!webhookUrl) return;

    const lines = [
      `Nuevo formulario recibido`,
      `Empresa: ${payload.companyName ?? '-'}`,
      `Contacto: ${payload.contactPerson ?? '-'}`,
      `Email: ${payload.email ?? '-'}`,
      `Teléfono: ${payload.phone ?? '-'}`,
      `Imágenes Cloudinary: ${payload.filesUploaded ?? 0}`,
      `Hoja: ${payload.sheetName ?? '-'}`,
      `Tipo: ${payload.formType ?? '-'}`,
      `Modo: ${payload.mode ?? '-'}`,
      `Fecha: ${payload.timestamp ?? new Date().toISOString()}`,
    ];

    const text = lines.join('\n');

    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
  } catch (err) {
    console.error('Error enviando notificación a Slack:', err);
  }
}

export async function notifyEmail(payload: NotificationPayload): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFY_EMAIL_TO;
  const from = process.env.NOTIFY_EMAIL_FROM || 'no-reply@yourdomain.com';
  if (!apiKey || !to) return;

  const resend = new Resend(apiKey);
  const subject = `Nuevo formulario: ${payload.companyName ?? 'Sin nombre'}`;
  const lines = [
    'Nuevo formulario recibido',
    `Empresa: ${payload.companyName ?? '-'}`,
    `Contacto: ${payload.contactPerson ?? '-'}`,
    `Email: ${payload.email ?? '-'}`,
    `Teléfono: ${payload.phone ?? '-'}`,
    `Imágenes Cloudinary: ${payload.filesUploaded ?? 0}`,
    `Hoja: ${payload.sheetName ?? '-'}`,
    `Tipo: ${payload.formType ?? '-'}`,
    `Modo: ${payload.mode ?? '-'}`,
    `Fecha: ${payload.timestamp ?? new Date().toISOString()}`,
  ];
  const text = lines.join('\n');

  try {
    await resend.emails.send({ to, from, subject, text });
  } catch (err) {
    console.error('Error enviando email de notificación:', err);
  }
}