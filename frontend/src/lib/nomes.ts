const TRATAMENTO = /^(dr|dra|sr|sra|prof)\.?$/i;

/** Primeiro nome "de verdade": pula tratamentos como "Dra." ou "Dr.". */
export function primeiroNome(nome: string): string {
  const partes = nome.trim().split(/\s+/);
  return partes.find((parte) => !TRATAMENTO.test(parte)) ?? partes[0] ?? '';
}
