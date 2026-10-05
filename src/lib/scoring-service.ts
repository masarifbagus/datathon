import fs from "fs";
import path from "path";
import { prisma } from "./prisma";
import { DEFAULT_CRITERIA, DEFAULT_TEAMS, DEFAULT_USERS } from "./constants";

export interface CriterionItem {
  id: string;
  code: string;
  name: string;
  weight: number;
  order: number;
  description: string;
}

export interface TeamItem {
  id: string;
  orderNo: number;
  name: string;
  leadName?: string | null;
  institution?: string | null;
  description?: string | null;
}

export interface UserItem {
  id: string;
  username: string;
  name: string;
  role: "judge" | "admin";
  avatar?: string | null;
}

export interface ScoreDetailItem {
  criterionId: string;
  criterionCode: string;
  criterionName: string;
  weight: number;
  rawScore: number;
  weightedScore: number;
  comment?: string | null;
}

export interface JudgeScoreItem {
  scoreId: string;
  judgeId: string;
  judgeUsername: string;
  judgeName: string;
  teamId: string;
  totalWeightedScore: number;
  comment: string;
  updatedAt: string;
  details: ScoreDetailItem[];
}

export interface TeamLeaderboardRow {
  team: TeamItem;
  judgeScores: Record<string, JudgeScoreItem | null>; // keyed by username: 'juri1', 'juri2', etc.
  submittedCount: number;
  totalJudges: number;
  finalScore: number | null; // Rata-rata nilai akhir
  rank: number;
}

// Local Store for disk persistence during development & fallback
interface MemoryStore {
  users: UserItem[];
  criteria: CriterionItem[];
  teams: TeamItem[];
  scores: Map<string, {
    id: string;
    teamId: string;
    userId: string;
    totalWeightedScore: number;
    comment: string;
    updatedAt: Date;
    details: {
      criterionId: string;
      rawScore: number;
      weightedScore: number;
      comment?: string | null;
    }[];
  }>;
}

const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const LOCAL_STORE_FILE = isServerless
  ? path.join("/tmp", ".local-scores.json")
  : path.join(process.cwd(), ".local-scores.json");

const memoryStore: MemoryStore = {
  users: DEFAULT_USERS.map((u) => ({
    id: `usr_${u.username}`,
    username: u.username,
    name: u.name,
    role: u.role as "judge" | "admin",
    avatar: u.avatar,
  })),
  criteria: DEFAULT_CRITERIA.map((c) => ({
    id: `crit_${c.code}`,
    code: c.code,
    name: c.name,
    weight: c.weight,
    order: c.order,
    description: c.description,
  })),
  teams: DEFAULT_TEAMS.map((t) => ({
    id: `team_${t.orderNo}`,
    orderNo: t.orderNo,
    name: t.name,
    leadName: t.leadName,
    institution: t.institution,
    description: t.description,
  })),
  scores: new Map(),
};

function saveScoresToDisk() {
  if (isServerless) return;
  try {
    const serialized = Array.from(memoryStore.scores.entries()).map(([k, v]) => ({
      key: k,
      ...v,
      updatedAt: v.updatedAt.toISOString(),
    }));
    fs.writeFileSync(LOCAL_STORE_FILE, JSON.stringify(serialized, null, 2), "utf-8");
  } catch (err: any) {
    if (err?.code !== "EROFS") {
      console.warn("Could not save local scores to disk:", err?.message || err);
    }
  }
}

function loadScoresFromDisk(): boolean {
  if (isServerless) return false;
  try {
    if (fs.existsSync(LOCAL_STORE_FILE)) {
      const content = fs.readFileSync(LOCAL_STORE_FILE, "utf-8");
      const list = JSON.parse(content);
      if (Array.isArray(list) && list.length > 0) {
        memoryStore.scores.clear();
        for (const item of list) {
          memoryStore.scores.set(item.key, {
            id: item.id,
            teamId: item.teamId,
            userId: item.userId,
            totalWeightedScore: item.totalWeightedScore,
            comment: item.comment,
            updatedAt: new Date(item.updatedAt),
            details: item.details,
          });
        }
        return true;
      }
    }
  } catch {
    // Ignore read errors
  }
  return false;
}

// Initialize scores from disk, or seed initial sample if first run
function initializeSampleScores() {
  loadScoresFromDisk();
}

initializeSampleScores();

export async function resetAllScores(): Promise<{ count: number }> {
  let count = 0;
  if (isPrismaConfigured()) {
    try {
      const result = await prisma.score.deleteMany({});
      count = result.count;
    } catch (err) {
      console.warn("Prisma reset scores failed:", err);
    }
  }

  memoryStore.scores.clear();
  if (!isServerless) {
    try {
      if (fs.existsSync(LOCAL_STORE_FILE)) {
        fs.writeFileSync(LOCAL_STORE_FILE, "[]", "utf-8");
      }
    } catch (err) {
      console.warn("Could not empty local store file:", err);
    }
  }

  return { count };
}

