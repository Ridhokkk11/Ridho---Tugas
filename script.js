/* ================================================================
   QUIZMASTER.JS — Seluruh JavaScript digabung jadi satu file.
   Struktur di bawah ini TETAP dipisah per bagian dengan komentar,
   supaya tetap mudah dibaca meski dalam satu file. Urutan bagian
   ini penting (mengikuti urutan <script> asli): data -> storage ->
   quiz -> statistics -> auth -> app.

   DAFTAR ISI:
   1. DATA.JS        — bank soal, daftar mapel, daftar badge
   2. STORAGE.JS     — akses localStorage yang aman
   3. QUIZ.JS        — mesin kuis (acak soal, timer, penilaian)
   4. STATISTICS.JS  — hitung statistik & cek syarat badge
   5. APP.JS         — router, render UI, inisialisasi aplikasi

   Catatan: fitur login email (Firebase Authentication) pernah ada di
   versi sebelumnya, tapi sudah dihapus atas permintaan — aplikasi ini
   kembali 100% tanpa backend/login, murni localStorage seperti awal.
   ================================================================ */

/* ============================== 1. DATA.JS ============================== */
/* ============================================================
   DATA.JS
   Berisi data statis aplikasi: daftar mata pelajaran, bank soal,
   dan daftar badge/achievement. Tidak ada logika di file ini,
   murni data supaya mudah ditambah/diedit oleh guru atau developer lain.
   ============================================================ */

/** Daftar mata pelajaran beserta ikon & warna identitas masing-masing */
const SUBJECTS = [
  { key: "matematika",        name: "Matematika",              icon: "🔢", color: "#3B82F6" },
  { key: "ipa",                name: "IPA",                     icon: "🔬", color: "#10B981" },
  { key: "ips",                name: "IPS",                     icon: "🌍", color: "#F59E0B" },
  { key: "bahasa-indonesia",   name: "Bahasa Indonesia",        icon: "📖", color: "#EF4444" },
  { key: "bahasa-inggris",     name: "Bahasa Inggris",          icon: "🗣️", color: "#8B5CF6" },
  { key: "ppkn",               name: "PPKn",                     icon: "⚖️", color: "#6366F1" },
  { key: "informatika",        name: "Informatika",             icon: "💻", color: "#06B6D4" },
  { key: "pai",                name: "Pendidikan Agama Islam",  icon: "🕌", color: "#14B8A6" }
];

/** Poin per tingkat kesulitan */
const POINTS_BY_DIFFICULTY = { "Mudah": 10, "Sedang": 15, "Sulit": 20 };

/**
 * Bank soal. Setiap soal WAJIB punya struktur:
 * { id, subject, grade, difficulty, question, options[4], correctAnswer, explanation, points }
 * correctAnswer adalah index (0-3) dari jawaban yang benar di array options.
 * Setiap soal dipastikan hanya memiliki SATU jawaban benar.
 */
