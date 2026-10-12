/**
 * Gera imagens de produto como data-URI SVG.
 *
 * Vantagens para o MVP/demo:
 *  - Não depende de rede (essencial em um totem que pode ficar
 *    offline) e nunca quebra o layout com imagem faltando.
 *  - Fácil de trocar depois por URLs reais de imagens (basta
 *    substituir o campo `image` no Product por uma URL).
 */

interface ImageOptions {
  emoji: string;
  from: string;
  to: string;
}

export function foodImage({ emoji, from, to }: ImageOptions): string {
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="450" viewBox="0 0 600 450">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${from}"/>
      <stop offset="1" stop-color="${to}"/>
    </linearGradient>
  </defs>
  <rect width="600" height="450" fill="url(#g)"/>
  <circle cx="300" cy="210" r="140" fill="rgba(255,255,255,0.14)"/>
  <text x="300" y="255" font-size="180" text-anchor="middle" dominant-baseline="middle">${emoji}</text>
</svg>`.trim();
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