function isPrismaConfigured(): boolean {
  const url = process.env.DATABASE_URL;
  if (!url) return false;
  if (url.includes("[YOUR-PROJECT-REF]") || url.includes("[YOUR-PASSWORD]")) return false;
  return url.startsWith("postgres://") || url.startsWith("postgresql://");
}

export async function getCriteria(): Promise<CriterionItem[]> {
  if (isPrismaConfigured()) {
    try {
      const list = await prisma.criterion.findMany({
        orderBy: { order: "asc" },
      });
      if (list.length > 0) {
        return list.map((c) => ({
          id: c.id,
          code: c.code,
          name: c.name,
          weight: c.weight,
          order: c.order,
          description: c.description || "",
        }));
      }
    } catch (err) {
      console.warn("Prisma query failed, using memory store:", err);
    }
  }
  return [...memoryStore.criteria].sort((a, b) => a.order - b.order);
}

export async function getTeams(): Promise<TeamItem[]> {
  if (isPrismaConfigured()) {
    try {
      const list = await prisma.team.findMany({
        orderBy: { orderNo: "asc" },
      });
      if (list.length > 0) {
        return list.map((t) => ({
          id: t.id,
          orderNo: t.orderNo,
          name: t.name,
          leadName: t.leadName,
          institution: t.institution,
          description: t.description,
        }));
      }
    } catch (err) {
      console.warn("Prisma query failed, using memory store:", err);
    }
  }
  return [...memoryStore.teams].sort((a, b) => a.orderNo - b.orderNo);
}

export async function getUsers(): Promise<UserItem[]> {
  if (isPrismaConfigured()) {
    try {
      const list = await prisma.user.findMany({
        orderBy: { username: "asc" },
      });
      if (list.length > 0) {
        return list.map((u) => ({
          id: u.id,
          username: u.username,
          name: u.name,
          role: u.role as "judge" | "admin",
          avatar: u.avatar,
        }));
      }
    } catch (err) {
      console.warn("Prisma query failed, using memory store:", err);
    }
  }
  return [...memoryStore.users];
}

export async function getUserByUsername(username: string): Promise<UserItem | null> {
  if (isPrismaConfigured()) {
    try {
      const u = await prisma.user.findUnique({
        where: { username },
      });
      if (u) {
        return {
          id: u.id,
          username: u.username,
          name: u.name,
          role: u.role as "judge" | "admin",
          avatar: u.avatar,
        };
      }
    } catch (err) {
      console.warn("Prisma query failed, checking memory store:", err);
    }
  }
  const found = memoryStore.users.find((u) => u.username.toLowerCase() === username.toLowerCase());
  return found ? { ...found } : null;
}

export async function getJudges(): Promise<UserItem[]> {
  const users = await getUsers();
  return users.filter((u) => u.role === "judge").sort((a, b) => a.username.localeCompare(b.username));
}

export async function getJudgeScoresMap(judgeId: string): Promise<Record<string, JudgeScoreItem>> {
  const result: Record<string, JudgeScoreItem> = {};
  const criteria = await getCriteria();
  const criteriaMap = new Map(criteria.map((c) => [c.id, c]));

  if (isPrismaConfigured()) {
    try {
      const scores = await prisma.score.findMany({
        where: { userId: judgeId },
        include: {
          user: true,
          details: {
            include: { criterion: true },
          },
        },
      });

      for (const s of scores) {
        result[s.teamId] = {
          scoreId: s.id,
          judgeId: s.userId,
          judgeUsername: s.user.username,
          judgeName: s.user.name,
          teamId: s.teamId,
          totalWeightedScore: Number(s.totalWeightedScore.toFixed(2)),
          comment: s.comment || "",
          updatedAt: s.updatedAt.toISOString(),
          details: s.details.map((d) => ({
            criterionId: d.criterionId,
            criterionCode: d.criterion.code,
            criterionName: d.criterion.name,
            weight: d.criterion.weight,
            rawScore: d.rawScore,
            weightedScore: Number(d.weightedScore.toFixed(2)),
            comment: d.comment || "",
          })),
        };
      }
      return result;
    } catch (err) {
      console.warn("Prisma query failed, using memory store:", err);
    }
  }

  // Memory store fallback
  const user = memoryStore.users.find((u) => u.id === judgeId);
  const username = user?.username || "judge";
  const judgeName = user?.name || "Juri";

  for (const [key, s] of memoryStore.scores.entries()) {
    if (s.userId === judgeId) {
      result[s.teamId] = {
        scoreId: s.id,
        judgeId: s.userId,
        judgeUsername: username,
        judgeName: judgeName,
        teamId: s.teamId,
        totalWeightedScore: Number(s.totalWeightedScore.toFixed(2)),
        comment: s.comment || "",
        updatedAt: s.updatedAt.toISOString(),
        details: s.details.map((d) => {
          const crit = criteriaMap.get(d.criterionId);
          return {
            criterionId: d.criterionId,
            criterionCode: crit?.code || "",
            criterionName: crit?.name || "",
            weight: crit?.weight || 0,
            rawScore: d.rawScore,
            weightedScore: Number(d.weightedScore.toFixed(2)),
            comment: d.comment || "",
          };
        }),
      };
    }
  }

  return result;
}

