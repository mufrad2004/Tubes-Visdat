// lib/hltb.ts
import fs from "fs";
import path from "path";
import { csvParse } from "d3-dsv";

export type HltbRow = {
  id: string;
  name: string;
  type: string;
  platform: string;
  genres: string;
  developer: string;
  publisher: string;
  release_date: string;
  release_year: string;
  release_month: string;
  main_story: string;
  main_plus_sides: string;
  completionist: string;
  all_styles: string;
  single_player: string;
  co_op: string;
  versus: string;
  [key: string]: string;
};

let cachedRows: HltbRow[] | null = null;

function toNumber(v: string | undefined): number | null {
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function loadHltbRows(): HltbRow[] {
  if (cachedRows) return cachedRows;

  const csvPath = path.join(process.cwd(), "public",  "hltb_dataset.csv");
  // const csvPath = "./hltb_dataset.csv"
  const raw = fs.readFileSync(csvPath, "utf8");
  const parsed = csvParse(raw) as unknown as HltbRow[];
  cachedRows = parsed;
  return cachedRows;
}

// 1) Rata-rata main_story & all_styles per tahun
export function getByYearAvgMainStory() {
  const rows = loadHltbRows();
  const agg: Record<
    string,
    { sumMain: number; sumAll: number; countMain: number; countAll: number }
  > = {};

  rows.forEach((r) => {
    const y = r.release_year;
    if (!y) return;
    const ms = toNumber(r.main_story);
    const as = toNumber(r.all_styles);
    if (!agg[y]) {
      agg[y] = { sumMain: 0, sumAll: 0, countMain: 0, countAll: 0 };
    }
    if (ms !== null) {
      agg[y].sumMain += ms;
      agg[y].countMain += 1;
    }
    if (as !== null) {
      agg[y].sumAll += as;
      agg[y].countAll += 1;
    }
  });

  return Object.entries(agg)
    .map(([year, v]) => ({
      year: Number(year),
      avgMainStory: v.countMain ? v.sumMain / v.countMain : 0,
      avgAllStyles: v.countAll ? v.sumAll / v.countAll : 0,
      count: v.countMain || v.countAll,
    }))
    .sort((a, b) => a.year - b.year)
    .filter((d) => d.year > 1970 && d.year < 2030); // buang noise
}

// 2) Top 10 genre terbanyak
export function getTopGenres(limit = 10) {
  const rows = loadHltbRows();
  const counter: Record<string, number> = {};

  rows.forEach((r) => {
    const g = r.genres;
    if (!g) return;
    g.split(",").map((x) => x.trim()).forEach((genre) => {
      if (!genre) return;
      counter[genre] = (counter[genre] || 0) + 1;
    });
  });

  return Object.entries(counter)
    .map(([genre, count]) => ({ genre, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

// 3) Top 10 platform terbanyak
export function getTopPlatforms(limit = 10) {
  const rows = loadHltbRows();
  const counter: Record<string, number> = {};

  rows.forEach((r) => {
    const p = r.platform;
    if (!p) return;
    p.split(",").map((x) => x.trim()).forEach((plat) => {
      if (!plat) return;
      counter[plat] = (counter[plat] || 0) + 1;
    });
  });

  return Object.entries(counter)
    .map(([platform, count]) => ({ platform, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

// 4) Rata-rata durasi per genre (main/main+side/completionist)
export function getGenreAvgDurations(limitGenres = 5) {
  const rows = loadHltbRows();
  const agg: Record<
    string,
    {
      sumMain: number;
      sumMPS: number;
      sumComp: number;
      cMain: number;
      cMPS: number;
      cComp: number;
    }
  > = {};

  rows.forEach((r) => {
    if (!r.genres) return;
    const ms = toNumber(r.main_story);
    const mps = toNumber(r.main_plus_sides);
    const comp = toNumber(r.completionist);

    r.genres.split(",").map((x) => x.trim()).forEach((g) => {
      if (!g) return;
      if (!agg[g]) {
        agg[g] = {
          sumMain: 0,
          sumMPS: 0,
          sumComp: 0,
          cMain: 0,
          cMPS: 0,
          cComp: 0,
        };
      }
      const a = agg[g];
      if (ms !== null) {
        a.sumMain += ms;
        a.cMain += 1;
      }
      if (mps !== null) {
        a.sumMPS += mps;
        a.cMPS += 1;
      }
      if (comp !== null) {
        a.sumComp += comp;
        a.cComp += 1;
      }
    });
  });

  const arr = Object.entries(agg)
    .map(([genre, v]) => ({
      genre,
      main: v.cMain ? v.sumMain / v.cMain : 0,
      mainPlusSides: v.cMPS ? v.sumMPS / v.cMPS : 0,
      completionist: v.cComp ? v.sumComp / v.cComp : 0,
      support: v.cMain + v.cMPS + v.cComp,
    }))
    .filter((d) => d.support > 50);

  arr.sort((a, b) => b.support - a.support);
  return arr.slice(0, limitGenres);
}

// 5) Histogram all_styles (bin logaritmik / kasar)
export function getPlaytimeHistogram() {
  const rows = loadHltbRows();
  const values: number[] = [];

  rows.forEach((r) => {
    const v = toNumber(r.all_styles);
    if (v !== null && v > 0 && v < 1000) {
      values.push(v);
    }
  });

  const bins = [1, 5, 10, 20, 40, 80, 160, 320, 640, 1000];
  const counts = new Array(bins.length - 1).fill(0);

  values.forEach((v) => {
    for (let i = 0; i < bins.length - 1; i++) {
      if (v >= bins[i] && v < bins[i + 1]) {
        counts[i] += 1;
        break;
      }
    }
  });

  return counts.map((c, i) => ({
    binLabel: `${bins[i]}–${bins[i + 1]} jam`,
    count: c,
  }));
}

// 6) Scatter main_story vs completionist (sample)
export function getMainVsCompletionist(sampleSize = 500) {
  const rows = loadHltbRows();
  const pts: { main_story: number; completionist: number }[] = [];

  for (const r of rows) {
    const ms = toNumber(r.main_story);
    const comp = toNumber(r.completionist);
    if (ms !== null && comp !== null && ms > 0 && comp > 0) {
      pts.push({ main_story: ms, completionist: comp });
    }
  }

  // simple random sample
  if (pts.length <= sampleSize) return pts;
  const out: typeof pts = [];
  const indices = new Set<number>();
  while (out.length < sampleSize && indices.size < pts.length) {
    const idx = Math.floor(Math.random() * pts.length);
    if (!indices.has(idx)) {
      indices.add(idx);
      out.push(pts[idx]);
    }
  }
  return out;
}

// 7) Jumlah game per tahun per type
export function getYearCountByType() {
  const rows = loadHltbRows();
  const agg: Record<
    string,
    { game: number; dlc: number; expansion: number; other: number }
  > = {};

  rows.forEach((r) => {
    const y = r.release_year;
    if (!y) return;
    const t = (r.type || "").toLowerCase();
    if (!agg[y]) {
      agg[y] = { game: 0, dlc: 0, expansion: 0, other: 0 };
    }
    if (t === "game") agg[y].game += 1;
    else if (t === "dlc") agg[y].dlc += 1;
    else if (t === "expansion") agg[y].expansion += 1;
    else agg[y].other += 1;
  });

  return Object.entries(agg)
    .map(([year, v]) => ({
      year: Number(year),
      gameCount: v.game,
      dlcCount: v.dlc,
      expansionCount: v.expansion,
      otherCount: v.other,
    }))
    .sort((a, b) => a.year - b.year);
}

// 8) Single-player vs co-op vs versus (berapa game punya mode itu)
export function getCoopVsSingleCounts() {
  const rows = loadHltbRows();
  let single = 0;
  let coop = 0;
  let versus = 0;

  rows.forEach((r) => {
    const sp = toNumber(r.single_player);
    const cp = toNumber(r.co_op);
    const vs = toNumber(r.versus);
    if (sp && sp > 0) single += 1;
    if (cp && cp > 0) coop += 1;
    if (vs && vs > 0) versus += 1;
  });

  return [
    { mode: "Single Player", count: single },
    { mode: "Co-op", count: coop },
    { mode: "Versus", count: versus },
  ];
}

// 9) Rata-rata all_styles per bulan rilis
export function getReleaseMonthAverages() {
  const rows = loadHltbRows();
  const agg: Record<number, { sum: number; count: number }> = {};

  rows.forEach((r) => {
    const m = toNumber(r.release_month);
    const as = toNumber(r.all_styles);
    if (!m || m < 1 || m > 12 || as === null) return;
    if (!agg[m]) agg[m] = { sum: 0, count: 0 };
    agg[m].sum += as;
    agg[m].count += 1;
  });

  const out: { month: number; avgAllStyles: number }[] = [];
  for (let m = 1; m <= 12; m++) {
    const v = agg[m];
    out.push({
      month: m,
      avgAllStyles: v ? v.sum / v.count : 0,
    });
  }
  return out;
}

// 10) Top 10 developer berdasarkan jumlah game
export function getTopDevelopers(limit = 10) {
  const rows = loadHltbRows();
  const counter: Record<string, number> = {};

  rows.forEach((r) => {
    const dev = (r.developer || "").trim();
    if (!dev) return;
    counter[dev] = (counter[dev] || 0) + 1;
  });

  return Object.entries(counter)
    .map(([developer, count]) => ({ developer, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export function getDashboardSummary() {
  return {
    byYearAvgMainStory: getByYearAvgMainStory(),
    topGenres: getTopGenres(),
    topPlatforms: getTopPlatforms(),
    genreAvgDurations: getGenreAvgDurations(),
    playtimeHistogram: getPlaytimeHistogram(),
    mainVsCompletionist: getMainVsCompletionist(),
    yearCountByType: getYearCountByType(),
    coopVsSingleCounts: getCoopVsSingleCounts(),
    releaseMonthAverages: getReleaseMonthAverages(),
    topDevelopers: getTopDevelopers(),
  };
}
