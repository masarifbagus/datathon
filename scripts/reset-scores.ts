import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function main() {
  console.log("🔄 Mereset data penilaian (scores & score_details)...");

  try {
    // Menghapus seluruh penilaian dari database
    // Tabel score_details otomatis terhapus karena foreign key ON DELETE CASCADE
    const deletedScores = await prisma.score.deleteMany({});
    console.log(`✅ Berhasil menghapus ${deletedScores.count} data nilai dari tabel scores di Supabase.`);

    // Bersihkan file cache lokal jika ada
    const localStorePath = path.join(process.cwd(), ".local-scores.json");
    if (fs.existsSync(localStorePath)) {
      fs.writeFileSync(localStorePath, "[]", "utf-8");
      console.log("✅ File cache .local-scores.json telah dikosongkan.");
    }

    console.log("\n✨ Database berhasil di-reset ke kondisi awal (bersih)!");
    console.log("ℹ️  Catatan: Data Tim, Kriteria, dan Akun Juri tetap aman & tidak dihapus.\n");
  } catch (error) {
    console.error("❌ Gagal mereset database:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