const QUESTION_BANK = [
  // ---------------- MATEMATIKA (id 1-10) ----------------
  { id: 1, subject: "matematika", grade: 7, difficulty: "Mudah", question: "Berapakah hasil dari 5 + 6?", options: ["10","11","9","12"], correctAnswer: 1, explanation: "5 + 6 = 11.", points: 10 },
  { id: 2, subject: "matematika", grade: 7, difficulty: "Mudah", question: "Berapakah hasil dari 12 - 7?", options: ["5","6","4","7"], correctAnswer: 0, explanation: "12 - 7 = 5.", points: 10 },
  { id: 3, subject: "matematika", grade: 7, difficulty: "Mudah", question: "Berapakah hasil dari 3 × 4?", options: ["7","12","9","10"], correctAnswer: 1, explanation: "3 × 4 = 12.", points: 10 },
  { id: 4, subject: "matematika", grade: 8, difficulty: "Mudah", question: "Berapakah hasil dari 20 : 5?", options: ["4","5","6","3"], correctAnswer: 0, explanation: "20 dibagi 5 sama dengan 4.", points: 10 },
  { id: 5, subject: "matematika", grade: 8, difficulty: "Sedang", question: "Berapakah hasil dari 15 × 3?", options: ["45","35","40","50"], correctAnswer: 0, explanation: "15 × 3 = 45.", points: 15 },
  { id: 6, subject: "matematika", grade: 8, difficulty: "Sedang", question: "Luas persegi panjang dengan panjang 8 cm dan lebar 5 cm adalah...", options: ["40 cm²","35 cm²","45 cm²","30 cm²"], correctAnswer: 0, explanation: "Luas = panjang × lebar = 8 × 5 = 40 cm².", points: 15 },
  { id: 7, subject: "matematika", grade: 9, difficulty: "Sedang", question: "Keliling persegi dengan sisi 6 cm adalah...", options: ["24 cm","20 cm","18 cm","12 cm"], correctAnswer: 0, explanation: "Keliling persegi = 4 × sisi = 4 × 6 = 24 cm.", points: 15 },
  { id: 8, subject: "matematika", grade: 9, difficulty: "Sulit", question: "Akar kuadrat dari 169 adalah...", options: ["11","12","13","14"], correctAnswer: 2, explanation: "13 × 13 = 169, jadi akar kuadrat 169 adalah 13.", points: 20 },
  { id: 9, subject: "matematika", grade: 9, difficulty: "Sulit", question: "FPB dari 12 dan 18 adalah...", options: ["4","6","3","2"], correctAnswer: 1, explanation: "Faktor persekutuan terbesar dari 12 dan 18 adalah 6.", points: 20 },
  { id: 10, subject: "matematika", grade: 9, difficulty: "Sulit", question: "Hasil dari 3³ adalah...", options: ["21","27","9","18"], correctAnswer: 1, explanation: "3³ = 3 × 3 × 3 = 27.", points: 20 },
  { id: 81, subject: "matematika", grade: 7, difficulty: "Mudah", question: "Bilangan bulat terkecil dari -5, -2, 0, 3 adalah...", options: ["-5","-2","0","3"], correctAnswer: 0, explanation: "Semakin ke kiri pada garis bilangan, nilainya semakin kecil, jadi -5 adalah yang terkecil.", points: 10 },
  { id: 82, subject: "matematika", grade: 7, difficulty: "Mudah", question: "Pecahan 3/4 jika diubah ke bentuk desimal menjadi...", options: ["0,75","0,34","0,43","0,57"], correctAnswer: 0, explanation: "3 dibagi 4 sama dengan 0,75.", points: 10 },
  { id: 89, subject: "matematika", grade: 7, difficulty: "Mudah", question: "Lambang bilangan Romawi untuk angka 50 adalah...", options: ["L","C","D","M"], correctAnswer: 0, explanation: "Dalam angka Romawi, L melambangkan 50.", points: 10 },
  { id: 83, subject: "matematika", grade: 8, difficulty: "Sedang", question: "Jika suatu data adalah 3/5, maka dalam bentuk persen menjadi...", options: ["60%","50%","65%","75%"], correctAnswer: 0, explanation: "3/5 = 0,6 = 60%.", points: 15 },
  { id: 84, subject: "matematika", grade: 8, difficulty: "Sedang", question: "Keliling lingkaran dengan jari-jari 7 cm (π = 22/7) adalah...", options: ["44 cm","22 cm","49 cm","154 cm"], correctAnswer: 0, explanation: "Keliling = 2 × π × r = 2 × 22/7 × 7 = 44 cm.", points: 15 },
  { id: 85, subject: "matematika", grade: 8, difficulty: "Sedang", question: "Rata-rata dari bilangan 4, 6, dan 8 adalah...", options: ["6","7","5","8"], correctAnswer: 0, explanation: "(4+6+8) : 3 = 18 : 3 = 6.", points: 15 },
  { id: 90, subject: "matematika", grade: 8, difficulty: "Sedang", question: "Hasil dari 2/3 + 1/3 adalah...", options: ["1","2/3","1/3","4/3"], correctAnswer: 0, explanation: "2/3 + 1/3 = 3/3 = 1.", points: 15 },
  { id: 86, subject: "matematika", grade: 9, difficulty: "Sulit", question: "Nilai x yang memenuhi persamaan 2x + 5 = 15 adalah...", options: ["5","4","6","10"], correctAnswer: 0, explanation: "2x = 15 - 5 = 10, sehingga x = 10 : 2 = 5.", points: 20 },
  { id: 87, subject: "matematika", grade: 9, difficulty: "Sulit", question: "Hasil dari (-3)² adalah...", options: ["9","-9","6","-6"], correctAnswer: 0, explanation: "(-3)² = (-3) × (-3) = 9 (dua bilangan negatif dikali menghasilkan positif).", points: 20 },
  { id: 88, subject: "matematika", grade: 9, difficulty: "Sulit", question: "Volume kubus dengan panjang sisi 4 cm adalah...", options: ["64 cm³","48 cm³","16 cm³","36 cm³"], correctAnswer: 0, explanation: "Volume kubus = sisi³ = 4³ = 64 cm³.", points: 20 },

  // ---------------- IPA (id 11-20) ----------------
  { id: 11, subject: "ipa", grade: 8, difficulty: "Mudah", question: "Organ yang berfungsi memompa darah adalah...", options: ["Paru-paru","Jantung","Ginjal","Hati"], correctAnswer: 1, explanation: "Jantung berfungsi memompa darah ke seluruh tubuh.", points: 10 },
  { id: 12, subject: "ipa", grade: 7, difficulty: "Mudah", question: "Matahari terbit dari arah...", options: ["Utara","Selatan","Timur","Barat"], correctAnswer: 2, explanation: "Matahari selalu terbit dari arah timur.", points: 10 },
  { id: 13, subject: "ipa", grade: 7, difficulty: "Mudah", question: "Air akan membeku pada suhu...", options: ["0°C","10°C","50°C","100°C"], correctAnswer: 0, explanation: "Air membeku menjadi es pada suhu 0°C.", points: 10 },
  { id: 14, subject: "ipa", grade: 8, difficulty: "Mudah", question: "Proses tumbuhan membuat makanan disebut...", options: ["Respirasi","Fotosintesis","Fermentasi","Evaporasi"], correctAnswer: 1, explanation: "Fotosintesis adalah proses tumbuhan membuat makanan menggunakan cahaya matahari.", points: 10 },
  { id: 15, subject: "ipa", grade: 7, difficulty: "Sedang", question: "Planet yang paling dekat dengan matahari adalah...", options: ["Bumi","Venus","Merkurius","Mars"], correctAnswer: 2, explanation: "Merkurius adalah planet terdekat dengan matahari dalam tata surya.", points: 15 },
  { id: 16, subject: "ipa", grade: 8, difficulty: "Sedang", question: "Alat untuk mengukur suhu disebut...", options: ["Barometer","Termometer","Speedometer","Altimeter"], correctAnswer: 1, explanation: "Termometer digunakan untuk mengukur suhu suatu benda.", points: 15 },
  { id: 17, subject: "ipa", grade: 8, difficulty: "Sedang", question: "Gas yang dibutuhkan manusia untuk bernapas adalah...", options: ["Oksigen","Karbon dioksida","Nitrogen","Hidrogen"], correctAnswer: 0, explanation: "Manusia bernapas dengan menghirup oksigen.", points: 15 },
  { id: 18, subject: "ipa", grade: 9, difficulty: "Sulit", question: "Perubahan wujud dari gas menjadi cair disebut...", options: ["Menguap","Mengembun","Membeku","Menyublim"], correctAnswer: 1, explanation: "Mengembun adalah perubahan wujud dari gas menjadi cair.", points: 20 },
  { id: 19, subject: "ipa", grade: 9, difficulty: "Sulit", question: "Bagian sel yang mengatur seluruh kegiatan sel adalah...", options: ["Mitokondria","Nukleus","Ribosom","Sitoplasma"], correctAnswer: 1, explanation: "Nukleus (inti sel) berfungsi mengatur seluruh kegiatan sel.", points: 20 },
  { id: 20, subject: "ipa", grade: 9, difficulty: "Sulit", question: "Hewan berikut yang mengalami metamorfosis sempurna adalah...", options: ["Belalang","Kupu-kupu","Capung","Kecoa"], correctAnswer: 1, explanation: "Kupu-kupu mengalami metamorfosis sempurna: telur-larva-pupa-dewasa.", points: 20 },
  { id: 91, subject: "ipa", grade: 7, difficulty: "Mudah", question: "Tumbuhan menyerap air dari dalam tanah melalui...", options: ["Akar","Daun","Batang","Bunga"], correctAnswer: 0, explanation: "Akar berfungsi menyerap air dan mineral dari dalam tanah.", points: 10 },
  { id: 98, subject: "ipa", grade: 7, difficulty: "Mudah", question: "Sumber energi utama bagi kehidupan di bumi adalah...", options: ["Matahari","Bulan","Bintang","Angin"], correctAnswer: 0, explanation: "Matahari adalah sumber energi utama bagi hampir semua kehidupan di bumi.", points: 10 },
  { id: 92, subject: "ipa", grade: 8, difficulty: "Mudah", question: "Bagian mata yang peka terhadap cahaya adalah...", options: ["Retina","Kornea","Pupil","Lensa"], correctAnswer: 0, explanation: "Retina adalah bagian mata yang peka terhadap cahaya dan meneruskannya ke otak.", points: 10 },
  { id: 93, subject: "ipa", grade: 8, difficulty: "Sedang", question: "Perubahan wujud zat dari padat langsung menjadi gas disebut...", options: ["Menyublim","Mencair","Membeku","Mengembun"], correctAnswer: 0, explanation: "Menyublim adalah perubahan wujud dari padat langsung menjadi gas, contohnya kapur barus.", points: 15 },
  { id: 94, subject: "ipa", grade: 8, difficulty: "Sedang", question: "Gaya yang menyebabkan benda jatuh ke bawah disebut gaya...", options: ["Gravitasi","Gesek","Magnet","Pegas"], correctAnswer: 0, explanation: "Gaya gravitasi bumi menarik semua benda ke bawah.", points: 15 },
  { id: 95, subject: "ipa", grade: 8, difficulty: "Sedang", question: "Hewan berikut yang termasuk kelompok mamalia adalah...", options: ["Paus","Hiu","Buaya","Ular"], correctAnswer: 0, explanation: "Paus menyusui anaknya dan bernapas dengan paru-paru, sehingga termasuk mamalia meski hidup di laut.", points: 15 },
  { id: 99, subject: "ipa", grade: 8, difficulty: "Sedang", question: "Bagian tumbuhan yang berkembang menjadi buah adalah...", options: ["Bunga","Daun","Akar","Batang"], correctAnswer: 0, explanation: "Setelah proses penyerbukan, bunga akan berkembang menjadi buah yang berisi biji.", points: 15 },
  { id: 96, subject: "ipa", grade: 9, difficulty: "Sulit", question: "Zat yang mempercepat reaksi kimia tanpa ikut bereaksi disebut...", options: ["Katalis","Enzim","Pelarut","Reduktor"], correctAnswer: 0, explanation: "Katalis mempercepat laju reaksi kimia tanpa dirinya ikut berubah secara permanen.", points: 20 },
  { id: 97, subject: "ipa", grade: 9, difficulty: "Sulit", question: "Satuan gaya dalam Sistem Internasional (SI) adalah...", options: ["Newton","Joule","Watt","Pascal"], correctAnswer: 0, explanation: "Newton (N) adalah satuan gaya dalam SI, sesuai nama fisikawan Isaac Newton.", points: 20 },
  { id: 100, subject: "ipa", grade: 9, difficulty: "Sulit", question: "Hukum kekekalan energi menyatakan bahwa...", options: ["Energi tidak dapat diciptakan atau dimusnahkan, hanya berubah bentuk","Energi selalu bertambah dengan sendirinya","Energi bisa hilang begitu saja","Energi hanya memiliki satu bentuk"], correctAnswer: 0, explanation: "Hukum kekekalan energi: energi tidak dapat diciptakan/dimusnahkan, hanya berubah dari satu bentuk ke bentuk lain.", points: 20 },

  // ---------------- IPS (id 21-30) ----------------
  { id: 21, subject: "ips", grade: 7, difficulty: "Mudah", question: "Ibu kota negara Indonesia adalah...", options: ["Bandung","Jakarta","Surabaya","Medan"], correctAnswer: 1, explanation: "Jakarta adalah ibu kota negara Indonesia.", points: 10 },
  { id: 22, subject: "ips", grade: 7, difficulty: "Mudah", question: "Benua terluas di dunia adalah...", options: ["Afrika","Asia","Eropa","Amerika"], correctAnswer: 1, explanation: "Asia adalah benua dengan luas wilayah terbesar di dunia.", points: 10 },
  { id: 23, subject: "ips", grade: 7, difficulty: "Mudah", question: "Bendera Indonesia berwarna...", options: ["Merah putih","Merah kuning","Putih biru","Kuning hijau"], correctAnswer: 0, explanation: "Bendera Indonesia berwarna merah putih.", points: 10 },
  { id: 24, subject: "ips", grade: 8, difficulty: "Mudah", question: "Proklamator kemerdekaan Indonesia adalah...", options: ["Soekarno-Hatta","Soeharto","Habibie","Sudirman"], correctAnswer: 0, explanation: "Soekarno dan Mohammad Hatta adalah proklamator kemerdekaan Indonesia.", points: 10 },
  { id: 25, subject: "ips", grade: 8, difficulty: "Sedang", question: "Samudra terluas di dunia adalah...", options: ["Atlantik","Pasifik","Hindia","Arktik"], correctAnswer: 1, explanation: "Samudra Pasifik adalah samudra terluas di dunia.", points: 15 },
  { id: 26, subject: "ips", grade: 8, difficulty: "Sedang", question: "Mata uang negara Jepang adalah...", options: ["Won","Yen","Rupiah","Ringgit"], correctAnswer: 1, explanation: "Yen adalah mata uang resmi negara Jepang.", points: 15 },
  { id: 27, subject: "ips", grade: 9, difficulty: "Sedang", question: "Gunung tertinggi di dunia adalah...", options: ["Gunung Everest","Gunung Fuji","Gunung Kilimanjaro","Gunung Rinjani"], correctAnswer: 0, explanation: "Gunung Everest adalah gunung tertinggi di dunia.", points: 15 },
  { id: 28, subject: "ips", grade: 9, difficulty: "Sulit", question: "ASEAN didirikan pada tahun...", options: ["1965","1967","1970","1975"], correctAnswer: 1, explanation: "ASEAN didirikan pada tanggal 8 Agustus 1967.", points: 20 },
  { id: 29, subject: "ips", grade: 9, difficulty: "Sulit", question: "Organisasi PBB didirikan pada tahun...", options: ["1942","1945","1950","1955"], correctAnswer: 1, explanation: "PBB (Perserikatan Bangsa-Bangsa) didirikan pada tahun 1945.", points: 20 },
  { id: 30, subject: "ips", grade: 9, difficulty: "Sulit", question: "Candi Buddha terbesar di Indonesia adalah...", options: ["Candi Prambanan","Candi Borobudur","Candi Mendut","Candi Kalasan"], correctAnswer: 1, explanation: "Candi Borobudur adalah candi Buddha terbesar di Indonesia.", points: 20 },
  { id: 102, subject: "ips", grade: 7, difficulty: "Mudah", question: "Mata uang resmi negara Indonesia adalah...", options: ["Rupiah","Ringgit","Baht","Peso"], correctAnswer: 0, explanation: "Rupiah adalah mata uang resmi Negara Kesatuan Republik Indonesia.", points: 10 },
  { id: 107, subject: "ips", grade: 7, difficulty: "Mudah", question: "Ibu kota Provinsi Jawa Barat adalah...", options: ["Bandung","Semarang","Surabaya","Yogyakarta"], correctAnswer: 0, explanation: "Bandung adalah ibu kota Provinsi Jawa Barat.", points: 10 },
  { id: 103, subject: "ips", grade: 8, difficulty: "Sedang", question: "Kegiatan ekonomi yang menghasilkan barang atau jasa disebut...", options: ["Produksi","Distribusi","Konsumsi","Promosi"], correctAnswer: 0, explanation: "Produksi adalah kegiatan menghasilkan atau menambah nilai guna barang/jasa.", points: 15 },
  { id: 108, subject: "ips", grade: 8, difficulty: "Sedang", question: "Kegiatan menyalurkan barang dari produsen ke konsumen disebut...", options: ["Distribusi","Produksi","Konsumsi","Investasi"], correctAnswer: 0, explanation: "Distribusi adalah kegiatan menyalurkan barang/jasa dari produsen ke konsumen.", points: 15 },
  { id: 104, subject: "ips", grade: 8, difficulty: "Sedang", question: "Kerajaan Hindu tertua di Indonesia adalah...", options: ["Kerajaan Kutai","Kerajaan Majapahit","Kerajaan Sriwijaya","Kesultanan Demak"], correctAnswer: 0, explanation: "Kerajaan Kutai di Kalimantan Timur adalah kerajaan Hindu tertua di Indonesia.", points: 15 },
  { id: 110, subject: "ips", grade: 8, difficulty: "Sedang", question: "Peta yang menggambarkan bentuk permukaan bumi (tinggi-rendah wilayah) disebut...", options: ["Peta topografi","Peta politik","Peta tematik","Peta buta"], correctAnswer: 0, explanation: "Peta topografi menggambarkan ketinggian dan bentuk relief permukaan bumi.", points: 15 },
  { id: 106, subject: "ips", grade: 9, difficulty: "Sulit", question: "Peristiwa 10 November diperingati sebagai...", options: ["Hari Pahlawan","Hari Kemerdekaan","Hari Kebangkitan Nasional","Hari Sumpah Pemuda"], correctAnswer: 0, explanation: "10 November diperingati sebagai Hari Pahlawan, mengenang pertempuran di Surabaya.", points: 20 },
  { id: 109, subject: "ips", grade: 9, difficulty: "Sulit", question: "Organisasi kerja sama ekonomi negara-negara Asia Pasifik disingkat...", options: ["APEC","ASEAN","OPEC","NATO"], correctAnswer: 0, explanation: "APEC (Asia-Pacific Economic Cooperation) adalah forum kerja sama ekonomi negara Asia Pasifik.", points: 20 },
  { id: 105, subject: "ips", grade: 9, difficulty: "Sulit", question: "Lembaga dunia yang mengatur dan mengawasi perdagangan antarnegara adalah...", options: ["WTO","UNESCO","WHO","UNICEF"], correctAnswer: 0, explanation: "WTO (World Trade Organization) adalah lembaga yang mengatur perdagangan dunia.", points: 20 },

  // ---------------- BAHASA INDONESIA (id 31-40) ----------------
  { id: 31, subject: "bahasa-indonesia", grade: 7, difficulty: "Mudah", question: "Sinonim dari kata 'senang' adalah...", options: ["Sedih","Gembira","Marah","Takut"], correctAnswer: 1, explanation: "Sinonim (persamaan makna) dari 'senang' adalah 'gembira'.", points: 10 },
  { id: 32, subject: "bahasa-indonesia", grade: 7, difficulty: "Mudah", question: "Antonim dari kata 'besar' adalah...", options: ["Kecil","Tinggi","Luas","Panjang"], correctAnswer: 0, explanation: "Antonim (lawan kata) dari 'besar' adalah 'kecil'.", points: 10 },
  { id: 33, subject: "bahasa-indonesia", grade: 7, difficulty: "Mudah", question: "Kata dasar dari 'bermain' adalah...", options: ["Main","Ber","Mainan","Bermain"], correctAnswer: 0, explanation: "Kata dasar dari 'bermain' adalah 'main', mendapat imbuhan 'ber-'.", points: 10 },
  { id: 34, subject: "bahasa-indonesia", grade: 8, difficulty: "Mudah", question: "Huruf pertama pada awal kalimat harus menggunakan...", options: ["Huruf kecil","Huruf kapital","Angka","Simbol"], correctAnswer: 1, explanation: "Awal kalimat selalu diawali huruf kapital.", points: 10 },
  { id: 35, subject: "bahasa-indonesia", grade: 8, difficulty: "Sedang", question: "Kalimat 'Tolong tutup pintu itu!' termasuk kalimat...", options: ["Berita","Tanya","Perintah","Seru"], correctAnswer: 2, explanation: "Kalimat yang meminta seseorang melakukan sesuatu disebut kalimat perintah.", points: 15 },
  { id: 36, subject: "bahasa-indonesia", grade: 8, difficulty: "Sedang", question: "Imbuhan 'me-' pada kata 'menulis' menunjukkan...", options: ["Tempat","Kata kerja","Kata sifat","Jumlah"], correctAnswer: 1, explanation: "Imbuhan 'me-' pada 'menulis' membentuk kata kerja aktif.", points: 15 },
  { id: 37, subject: "bahasa-indonesia", grade: 9, difficulty: "Sedang", question: "Contoh kata sifat adalah...", options: ["Berlari","Indah","Meja","Dan"], correctAnswer: 1, explanation: "'Indah' adalah kata sifat karena menggambarkan keadaan/sifat sesuatu.", points: 15 },
  { id: 38, subject: "bahasa-indonesia", grade: 9, difficulty: "Sulit", question: "Majas yang membandingkan dua hal secara langsung disebut...", options: ["Metafora","Personifikasi","Hiperbola","Ironi"], correctAnswer: 0, explanation: "Metafora adalah majas perbandingan langsung tanpa kata penghubung.", points: 20 },
  { id: 39, subject: "bahasa-indonesia", grade: 9, difficulty: "Sulit", question: "Karya sastra 4 baris bersajak a-b-a-b disebut...", options: ["Syair","Pantun","Gurindam","Puisi bebas"], correctAnswer: 1, explanation: "Pantun adalah puisi lama 4 baris dengan sajak a-b-a-b.", points: 20 },
  { id: 40, subject: "bahasa-indonesia", grade: 9, difficulty: "Sulit", question: "Kalimat pasif biasanya ditandai dengan awalan...", options: ["me-","di-","ke-","per-"], correctAnswer: 1, explanation: "Kalimat pasif dalam Bahasa Indonesia umumnya ditandai awalan 'di-'.", points: 20 },
  { id: 111, subject: "bahasa-indonesia", grade: 7, difficulty: "Mudah", question: "Kata ulang dari kata 'rumah' adalah...", options: ["Rumah-rumah","Rumahan","Rumah-rumahan","Perumahan"], correctAnswer: 0, explanation: "Kata ulang utuh dari 'rumah' adalah 'rumah-rumah'.", points: 10 },
  { id: 118, subject: "bahasa-indonesia", grade: 7, difficulty: "Mudah", question: "Huruf vokal pada kata 'meja' berjumlah...", options: ["2","3","1","4"], correctAnswer: 0, explanation: "Kata 'meja' memiliki huruf vokal 'e' dan 'a', jadi berjumlah 2.", points: 10 },
  { id: 112, subject: "bahasa-indonesia", grade: 8, difficulty: "Mudah", question: "Kalimat yang berisi ajakan kepada orang lain disebut kalimat...", options: ["Ajakan","Berita","Tanya","Seru"], correctAnswer: 0, explanation: "Kalimat ajakan mengajak orang lain melakukan sesuatu, biasa memakai kata 'ayo' atau 'mari'.", points: 10 },
  { id: 113, subject: "bahasa-indonesia", grade: 8, difficulty: "Sedang", question: "Teks yang menceritakan pengalaman pribadi secara runtut disebut teks...", options: ["Narasi","Eksposisi","Deskripsi","Argumentasi"], correctAnswer: 0, explanation: "Teks narasi menceritakan rangkaian peristiwa atau pengalaman secara runtut.", points: 15 },
  { id: 114, subject: "bahasa-indonesia", grade: 8, difficulty: "Sedang", question: "Kalimat yang menyatakan hubungan sebab-akibat biasa dihubungkan kata...", options: ["Sehingga","Dan","Atau","Tetapi"], correctAnswer: 0, explanation: "Kata 'sehingga' menghubungkan sebab dengan akibat yang ditimbulkannya.", points: 15 },
  { id: 119, subject: "bahasa-indonesia", grade: 8, difficulty: "Sedang", question: "Bentuk kata baku untuk kata tidak baku 'gimana' adalah...", options: ["Bagaimana","Gimana","Kayak","Gitu"], correctAnswer: 0, explanation: "'Bagaimana' adalah bentuk baku, sedangkan 'gimana' adalah bentuk tidak baku (bahasa percakapan).", points: 15 },
  { id: 115, subject: "bahasa-indonesia", grade: 9, difficulty: "Sedang", question: "Bagian yang berisi tanggal dan alamat tujuan pada surat resmi disebut...", options: ["Kepala surat","Isi surat","Penutup surat","Lampiran"], correctAnswer: 0, explanation: "Kepala surat memuat identitas pengirim, tanggal, dan tujuan surat.", points: 15 },
  { id: 116, subject: "bahasa-indonesia", grade: 9, difficulty: "Sulit", question: "Gaya bahasa yang melebih-lebihkan suatu keadaan disebut...", options: ["Hiperbola","Metafora","Personifikasi","Ironi"], correctAnswer: 0, explanation: "Hiperbola adalah majas yang melebih-lebihkan sesuatu untuk menekankan makna.", points: 20 },
  { id: 117, subject: "bahasa-indonesia", grade: 9, difficulty: "Sulit", question: "Unsur intrinsik cerita yang berisi pesan moral untuk pembaca disebut...", options: ["Amanat","Alur","Latar","Tokoh"], correctAnswer: 0, explanation: "Amanat adalah pesan moral yang ingin disampaikan pengarang melalui ceritanya.", points: 20 },
  { id: 120, subject: "bahasa-indonesia", grade: 9, difficulty: "Sulit", question: "Puisi modern yang tidak terikat rima dan jumlah baris disebut...", options: ["Puisi bebas","Pantun","Syair","Gurindam"], correctAnswer: 0, explanation: "Puisi bebas tidak terikat aturan rima, bait, maupun jumlah baris seperti puisi lama.", points: 20 },

  // ---------------- BAHASA INGGRIS (id 41-50) ----------------
  { id: 41, subject: "bahasa-inggris", grade: 7, difficulty: "Mudah", question: "'Book' dalam Bahasa Indonesia artinya...", options: ["Meja","Buku","Pensil","Tas"], correctAnswer: 1, explanation: "'Book' berarti 'buku' dalam Bahasa Indonesia.", points: 10 },
  { id: 42, subject: "bahasa-inggris", grade: 7, difficulty: "Mudah", question: "Choose the correct form: 'She ___ a student.'", options: ["is","are","am","be"], correctAnswer: 0, explanation: "Subjek tunggal orang ketiga (she) menggunakan 'is'.", points: 10 },
  { id: 43, subject: "bahasa-inggris", grade: 7, difficulty: "Mudah", question: "Antonym of 'big' is...", options: ["Large","Small","Huge","Tall"], correctAnswer: 1, explanation: "Lawan kata dari 'big' (besar) adalah 'small' (kecil).", points: 10 },
  { id: 44, subject: "bahasa-inggris", grade: 8, difficulty: "Mudah", question: "'Cat' dalam Bahasa Indonesia artinya...", options: ["Anjing","Kucing","Burung","Ikan"], correctAnswer: 1, explanation: "'Cat' berarti 'kucing' dalam Bahasa Indonesia.", points: 10 },
  { id: 45, subject: "bahasa-inggris", grade: 8, difficulty: "Sedang", question: "Choose the correct past tense of 'go':", options: ["Goed","Went","Gone","Going"], correctAnswer: 1, explanation: "Bentuk lampau (past tense) dari 'go' adalah 'went'.", points: 15 },
  { id: 46, subject: "bahasa-inggris", grade: 8, difficulty: "Sedang", question: "'They ___ to school every day.'", options: ["go","goes","going","went"], correctAnswer: 0, explanation: "Subjek jamak (they) menggunakan bentuk dasar 'go' pada simple present tense.", points: 15 },
  { id: 47, subject: "bahasa-inggris", grade: 9, difficulty: "Sedang", question: "Synonym of 'happy' is...", options: ["Sad","Angry","Glad","Tired"], correctAnswer: 2, explanation: "Persamaan makna dari 'happy' (senang) adalah 'glad'.", points: 15 },
  { id: 48, subject: "bahasa-inggris", grade: 9, difficulty: "Sulit", question: "Choose the correct sentence:", options: ["She don't like tea.","She doesn't likes tea.","She doesn't like tea.","She not like tea."], correctAnswer: 2, explanation: "Bentuk negatif yang benar untuk subjek tunggal adalah 'doesn't' + kata kerja dasar.", points: 20 },
  { id: 49, subject: "bahasa-inggris", grade: 9, difficulty: "Sulit", question: "'If it rains, I ___ stay home.' (conditional)", options: ["will","would","was","did"], correctAnswer: 0, explanation: "Pada conditional type 1, klausa hasil menggunakan 'will' + kata kerja dasar.", points: 20 },
  { id: 50, subject: "bahasa-inggris", grade: 9, difficulty: "Sulit", question: "The plural form of 'child' is...", options: ["Childs","Children","Childes","Child"], correctAnswer: 1, explanation: "Bentuk jamak dari 'child' adalah 'children' (bentuk tidak beraturan).", points: 20 },
  { id: 121, subject: "bahasa-inggris", grade: 7, difficulty: "Mudah", question: "Choose the correct sentence: 'They ___ playing football now.'", options: ["are","is","am","be"], correctAnswer: 0, explanation: "Subjek jamak 'they' menggunakan 'are' pada present continuous tense.", points: 10 },
  { id: 128, subject: "bahasa-inggris", grade: 7, difficulty: "Mudah", question: "The opposite (antonym) of 'big' is...", options: ["Small","Tall","Long","Heavy"], correctAnswer: 0, explanation: "'Small' (kecil) adalah lawan kata dari 'big' (besar).", points: 10 },
  { id: 122, subject: "bahasa-inggris", grade: 7, difficulty: "Mudah", question: "The plural form of 'book' is...", options: ["Books","Bookes","Bookies","Book"], correctAnswer: 0, explanation: "Bentuk jamak dari 'book' cukup ditambah '-s' menjadi 'books'.", points: 10 },
  { id: 123, subject: "bahasa-inggris", grade: 8, difficulty: "Sedang", question: "Choose the correct article: 'I have ___ apple.'", options: ["an","a","the","some"], correctAnswer: 0, explanation: "Kata 'apple' diawali huruf vokal, sehingga menggunakan artikel 'an'.", points: 15 },
  { id: 124, subject: "bahasa-inggris", grade: 8, difficulty: "Sedang", question: "The past tense of 'go' is...", options: ["Went","Goed","Gone","Going"], correctAnswer: 0, explanation: "Bentuk lampau dari 'go' adalah 'went' (kata kerja tidak beraturan).", points: 15 },
  { id: 129, subject: "bahasa-inggris", grade: 8, difficulty: "Sedang", question: "Choose the correct question word order: 'What time ___ it?'", options: ["is","are","do","does"], correctAnswer: 0, explanation: "Untuk menanyakan waktu (time) yang bersifat tunggal, digunakan 'is'.", points: 15 },
  { id: 126, subject: "bahasa-inggris", grade: 9, difficulty: "Sulit", question: "'This book is ___ than that one.' (comparative of 'good')", options: ["better","gooder","best","more good"], correctAnswer: 0, explanation: "Bentuk komparatif dari 'good' yang tidak beraturan adalah 'better'.", points: 20 },
  { id: 127, subject: "bahasa-inggris", grade: 9, difficulty: "Sulit", question: "Choose the correct passive voice of: 'They clean the room.'", options: ["The room is cleaned by them.","The room cleans them.","They is cleaned room.","Room the is cleaned."], correctAnswer: 0, explanation: "Kalimat pasif dibentuk: subjek + to be + verb-3 + by + pelaku.", points: 20 },
  { id: 130, subject: "bahasa-inggris", grade: 9, difficulty: "Sulit", question: "'If I ___ rich, I would travel the world.' (conditional type 2)", options: ["were","was","am","be"], correctAnswer: 0, explanation: "Pada conditional type 2, digunakan 'were' untuk semua subjek (termasuk I) sebagai bentuk pengandaian.", points: 20 },

  // ---------------- PPKn (id 51-60) ----------------
  { id: 51, subject: "ppkn", grade: 7, difficulty: "Mudah", question: "Lambang negara Indonesia adalah Garuda...", options: ["Pancasila","Nusantara","Indonesia","Merdeka"], correctAnswer: 0, explanation: "Lambang negara Indonesia adalah Garuda Pancasila.", points: 10 },
  { id: 52, subject: "ppkn", grade: 7, difficulty: "Mudah", question: "Sila pertama Pancasila berbunyi...", options: ["Ketuhanan Yang Maha Esa","Kemanusiaan yang Adil dan Beradab","Persatuan Indonesia","Keadilan Sosial"], correctAnswer: 0, explanation: "Sila pertama Pancasila adalah 'Ketuhanan Yang Maha Esa'.", points: 10 },
  { id: 53, subject: "ppkn", grade: 7, difficulty: "Mudah", question: "Hari lahir Pancasila diperingati setiap tanggal...", options: ["1 Juni","17 Agustus","28 Oktober","10 November"], correctAnswer: 0, explanation: "Hari lahir Pancasila diperingati setiap tanggal 1 Juni.", points: 10 },
  { id: 54, subject: "ppkn", grade: 8, difficulty: "Mudah", question: "UUD 1945 disahkan pada tanggal...", options: ["17 Agustus 1945","18 Agustus 1945","1 Juni 1945","22 Juni 1945"], correctAnswer: 1, explanation: "UUD 1945 disahkan sehari setelah proklamasi, yaitu 18 Agustus 1945.", points: 10 },
  { id: 55, subject: "ppkn", grade: 8, difficulty: "Sedang", question: "Lembaga yang berwenang membuat undang-undang adalah...", options: ["DPR","MA","MK","BPK"], correctAnswer: 0, explanation: "DPR (Dewan Perwakilan Rakyat) berwenang membentuk undang-undang.", points: 15 },
  { id: 56, subject: "ppkn", grade: 8, difficulty: "Sedang", question: "Bhinneka Tunggal Ika memiliki arti...", options: ["Berbeda-beda tetapi tetap satu","Bersatu kita teguh","Satu nusa satu bangsa","Merdeka atau mati"], correctAnswer: 0, explanation: "Bhinneka Tunggal Ika berarti 'berbeda-beda tetapi tetap satu jua'.", points: 15 },
  { id: 57, subject: "ppkn", grade: 9, difficulty: "Sedang", question: "Presiden Indonesia dipilih melalui...", options: ["Pemilu","Penunjukan MPR","Keturunan","Seleksi DPR"], correctAnswer: 0, explanation: "Presiden Indonesia dipilih langsung oleh rakyat melalui Pemilu.", points: 15 },
  { id: 58, subject: "ppkn", grade: 9, difficulty: "Sulit", question: "Jumlah sila dalam Pancasila adalah...", options: ["4","5","6","7"], correctAnswer: 1, explanation: "Pancasila terdiri dari 5 sila.", points: 20 },
  { id: 59, subject: "ppkn", grade: 9, difficulty: "Sulit", question: "Lembaga yang mengawasi keuangan negara adalah...", options: ["BPK","KPK","MK","MA"], correctAnswer: 0, explanation: "BPK (Badan Pemeriksa Keuangan) bertugas mengawasi keuangan negara.", points: 20 },
  { id: 60, subject: "ppkn", grade: 9, difficulty: "Sulit", question: "Pasal tentang hak asasi manusia dalam UUD 1945 terdapat pada bab...", options: ["Bab IX","Bab X","Bab XA","Bab XI"], correctAnswer: 2, explanation: "Hak asasi manusia diatur dalam Bab XA UUD 1945 (Pasal 28A-28J).", points: 20 },
  { id: 131, subject: "ppkn", grade: 7, difficulty: "Mudah", question: "Semboyan negara Indonesia yang tertulis di lambang Garuda adalah...", options: ["Bhinneka Tunggal Ika","Garuda Pancasila","Merdeka atau Mati","Satu Nusa Satu Bangsa"], correctAnswer: 0, explanation: "Semboyan 'Bhinneka Tunggal Ika' tertulis pada pita yang dicengkeram Garuda Pancasila.", points: 10 },
  { id: 137, subject: "ppkn", grade: 7, difficulty: "Mudah", question: "Contoh sikap menghargai keberagaman di lingkungan sekolah adalah...", options: ["Toleransi","Diskriminasi","Egois","Acuh tak acuh"], correctAnswer: 0, explanation: "Toleransi adalah sikap menghargai perbedaan yang ada di sekitar kita.", points: 10 },
  { id: 140, subject: "ppkn", grade: 7, difficulty: "Mudah", question: "Bendera pusaka kemerdekaan Indonesia bernama...", options: ["Sang Saka Merah Putih","Garuda Pancasila","Bhinneka Tunggal Ika","Merah Putih Berkibar"], correctAnswer: 0, explanation: "Bendera pusaka yang dikibarkan saat proklamasi disebut Sang Saka Merah Putih.", points: 10 },
  { id: 132, subject: "ppkn", grade: 8, difficulty: "Mudah", question: "Hari Kesaktian Pancasila diperingati setiap tanggal...", options: ["1 Oktober","1 Juni","17 Agustus","28 Oktober"], correctAnswer: 0, explanation: "Hari Kesaktian Pancasila diperingati setiap tanggal 1 Oktober.", points: 10 },
  { id: 133, subject: "ppkn", grade: 8, difficulty: "Sedang", question: "Lembaga negara yang berwenang mengadili sengketa hasil pemilu adalah...", options: ["Mahkamah Konstitusi","Mahkamah Agung","DPR","BPK"], correctAnswer: 0, explanation: "Mahkamah Konstitusi (MK) berwenang mengadili sengketa hasil pemilihan umum.", points: 15 },
  { id: 135, subject: "ppkn", grade: 8, difficulty: "Sedang", question: "Sistem pemerintahan yang dianut negara Indonesia adalah...", options: ["Presidensial","Parlementer","Monarki","Liberal"], correctAnswer: 0, explanation: "Indonesia menganut sistem pemerintahan presidensial, di mana presiden adalah kepala negara sekaligus kepala pemerintahan.", points: 15 },
  { id: 138, subject: "ppkn", grade: 9, difficulty: "Sedang", question: "Norma yang bersumber dari hati nurani manusia disebut norma...", options: ["Kesusilaan","Hukum","Agama","Kesopanan"], correctAnswer: 0, explanation: "Norma kesusilaan bersumber dari hati nurani manusia tentang baik dan buruk.", points: 15 },
  { id: 136, subject: "ppkn", grade: 9, difficulty: "Sulit", question: "Proses perubahan pasal-pasal dalam UUD 1945 disebut...", options: ["Amandemen","Referendum","Konstitusi","Proklamasi"], correctAnswer: 0, explanation: "Amandemen adalah proses perubahan terhadap pasal-pasal dalam suatu undang-undang dasar.", points: 20 },
  { id: 139, subject: "ppkn", grade: 9, difficulty: "Sulit", question: "Lembaga yang berwenang menguji undang-undang terhadap UUD 1945 adalah...", options: ["Mahkamah Konstitusi","Mahkamah Agung","DPR","Presiden"], correctAnswer: 0, explanation: "Mahkamah Konstitusi berwenang menguji undang-undang terhadap UUD 1945 (judicial review).", points: 20 },

  // ---------------- INFORMATIKA (id 61-70) ----------------
  { id: 61, subject: "informatika", grade: 7, difficulty: "Mudah", question: "Perangkat keras komputer disebut...", options: ["Software","Hardware","Brainware","Freeware"], correctAnswer: 1, explanation: "Perangkat keras komputer disebut hardware.", points: 10 },
  { id: 62, subject: "informatika", grade: 7, difficulty: "Mudah", question: "Singkatan dari CPU adalah...", options: ["Central Processing Unit","Computer Personal Unit","Central Program Unit","Control Processing Unit"], correctAnswer: 0, explanation: "CPU adalah singkatan dari Central Processing Unit.", points: 10 },
  { id: 63, subject: "informatika", grade: 7, difficulty: "Mudah", question: "Contoh sistem operasi adalah...", options: ["Windows","Word","Excel","Chrome"], correctAnswer: 0, explanation: "Windows adalah contoh sistem operasi komputer.", points: 10 },
  { id: 64, subject: "informatika", grade: 8, difficulty: "Mudah", question: "Alat untuk menyimpan data secara permanen adalah...", options: ["RAM","Hard Disk","Monitor","Keyboard"], correctAnswer: 1, explanation: "Hard Disk digunakan untuk menyimpan data secara permanen.", points: 10 },
  { id: 65, subject: "informatika", grade: 8, difficulty: "Sedang", question: "Bahasa untuk membuat struktur halaman web adalah...", options: ["HTML","Excel","Photoshop","Word"], correctAnswer: 0, explanation: "HTML digunakan untuk membuat struktur halaman web.", points: 15 },
  { id: 66, subject: "informatika", grade: 8, difficulty: "Sedang", question: "Singkatan dari URL adalah...", options: ["Uniform Resource Locator","United Resource Link","Universal Result Locator","Unique Resource Locator"], correctAnswer: 0, explanation: "URL adalah singkatan dari Uniform Resource Locator.", points: 15 },
  { id: 67, subject: "informatika", grade: 9, difficulty: "Sedang", question: "Jaringan komputer dalam area kecil (misal satu gedung) disebut...", options: ["WAN","LAN","MAN","VPN"], correctAnswer: 1, explanation: "LAN (Local Area Network) adalah jaringan dalam area kecil.", points: 15 },
  { id: 68, subject: "informatika", grade: 9, difficulty: "Sulit", question: "Kode biner untuk bilangan 'satu' adalah...", options: ["1","01","10","11"], correctAnswer: 0, explanation: "Bilangan desimal 1 dalam biner ditulis sebagai '1'.", points: 20 },
  { id: 69, subject: "informatika", grade: 9, difficulty: "Sulit", question: "Algoritma pengurutan yang membandingkan elemen berdekatan disebut...", options: ["Bubble Sort","Quick Sort","Merge Sort","Binary Search"], correctAnswer: 0, explanation: "Bubble Sort mengurutkan dengan membandingkan pasangan elemen berdekatan berulang kali.", points: 20 },
  { id: 70, subject: "informatika", grade: 9, difficulty: "Sulit", question: "Format file gambar yang mendukung transparansi adalah...", options: ["JPG","PNG","BMP","TIFF"], correctAnswer: 1, explanation: "PNG mendukung transparansi (alpha channel), berbeda dengan JPG.", points: 20 },
  { id: 141, subject: "informatika", grade: 7, difficulty: "Mudah", question: "Aplikasi yang digunakan untuk mengetik dokumen adalah...", options: ["Microsoft Word","Microsoft Excel","Adobe Photoshop","Windows Media Player"], correctAnswer: 0, explanation: "Microsoft Word adalah aplikasi pengolah kata untuk mengetik dokumen.", points: 10 },
  { id: 142, subject: "informatika", grade: 7, difficulty: "Mudah", question: "Program atau aplikasi komputer disebut juga...", options: ["Software","Hardware","Brainware","Firmware"], correctAnswer: 0, explanation: "Software (perangkat lunak) adalah istilah untuk program/aplikasi komputer.", points: 10 },
  { id: 148, subject: "informatika", grade: 7, difficulty: "Mudah", question: "Tombol keyboard untuk menghapus karakter di depan (kanan) kursor adalah...", options: ["Delete","Backspace","Enter","Shift"], correctAnswer: 0, explanation: "Tombol Delete menghapus karakter di depan/kanan kursor, sedangkan Backspace menghapus di belakang/kiri kursor.", points: 10 },
  { id: 143, subject: "informatika", grade: 8, difficulty: "Sedang", question: "Bahasa yang digunakan untuk mengatur tampilan (styling) halaman web adalah...", options: ["CSS","HTML","Python","Java"], correctAnswer: 0, explanation: "CSS (Cascading Style Sheets) digunakan untuk mengatur tampilan visual halaman web.", points: 15 },
  { id: 144, subject: "informatika", grade: 8, difficulty: "Sedang", question: "WWW adalah singkatan dari...", options: ["World Wide Web","World Wide Wireless","Wide World Web","World Web Wide"], correctAnswer: 0, explanation: "WWW adalah singkatan dari World Wide Web, sistem informasi berbasis internet.", points: 15 },
  { id: 149, subject: "informatika", grade: 8, difficulty: "Sedang", question: "Aplikasi yang digunakan untuk membuat presentasi adalah...", options: ["Microsoft PowerPoint","Microsoft Word","Microsoft Excel","Notepad"], correctAnswer: 0, explanation: "Microsoft PowerPoint adalah aplikasi khusus untuk membuat slide presentasi.", points: 15 },
  { id: 145, subject: "informatika", grade: 9, difficulty: "Sedang", question: "Perangkat yang menghubungkan komputer ke jaringan internet disebut...", options: ["Modem","Monitor","Keyboard","Printer"], correctAnswer: 0, explanation: "Modem berfungsi menghubungkan komputer/jaringan lokal ke jaringan internet.", points: 15 },
  { id: 146, subject: "informatika", grade: 9, difficulty: "Sulit", question: "Sistem bilangan dasar yang digunakan oleh komputer untuk mengolah data adalah...", options: ["Biner","Desimal","Romawi","Oktal"], correctAnswer: 0, explanation: "Komputer mengolah data menggunakan sistem bilangan biner (basis 2: hanya 0 dan 1).", points: 20 },
  { id: 147, subject: "informatika", grade: 9, difficulty: "Sulit", question: "Proses mengubah data mentah menjadi informasi yang bermakna disebut...", options: ["Pengolahan data","Penyimpanan data","Transmisi data","Enkripsi data"], correctAnswer: 0, explanation: "Pengolahan data adalah proses mengubah data mentah menjadi informasi yang berguna.", points: 20 },
  { id: 150, subject: "informatika", grade: 9, difficulty: "Sulit", question: "Protokol yang digunakan untuk mengirim surat elektronik (email) adalah...", options: ["SMTP","HTTP","FTP","TCP"], correctAnswer: 0, explanation: "SMTP (Simple Mail Transfer Protocol) digunakan untuk mengirim email.", points: 20 },

  // ---------------- PENDIDIKAN AGAMA ISLAM (id 71-80) ----------------
  { id: 71, subject: "pai", grade: 7, difficulty: "Mudah", question: "Rukun Islam yang pertama adalah...", options: ["Syahadat","Salat","Zakat","Puasa"], correctAnswer: 0, explanation: "Rukun Islam pertama adalah mengucapkan dua kalimat syahadat.", points: 10 },
  { id: 72, subject: "pai", grade: 7, difficulty: "Mudah", question: "Kitab suci umat Islam adalah...", options: ["Taurat","Injil","Al-Qur'an","Zabur"], correctAnswer: 2, explanation: "Kitab suci umat Islam adalah Al-Qur'an.", points: 10 },
  { id: 73, subject: "pai", grade: 7, difficulty: "Mudah", question: "Jumlah rakaat salat Subuh adalah...", options: ["2","3","4","5"], correctAnswer: 0, explanation: "Salat Subuh terdiri dari 2 rakaat.", points: 10 },
  { id: 74, subject: "pai", grade: 8, difficulty: "Mudah", question: "Nabi terakhir dalam ajaran Islam adalah...", options: ["Nabi Isa","Nabi Musa","Nabi Muhammad SAW","Nabi Ibrahim"], correctAnswer: 2, explanation: "Nabi Muhammad SAW adalah nabi dan rasul terakhir dalam ajaran Islam.", points: 10 },
  { id: 75, subject: "pai", grade: 8, difficulty: "Sedang", question: "Bulan puasa bagi umat Islam disebut bulan...", options: ["Syawal","Ramadhan","Muharram","Rajab"], correctAnswer: 1, explanation: "Umat Islam berpuasa wajib pada bulan Ramadhan.", points: 15 },
  { id: 76, subject: "pai", grade: 8, difficulty: "Sedang", question: "Rukun Iman berjumlah...", options: ["4","5","6","7"], correctAnswer: 2, explanation: "Rukun Iman berjumlah 6 perkara.", points: 15 },
  { id: 77, subject: "pai", grade: 9, difficulty: "Sedang", question: "Tempat ibadah umat Islam disebut...", options: ["Gereja","Masjid","Vihara","Pura"], correctAnswer: 1, explanation: "Tempat ibadah umat Islam disebut masjid.", points: 15 },
  { id: 78, subject: "pai", grade: 9, difficulty: "Sulit", question: "Zakat yang dikeluarkan menjelang Idul Fitri disebut...", options: ["Zakat Mal","Zakat Fitrah","Zakat Profesi","Zakat Emas"], correctAnswer: 1, explanation: "Zakat Fitrah dikeluarkan menjelang Idul Fitri.", points: 20 },
  { id: 79, subject: "pai", grade: 9, difficulty: "Sulit", question: "Perjalanan ibadah ke Baitullah dengan syarat & rukun tertentu disebut...", options: ["Umrah","Haji","Tabligh","Dakwah"], correctAnswer: 1, explanation: "Haji adalah ibadah berkunjung ke Baitullah pada waktu tertentu dengan rukun & syarat khusus.", points: 20 },
  { id: 80, subject: "pai", grade: 9, difficulty: "Sulit", question: "Malaikat yang bertugas menyampaikan wahyu kepada nabi adalah...", options: ["Mikail","Jibril","Israfil","Izrail"], correctAnswer: 1, explanation: "Malaikat Jibril bertugas menyampaikan wahyu kepada para nabi.", points: 20 },
  { id: 151, subject: "pai", grade: 7, difficulty: "Mudah", question: "Salat wajib yang harus dikerjakan dalam sehari semalam berjumlah...", options: ["5 waktu","3 waktu","4 waktu","6 waktu"], correctAnswer: 0, explanation: "Umat Islam wajib melaksanakan salat 5 waktu dalam sehari semalam.", points: 10 },
  { id: 157, subject: "pai", grade: 7, difficulty: "Mudah", question: "Kota suci tempat umat Islam melaksanakan ibadah haji adalah...", options: ["Mekkah","Madinah","Yerusalem","Baghdad"], correctAnswer: 0, explanation: "Ibadah haji dilaksanakan di Kota Mekkah, tepatnya di Ka'bah dan sekitarnya.", points: 10 },
  { id: 152, subject: "pai", grade: 8, difficulty: "Mudah", question: "Nabi dan Rasul yang mendapat gelar Ulul Azmi berjumlah...", options: ["5","4","6","3"], correctAnswer: 0, explanation: "Terdapat 5 Rasul yang mendapat gelar Ulul Azmi karena ketabahannya luar biasa.", points: 10 },
  { id: 153, subject: "pai", grade: 8, difficulty: "Sedang", question: "Hukum melaksanakan puasa Ramadhan bagi umat Islam yang mampu adalah...", options: ["Wajib","Sunnah","Mubah","Makruh"], correctAnswer: 0, explanation: "Puasa Ramadhan hukumnya wajib bagi setiap muslim yang mampu (baligh dan berakal).", points: 15 },
  { id: 154, subject: "pai", grade: 8, difficulty: "Sedang", question: "Malaikat yang bertugas mencatat amal baik manusia adalah...", options: ["Raqib","Atid","Munkar","Nakir"], correctAnswer: 0, explanation: "Malaikat Raqib bertugas mencatat amal baik manusia, sedangkan Atid mencatat amal buruk.", points: 15 },
  { id: 155, subject: "pai", grade: 8, difficulty: "Sedang", question: "Kitab suci yang diturunkan Allah kepada Nabi Musa AS adalah...", options: ["Taurat","Injil","Zabur","Al-Qur'an"], correctAnswer: 0, explanation: "Kitab Taurat diturunkan kepada Nabi Musa AS.", points: 15 },
  { id: 158, subject: "pai", grade: 9, difficulty: "Sedang", question: "Sifat wajib bagi Allah yang berarti Allah itu Maha Esa disebut...", options: ["Wahdaniyah","Qidam","Baqa","Wujud"], correctAnswer: 0, explanation: "Wahdaniyah berarti Allah itu Esa/tunggal, tidak ada sekutu bagi-Nya.", points: 15 },
  { id: 156, subject: "pai", grade: 9, difficulty: "Sulit", question: "Rukun haji yang wajib dilaksanakan dengan berdiam diri di Padang Arafah disebut...", options: ["Wukuf","Tawaf","Sa'i","Tahallul"], correctAnswer: 0, explanation: "Wukuf di Arafah adalah rukun haji yang paling utama, dilaksanakan pada tanggal 9 Dzulhijjah.", points: 20 },
  { id: 159, subject: "pai", grade: 9, difficulty: "Sulit", question: "Wahyu pertama Al-Qur'an diturunkan kepada Nabi Muhammad SAW di gua...", options: ["Hira","Tsur","Uhud","Badar"], correctAnswer: 0, explanation: "Wahyu pertama (QS. Al-'Alaq ayat 1-5) diturunkan di Gua Hira.", points: 20 },
  { id: 160, subject: "pai", grade: 9, difficulty: "Sulit", question: "Zakat yang dikenakan atas harta kekayaan yang telah mencapai nisab disebut zakat...", options: ["Maal","Fitrah","Profesi","Emas"], correctAnswer: 0, explanation: "Zakat Maal adalah zakat harta kekayaan yang telah mencapai nisab dan haul (satu tahun kepemilikan).", points: 20 }
];

