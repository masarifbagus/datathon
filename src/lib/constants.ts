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
    description: "Kualitas arsitektur teknis, kinerja aplikasi, keandalan fungsional, dan eksekusi prototype.",
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
    name: "Adek Muhammad Zulkham",
    institution: "LAN RI / Mitra Datathon",
  },
  {
    orderNo: 2,
    name: "Sparta",
    institution: "LAN RI / Mitra Datathon",
  },
  {
    orderNo: 3,
    name: "Tim Tangga",
    institution: "LAN RI / Mitra Datathon",
  },
  {
    orderNo: 4,
    name: "Brantas",
    institution: "LAN RI / Mitra Datathon",
  },
  {
    orderNo: 5,
    name: "Tim Cendekia",
    institution: "LAN RI / Mitra Datathon",
  },
];

export const DEFAULT_USERS = [
  {
    username: "KemenpanRB",
    name: "KemenpanRB",
    role: "judge",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=juri1",
  },
  {
    username: "KSP",
    name: "KSP",
    role: "judge",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=juri2",
  },
  {
    username: "Tanoto Foundation",
    name: "Tanoto Foundation",
    role: "judge",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=juri3",
  },
  {
    username: "LAN",
    name: "LAN",
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
