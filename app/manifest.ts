import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Gym Progress Tracker",
    short_name: "GymTracker",
    description: "Pantau progres latihan gym kamu setiap harinya.",
    start_url: "/",
    display: "standalone",
    background_color: "#030712", // gray-950
    theme_color: "#4f46e5", // indigo-600
    orientation: "portrait-primary",
    icons: [
      {
        src: "https://www.w3.org/Graphics/SVG/1.1/W3C-SVG-1.1.svg", // Placeholder icon
        sizes: "192x192",
        type: "image/svg+xml",
      },
    ],
  };
}
