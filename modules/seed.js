/* seed.js — data contoh Course Creator realistis. */
window.SEED = function (Store, Brain) {
  var DAY = 864e5, now = Date.now();
  function uid(n) { return "s" + n + Math.random().toString(36).slice(2, 5); }
  Brain.set({ bisnis: { nama: "Kelas Kreatif Nusa", niche: "Kelas online kreatif", produk: ["Dasar Fotografi HP", "Public Speaking"], target: "pemula & profesional muda", lokasi: "Jakarta" }, voice: { tone: "ramah & memotivasi", sapaan: "kamu", contoh: "" }, riwayat: [] });

  Store.set("edu_progres", [
    { id: uid(1), nama: "Dasar Fotografi HP", modul: [
      { text: "Modul 1: Pengenalan kamera HP", done: true }, { text: "Modul 2: Komposisi & framing", done: true },
      { text: "Modul 3: Pencahayaan alami", done: true }, { text: "Modul 4: Editing di Lightroom Mobile", done: false }, { text: "Modul 5: Praktik & review", done: false }
    ] },
    { id: uid(2), nama: "Public Speaking Dasar", modul: [
      { text: "Modul 1: Mindset & percaya diri", done: true }, { text: "Modul 2: Struktur presentasi", done: false }, { text: "Modul 3: Bahasa tubuh", done: false }
    ] }
  ]);
  Store.set("edu_murid", [
    { id: uid(3), nama: "Andi Pratama", kelas: "Dasar Fotografi HP", progress: 80, bayar: "lunas", kontak: "0812xx" },
    { id: uid(4), nama: "Siti Rahma", kelas: "Dasar Fotografi HP", progress: 60, bayar: "lunas", kontak: "0813xx" },
    { id: uid(5), nama: "Budi Santoso", kelas: "Public Speaking Dasar", progress: 33, bayar: "belum", kontak: "0814xx" },
    { id: uid(6), nama: "Maya Putri", kelas: "Dasar Fotografi HP", progress: 100, bayar: "lunas", kontak: "0815xx" },
    { id: uid(7), nama: "Reza Fadli", kelas: "Public Speaking Dasar", progress: 0, bayar: "belum", kontak: "0816xx" }
  ]);
  Store.set("edu_jadwal", [
    { id: uid(8), topik: "Modul 4: Editing Lightroom", kelas: "Dasar Fotografi HP", tanggal: now + 2 * DAY, jam: "19:00" },
    { id: uid(9), topik: "Modul 2: Struktur presentasi", kelas: "Public Speaking Dasar", tanggal: now + 6 * DAY, jam: "20:00" }
  ]);
  Store.set("edu_kuis", [
    { id: uid(10), kelas: "Dasar Fotografi HP", soal: [
      { q: "Apa aturan komposisi paling dasar?", opsi: ["Rule of thirds", "Rule of five", "Golden noise"], jawaban: "Rule of thirds" },
      { q: "Cahaya terbaik untuk foto natural?", opsi: ["Tengah hari", "Golden hour", "Lampu neon"], jawaban: "Golden hour" },
      { q: "Format foto agar mudah diedit?", opsi: ["JPG kecil", "Screenshot", "RAW/kualitas tinggi"], jawaban: "RAW/kualitas tinggi" }
    ] }
  ]);
};