/** Daftar badge/achievement beserta syarat perolehannya (dicek di js/quiz.js) */
const BADGES = [
  { id: "first_quiz",    name: "First Quiz",     icon: "🎉", desc: "Menyelesaikan kuis pertama." },
  { id: "perfect_score", name: "Perfect Score",  icon: "💯", desc: "Mendapatkan nilai 100 dalam satu kuis." },
  { id: "quiz_master",   name: "Quiz Master",    icon: "🏆", desc: "Menyelesaikan 10 kuis." },
  { id: "hard_worker",   name: "Hard Worker",    icon: "💪", desc: "Mengerjakan kuis pada 3 hari berbeda." },
  { id: "speed_solver",  name: "Speed Solver",   icon: "⚡", desc: "Menyelesaikan kuis dengan nilai baik sebelum waktu habis." }
];


/* ============================== 2. STORAGE.JS ============================== */
/* ============================================================
   STORAGE.JS
   Semua akses ke localStorage HARUS lewat file ini.
   Tujuannya: satu tempat yang menangani try/catch, validasi data,
   dan nilai default, supaya data localStorage yang rusak/hilang
   TIDAK PERNAH membuat aplikasi crash (poin 22 & 23 requirement).
   ============================================================ */

const STORAGE_PREFIX = "quizmaster_";

