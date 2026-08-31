export function hojeISO(): string {
  const agora = new Date();
  const mes = String(agora.getMonth() + 1).padStart(2, '0');
  const dia = String(agora.getDate()).padStart(2, '0');
  return `${agora.getFullYear()}-${mes}-${dia}`;
}

export function parseData(texto: string): Date | null {
  const partes = String(texto).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!partes) return null;
  return new Date(Number(partes[1]), Number(partes[2]) - 1, Number(partes[3]));
}

/** "31 de agosto de 2026" */
export function formatarDataLonga(texto: string): string {
  const data = parseData(texto);
  if (!data) return texto;
  return data.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/** "seg., 25/08" */
export function formatarDiaCurto(texto: string): string {
  const data = parseData(texto);
  if (!data) return texto;
  const dia = String(data.getDate()).padStart(2, '0');
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  return `${data
    .toLocaleDateString('pt-BR', { weekday: 'short' })
    .replace('.', '')}, ${dia}/${mes}`;
}

export function somarDiasISO(iso: string, dias: number): string {
  const data = parseData(iso);
  if (!data) return iso;
  const nova = new Date(data.getTime() + dias * 86_400_000);
  const mes = String(nova.getMonth() + 1).padStart(2, '0');
  const dia = String(nova.getDate()).padStart(2, '0');
  return `${nova.getFullYear()}-${mes}-${dia}`;
}

/** "segunda-feira, 25 de agosto" */
export function formatarDiaExtenso(iso: string): string {
  const data = parseData(iso);
  if (!data) return iso;
  return data.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

export function rotuloRelativo(iso: string): string {
  const hoje = hojeISO();
  if (iso === hoje) return 'Hoje';
  if (iso === somarDiasISO(hoje, -1)) return 'Ontem';
  return '';
}

export function pluralizar(
  quantidade: number,
  singular: string,
  plural: string,
): string {
  return quantidade === 1 ? singular : plural;
}