export async function saveJudgeScore(params: {
  judgeId: string;
  teamId: string;
  rawScores: Record<string, number>; // criterionId or code -> 0..100
  criterionComments?: Record<string, string>; // criterionId or code -> comment
  comment?: string;
}): Promise<{ success: boolean; totalWeightedScore: number; message?: string }> {
  const { judgeId, teamId, rawScores, criterionComments = {}, comment = "" } = params;
  const criteria = await getCriteria();

  // Calculate weighted scores
  let total = 0;
  const detailsToSave: {
    criterionId: string;
    rawScore: number;
    weightedScore: number;
    comment: string;
  }[] = [];

  for (const crit of criteria) {
    const raw = Number(rawScores[crit.id] ?? rawScores[crit.code] ?? 0);
    const clampedRaw = Math.max(0, Math.min(100, isNaN(raw) ? 0 : raw));
    const weighted = Number((clampedRaw * crit.weight).toFixed(2));
    const critComment = criterionComments[crit.id] || criterionComments[crit.code] || "";
    total += weighted;
    detailsToSave.push({
      criterionId: crit.id,
      rawScore: clampedRaw,
      weightedScore: weighted,
      comment: critComment.trim(),
    });
  }

  const finalWeightedTotal = Number(total.toFixed(2));

  if (isPrismaConfigured()) {
    try {
      // Upsert Score directly (PgBouncer pooler compatible)
      const score = await prisma.score.upsert({
        where: {
          teamId_userId: {
            teamId,
            userId: judgeId,
          },
        },
        update: {
          totalWeightedScore: finalWeightedTotal,
          comment,
        },
        create: {
          teamId,
          userId: judgeId,
          totalWeightedScore: finalWeightedTotal,
          comment,
        },
      });

      // Upsert Details sequentially (PgBouncer pooler compatible)
      for (const detail of detailsToSave) {
        await prisma.scoreDetail.upsert({
          where: {
            scoreId_criterionId: {
              scoreId: score.id,
              criterionId: detail.criterionId,
            },
          },
          update: {
            rawScore: detail.rawScore,
            weightedScore: detail.weightedScore,
            comment: detail.comment,
          },
          create: {
            scoreId: score.id,
            criterionId: detail.criterionId,
            rawScore: detail.rawScore,
            weightedScore: detail.weightedScore,
            comment: detail.comment,
          },
        });
      }

      return { success: true, totalWeightedScore: finalWeightedTotal };
    } catch (err: any) {
      console.error("Prisma save failed on Supabase:", err);
      if (process.env.NODE_ENV === "production" || isServerless) {
        throw new Error(`Gagal menyimpan ke database Supabase: ${err?.message || "Koneksi database bermasalah"}`);
      }
    }
  } else {
    console.warn("DATABASE_URL is not configured in environment variables!");
    if (process.env.NODE_ENV === "production" || isServerless) {
      throw new Error("DATABASE_URL belum dikonfigurasi di Environment Variables Vercel. Silakan tambahkan DATABASE_URL pada dashboard Vercel.");
    }
  }

  // Local store fallback with disk persistence
  const scoreKey = `${teamId}_${judgeId}`;
  memoryStore.scores.set(scoreKey, {
    id: `score_${scoreKey}`,
    teamId,
    userId: judgeId,
    totalWeightedScore: finalWeightedTotal,
    comment,
    updatedAt: new Date(),
    details: detailsToSave,
  });

  saveScoresToDisk();

  return { success: true, totalWeightedScore: finalWeightedTotal };
}

