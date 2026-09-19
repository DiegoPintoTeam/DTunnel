export default function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '';
  return new Date(date)
    .toLocaleString('es-CO', {
      timeZone: 'America/Bogota',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
    .replace(',', '');
}
