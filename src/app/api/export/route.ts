import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { getAdminLeaderboard } from "@/lib/scoring-service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { rows, judges, criteria } = await getAdminLeaderboard();

    // ==========================================
    // 1. SHEET 1: REKAPITULASI PENILAIAN UTAMA
    // ==========================================
    const worksheetRekap: XLSX.WorkSheet = {};

    // Header Metadata
    worksheetRekap["A1"] = { t: "s", v: "LEMBAGA ADMINISTRASI NEGARA REPUBLIK INDONESIA" };
    worksheetRekap["A2"] = { t: "s", v: "DEMO DAY LAN DATATHON 2026" };
    worksheetRekap["A3"] = { t: "s", v: "REKAPITULASI HASIL PENILAIAN DEWAN JURI" };
    worksheetRekap["A4"] = {
      t: "s",
      v: `Waktu Rekapitulasi: ${new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })} WIB`,
    };

    // Table Column Headers (Row 6)
    const rekapHeaders = [
      "NO",
      "NAMA TIM",
      "KETUA TIM",
      "INSTANSI",
      ...judges.map((j) => j.name.toUpperCase()),
      "NILAI AKHIR (RATA-RATA)",
      "PERINGKAT",
      "STATUS PROGRES",
    ];

    rekapHeaders.forEach((headerText, colIdx) => {
      const cellRef = XLSX.utils.encode_cell({ c: colIdx, r: 5 }); // Row 6 (0-indexed: 5)
      worksheetRekap[cellRef] = { t: "s", v: headerText };
    });

    const startRowIdx = 6; // Excel row 7 (0-indexed: 6)
    const endRowIdx = startRowIdx + rows.length - 1; // Excel row 11

    rows.forEach((r, idx) => {
      const currentR = startRowIdx + idx; // 0-indexed row
      const excelRowNumber = currentR + 1; // 1-indexed row in Excel (7, 8, 9...)

      // Col A: NO
      worksheetRekap[XLSX.utils.encode_cell({ c: 0, r: currentR })] = { t: "n", v: idx + 1 };
      // Col B: NAMA TIM
      worksheetRekap[XLSX.utils.encode_cell({ c: 1, r: currentR })] = { t: "s", v: r.team.name };
      // Col C: KETUA TIM
      worksheetRekap[XLSX.utils.encode_cell({ c: 2, r: currentR })] = { t: "s", v: r.team.leadName || "-" };
      // Col D: INSTANSI
      worksheetRekap[XLSX.utils.encode_cell({ c: 3, r: currentR })] = { t: "s", v: r.team.institution || "LAN RI" };

      // Col E, F, G, H: JURI 1, 2, 3, 4 (Bobot Terhitung)
      judges.forEach((j, jIdx) => {
        const scoreItem = r.judgeScores[j.username];
        const cellRef = XLSX.utils.encode_cell({ c: 4 + jIdx, r: currentR });
        if (scoreItem !== null) {
          worksheetRekap[cellRef] = {
            t: "n",
            v: Number(scoreItem.totalWeightedScore.toFixed(2)),
          };
        } else {
          worksheetRekap[cellRef] = { t: "s", v: "-" };
        }
      });

      // Col I: NILAI AKHIR (RATA-RATA)
      // Rumus Excel Asli: =AVERAGE(E7:H7)
      const avgColRef = XLSX.utils.encode_cell({ c: 8, r: currentR });
      const firstJudgeColLetter = "E";
      const lastJudgeColLetter = String.fromCharCode(68 + judges.length); // H for 4 judges
      const avgFormula = `AVERAGE(${firstJudgeColLetter}${excelRowNumber}:${lastJudgeColLetter}${excelRowNumber})`;
      const defaultAvgVal = r.finalScore !== null ? Number(r.finalScore.toFixed(2)) : 0;

      worksheetRekap[avgColRef] = {
        t: "n",
        f: avgFormula,
        v: defaultAvgVal,
      };

      // Col J: PERINGKAT (RANKING)
      // Rumus Excel Asli: =RANK(I7, $I$7:$I$11)
      const rankColRef = XLSX.utils.encode_cell({ c: 9, r: currentR });
      const rankRange = `$I$${startRowIdx + 1}:$I$${endRowIdx + 1}`;
      const rankFormula = `RANK(I${excelRowNumber},${rankRange})`;
      worksheetRekap[rankColRef] = {
        t: "n",
        f: rankFormula,
        v: r.rank > 0 ? r.rank : idx + 1,
      };

      // Col K: STATUS PROGRES
      const statusColRef = XLSX.utils.encode_cell({ c: 10, r: currentR });
      worksheetRekap[statusColRef] = {
        t: "s",
        v: `${r.submittedCount} / ${r.totalJudges} Juri Selesai`,
      };
    });

    // Summary Statistics Rows (Rata-rata, Tertinggi, Terendah)
    const summaryStartRow = endRowIdx + 2; // e.g. Excel row 13
    worksheetRekap[XLSX.utils.encode_cell({ c: 3, r: summaryStartRow })] = {
      t: "s",
      v: "Rata-rata Keseluruhan",
    };
    worksheetRekap[XLSX.utils.encode_cell({ c: 8, r: summaryStartRow })] = {
      t: "n",
      f: `AVERAGE(I${startRowIdx + 1}:I${endRowIdx + 1})`,
      v: rows.length > 0 ? Number((rows.reduce((acc, curr) => acc + (curr.finalScore || 0), 0) / rows.length).toFixed(2)) : 0,
    };

    worksheetRekap[XLSX.utils.encode_cell({ c: 3, r: summaryStartRow + 1 })] = {
      t: "s",
      v: "Nilai Tertinggi (Maksimal)",
    };
    worksheetRekap[XLSX.utils.encode_cell({ c: 8, r: summaryStartRow + 1 })] = {
      t: "n",
      f: `MAX(I${startRowIdx + 1}:I${endRowIdx + 1})`,
      v: rows[0]?.finalScore ?? 0,
    };

    worksheetRekap[XLSX.utils.encode_cell({ c: 3, r: summaryStartRow + 2 })] = {
      t: "s",
      v: "Nilai Terendah (Minimal)",
    };
    worksheetRekap[XLSX.utils.encode_cell({ c: 8, r: summaryStartRow + 2 })] = {
      t: "n",
      f: `MIN(I${startRowIdx + 1}:I${endRowIdx + 1})`,
      v: rows[rows.length - 1]?.finalScore ?? 0,
    };

    // Notes & Weights
    const notesStartRow = summaryStartRow + 4;
    worksheetRekap[XLSX.utils.encode_cell({ c: 0, r: notesStartRow })] = {
      t: "s",
      v: "* KETENTUAN FORMULA & BOBOT KRITERIA PENILAIAN LAN DATATHON 2026:",
    };
    criteria.forEach((c, cIdx) => {
      worksheetRekap[XLSX.utils.encode_cell({ c: 0, r: notesStartRow + 1 + cIdx })] = {
        t: "s",
        v: `${c.order}. ${c.name} - Bobot: ${(c.weight * 100).toFixed(0)}% (${c.weight})`,
      };
    });
    worksheetRekap[XLSX.utils.encode_cell({ c: 0, r: notesStartRow + criteria.length + 1 })] = {
      t: "s",
      v: "* Formula Nilai Akhir Peserta = AVERAGE(Juri 1, Juri 2, Juri 3, Juri 4)",
    };

    // Set Range
    worksheetRekap["!ref"] = XLSX.utils.encode_range({
      s: { c: 0, r: 0 },
      e: { c: 10, r: notesStartRow + criteria.length + 2 },
    });

    // Column Widths
    worksheetRekap["!cols"] = [
      { wch: 6 },  // NO
      { wch: 24 }, // NAMA TIM
      { wch: 26 }, // KETUA TIM
      { wch: 26 }, // INSTANSI
      { wch: 14 }, // JURI 1
      { wch: 14 }, // JURI 2
      { wch: 14 }, // JURI 3
      { wch: 14 }, // JURI 4
      { wch: 26 }, // NILAI AKHIR (RATA-RATA)
      { wch: 14 }, // PERINGKAT
      { wch: 22 }, // STATUS PROGRES
    ];

    // ==========================================
    // 2. SHEET 2: RINCIAN ASPEK & KOMENTAR JURI
    // ==========================================
    const worksheetDetail: XLSX.WorkSheet = {};

    worksheetDetail["A1"] = { t: "s", v: "RINCIAN SKOR PER ASPEK & KOMENTAR KUALITATIF DEWAN JURI" };
    worksheetDetail["A2"] = { t: "s", v: "DEMO DAY LAN DATATHON 2026" };

    const detailHeaders = [
      "NO",
      "NAMA TIM",
      "DEWAN JURI",
      "Relevansi (10%)",
      "Inovasi (25%)",
      "Teknologi (25%)",
      "Dampak (30%)",
      "Presentasi (10%)",
      "TOTAL TERBOBOT",
      "KOMENTAR RELEVANSI",
      "KOMENTAR INOVASI",
      "KOMENTAR TEKNOLOGI",
      "KOMENTAR DAMPAK",
      "KOMENTAR PRESENTASI",
    ];

    detailHeaders.forEach((h, colIdx) => {
      worksheetDetail[XLSX.utils.encode_cell({ c: colIdx, r: 3 })] = { t: "s", v: h }; // Row 4 (index 3)
    });

    let detailRowIdx = 4; // Excel row 5 (0-indexed: 4)
    let detailCounter = 1;

    for (const r of rows) {
      for (const j of judges) {
        const scoreItem = r.judgeScores[j.username];
        const excelRowNumber = detailRowIdx + 1;

        worksheetDetail[XLSX.utils.encode_cell({ c: 0, r: detailRowIdx })] = { t: "n", v: detailCounter++ };
        worksheetDetail[XLSX.utils.encode_cell({ c: 1, r: detailRowIdx })] = { t: "s", v: r.team.name };
        worksheetDetail[XLSX.utils.encode_cell({ c: 2, r: detailRowIdx })] = { t: "s", v: j.name };

        if (scoreItem) {
          const scoreMap = new Map(scoreItem.details.map((d) => [d.criterionCode, d.rawScore]));
          const commentMap = new Map(scoreItem.details.map((d) => [d.criterionCode, d.comment || "-"]));

          const scoreRelevansi = scoreMap.get("relevansi") ?? 0;
          const scoreInovasi = scoreMap.get("inovasi") ?? 0;
          const scoreTeknologi = scoreMap.get("teknologi") ?? 0;
          const scoreDampak = scoreMap.get("dampak") ?? 0;
          const scorePresentasi = scoreMap.get("presentasi") ?? 0;

          worksheetDetail[XLSX.utils.encode_cell({ c: 3, r: detailRowIdx })] = { t: "n", v: scoreRelevansi };
          worksheetDetail[XLSX.utils.encode_cell({ c: 4, r: detailRowIdx })] = { t: "n", v: scoreInovasi };
          worksheetDetail[XLSX.utils.encode_cell({ c: 5, r: detailRowIdx })] = { t: "n", v: scoreTeknologi };
          worksheetDetail[XLSX.utils.encode_cell({ c: 6, r: detailRowIdx })] = { t: "n", v: scoreDampak };
          worksheetDetail[XLSX.utils.encode_cell({ c: 7, r: detailRowIdx })] = { t: "n", v: scorePresentasi };

          // Formula Asli Terbobot Juri:
          // =(D5*0.1)+(E5*0.25)+(F5*0.25)+(G5*0.3)+(H5*0.1)
          const formulaTotal = `(D${excelRowNumber}*0.1)+(E${excelRowNumber}*0.25)+(F${excelRowNumber}*0.25)+(G${excelRowNumber}*0.3)+(H${excelRowNumber}*0.1)`;

          worksheetDetail[XLSX.utils.encode_cell({ c: 8, r: detailRowIdx })] = {
            t: "n",
            f: formulaTotal,
            v: Number(scoreItem.totalWeightedScore.toFixed(2)),
          };

          worksheetDetail[XLSX.utils.encode_cell({ c: 9, r: detailRowIdx })] = {
            t: "s",
            v: commentMap.get("relevansi") || "-",
          };
          worksheetDetail[XLSX.utils.encode_cell({ c: 10, r: detailRowIdx })] = {
            t: "s",
            v: commentMap.get("inovasi") || "-",
          };
          worksheetDetail[XLSX.utils.encode_cell({ c: 11, r: detailRowIdx })] = {
            t: "s",
            v: commentMap.get("teknologi") || "-",
          };
          worksheetDetail[XLSX.utils.encode_cell({ c: 12, r: detailRowIdx })] = {
            t: "s",
            v: commentMap.get("dampak") || "-",
          };
          worksheetDetail[XLSX.utils.encode_cell({ c: 13, r: detailRowIdx })] = {
            t: "s",
            v: commentMap.get("presentasi") || "-",
          };
        } else {
          worksheetDetail[XLSX.utils.encode_cell({ c: 3, r: detailRowIdx })] = { t: "s", v: "-" };
          worksheetDetail[XLSX.utils.encode_cell({ c: 4, r: detailRowIdx })] = { t: "s", v: "-" };
          worksheetDetail[XLSX.utils.encode_cell({ c: 5, r: detailRowIdx })] = { t: "s", v: "-" };
          worksheetDetail[XLSX.utils.encode_cell({ c: 6, r: detailRowIdx })] = { t: "s", v: "-" };
          worksheetDetail[XLSX.utils.encode_cell({ c: 7, r: detailRowIdx })] = { t: "s", v: "-" };
          worksheetDetail[XLSX.utils.encode_cell({ c: 8, r: detailRowIdx })] = { t: "s", v: "-" };
          worksheetDetail[XLSX.utils.encode_cell({ c: 9, r: detailRowIdx })] = { t: "s", v: "-" };
          worksheetDetail[XLSX.utils.encode_cell({ c: 10, r: detailRowIdx })] = { t: "s", v: "-" };
          worksheetDetail[XLSX.utils.encode_cell({ c: 11, r: detailRowIdx })] = { t: "s", v: "-" };
          worksheetDetail[XLSX.utils.encode_cell({ c: 12, r: detailRowIdx })] = { t: "s", v: "-" };
          worksheetDetail[XLSX.utils.encode_cell({ c: 13, r: detailRowIdx })] = {
            t: "s",
            v: "(Belum memberikan nilai)",
          };
        }

        detailRowIdx++;
      }
    }

    worksheetDetail["!ref"] = XLSX.utils.encode_range({
      s: { c: 0, r: 0 },
      e: { c: 13, r: detailRowIdx },
    });

    worksheetDetail["!cols"] = [
      { wch: 6 },  // NO
      { wch: 22 }, // NAMA TIM
      { wch: 16 }, // JURI
      { wch: 15 }, // Relevansi
      { wch: 15 }, // Inovasi
      { wch: 15 }, // Teknologi
      { wch: 15 }, // Dampak
      { wch: 15 }, // Presentasi
      { wch: 18 }, // TOTAL TERBOBOT
      { wch: 32 }, // KOMENTAR RELEVANSI
      { wch: 32 }, // KOMENTAR INOVASI
      { wch: 32 }, // KOMENTAR TEKNOLOGI
      { wch: 32 }, // KOMENTAR DAMPAK
      { wch: 32 }, // KOMENTAR PRESENTASI
    ];

    // ==========================================
    // 3. COMPILE WORKBOOK & EXPORT
    // ==========================================
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheetRekap, "Rekap Penilaian");
    XLSX.utils.book_append_sheet(workbook, worksheetDetail, "Rincian Aspek & Komentar");

    const buf = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    const filename = `Rekap_Nilai_LAN_Datathon_2026_${new Date().toISOString().split("T")[0]}.xlsx`;

    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });
  } catch (error) {
    console.error("Export Excel error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengunduh file Excel" },
      { status: 500 }
    );
  }
}