/** Ambil data dari localStorage dengan aman. Kembalikan defaultValue jika gagal/tidak ada. */
function loadFromStorage(key, defaultValue) {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if (raw === null || raw === undefined) return defaultValue;
    const parsed = JSON.parse(raw);
    if (parsed === null || parsed === undefined) return defaultValue;
    return parsed;
  } catch (err) {
    console.error("Gagal membaca localStorage untuk kunci '" + key + "':", err);
    return defaultValue;
  }
}

/** Simpan data ke localStorage dengan aman. Mengembalikan true/false. */
function saveToStorage(key, value) {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.error("Gagal menyimpan localStorage untuk kunci '" + key + "':", err);
    return false;
  }
}

function removeFromStorage(key) {
  try {
    localStorage.removeItem(STORAGE_PREFIX + key);
  } catch (err) {
    console.error("Gagal menghapus localStorage untuk kunci '" + key + "':", err);
  }
}

/** Struktur default untuk profil pengguna */
function getDefaultProfile() {
  return {
    name: "Pelajar",
    avatar: "🧑‍🎓",
    xp: 0,
    badges: [],       // array of badge id (string)
    soundOn: true,
    bgMotionOn: true,
    createdAt: new Date().toISOString()
  };
}

/** Validasi ringan supaya profil yang korup tidak membuat app crash */
function sanitizeProfile(profile) {
  const def = getDefaultProfile();
  if (!profile || typeof profile !== "object") return def;
  return {
    name: typeof profile.name === "string" && profile.name.trim() ? profile.name.trim() : def.name,
    avatar: typeof profile.avatar === "string" && profile.avatar ? profile.avatar : def.avatar,
    xp: typeof profile.xp === "number" && !isNaN(profile.xp) && profile.xp >= 0 ? profile.xp : 0,
    badges: Array.isArray(profile.badges) ? profile.badges.filter(b => typeof b === "string") : [],
    soundOn: typeof profile.soundOn === "boolean" ? profile.soundOn : true,
    bgMotionOn: typeof profile.bgMotionOn === "boolean" ? profile.bgMotionOn : true,
    createdAt: typeof profile.createdAt === "string" ? profile.createdAt : def.createdAt
  };
}

