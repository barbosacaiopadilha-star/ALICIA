import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AliCIA · Aliviar",
    short_name: "AliCIA",
    description:
      "Aliviar é a Curadoria Médica que ajuda você a escolher, com consciência, quem irá conduzir seu tratamento.",
    start_url: "/alicia",
    display: "standalone",
    background_color: "#FDFCFA",
    theme_color: "#17160F",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
