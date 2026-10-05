export const DEFAULT_CRITERIA = [
  {
    code: "relevansi",
    name: "Relevansi",
    weight: 0.10,
    order: 1,
    description: "Kesesuaian solusi dengan tema, kebutuhan data strategis, dan permasalahan di LAN RI.",
  },
  {
    code: "inovasi",
    name: "Inovasi dan Orisinalitas",
    weight: 0.25,
    order: 2,
    description: "Kebaruan konsep, ide kreatif, keunikan pendekatan, dan diferensiasi dari sistem eksisting.",
  },
  {
    code: "teknologi",
    name: "Penerapan Teknologi dan Fungsionalitas Aplikasi",
    weight: 0.25,
    order: 3,
    description: "Kualitas arsitektur teknis, kinerja aplikasi, keandalan fungsional, dan eksekusi demo prototype.",
  },
  {
    code: "dampak",
    name: "Dampak, keberlanjutan dan potensi replikasi",
    weight: 0.30,
    order: 4,
    description: "Manfaat nyata bagi pelayanan publik/kebijakan, keberlanjutan solusi, dan kemudahan direplikasi.",
  },
  {
    code: "presentasi",
    name: "Presentasi dan Keterpaduan Tim",
    weight: 0.10,
    order: 5,
    description: "Kejelasan pemaparan, ketepatan waktu, penguasaan materi teknis, dan keterpaduan tim saat Q&A.",
  },
];

export const DEFAULT_TEAMS = [
  {
    orderNo: 1,
    name: "Simpul Desa",
    leadName: "Adek Muhammad Zulkham",
    institution: "LAN RI / Mitra Datathon",
    description: "Platform digital integrasi data perdesaan terpadu untuk penguatan tata kelola pemerintahan desa.",
  },
  {
    orderNo: 2,
    name: "Brantas",
    leadName: "Ketua Tim Brantas",
    institution: "LAN RI / Mitra Datathon",
    description: "Sistem analitik cerdas pengelolaan sumber daya dan pemantauan aliran data berbasis dashboard interaktif.",
  },
  {
    orderNo: 3,
    name: "Sparta",
    leadName: "Ketua Tim Sparta",
    institution: "LAN RI / Mitra Datathon",
    description: "Aplikasi percepatan pengambilan keputusan strategis instansi berbasis model machine learning prediktif.",
  },
  {
    orderNo: 4,
    name: "Tim Cendekia",
    leadName: "Ketua Tim Cendekia",
    institution: "LAN RI / Mitra Datathon",
    description: "Ekosistem data analitik terintegrasi untuk pemetaan kompetensi aparatur sipil negara secara holistik.",
  },
  {
    orderNo: 5,
    name: "Tim Tangga",
    leadName: "Ketua Tim Tangga",
    institution: "LAN RI / Mitra Datathon",
    description: "Solusi otomatisasi agregasi data lintas instansi guna efisiensi monitoring dan evaluasi program prioritas.",
  },
];

export const DEFAULT_USERS = [
  {
    username: "juri1",
    name: "Juri 1",
    role: "judge",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=juri1",
  },
  {
    username: "juri2",
    name: "Juri 2",
    role: "judge",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=juri2",
  },
  {
    username: "juri3",
    name: "Juri 3",
    role: "judge",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=juri3",
  },
  {
    username: "juri4",
    name: "Juri 4",
    role: "judge",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=juri4",
  },
  {
    username: "admin",
    name: "Administrator Datathon",
    role: "admin",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=admin",
  },
];
