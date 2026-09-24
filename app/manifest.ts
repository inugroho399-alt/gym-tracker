import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "IRONLOG — Progressive Overload Gym Tracker",
    short_name: "IRONLOG",
    description: "Buku catatan latihan angkat beban & progressive overload tanpa distraksi.",
    start_url: "/",
    display: "standalone",
    background_color: "#090a0e",
    theme_color: "#090a0e",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icon",
        sizes: "32x32",
        type: "image/png",
      },
    ],
  };
}
