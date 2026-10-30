export function tituloLegivel(titulo: string): string {
  const semAno = titulo.replace(/\s*\(\d{4}\)\s*$/, "");
  const partes = semAno.match(/^(.+), (The|A|An)$/);
  return partes ? `${partes[2]} ${partes[1]}` : semAno;
}