function getProfile() {
  return sanitizeProfile(loadFromStorage("profile", getDefaultProfile()));
}
function saveProfile(profile) {
  return saveToStorage("profile", sanitizeProfile(profile));
}

/** Riwayat kuis: array of history entries (lihat js/quiz.js untuk struktur lengkap) */
function getHistory() {
  const raw = loadFromStorage("history", []);
  return Array.isArray(raw) ? raw : [];
}
function saveHistory(historyArr) {
  return saveToStorage("history", Array.isArray(historyArr) ? historyArr : []);
}
function addHistoryEntry(entry) {
  const history = getHistory();
  history.unshift(entry); // terbaru di paling atas
  saveHistory(history);
  return history;
}
function clearHistory() {
  saveHistory([]);
}

/** Tema: "light" | "dark" */
function getTheme() {
  const t = loadFromStorage("theme", "light");
  return t === "dark" ? "dark" : "light";
}
function saveTheme(theme) {
  saveToStorage("theme", theme === "dark" ? "dark" : "light");
}

/** Sesi kuis yang sedang berjalan (agar bisa dilanjutkan setelah refresh) */
function getActiveSession() {
  return loadFromStorage("activeSession", null);
}
function saveActiveSession(session) {
  return saveToStorage("activeSession", session);
}
function clearActiveSession() {
  removeFromStorage("activeSession");
}

/** ID sesi hasil terakhir, dipakai agar halaman Hasil tahan refresh tanpa hitung ulang XP */
function getLastResultSessionId() {
  return loadFromStorage("lastResultSessionId", null);
}
function saveLastResultSessionId(id) {
  saveToStorage("lastResultSessionId", id);
}

/** Menghapus SELURUH data aplikasi (dipakai fitur "Reset Data" di Pengaturan) */
function resetAllAppData() {
  removeFromStorage("profile");
  removeFromStorage("history");
  removeFromStorage("theme");
  removeFromStorage("activeSession");
  removeFromStorage("lastResultSessionId");
}


/* ============================== 3. QUIZ.JS ============================== */
/* ============================================================
   QUIZ.JS
   Logika inti kuis: memilih soal dari bank, mengacak (tanpa mengubah
   jawaban benar), menyimpan progres pengerjaan, menghitung skor,
   XP, dan badge. File ini TIDAK menyentuh DOM secara langsung -
   semua render dilakukan oleh js/app.js supaya logika & tampilan terpisah.
   ============================================================ */

const XP_PER_CORRECT_ANSWER = 10;

/** Mengacak array tanpa mengubah array asli (Fisher-Yates) */
function shuffleArray(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Membuat id sesi kuis yang unik (tidak butuh library UUID eksternal) */
function generateSessionId() {
  return "qs_" + Date.now() + "_" + Math.random().toString(36).slice(2, 9);
}

/**
 * Mengambil soal yang tersedia sesuai filter.
 * grade "semua" / difficulty "Semua" berarti tidak difilter pada kriteria tsb.
 */
function getFilteredQuestions(subjectKey, grade, difficulty) {
  return QUESTION_BANK.filter(q => {
    if (q.subject !== subjectKey) return false;
    if (grade && grade !== "semua" && String(q.grade) !== String(grade)) return false;
    if (difficulty && difficulty !== "Semua" && q.difficulty !== difficulty) return false;
    return true;
  });
}

/**
 * Menyiapkan satu soal untuk sesi kuis: menyalin data asli lalu (opsional)
 * mengacak urutan opsi jawaban. Jawaban benar (correctAnswer) ikut di-remap
 * mengikuti posisi baru, sehingga jawaban benar TIDAK PERNAH berubah maknanya.
 */
function prepareQuestionForSession(original, randomizeOptions) {
  const q = {
    id: original.id,
    subject: original.subject,
    grade: original.grade,
    difficulty: original.difficulty,
    question: original.question,
    options: original.options.slice(),
    correctAnswer: original.correctAnswer,
    explanation: original.explanation,
    points: original.points
  };
  if (randomizeOptions) {
    const order = shuffleArray(q.options.map((_, i) => i));
    q.options = order.map(i => original.options[i]);
    q.correctAnswer = order.indexOf(original.correctAnswer);
  }
  return q;
}

/**
 * Memulai sesi kuis baru. config: { subjectKey, grade, difficulty, jumlahSoal, durasiMenit, mode }
 * mode: "acak" | "berurutan"
 * Mengembalikan { success, session } atau { success:false, message } jika gagal validasi.
 */
function startQuizSession(config) {
  const pool = getFilteredQuestions(config.subjectKey, config.grade, config.difficulty);

  if (pool.length === 0) {
    return { success: false, message: "Data soal tidak tersedia untuk filter yang dipilih." };
  }
  if (!config.jumlahSoal || config.jumlahSoal < 1) {
    return { success: false, message: "Jumlah soal tidak valid." };
  }
  if (config.jumlahSoal > pool.length) {
    return { success: false, message: "Jumlah soal melebihi soal yang tersedia (maks " + pool.length + " soal)." };
  }

  const isRandom = config.mode === "acak";
  const chosenOriginals = isRandom ? shuffleArray(pool).slice(0, config.jumlahSoal) : pool.slice(0, config.jumlahSoal);
  const questions = chosenOriginals.map(q => prepareQuestionForSession(q, isRandom));

  const session = {
    sessionId: generateSessionId(),
    subjectKey: config.subjectKey,
    grade: config.grade,
    difficulty: config.difficulty,
    mode: config.mode,
    durationSeconds: config.durasiMenit * 60,
    startTimestamp: Date.now(),
    questions: questions,
    answers: questions.map(() => null),     // index pilihan (0-3) atau null
    marked: questions.map(() => false),
    currentIndex: 0,
    submitted: false
  };

  saveActiveSession(session);
  return { success: true, session: session };
}

/** Sisa waktu (detik) dihitung dari selisih waktu asli, BUKAN dari counter -
 *  ini mencegah bug timer "bertambah/dobel" saat halaman di-refresh. */
function getRemainingSeconds(session) {
  const elapsed = Math.floor((Date.now() - session.startTimestamp) / 1000);
  const remaining = session.durationSeconds - elapsed;
  return Math.max(0, remaining);
}

function recordAnswer(session, questionIndex, optionIndex) {
  if (!session || session.submitted) return session;
  if (questionIndex < 0 || questionIndex >= session.questions.length) return session;
  session.answers[questionIndex] = optionIndex;
  saveActiveSession(session);
  return session;
}

function toggleMarkQuestion(session, questionIndex) {
  if (!session || session.submitted) return session;
  if (questionIndex < 0 || questionIndex >= session.questions.length) return session;
  session.marked[questionIndex] = !session.marked[questionIndex];
  saveActiveSession(session);
  return session;
}

function goToQuestion(session, index) {
  if (!session) return session;
  const clamped = Math.max(0, Math.min(session.questions.length - 1, index));
  session.currentIndex = clamped;
  saveActiveSession(session);
  return session;
}

/**
 * Label kategori nilai untuk ditampilkan di halaman hasil.
 */
function getScoreLabel(score) {
  if (score >= 90) return "Sangat Baik";
  if (score >= 75) return "Baik";
  if (score >= 60) return "Cukup";
  return "Perlu Belajar Lagi";
}
function getScoreMotivation(score) {
  if (score === 100) return "Luar biasa! Nilai sempurna! 🌟";
  if (score >= 90) return "Hebat sekali, pertahankan ya! 🎉";
  if (score >= 75) return "Kerja bagus, terus berlatih! 👍";
  if (score >= 60) return "Sudah lumayan, ayo tingkatkan lagi! 💪";
  return "Jangan menyerah, coba lagi ya! 🙂";
}

/**
 * Menghitung XP dari skor akhir sesuai aturan section 13:
 * benar = +10 XP, bonus berdasar persentase.
 */
function calculateXP(correctCount, scorePercent) {
  let xp = correctCount * XP_PER_CORRECT_ANSWER;
  if (scorePercent === 100) xp += 50;
  else if (scorePercent >= 90) xp += 30;
  else if (scorePercent >= 80) xp += 20;
  return xp;
}

/**
 * Mengevaluasi badge baru yang berhasil dibuka berdasarkan history TERBARU (termasuk
 * entry yang baru saja ditambahkan) dan profil. Mengembalikan array id badge BARU saja
 * (badge yang sudah dimiliki sebelumnya tidak dimasukkan lagi -> mencegah duplikasi).
 */
function evaluateNewBadges(profile, history, latestEntry) {
  const owned = new Set(profile.badges);
  const newlyEarned = [];

  function award(id) {
    if (!owned.has(id)) { owned.add(id); newlyEarned.push(id); }
  }

  if (history.length >= 1) award("first_quiz");
  if (latestEntry.score === 100) award("perfect_score");
  if (history.length >= 10) award("quiz_master");

  const uniqueDays = new Set(history.map(h => h.date.slice(0, 10)));
  if (uniqueDays.size >= 3) award("hard_worker");

  if (latestEntry.finishedBy === "manual" && latestEntry.timeRemainingAtSubmit > 0 && latestEntry.score >= 60) {
    award("speed_solver");
  }

  return newlyEarned;
}

/**
 * Menyelesaikan sesi kuis (dipanggil SEKALI saja: baik lewat tombol "Selesai" atau
 * karena waktu habis). Menghitung skor, menyimpan riwayat, menambah XP & badge,
 * lalu membersihkan sesi aktif. Mengembalikan sessionId hasil untuk navigasi ke
 * halaman Hasil. Jika sesi sudah pernah disubmit sebelumnya (mis. race condition
 * tombol diklik dua kali), fungsi ini TIDAK memproses ulang (mencegah XP dobel).
 */
function finishQuizSession(session, finishedBy) {
  if (!session) return null;
  if (session.submitted) return session.sessionId; // sudah pernah diproses, jangan diulang

  const total = session.questions.length;
  let correct = 0, wrong = 0, unanswered = 0, totalPoints = 0;
  const answerDetails = session.questions.map((q, i) => {
    const selected = session.answers[i];
    const isCorrect = selected !== null && selected === q.correctAnswer;
    if (selected === null || selected === undefined) unanswered++;
    else if (isCorrect) { correct++; totalPoints += q.points; }
    else wrong++;
    return {
      questionId: q.id,
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      selected: (selected === null || selected === undefined) ? null : selected,
      correct: isCorrect,
      marked: !!session.marked[i],
      explanation: q.explanation,
      points: q.points
    };
  });

  const score = Math.round((correct / total) * 100);
  const timeRemaining = getRemainingSeconds(session);
  const durationUsed = session.durationSeconds - timeRemaining;
  const xpEarned = calculateXP(correct, score);

  const historyEntry = {
    sessionId: session.sessionId,
    date: new Date().toISOString(),
    subject: session.subjectKey,
    grade: session.grade,
    difficulty: session.difficulty,
    mode: session.mode,
    totalQuestions: total,
    correct: correct,
    wrong: wrong,
    unanswered: unanswered,
    score: score,
    totalPoints: totalPoints,
    xpEarned: xpEarned,
    durationSeconds: durationUsed,
    durationLimitSeconds: session.durationSeconds,
    timeRemainingAtSubmit: timeRemaining,
    finishedBy: finishedBy, // "manual" | "timeout"
    answers: answerDetails,
    newBadges: [] // diisi setelah evaluasi badge di bawah
  };

  const history = addHistoryEntry(historyEntry);
  const profile = getProfile();
  const newBadgeIds = evaluateNewBadges(profile, history, historyEntry);

  profile.xp += xpEarned;
  profile.badges = profile.badges.concat(newBadgeIds);
  saveProfile(profile);

  // Simpan badge baru ke entry riwayat juga supaya halaman Hasil tetap konsisten setelah refresh
  historyEntry.newBadges = newBadgeIds;
  saveHistory(history.map(h => h.sessionId === historyEntry.sessionId ? historyEntry : h));

  session.submitted = true;
  clearActiveSession();
  saveLastResultSessionId(session.sessionId);

  return session.sessionId;
}


/* ============================== 4. STATISTICS.JS ============================== */
/* ============================================================
   STATISTICS.JS
   Mengolah array riwayat (history) menjadi angka statistik siap-tampil.
   Selalu menangani kasus data kosong dengan aman (tidak pernah crash).
   ============================================================ */

/**
 * Menghitung statistik keseluruhan dari riwayat.
 * Mengembalikan null jika riwayat kosong (supaya UI bisa menampilkan empty state).
 */
function computeOverallStats(history) {
  if (!Array.isArray(history) || history.length === 0) return null;

  const totalQuiz = history.length;
  const scores = history.map(h => h.score);
  const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / totalQuiz);
  const highestScore = Math.max(...scores);
  const lowestScore = Math.min(...scores);
  const totalQuestions = history.reduce((sum, h) => sum + h.totalQuestions, 0);
  const totalCorrect = history.reduce((sum, h) => sum + h.correct, 0);
  const correctPercentage = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  return { totalQuiz, avgScore, highestScore, lowestScore, totalQuestions, totalCorrect, correctPercentage };
}

/**
 * Menghitung performa per mata pelajaran: { subjectKey: { count, avgScore } }
 * Hanya memasukkan mapel yang benar-benar sudah pernah dikerjakan.
 */
function computeSubjectPerformance(history) {
  if (!Array.isArray(history) || history.length === 0) return {};

  const grouped = {};
  history.forEach(h => {
    if (!grouped[h.subject]) grouped[h.subject] = { count: 0, totalScore: 0 };
    grouped[h.subject].count += 1;
    grouped[h.subject].totalScore += h.score;
  });

  const result = {};
  Object.keys(grouped).forEach(key => {
    result[key] = {
      count: grouped[key].count,
      avgScore: Math.round(grouped[key].totalScore / grouped[key].count)
    };
  });
  return result;
}