export async function getAdminLeaderboard(): Promise<{
  rows: TeamLeaderboardRow[];
  judges: UserItem[];
  criteria: CriterionItem[];
  totalTeams: number;
  totalSubmissions: number;
  totalPossibleSubmissions: number;
  topTeam: TeamLeaderboardRow | null;
}> {
  const teams = await getTeams();
  const judges = await getJudges();
  const criteria = await getCriteria();
  const criteriaMap = new Map(criteria.map((c) => [c.id, c]));

  // Fetch all scores
  const allScoresMap: Map<string, JudgeScoreItem> = new Map();

  let fetchedFromDb = false;
  if (isPrismaConfigured()) {
    try {
      const dbScores = await prisma.score.findMany({
        include: {
          user: true,
          details: {
            include: { criterion: true },
          },
        },
      });

      for (const s of dbScores) {
        allScoresMap.set(`${s.teamId}_${s.userId}`, {
          scoreId: s.id,
          judgeId: s.userId,
          judgeUsername: s.user.username,
          judgeName: s.user.name,
          teamId: s.teamId,
          totalWeightedScore: Number(s.totalWeightedScore.toFixed(2)),
          comment: s.comment || "",
          updatedAt: s.updatedAt.toISOString(),
          details: s.details.map((d) => ({
            criterionId: d.criterionId,
            criterionCode: d.criterion.code,
            criterionName: d.criterion.name,
            weight: d.criterion.weight,
            rawScore: d.rawScore,
            weightedScore: Number(d.weightedScore.toFixed(2)),
            comment: d.comment || "",
          })),
        });
      }
      fetchedFromDb = true;
    } catch (err) {
      console.warn("Prisma leaderboard fetch failed, falling back to memory:", err);
    }
  }

  // Only fallback to memoryStore if DB query was not executed or failed
  if (!fetchedFromDb) {
    for (const [key, s] of memoryStore.scores.entries()) {
      const user = memoryStore.users.find((u) => u.id === s.userId);
      allScoresMap.set(key, {
        scoreId: s.id,
        judgeId: s.userId,
        judgeUsername: user?.username || "judge",
        judgeName: user?.name || "Juri",
        teamId: s.teamId,
        totalWeightedScore: Number(s.totalWeightedScore.toFixed(2)),
        comment: s.comment || "",
        updatedAt: s.updatedAt.toISOString(),
        details: s.details.map((d) => {
          const crit = criteriaMap.get(d.criterionId);
          return {
            criterionId: d.criterionId,
            criterionCode: crit?.code || "",
            criterionName: crit?.name || "",
            weight: crit?.weight || 0,
            rawScore: d.rawScore,
            weightedScore: Number(d.weightedScore.toFixed(2)),
            comment: d.comment || "",
          };
        }),
      });
    }
  }

  let totalSubmissions = 0;
  const rows: TeamLeaderboardRow[] = teams.map((team) => {
    const judgeScoresRecord: Record<string, JudgeScoreItem | null> = {};
    let sumScore = 0;
    let submittedCount = 0;

    for (const judge of judges) {
      const key = `${team.id}_${judge.id}`;
      const scoreItem = allScoresMap.get(key) || null;
      judgeScoresRecord[judge.username] = scoreItem;

      if (scoreItem !== null) {
        sumScore += scoreItem.totalWeightedScore;
        submittedCount++;
        totalSubmissions++;
      }
    }

    // Formula Rekap Nilai Akhir:
    // Sesuai excel asli: Nilai Akhir Peserta = Rata-rata dari nilai total terbobot Juri 1 sampai Juri 4
    // Jika semua juri sudah menilai, rata-rata dibagi 4.
    // Jika sebagian juri menilai, tampilkan rata-rata terbobot dari juri yang sudah submit (atau null jika 0).
    const finalScore =
      submittedCount > 0
        ? Number((sumScore / submittedCount).toFixed(2))
        : null;

    return {
      team,
      judgeScores: judgeScoresRecord,
      submittedCount,
      totalJudges: judges.length,
      finalScore,
      rank: 0,
    };
  });

  // Sort by finalScore descending (nulls at the end)
  rows.sort((a, b) => {
    if (a.finalScore === null && b.finalScore === null) return a.team.orderNo - b.team.orderNo;
    if (a.finalScore === null) return 1;
    if (b.finalScore === null) return -1;
    if (b.finalScore !== a.finalScore) return b.finalScore - a.finalScore;
    return a.team.orderNo - b.team.orderNo;
  });

  // Assign ranks
  rows.forEach((row, index) => {
    row.rank = row.finalScore !== null ? index + 1 : 0;
  });

  const totalPossibleSubmissions = teams.length * judges.length;
  const topTeam = rows.find((r) => r.finalScore !== null) || null;

  return {
    rows,
    judges,
    criteria,
    totalTeams: teams.length,
    totalSubmissions,
    totalPossibleSubmissions,
    topTeam,
  };
}
