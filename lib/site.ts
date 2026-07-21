// URL canônica do site em produção. Sobrescrever via NEXT_PUBLIC_SITE_URL
// quando houver domínio próprio, sem precisar tocar no código.
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://alicia-phi.vercel.app";