/** Format detik menjadi "mm:ss" untuk ditampilkan */
function formatDuration(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return String(m).padStart(2, "0") + ":" + String(sec).padStart(2, "0");
}

/** Format tanggal ISO menjadi format Indonesia yang mudah dibaca */
function formatDateID(isoString) {
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) +
           " " + d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  } catch (e) {
    return "-";
  }
}


/* ============================== 5. APP.JS ============================== */
/* ============================================================
   APP.JS — QuizMaster
   Struktur file:
   1. Util umum (escape HTML, toast, modal konfirmasi, format)
   2. Navigasi & shell (sidebar, bottom nav, drawer, tema)
   3. Router (hash-based, satu #app-content)
   4. Halaman: Dashboard, Daftar Kuis, Detail Kuis, Setup Kuis
   5. Halaman: Pengerjaan Kuis (+ timer, satu sumber timer)
   6. Halaman: Hasil, Pembahasan
   7. Halaman: Riwayat, Statistik, Leaderboard, Profil, Pengaturan
   8. Inisialisasi aplikasi
   ============================================================ */

/* ================= 1. UTIL UMUM ================= */

/** Meng-escape teks agar aman dimasukkan sebagai HTML (posisi teks biasa) */
function escapeHTML(text) {
  const div = document.createElement("div");
  div.textContent = text === null || text === undefined ? "" : String(text);
  return div.innerHTML;
}
/** Meng-escape teks agar aman dimasukkan ke dalam atribut HTML (mis. value="...") */
function escapeAttr(text) {
  return escapeHTML(text).replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function getSubject(key) {
  return SUBJECTS.find(s => s.key === key) || { key: key, name: key, icon: "❓", color: "#999999" };
}

function renderEmptyState(message) {
  return `<div class="empty-state"><span class="empty-icon">📭</span><p>${escapeHTML(message)}</p></div>`;
}

/** Notifikasi toast singkat. type: "info" | "success" | "error" */
function showToast(message, type) {
  type = type || "info";
  const container = document.getElementById("toast-container");
  if (!container) return;
  const el = document.createElement("div");
  el.className = "toast toast-" + type;
  el.setAttribute("role", "status");
  el.textContent = message; // textContent -> aman dari injeksi HTML
  container.appendChild(el);
  requestAnimationFrame(() => el.classList.add("show"));
  setTimeout(() => {
    el.classList.remove("show");
    setTimeout(() => el.remove(), 300);
  }, 3200);
}

/** Dialog konfirmasi sebelum aksi berbahaya (hapus riwayat, reset data, dll) */
function showConfirm(message, onConfirm) {
  const root = document.getElementById("modal-root");
  root.innerHTML = "";
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  const box = document.createElement("div");
  box.className = "modal-box";
  box.setAttribute("role", "alertdialog");
  box.setAttribute("aria-modal", "true");

  const p = document.createElement("p");
  p.className = "modal-message";
  p.textContent = message;

  const actions = document.createElement("div");
  actions.className = "modal-actions";
  const btnCancel = document.createElement("button");
  btnCancel.className = "btn btn-secondary";
  btnCancel.textContent = "Batal";
  const btnOk = document.createElement("button");
  btnOk.className = "btn btn-danger";
  btnOk.textContent = "Ya, Lanjutkan";

  actions.appendChild(btnCancel);
  actions.appendChild(btnOk);
  box.appendChild(p);
  box.appendChild(actions);
  overlay.appendChild(box);
  root.appendChild(overlay);

  function close() { root.innerHTML = ""; }
  btnCancel.addEventListener("click", close);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });
  btnOk.addEventListener("click", () => { close(); onConfirm(); });
  btnOk.focus();
}

/** Efek bunyi klik singkat (menghormati preferensi profil.soundOn) */
let audioCtxInstance = null;
function playClickSound() {
  try {
    const profile = getProfile();
    if (!profile.soundOn) return;
    if (!audioCtxInstance) audioCtxInstance = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtxInstance.createOscillator();
    const gain = audioCtxInstance.createGain();
    osc.type = "sine"; osc.frequency.value = 440; gain.gain.value = 0.05;
    osc.connect(gain).connect(audioCtxInstance.destination);
    osc.start(); osc.stop(audioCtxInstance.currentTime + 0.06);
  } catch (e) { /* Jika audio diblokir browser, aplikasi tetap berjalan normal */ }
}

function navigateTo(hash) { window.location.hash = hash; }


/* ================= 2. NAVIGASI & SHELL ================= */

const NAV_ITEMS = [
  { route: "dashboard",   label: "Dashboard",   icon: "🏠" },
  { route: "quizzes",     label: "Daftar Kuis", icon: "📚" },
  { route: "history",     label: "Riwayat",     icon: "🕒" },
  { route: "statistics",  label: "Statistik",   icon: "📊" },
  { route: "leaderboard", label: "Leaderboard", icon: "🏆" },
  { route: "profile",     label: "Profil",      icon: "👤" },
  { route: "settings",    label: "Pengaturan",  icon: "⚙️" }
];

function buildNav() {
  const navHtml = (items, cls) => items.map(item =>
    `<button class="${cls}" data-route="${item.route}" onclick="navigateTo('#/${item.route}')" aria-label="${item.label}">
       <span class="nav-icon">${item.icon}</span><span class="${cls === "bottom-nav-link" ? "nav-label-sm" : "nav-label"}">${item.label}</span>
     </button>`
  ).join("");

  const sidebar = document.getElementById("sidebar-nav");
  if (sidebar) sidebar.innerHTML = navHtml(NAV_ITEMS, "nav-link");

  const bottomNav = document.getElementById("bottom-nav");
  if (bottomNav) bottomNav.innerHTML = navHtml(NAV_ITEMS.slice(0, 5), "bottom-nav-link");

  const drawer = document.getElementById("mobile-drawer-list");
  if (drawer) drawer.innerHTML = navHtml(NAV_ITEMS, "drawer-link");
}

function updateActiveNav(route) {
  document.querySelectorAll("[data-route]").forEach(el => {
    el.classList.toggle("active", el.getAttribute("data-route") === route);
  });
}

