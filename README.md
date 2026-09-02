# Gym Progress Tracker

Aplikasi modern untuk mencatat sesi latihan gym, memantau *progressive overload*, dan menganalisis metrik kekuatan secara berkala.

## Fitur Utama

1. **Pilih Split Day**: Dukungan template latihan fleksibel (Push, Pull, Legs, Upper, Lower, Arms).
2. **Catat PR & Normal Sets**: Lacak set yang bertujuan untuk *Personal Record* dan set hipertrofi biasa.
3. **Auto-suggest Naik Beban**: Sistem pintar yang otomatis menyarankan kenaikan beban (+2.5kg atau +5kg) jika target repetisi PR telah tercapai di sesi sebelumnya.
4. **Riwayat Terstruktur**: Lihat histori sesi latihan dengan desain *accordion* yang rapi.
5. **Grafik Progress Interaktif**: Visualisasi tren perkembangan kekuatan (max weight & total volume) dari waktu ke waktu menggunakan grafik interaktif.
6. **PWA Ready**: Bisa di-install langsung ke *homescreen* HP seperti aplikasi *native* pada umumnya untuk akses cepat secara *offline*.

## Teknologi

- Next.js 14 (App Router)
- React (Client Components)
- Tailwind CSS (Sistem warna kustom Emerald & Zinc)
- Lucide Icons
- Recharts (untuk visualisasi progres)
- LocalStorage (Persistensi state)

## Cara Menjalankan Secara Lokal

1. Pastikan Anda memiliki Node.js terinstal.
2. Clone atau masuk ke direktori proyek ini.
3. Instal semua dependensi:
   ```bash
   npm install
   ```
4. Jalankan server *development*:
   ```bash
   npm run dev
   ```
5. Buka `http://localhost:3000` di browser Anda.

---

*Catatan: Karena aplikasi menggunakan `localStorage` sebagai sumber data utamanya saat ini, seluruh riwayat latihan tersimpan secara aman di dalam browser perangkat Anda.*