function toggleMobileDrawer() { document.getElementById("mobile-drawer").classList.toggle("open"); }
function closeMobileDrawer() {
  const d = document.getElementById("mobile-drawer");
  if (d) d.classList.remove("open");
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme === "dark" ? "dark" : "light");
  const btn = document.getElementById("theme-toggle-mobile");
  if (btn) btn.textContent = theme === "dark" ? "☀️" : "🌙";
}
function handleToggleThemeQuick() {
  const next = getTheme() === "dark" ? "light" : "dark";
  saveTheme(next);
  applyTheme(next);
  if (currentRoute() === "settings") renderSettings();
}
function applyBackgroundMotionPref(on) {
  document.body.classList.toggle("motion-off", !on);
}
function currentRoute() {
  return window.location.hash.replace(/^#\/?/, "").split("/").filter(Boolean)[0] || "dashboard";
}


/* ================= 3. ROUTER ================= */

function router() {
  const hash = window.location.hash.replace(/^#\/?/, "");
  const segments = hash.split("/").filter(Boolean);
  const route = segments[0] || "dashboard";
  const param = segments[1];

  if (route !== "quiz-play") stopQuizTimerLoop();
  document.body.classList.toggle("page-quiz", route === "quiz-play");

  try {
    if (route === "quiz" && param) renderQuizDetail(param);
    else if (route === "quiz-setup" && param) renderQuizSetup(param);
    else if (route === "result" && param) renderResult(param);
    else if (route === "review" && param) renderReview(param);
    else if (route === "dashboard") renderDashboard();
    else if (route === "quizzes") renderQuizList();
    else if (route === "quiz-play") renderQuizPlay();
    else if (route === "history") renderHistory();
    else if (route === "statistics") renderStatistics();
    else if (route === "leaderboard") renderLeaderboard();
    else if (route === "profile") renderProfile();
    else if (route === "settings") renderSettings();
    else renderDashboard();
  } catch (err) {
    console.error("Gagal merender halaman '" + route + "':", err);
    document.getElementById("app-content").innerHTML =
      renderEmptyState("Terjadi kesalahan saat memuat halaman ini. Silakan coba lagi atau kembali ke Dashboard.");
  }

  updateActiveNav(route);
  window.scrollTo(0, 0);
  closeMobileDrawer();

  // Sentuhan smooth: setiap halaman baru masuk dengan animasi fade+slide ringan,
  // bukan berganti kasar. Kelas dilepas-pasang lagi supaya animasi CSS terpicu ulang
  // setiap kali route berubah (reflow paksa lewat requestAnimationFrame).
  const contentEl = document.getElementById("app-content");
  if (contentEl) {
    contentEl.classList.remove("page-enter");
    void contentEl.offsetWidth; // trik reflow supaya animasi bisa diputar ulang
    contentEl.classList.add("page-enter");
  }
}
window.addEventListener("hashchange", router);


/* ================= 4. DASHBOARD, DAFTAR & DETAIL KUIS ================= */

function renderDashboard() {
  const profile = getProfile();
  const history = getHistory();
  const stats = computeOverallStats(history);
  const activeSession = getActiveSession();

  const hour = new Date().getHours();
  const greeting = hour < 10 ? "Selamat pagi" : hour < 15 ? "Selamat siang" : hour < 18 ? "Selamat sore" : "Selamat malam";

  const totalQuiz = stats ? stats.totalQuiz : 0;
  const avgScore = stats ? stats.avgScore : 0;
  const totalXP = profile.xp;
  const badgeCount = profile.badges.length;
  const level = Math.floor(totalXP / 100) + 1;
  const xpIntoLevel = totalXP % 100;
  const lastQuiz = history[0];

  const perfMap = computeSubjectPerformance(history);
  const recommended = SUBJECTS.slice().sort((a, b) => {
    const ca = perfMap[a.key] ? perfMap[a.key].count : 0;
    const cb = perfMap[b.key] ? perfMap[b.key].count : 0;
    return ca - cb;
  }).slice(0, 3);

  let html = `
    <section class="hero-section">
      <div class="hero-decor" aria-hidden="true">
        <span class="hero-icon i1">📚</span><span class="hero-icon i2">💡</span>
        <span class="hero-icon i3">✏️</span><span class="hero-icon i4">🏆</span>
      </div>
      <h1 class="page-title">${greeting}, ${escapeHTML(profile.name)}! 👋</h1>
      <p class="page-subtitle">Yuk lanjutkan belajarmu hari ini bersama QuizMaster.</p>
    </section>`;

  if (activeSession) {
    html += `
    <div class="alert-card">
      <div><strong>Kuis belum selesai</strong><p class="panel-note">${escapeHTML(getSubject(activeSession.subjectKey).name)} &middot; soal ${activeSession.currentIndex + 1}/${activeSession.questions.length}</p></div>
      <button class="btn btn-primary" onclick="navigateTo('#/quiz-play')">Lanjutkan</button>
    </div>`;
  }

  html += `
    <section class="stat-grid">
      <div class="stat-card"><div class="stat-icon">📝</div><div class="stat-value">${totalQuiz}</div><div class="stat-label">Total Kuis</div></div>
      <div class="stat-card"><div class="stat-icon">📈</div><div class="stat-value">${avgScore}</div><div class="stat-label">Rata-rata Nilai</div></div>
      <div class="stat-card"><div class="stat-icon">⚡</div><div class="stat-value">${totalXP}</div><div class="stat-label">Total XP</div></div>
      <div class="stat-card"><div class="stat-icon">🏅</div><div class="stat-value">${badgeCount}</div><div class="stat-label">Badge</div></div>
    </section>

    <section class="panel">
      <div class="panel-header"><h2>Progress Belajar</h2><span class="level-badge">Level ${level}</span></div>
      <div class="progress-track"><div class="progress-fill" style="width:${xpIntoLevel}%"></div></div>
      <p class="panel-note">${xpIntoLevel} / 100 XP menuju Level ${level + 1}</p>
    </section>

    <button class="btn btn-primary btn-large btn-full" onclick="navigateTo('#/quizzes')" style="margin-bottom:16px;">🚀 Mulai Kuis</button>`;

  if (lastQuiz) {
    html += `
    <section class="panel">
      <div class="panel-header"><h2>Kuis Terakhir</h2></div>
      <div class="last-quiz-card">
        <div>
          <strong>${getSubject(lastQuiz.subject).icon} ${escapeHTML(getSubject(lastQuiz.subject).name)}</strong>
          <p class="panel-note">${formatDateID(lastQuiz.date)} &middot; Nilai ${lastQuiz.score}</p>
        </div>
        <button class="btn btn-secondary" onclick="navigateTo('#/review/${lastQuiz.sessionId}')">Lihat</button>
      </div>
    </section>`;
  }

  html += `<section class="panel"><div class="panel-header"><h2>Rekomendasi untukmu</h2></div><div class="subject-grid">`;
  recommended.forEach(s => {
    html += `
      <button class="subject-card" style="--subject-color:${s.color}" onclick="navigateTo('#/quiz/${s.key}')">
        <span class="subject-icon">${s.icon}</span><span class="subject-name">${escapeHTML(s.name)}</span>
      </button>`;
  });
  html += `</div></section>`;

  document.getElementById("app-content").innerHTML = html;
}

let quizListFilters = { grade: "semua", difficulty: "Semua" };
function setQuizListFilter(type, value) { quizListFilters[type] = value; renderQuizList(); }

function renderQuizList() {
  let html = `<h1 class="page-title">Daftar Kuis</h1><p class="page-subtitle">Pilih mata pelajaran yang ingin kamu latih.</p>`;

  html += `<div class="filter-row">
    <div class="filter-group">
      <span class="filter-label">Kelas</span>
      <div class="chip-row">
        ${["semua", "7", "8", "9"].map(g => `<button class="chip ${quizListFilters.grade === g ? "active" : ""}" onclick="setQuizListFilter('grade','${g}')">${g === "semua" ? "Semua" : "Kelas " + g}</button>`).join("")}
      </div>
    </div>
    <div class="filter-group">
      <span class="filter-label">Kesulitan</span>
      <div class="chip-row">
        ${["Semua", "Mudah", "Sedang", "Sulit"].map(d => `<button class="chip ${quizListFilters.difficulty === d ? "active" : ""}" onclick="setQuizListFilter('difficulty','${d}')">${d}</button>`).join("")}
      </div>
    </div>
  </div>`;

  html += `<div class="subject-grid subject-grid-lg">`;
  SUBJECTS.forEach(s => {
    const count = getFilteredQuestions(s.key, quizListFilters.grade, quizListFilters.difficulty).length;
    html += `
      <button class="subject-card-lg" style="--subject-color:${s.color}" onclick="navigateTo('#/quiz/${s.key}')" ${count === 0 ? "disabled" : ""}>
        <span class="subject-icon-lg">${s.icon}</span>
        <span class="subject-name-lg">${escapeHTML(s.name)}</span>
        <span class="subject-count">${count} soal tersedia</span>
      </button>`;
  });
  html += `</div>`;

  document.getElementById("app-content").innerHTML = html;
}

function renderQuizDetail(subjectKey) {
  const subject = getSubject(subjectKey);
  const all = QUESTION_BANK.filter(q => q.subject === subjectKey);
  if (all.length === 0) {
    document.getElementById("app-content").innerHTML =
      `<button class="btn-back" onclick="navigateTo('#/quizzes')">⟵ Kembali</button>` +
      renderEmptyState("Data soal tidak tersedia untuk mata pelajaran ini.");
    return;
  }
  const byDiff = { Mudah: 0, Sedang: 0, Sulit: 0 };
  all.forEach(q => byDiff[q.difficulty]++);
  const grades = Array.from(new Set(all.map(q => q.grade))).sort();

  const html = `
    <button class="btn-back" onclick="navigateTo('#/quizzes')">⟵ Kembali ke Daftar Kuis</button>
    <div class="subject-hero" style="--subject-color:${subject.color}">
      <span class="subject-hero-icon">${subject.icon}</span>
      <h1 class="page-title">${escapeHTML(subject.name)}</h1>
      <p class="page-subtitle">${all.length} soal tersedia &middot; Kelas ${grades.join(", ")}</p>
    </div>
    <div class="stat-grid">
      <div class="stat-card"><div class="stat-value">${byDiff.Mudah}</div><div class="stat-label">Mudah</div></div>
      <div class="stat-card"><div class="stat-value">${byDiff.Sedang}</div><div class="stat-label">Sedang</div></div>
      <div class="stat-card"><div class="stat-value">${byDiff.Sulit}</div><div class="stat-label">Sulit</div></div>
    </div>
    <button class="btn btn-primary btn-large btn-full" onclick="navigateTo('#/quiz-setup/${subjectKey}')">Mulai Kuis ➜</button>`;
  document.getElementById("app-content").innerHTML = html;
}

let quizSetupState = null;

function renderQuizSetup(subjectKey) {
  const subject = getSubject(subjectKey);
  if (!QUESTION_BANK.some(q => q.subject === subjectKey)) {
    document.getElementById("app-content").innerHTML =
      `<button class="btn-back" onclick="navigateTo('#/quizzes')">⟵ Kembali</button>` +
      renderEmptyState("Data soal tidak tersedia untuk mata pelajaran ini.");
    return;
  }
  if (!quizSetupState || quizSetupState.subjectKey !== subjectKey) {
    quizSetupState = { subjectKey: subjectKey, grade: "semua", difficulty: "Semua", jumlah: 10, durasi: 10, mode: "berurutan" };
  }
  const available = getFilteredQuestions(subjectKey, quizSetupState.grade, quizSetupState.difficulty).length;
  if (quizSetupState.jumlah > available) quizSetupState.jumlah = Math.max(1, available);
  if (quizSetupState.jumlah < 1) quizSetupState.jumlah = 1;

  const grades = Array.from(new Set(QUESTION_BANK.filter(q => q.subject === subjectKey).map(q => q.grade))).sort();

  const html = `
    <button class="btn-back" onclick="navigateTo('#/quiz/${subjectKey}')">⟵ Kembali</button>
    <h1 class="page-title">${subject.icon} Atur Kuis ${escapeHTML(subject.name)}</h1>
    <p class="page-subtitle">Sesuaikan pengaturan sebelum memulai.</p>

    <div class="panel">
      <label class="form-label" for="setup-grade">Kelas</label>
      <select id="setup-grade" class="form-select" onchange="updateSetupField('grade', this.value)">
        <option value="semua" ${quizSetupState.grade === "semua" ? "selected" : ""}>Semua Kelas</option>
        ${grades.map(g => `<option value="${g}" ${String(quizSetupState.grade) === String(g) ? "selected" : ""}>Kelas ${g}</option>`).join("")}
      </select>

      <label class="form-label" for="setup-difficulty">Tingkat Kesulitan</label>
      <select id="setup-difficulty" class="form-select" onchange="updateSetupField('difficulty', this.value)">
        ${["Semua", "Mudah", "Sedang", "Sulit"].map(d => `<option value="${d}" ${quizSetupState.difficulty === d ? "selected" : ""}>${d}</option>`).join("")}
      </select>

      <label class="form-label" for="setup-jumlah">Jumlah Soal (maks ${available})</label>
      <input id="setup-jumlah" class="form-input" type="number" min="1" max="${available}" value="${quizSetupState.jumlah}" onchange="updateSetupField('jumlah', this.value)">

      <label class="form-label" for="setup-durasi">Durasi</label>
      <select id="setup-durasi" class="form-select" onchange="updateSetupField('durasi', this.value)">
        ${[5, 10, 15, 20, 30].map(m => `<option value="${m}" ${Number(quizSetupState.durasi) === m ? "selected" : ""}>${m} menit</option>`).join("")}
      </select>

      <label class="form-label">Mode Pengerjaan</label>
      <div class="chip-row">
        <button class="chip ${quizSetupState.mode === "berurutan" ? "active" : ""}" onclick="updateSetupField('mode','berurutan')">📋 Berurutan</button>
        <button class="chip ${quizSetupState.mode === "acak" ? "active" : ""}" onclick="updateSetupField('mode','acak')">🎲 Acak</button>
      </div>
    </div>

    <div class="panel">
      <div class="panel-header"><h2>Ringkasan</h2></div>
      <ul class="summary-list">
        <li>📝 <strong>${quizSetupState.jumlah}</strong> soal</li>
        <li>⏱️ <strong>${quizSetupState.durasi}</strong> menit</li>
        <li>🧮 Nilai = (jawaban benar ÷ total soal) × 100</li>
      </ul>
      ${available === 0 ? `<p class="form-error">Tidak ada soal tersedia untuk filter ini. Coba ubah kelas/kesulitan.</p>` : ""}
    </div>

    <button class="btn btn-primary btn-large btn-full" onclick="handleStartQuiz()" ${available === 0 ? "disabled" : ""}>Mulai Kuis ➜</button>`;

  document.getElementById("app-content").innerHTML = html;
}

function updateSetupField(field, value) {
  if (field === "jumlah") {
    value = parseInt(value, 10);
    if (isNaN(value) || value < 1) value = 1;
  }
  quizSetupState[field] = value;
  renderQuizSetup(quizSetupState.subjectKey);
}

function handleStartQuiz() {
  const result = startQuizSession({
    subjectKey: quizSetupState.subjectKey,
    grade: quizSetupState.grade,
    difficulty: quizSetupState.difficulty,
    jumlahSoal: quizSetupState.jumlah,
    durasiMenit: Number(quizSetupState.durasi),
    mode: quizSetupState.mode
  });
  if (!result.success) { showToast(result.message, "error"); return; }
  navigateTo("#/quiz-play");
}


/* ================= 5. PENGERJAAN KUIS (+ TIMER) ================= */

let quizTimerId = null; // SATU-SATUNYA sumber timer aktif di seluruh aplikasi

function startQuizTimerLoop(session) {
  stopQuizTimerLoop();
  updateTimerDisplayValue(getRemainingSeconds(session));
  quizTimerId = setInterval(() => {
    const current = getActiveSession();
    if (!current || current.submitted) { stopQuizTimerLoop(); return; }
    const remaining = getRemainingSeconds(current);
    updateTimerDisplayValue(remaining);
    if (remaining <= 0) {
      stopQuizTimerLoop();
      const sid = finishQuizSession(current, "timeout");
      navigateTo("#/result/" + sid);
    }
  }, 1000);
}
function stopQuizTimerLoop() {
  if (quizTimerId) { clearInterval(quizTimerId); quizTimerId = null; }
}
function updateTimerDisplayValue(remaining) {
  const el = document.getElementById("quiz-timer");
  if (!el) return;
  el.textContent = "⏱️ " + formatDuration(remaining);
  el.classList.toggle("critical", remaining <= 30);
}

function renderQuizPlay() {
  const session = getActiveSession();
  if (!session) {
    showToast("Sesi kuis tidak ditemukan. Silakan mulai kuis baru.", "error");
    navigateTo("#/quizzes");
    return;
  }
  if (getRemainingSeconds(session) <= 0) {
    const sid = finishQuizSession(session, "timeout");
    navigateTo("#/result/" + sid);
    return;
  }

  const subject = getSubject(session.subjectKey);
  const total = session.questions.length;
  const idx = session.currentIndex;
  const q = session.questions[idx];
  const selected = session.answers[idx];
  const marked = session.marked[idx];
  const percent = ((idx + 1) / total) * 100;

  let navigatorHtml = `<div class="q-navigator">`;
  session.questions.forEach((qq, i) => {
    let cls = "q-nav-dot";
    if (i === idx) cls += " active";
    else if (session.answers[i] !== null) cls += " answered";
    if (session.marked[i]) cls += " marked";
    navigatorHtml += `<button class="${cls}" onclick="jumpToQuestion(${i})" aria-label="Ke soal ${i + 1}">${i + 1}</button>`;
  });
  navigatorHtml += `</div>`;

  const letters = ["A", "B", "C", "D"];
  let optionsHtml = "";
  q.options.forEach((opt, i) => {
    optionsHtml += `
      <button class="quiz-option ${selected === i ? "selected" : ""}" onclick="selectAnswer(${i})">
        <span class="option-letter">${letters[i]}</span><span class="option-text">${escapeHTML(opt)}</span>
      </button>`;
  });

  const isLast = idx === total - 1;

  const html = `
    <div class="quiz-topbar">
      <span class="subject-pill" style="--subject-color:${subject.color}">${subject.icon} ${escapeHTML(subject.name)}</span>
      <span class="timer-badge" id="quiz-timer">⏱️ --:--</span>
    </div>
    <div class="progress-track"><div class="progress-fill" style="width:${percent}%"></div></div>
    <p class="quiz-progress-label">Soal ${idx + 1} dari ${total}</p>

    ${navigatorHtml}

    <div class="quiz-card">
      <div class="quiz-card-header">
        <span class="quiz-difficulty-tag">${q.difficulty}</span>
        <button class="mark-btn ${marked ? "active" : ""}" onclick="handleToggleMark()" aria-pressed="${marked}">
          ${marked ? "🚩 Ditandai" : "🏳️ Tandai Soal"}
        </button>
      </div>
      <h2 class="quiz-question">${escapeHTML(q.question)}</h2>
      <div class="quiz-options">${optionsHtml}</div>
    </div>

    <div class="quiz-nav-row">
      <button class="btn btn-secondary" onclick="handlePrevQuestion()" ${idx === 0 ? "disabled" : ""}>⟵ Sebelumnya</button>
      ${isLast ? `<button class="btn btn-success" onclick="handleFinishQuiz()">Selesai Kuis 🏁</button>`
                : `<button class="btn btn-primary" onclick="handleNextQuestion()">Berikutnya ➜</button>`}
    </div>`;

  document.getElementById("app-content").innerHTML = html;
  startQuizTimerLoop(session);
}

function selectAnswer(optionIndex) {
  const session = getActiveSession();
  if (!session) return;
  recordAnswer(session, session.currentIndex, optionIndex);
  playClickSound();
  renderQuizPlay();
}
function handleToggleMark() {
  const session = getActiveSession();
  if (!session) return;
  toggleMarkQuestion(session, session.currentIndex);
  renderQuizPlay();
}
function handlePrevQuestion() {
  const session = getActiveSession();
  if (!session) return;
  goToQuestion(session, session.currentIndex - 1);
  renderQuizPlay();
}
function handleNextQuestion() {
  const session = getActiveSession();
  if (!session) return;
  goToQuestion(session, session.currentIndex + 1);
  renderQuizPlay();
}
function jumpToQuestion(i) {
  const session = getActiveSession();
  if (!session) return;
  goToQuestion(session, i);
  renderQuizPlay();
}
function handleFinishQuiz() {
  const session = getActiveSession();
  if (!session) return;
  const unanswered = session.answers.filter(a => a === null).length;
  const proceed = () => {
    stopQuizTimerLoop();
    const sid = finishQuizSession(session, "manual");
    navigateTo("#/result/" + sid);
  };
  if (unanswered > 0) {
    showConfirm(`Masih ada ${unanswered} soal belum dijawab. Yakin ingin menyelesaikan kuis?`, proceed);
  } else {
    proceed();
  }
}


/* ================= 6. HASIL & PEMBAHASAN ================= */

function renderResult(sessionId) {
  const entry = getHistory().find(h => h.sessionId === sessionId);
  if (!entry) {
    showToast("Data hasil kuis tidak ditemukan.", "error");
    navigateTo("#/dashboard");
    return;
  }
  const subject = getSubject(entry.subject);
  const label = getScoreLabel(entry.score);
  const motivation = getScoreMotivation(entry.score);

  let badgeHtml = "";
  if (entry.newBadges && entry.newBadges.length) {
    badgeHtml = `<div class="panel"><div class="panel-header"><h2>Badge Baru! 🎊</h2></div><div class="badge-row">`;
    entry.newBadges.forEach(id => {
      const b = BADGES.find(x => x.id === id);
      if (b) badgeHtml += `<div class="badge-chip"><span class="badge-icon">${b.icon}</span><span>${escapeHTML(b.name)}</span></div>`;
    });
    badgeHtml += `</div></div>`;
  }

  const html = `
    <div class="result-hero">
      <p class="result-subject">${subject.icon} ${escapeHTML(subject.name)}</p>
      <div class="result-score">${entry.score}</div>
      <p class="result-label">${escapeHTML(label)}</p>
      <p class="result-motivation">${escapeHTML(motivation)}</p>
    </div>

    <div class="stat-grid">
      <div class="stat-card"><div class="stat-value" style="color:var(--success)">${entry.correct}</div><div class="stat-label">Benar</div></div>
      <div class="stat-card"><div class="stat-value" style="color:var(--danger)">${entry.wrong}</div><div class="stat-label">Salah</div></div>
      <div class="stat-card"><div class="stat-value">${entry.unanswered}</div><div class="stat-label">Tidak Dijawab</div></div>
      <div class="stat-card"><div class="stat-value">${formatDuration(entry.durationSeconds)}</div><div class="stat-label">Waktu</div></div>
    </div>

    <div class="panel"><div class="panel-header"><h2>XP Diperoleh</h2></div><p class="xp-earned">+${entry.xpEarned} XP ⚡</p></div>

    ${badgeHtml}

    <div class="result-actions">
      <button class="btn btn-primary btn-full" onclick="navigateTo('#/review/${entry.sessionId}')">📖 Lihat Pembahasan</button>
      <button class="btn btn-secondary btn-full" onclick="handleRetryQuiz('${entry.sessionId}')">🔁 Ulangi Kuis</button>
      <button class="btn btn-secondary btn-full" onclick="navigateTo('#/dashboard')">🏠 Kembali ke Dashboard</button>
      <button class="btn btn-secondary btn-full" onclick="handleShareResult('${entry.sessionId}')">📤 Bagikan Hasil</button>
    </div>`;
  document.getElementById("app-content").innerHTML = html;
}

function handleRetryQuiz(sessionId) {
  const entry = getHistory().find(h => h.sessionId === sessionId);
  if (!entry) { showToast("Data kuis tidak ditemukan.", "error"); return; }
  const result = startQuizSession({
    subjectKey: entry.subject,
    grade: entry.grade,
    difficulty: entry.difficulty,
    jumlahSoal: entry.totalQuestions,
    durasiMenit: Math.max(1, Math.round(entry.durationLimitSeconds / 60)),
    mode: entry.mode
  });
  if (!result.success) { showToast(result.message, "error"); return; }
  navigateTo("#/quiz-play");
}

function handleShareResult(sessionId) {
  const entry = getHistory().find(h => h.sessionId === sessionId);
  if (!entry) return;
  const subject = getSubject(entry.subject);
  const text = "Saya mendapatkan nilai " + entry.score + " di kuis " + subject.name +
               " (QuizMaster)! Benar " + entry.correct + "/" + entry.totalQuestions + ". 🎉";

  if (navigator.share) {
    navigator.share({ title: "Hasil QuizMaster", text: text }).catch(() => {});
  } else if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text)
      .then(() => showToast("Hasil disalin ke clipboard!", "success"))
      .catch(() => window.prompt("Salin teks berikut:", text));
  } else {
    window.prompt("Salin teks berikut:", text);
  }
}

function renderReview(sessionId) {
  const entry = getHistory().find(h => h.sessionId === sessionId);
  if (!entry) {
    showToast("Data pembahasan tidak ditemukan.", "error");
    navigateTo("#/dashboard");
    return;
  }
  const subject = getSubject(entry.subject);
  const letters = ["A", "B", "C", "D"];

  let itemsHtml = "";
  entry.answers.forEach((a, i) => {
    const userAnswerText = a.selected === null ? "Tidak dijawab" : (letters[a.selected] + ". " + a.options[a.selected]);
    const correctText = letters[a.correctAnswer] + ". " + a.options[a.correctAnswer];
    const statusClass = a.selected === null ? "unanswered" : (a.correct ? "correct" : "wrong");
    const statusIcon = a.selected === null ? "○" : (a.correct ? "✓" : "✕");
    const statusText = a.selected === null ? "Tidak Dijawab" : (a.correct ? "Benar" : "Salah");
    itemsHtml += `
      <div class="review-item ${statusClass}">
        <div class="review-item-header"><span>Soal ${i + 1}</span><span class="review-status">${statusIcon} ${statusText}</span></div>
        <p class="review-question">${escapeHTML(a.question)}</p>
        <p class="review-line">Jawabanmu: <strong>${escapeHTML(userAnswerText)}</strong></p>
        ${!a.correct ? `<p class="review-line">Jawaban benar: <strong>${escapeHTML(correctText)}</strong></p>` : ""}
        <p class="review-explanation">💡 ${escapeHTML(a.explanation)}</p>
      </div>`;
  });

  const html = `
    <button class="btn-back" onclick="navigateTo('#/result/${entry.sessionId}')">⟵ Kembali ke Hasil</button>
    <h1 class="page-title">Pembahasan ${subject.icon} ${escapeHTML(subject.name)}</h1>
    <p class="page-subtitle">Nilai ${entry.score} &middot; ${entry.correct} benar dari ${entry.totalQuestions} soal</p>
    <div class="review-list">${itemsHtml}</div>`;
  document.getElementById("app-content").innerHTML = html;
}


/* ================= 7. RIWAYAT, STATISTIK, LEADERBOARD, PROFIL, PENGATURAN ================= */

function renderHistory() {
  const history = getHistory();
  let html = `<h1 class="page-title">Riwayat Kuis</h1><p class="page-subtitle">Semua kuis yang pernah kamu kerjakan.</p>`;

  if (history.length === 0) {
    html += renderEmptyState("Belum ada riwayat kuis. Yuk kerjakan kuis pertamamu!");
    document.getElementById("app-content").innerHTML = html;
    return;
  }

  html += `<button class="btn btn-danger-outline" onclick="handleClearHistory()">🗑️ Hapus Semua Riwayat</button><div class="history-list">`;
  history.forEach(h => {
    const subject = getSubject(h.subject);
    html += `
      <button class="history-item" onclick="navigateTo('#/review/${h.sessionId}')">
        <div class="history-item-left">
          <span class="subject-icon" style="color:${subject.color}">${subject.icon}</span>
          <div>
            <strong>${escapeHTML(subject.name)}</strong>
            <p class="panel-note">${formatDateID(h.date)} &middot; ${h.totalQuestions} soal &middot; ${formatDuration(h.durationSeconds)}</p>
          </div>
        </div>
        <div class="history-item-right">
          <span class="history-score">${h.score}</span>
          <span class="panel-note">${h.correct} benar / ${h.wrong} salah</span>
        </div>
      </button>`;
  });
  html += `</div>`;
  document.getElementById("app-content").innerHTML = html;
}

function handleClearHistory() {
  showConfirm("Semua riwayat kuis akan dihapus permanen dari perangkat ini. Lanjutkan?", () => {
    clearHistory();
    showToast("Riwayat berhasil dihapus.", "success");
    renderHistory();
  });
}

function renderStatistics() {
  const history = getHistory();
  const stats = computeOverallStats(history);
  let html = `<h1 class="page-title">Statistik</h1><p class="page-subtitle">Pantau perkembangan belajarmu.</p>`;

  if (!stats) {
    html += renderEmptyState("Belum ada data. Kerjakan kuis untuk melihat statistik.");
    document.getElementById("app-content").innerHTML = html;
    return;
  }

  html += `
    <div class="stat-grid">
      <div class="stat-card"><div class="stat-value">${stats.avgScore}</div><div class="stat-label">Rata-rata Nilai</div></div>
      <div class="stat-card"><div class="stat-value">${stats.highestScore}</div><div class="stat-label">Nilai Tertinggi</div></div>
      <div class="stat-card"><div class="stat-value">${stats.lowestScore}</div><div class="stat-label">Nilai Terendah</div></div>
      <div class="stat-card"><div class="stat-value">${stats.totalQuiz}</div><div class="stat-label">Total Kuis</div></div>
      <div class="stat-card"><div class="stat-value">${stats.totalQuestions}</div><div class="stat-label">Total Soal</div></div>
      <div class="stat-card"><div class="stat-value">${stats.correctPercentage}%</div><div class="stat-label">Persentase Benar</div></div>
    </div>
    <div class="panel"><div class="panel-header"><h2>Performa per Mata Pelajaran</h2></div><div class="perf-bars">`;

  const perf = computeSubjectPerformance(history);
  SUBJECTS.forEach(s => {
    if (!perf[s.key]) return;
    const p = perf[s.key];
    html += `
      <div class="perf-row">
        <div class="perf-label">${s.icon} ${escapeHTML(s.name)} <span class="panel-note">(${p.count} kuis)</span></div>
        <div class="perf-track"><div class="perf-fill" style="width:${p.avgScore}%; background:${s.color}"></div></div>
        <div class="perf-value">${p.avgScore}</div>
      </div>`;
  });
  html += `</div></div>`;
  document.getElementById("app-content").innerHTML = html;
}

const DEMO_LEADERBOARD_ENTRIES = [
  { name: "Alya (Demo)", xp: 850, quizCount: 22, avgScore: 88 },
  { name: "Bima (Demo)", xp: 620, quizCount: 15, avgScore: 79 },
  { name: "Citra (Demo)", xp: 410, quizCount: 9, avgScore: 74 }
];

function renderLeaderboard() {
  const profile = getProfile();
  const history = getHistory();
  const stats = computeOverallStats(history);

  const userEntry = { name: profile.name, xp: profile.xp, quizCount: history.length, avgScore: stats ? stats.avgScore : 0, isUser: true };
  const all = DEMO_LEADERBOARD_ENTRIES.map(e => Object.assign({ isUser: false }, e)).concat([userEntry]).sort((a, b) => b.xp - a.xp);

  let html = `
    <h1 class="page-title">Leaderboard</h1>
    <p class="page-subtitle">Peringkat berdasarkan XP.</p>
    <div class="notice-card">⚠️ Leaderboard ini memakai data lokal &amp; data demo di perangkat ini. Karena QuizMaster belum memiliki server, ini <strong>bukan</strong> ranking global sesungguhnya.</div>
    <div class="leaderboard-list">`;
  all.forEach((e, i) => {
    html += `
      <div class="leaderboard-item ${e.isUser ? "is-you" : ""}">
        <span class="leaderboard-rank">${i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "#" + (i + 1)}</span>
        <div class="leaderboard-info">
          <strong>${escapeHTML(e.name)}</strong>${e.isUser ? ' <span class="you-tag">Kamu</span>' : ""}
          <p class="panel-note">${e.quizCount} kuis &middot; rata-rata ${e.avgScore}</p>
        </div>
        <span class="leaderboard-xp">${e.xp} XP</span>
      </div>`;
  });
  html += `</div>`;
  document.getElementById("app-content").innerHTML = html;
}

let selectedAvatarTemp = null;
function renderProfile() {
  selectedAvatarTemp = null;
  const profile = getProfile();
  const history = getHistory();
  const avatars = ["🧑‍🎓", "👩‍🎓", "🦸", "🐱", "🦁", "🚀", "🎨", "⚽"];

  const html = `
    <h1 class="page-title">Profil</h1>
    <p class="page-subtitle">Atur identitasmu di QuizMaster.</p>

    <div class="panel">
      <label class="form-label" for="profile-name">Nama</label>
      <input id="profile-name" class="form-input" type="text" maxlength="20" value="${escapeAttr(profile.name)}" placeholder="Nama kamu">
      <p class="form-error" id="profile-name-error" style="display:none;">Nama tidak boleh kosong.</p>

      <label class="form-label">Avatar</label>
      <div class="avatar-grid">
        ${avatars.map(a => `<button type="button" class="avatar-option ${profile.avatar === a ? "active" : ""}" onclick="selectAvatar('${a}')" aria-label="Pilih avatar ${a}">${a}</button>`).join("")}
      </div>

      <button class="btn btn-primary btn-full" style="margin-top:16px;" onclick="handleSaveProfile()">💾 Simpan Profil</button>
    </div>

    <div class="panel">
      <div class="panel-header"><h2>Ringkasan</h2></div>
      <ul class="summary-list">
        <li>📝 ${history.length} kuis dikerjakan</li>
        <li>⚡ ${profile.xp} XP</li>
        <li>🏅 ${profile.badges.length} badge</li>
      </ul>
    </div>

    <div class="panel">
      <div class="panel-header"><h2>Badge Diperoleh</h2></div>
      ${profile.badges.length === 0
        ? `<p class="panel-note">Belum ada badge. Kerjakan kuis untuk membuka badge pertamamu!</p>`
        : `<div class="badge-row">${profile.badges.map(id => {
            const b = BADGES.find(x => x.id === id);
            return b ? `<div class="badge-chip" title="${escapeAttr(b.desc)}"><span class="badge-icon">${b.icon}</span><span>${escapeHTML(b.name)}</span></div>` : "";
          }).join("")}</div>`}
    </div>`;
  document.getElementById("app-content").innerHTML = html;
}

function selectAvatar(a) {
  selectedAvatarTemp = a;
  document.querySelectorAll(".avatar-option").forEach(btn => {
    btn.classList.toggle("active", btn.textContent.trim() === a);
  });
}

function handleSaveProfile() {
  const nameInput = document.getElementById("profile-name");
  const name = nameInput.value.trim();
  if (!name) {
    document.getElementById("profile-name-error").style.display = "block";
    showToast("Nama tidak boleh kosong.", "error");
    return;
  }
  const profile = getProfile();
  profile.name = name;
  if (selectedAvatarTemp) profile.avatar = selectedAvatarTemp;
  saveProfile(profile);
  showToast("Profil berhasil disimpan!", "success");
  renderProfile();
}

function renderSettings() {
  const profile = getProfile();
  const theme = getTheme();

  const html = `
    <h1 class="page-title">Pengaturan</h1>
    <p class="page-subtitle">Sesuaikan tampilan &amp; preferensi QuizMaster.</p>

    <div class="panel">
      <div class="panel-header"><h2>Tema</h2></div>
      <div class="chip-row">
        <button class="chip ${theme === "light" ? "active" : ""}" onclick="handleSetTheme('light')">☀️ Light Mode</button>
        <button class="chip ${theme === "dark" ? "active" : ""}" onclick="handleSetTheme('dark')">🌙 Dark Mode</button>
      </div>
    </div>

    <div class="panel">
      <div class="panel-header"><h2>Preferensi</h2></div>
      <div class="toggle-row"><span>🔊 Efek Suara</span>
        <button class="toggle-switch ${profile.soundOn ? "on" : ""}" onclick="handleTogglePref('soundOn')" aria-pressed="${profile.soundOn}"></button>
      </div>
      <div class="toggle-row"><span>✨ Animasi Latar Belakang</span>
        <button class="toggle-switch ${profile.bgMotionOn ? "on" : ""}" onclick="handleTogglePref('bgMotionOn')" aria-pressed="${profile.bgMotionOn}"></button>
      </div>
    </div>

    <div class="panel">
      <div class="panel-header"><h2>Zona Berbahaya</h2></div>
      <button class="btn btn-danger-outline btn-full" onclick="handleResetData()">🗑️ Reset Semua Data Aplikasi</button>
      <p class="panel-note">Menghapus profil, riwayat, XP, dan badge secara permanen dari perangkat ini.</p>
    </div>`;
  document.getElementById("app-content").innerHTML = html;
}

function handleSetTheme(theme) {
  saveTheme(theme);
  applyTheme(theme);
  renderSettings();
}
function handleTogglePref(field) {
  const profile = getProfile();
  profile[field] = !profile[field];
  saveProfile(profile);
  if (field === "bgMotionOn") applyBackgroundMotionPref(profile.bgMotionOn);
  renderSettings();
}
function handleResetData() {
  showConfirm("Seluruh data (profil, riwayat, XP, badge) akan dihapus permanen dari perangkat ini. Lanjutkan?", () => {
    stopQuizTimerLoop();
    resetAllAppData();
    showToast("Semua data berhasil direset.", "success");
    applyTheme(getTheme());
    applyBackgroundMotionPref(getProfile().bgMotionOn);
    navigateTo("#/dashboard");
    router(); // pastikan dashboard langsung menampilkan data bersih meski hash tidak berubah
  });
}


/* ================= 9. INISIALISASI ================= */

function initApp() {
  const profile = getProfile(); // sekaligus memvalidasi & menulis default jika data korup
  applyTheme(getTheme());
  applyBackgroundMotionPref(profile.bgMotionOn);
  buildNav();

  if (!window.location.hash || window.location.hash === "#") {
    window.location.hash = "#/dashboard";
  } else {
    router();
  }
}

document.addEventListener("DOMContentLoaded", initApp);