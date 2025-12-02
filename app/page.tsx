"use client";

import React, { useEffect, useRef, useState } from "react";
import ChartCard from "@/components/ChartCard";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  BarChart,
  Bar,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
} from "recharts";

type YearAvg = {
  year: number;
  avgMainStory: number;
  avgAllStyles: number;
  count: number;
};

type GenreCount = { genre: string; count: number };
type PlatformCount = { platform: string; count: number };
type GenreAvgDur = {
  genre: string;
  main: number;
  mainPlusSides: number;
  completionist: number;
};
type HistBin = { binLabel: string; count: number };
type MainComp = { main_story: number; completionist: number };
type YearType = {
  year: number;
  gameCount: number;
  dlcCount: number;
  expansionCount: number;
  otherCount: number;
};
type ModeCount = { mode: string; count: number };
type MonthAvg = { month: number; avgAllStyles: number };
type DevCount = { developer: string; count: number };

type DashboardData = {
  byYearAvgMainStory: YearAvg[];
  topGenres: GenreCount[];
  topPlatforms: PlatformCount[];
  genreAvgDurations: GenreAvgDur[];
  playtimeHistogram: HistBin[];
  mainVsCompletionist: MainComp[];
  yearCountByType: YearType[];
  coopVsSingleCounts: ModeCount[];
  releaseMonthAverages: MonthAvg[];
  topDevelopers: DevCount[];
};

const PIE_COLORS = ["#3b82f6", "#22c55e", "#f97316", "#e11d48", "#a855f7"];

// ===== FADE-IN + SHADOW COMPONENT =====
type FadeState = "hidden" | "visible" | "shadow";

function FadeInSection({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [state, setState] = useState<FadeState>("hidden");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const rectTop = entry.boundingClientRect.top;
          const vh = window.innerHeight || 0;

          if (entry.isIntersecting) {
            // fokus di layar -> full
            setState("visible");
          } else {
            if (rectTop < 0) {
              // di atas viewport -> shadow
              setState("shadow");
            } else if (rectTop >= vh) {
              // di bawah viewport -> sembunyi (buat fade-in lagi)
              setState("hidden");
            }
          }
        });
      },
      {
        threshold: 0.3,
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const className =
    "fade-section" +
    (state === "visible" ? " visible" : "") +
    (state === "shadow" ? " shadow" : "");

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}



export default function Page() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/hltb/summary")
      .then((res) => res.json())
      .then((d) => {
        if (d.error) {
          setError(d.error);
        } else {
          setData(d);
        }
      })
      .catch((e) => {
        console.error(e);
        setError("Failed to load data");
      });
  }, []);

  const handleScrollToDashboard = () => {
    const el = document.getElementById("dashboard-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  if (error) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "radial-gradient(circle at top, #1f2937, #020617)",
          color: "#e5e7eb",
        }}
      >
        <p>{error}</p>
      </main>
    );
  }

  const hasData = !!data;

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, rgba(56,189,248,0.15), transparent 60%), #020617",
        color: "#e5e7eb",
      }}
    >
      {/* NAVBAR */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          backdropFilter: "blur(14px)",
          background:
            "linear-gradient(to bottom, rgba(15,23,42,0.92), rgba(15,23,42,0.7))",
          borderBottom: "1px solid rgba(30,64,175,0.4)",
        }}
      >
        <div
          style={{
            maxWidth: 1120,
            margin: "0 auto",
            padding: "12px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "999px",
                background:
                  "conic-gradient(from 120deg,#38bdf8,#22c55e,#a855f7,#38bdf8)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 25px rgba(56,189,248,0.5)",
              }}
            >
              <span
                style={{
                  fontSize: 16,
                  fontWeight: 800,
                  color: "#020617",
                }}
              >
                H
              </span>
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 16 }}>
                HLTB Insights
              </div>
              <div style={{ fontSize: 11, color: "#9ca3af" }}>
                HowLongToBeat data explorer
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 20,
              fontSize: 13,
            }}
          >
            <button
              onClick={handleScrollToDashboard}
              style={{
                border: "none",
                background: "transparent",
                color: "#e5e7eb",
                cursor: "pointer",
              }}
            >
              Dashboard
            </button>
            <a
              href="#highlights"
              style={{
                color: "#9ca3af",
                textDecoration: "none",
              }}
            >
              Highlights
            </a>
            <a
              href="#about"
              style={{
                color: "#9ca3af",
                textDecoration: "none",
              }}
            >
              About
            </a>
          </div>
        </div>
      </nav>

      {/* HERO / LANDING SECTION */}
      <section
        style={{
          maxWidth: 1120,
          margin: "0 auto",
          padding: "40px 24px 32px",
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.2fr) minmax(0, 1fr)",
          gap: 32,
          alignItems: "center",
        }}
      >
        <div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "4px 10px",
              borderRadius: 999,
              backgroundColor: "rgba(15,23,42,0.85)",
              border: "1px solid rgba(59,130,246,0.45)",
              fontSize: 11,
              marginBottom: 16,
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: 999,
                background: "#22c55e",
              }}
            />
            Live from your HLTB dataset
          </div>

          <h1
            style={{
              fontSize: 34,
              lineHeight: 1.1,
              fontWeight: 800,
              marginBottom: 12,
            }}
          >
            Turn game completion times
            <br />
            into a storytelling dashboard.
          </h1>

          <p
            style={{
              fontSize: 14,
              color: "#9ca3af",
              maxWidth: 520,
              lineHeight: 1.6,
              marginBottom: 20,
            }}
          >
            Explore how long players actually spend finishing games. See trends
            across genres, platforms, and game modes with 10+ interactive
            visualizations powered by your HowLongToBeat dataset.
          </p>

          <div
            style={{
              display: "flex",
              gap: 12,
              alignItems: "center",
              marginBottom: 16,
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={handleScrollToDashboard}
              style={{
                padding: "10px 18px",
                borderRadius: 999,
                border: "none",
                background:
                  "linear-gradient(135deg,#38bdf8,#6366f1,#a855f7)",
                color: "#e5e7eb",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                boxShadow: "0 10px 30px rgba(56,189,248,0.45)",
              }}
            >
              Explore the dashboard
            </button>
            <a
              href="#highlights"
              style={{
                fontSize: 13,
                color: "#9ca3af",
                textDecoration: "none",
              }}
            >
              View key insights ↓
            </a>
          </div>

          <div
            style={{
              display: "flex",
              gap: 20,
              fontSize: 11,
              color: "#9ca3af",
              flexWrap: "wrap",
            }}
          >
            <div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>
                {hasData ? data.topGenres.length : "10+"}
              </div>
              <div>Popular genres</div>
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>
                {hasData ? data.topPlatforms.length : "10+"}
              </div>
              <div>Platforms compared</div>
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>10</div>
              <div>Interactive charts</div>
            </div>
          </div>
        </div>

        {/* preview panel */}
        <div
          style={{
            borderRadius: 20,
            border: "1px solid rgba(31,41,55,0.9)",
            background:
              "radial-gradient(circle at top left,rgba(59,130,246,0.22),transparent 60%), #020617",
            padding: 16,
            boxShadow: "0 20px 45px rgba(0,0,0,0.7)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 10,
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: 12, color: "#9ca3af" }}>
              Sample view · Avg playtime trend
            </span>
            <span
              style={{
                fontSize: 11,
                padding: "3px 8px",
                borderRadius: 999,
                backgroundColor: "rgba(15,23,42,0.9)",
                border: "1px solid rgba(55,65,81,0.9)",
              }}
            >
              Read-only
            </span>
          </div>
          <div style={{ width: "100%", height: 220 }}>
            {hasData ? (
              <ResponsiveContainer>
                <LineChart data={data.byYearAvgMainStory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis
                    dataKey="year"
                    tick={{ fontSize: 10, fill: "#9ca3af" }}
                  />
                  <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="avgMainStory"
                    name="Main Story"
                    stroke="#38bdf8"
                    dot={false}
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="avgAllStyles"
                    name="All Styles"
                    stroke="#a855f7"
                    dot={false}
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  color: "#6b7280",
                }}
              >
                Loading preview…
              </div>
            )}
          </div>
        </div>
      </section>

      {/* HIGHLIGHTS SECTION */}
      <section
        id="highlights"
        style={{
          maxWidth: 1120,
          margin: "0 auto",
          padding: "8px 24px 16px",
        }}
      >
        <h2
          style={{
            fontSize: 20,
            fontWeight: 700,
            marginBottom: 8,
          }}
        >
          What can you discover?
        </h2>
        <p
          style={{
            fontSize: 13,
            color: "#9ca3af",
            maxWidth: 720,
            marginBottom: 16,
          }}
        >
          This landing page summarizes your HowLongToBeat dataset into a
          collection of focused questions: Which genres demand the most time?
          How do platforms compare? Do completionist runs scale linearly with
          main story? Scroll down and explore the charts to answer them.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 14,
            fontSize: 12,
          }}
        >
          <div
            style={{
              backgroundColor: "#020617",
              borderRadius: 14,
              border: "1px solid #1f2937",
              padding: 12,
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: 4 }}>
              Genre depth vs time
            </div>
            <p style={{ color: "#9ca3af" }}>
              Compare average main story, main+side, and completionist times for
              the most popular genres, and see which ones are real time sinks.
            </p>
          </div>
          <div
            style={{
              backgroundColor: "#020617",
              borderRadius: 14,
              border: "1px solid #1f2937",
              padding: 12,
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: 4 }}>
              Platform libraries at a glance
            </div>
            <p style={{ color: "#9ca3af" }}>
              Visualize which platforms host the largest catalog of titles in
              your dataset and how release trends evolve over time.
            </p>
          </div>
          <div
            style={{
              backgroundColor: "#020617",
              borderRadius: 14,
              border: "1px solid #1f2937",
              padding: 12,
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: 4 }}>
              Main vs completionist runs
            </div>
            <p style={{ color: "#9ca3af" }}>
              Explore the relationship between “just finishing” a game and
              going for 100% completion using a dedicated scatter plot.
            </p>
          </div>
          <div
            style={{
              backgroundColor: "#020617",
              borderRadius: 14,
              border: "1px solid #1f2937",
              padding: 12,
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: 4 }}>
              Single-player & co-op modes
            </div>
            <p style={{ color: "#9ca3af" }}>
              See how many titles support single-player only, co-op, or versus
              modes and understand the balance of experience types.
            </p>
          </div>
        </div>
      </section>

      {/* DASHBOARD SECTION: 1 GRAFIK = 1 LAYAR */}
      <section
        id="dashboard-section"
        style={{
          marginTop: 8,
        }}
      >
        {!data && (
          <div
            style={{
              minHeight: "60vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
              color: "#9ca3af",
            }}
          >
            Loading charts…
          </div>
        )}

        {data && (
                      <>
            {/* 1. Average playtime per year */}
            <section
              style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                padding: "32px 0",
              }}
            >
              <div
                style={{
                  maxWidth: 1120,
                  margin: "0 auto",
                  padding: "0 24px",
                  width: "100%",
                }}
              >
                <ChartCard
                  title="Average playtime per year"
                  description="Compare the average Main Story and All Styles durations by release year."
                >
                  <ResponsiveContainer>
                    <LineChart data={data.byYearAvgMainStory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                      <XAxis dataKey="year" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="avgMainStory"
                        name="Main Story"
                        stroke="#3b82f6"
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="avgAllStyles"
                        name="All Styles"
                        stroke="#22c55e"
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartCard>

                {/* teks penjelas di bawah grafik */}
                <p
                  style={{
                    marginTop: 12,
                    fontSize: 13,
                    color: "#9ca3af",
                    maxWidth: 800,
                  }}
                >
                  Grafik ini menunjukkan tren rata-rata durasi permainan dari waktu ke
                  waktu. Terlihat bahwa game yang dirilis pada tahun-tahun terbaru cenderung
                  memiliki durasi main story dan all styles yang lebih panjang dibandingkan
                  game lawas, yang mengindikasikan meningkatnya kompleksitas dan konten
                  dalam sebuah judul game.
                </p>
              </div>
            </section>


            {/* 2. Top 10 genres */}
            <section
              style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                padding: "32px 0",
              }}
            >
              <div
                style={{
                  maxWidth: 1120,
                  margin: "0 auto",
                  padding: "0 24px",
                  width: "100%",
                }}
              >
                <ChartCard
                  title="Top 10 genres"
                  description="Count of games for each of the most common genres."
                >
                  <ResponsiveContainer>
                    <BarChart
                      data={data.topGenres}
                      margin={{ left: 0, right: 0, top: 10, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                      <XAxis
                        dataKey="genre"
                        angle={-30}
                        textAnchor="end"
                        interval={0}
                        height={70}
                      />
                      <YAxis />
                      <Tooltip />
                      <Bar
                        dataKey="count"
                        name="Number of games"
                        fill="#6366f1"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>
                <p
                  style={{
                    marginTop: 12,
                    fontSize: 13,
                    color: "#9ca3af",
                    maxWidth: 800,
                  }}
                >
                  Grafik ini memperlihatkan sepuluh genre dengan jumlah game terbanyak dalam
                  dataset. Genre dengan jumlah judul lebih besar biasanya merupakan genre
                  populer di pasaran dan mendapatkan dukungan pengembangan yang konsisten dari
                  berbagai studio. Distribusi ini juga membantu memahami fokus industri game
                  pada kategori tertentu.
                </p>
              </div>
            </section>

            {/* 3. Top 10 platforms */}
            <section
              style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                padding: "32px 0",
              }}
            >
              <div
                style={{
                  maxWidth: 1120,
                  margin: "0 auto",
                  padding: "0 24px",
                  width: "100%",
                }}
              >
                <ChartCard
                  title="Top 10 platforms"
                  description="Platforms with the largest number of titles in the dataset."
                >
                  <ResponsiveContainer>
                    <BarChart
                      data={data.topPlatforms}
                      layout="vertical"
                      margin={{ left: 80, right: 20, top: 10, bottom: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                      <XAxis type="number" />
                      <YAxis
                        type="category"
                        dataKey="platform"
                        width={70}
                        tick={{ fontSize: 11 }}
                      />
                      <Tooltip />
                      <Bar
                        dataKey="count"
                        name="Number of games"
                        fill="#22c55e"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>
                <p
                  style={{
                    marginTop: 12,
                    fontSize: 13,
                    color: "#9ca3af",
                    maxWidth: 800,
                  }}
                >
                  Grafik platform menggambarkan platform mana yang memiliki katalog game
                  terbanyak dalam dataset. Platform dengan jumlah judul besar biasanya
                  menunjukkan ekosistem yang matang dan dukungan developer yang kuat. Data ini
                  dapat digunakan untuk melihat dominasi platform tertentu dalam industri game.
                </p>
              </div>
            </section>

            {/* 4. Playtime profile by genre */}
            <section
              style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                padding: "32px 0",
              }}
            >
              <div
                style={{
                  maxWidth: 1120,
                  margin: "0 auto",
                  padding: "0 24px",
                  width: "100%",
                }}
              >
                <ChartCard
                  title="Playtime profile by genre"
                  description="Average Main Story, Main + Side, and Completionist times for popular genres."
                >
                  <ResponsiveContainer>
                    <BarChart
                      data={data.genreAvgDurations}
                      margin={{ left: 0, right: 0, top: 10, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                      <XAxis
                        dataKey="genre"
                        angle={-30}
                        textAnchor="end"
                        interval={0}
                        height={70}
                      />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="main" name="Main Story" fill="#3b82f6" />
                      <Bar
                        dataKey="mainPlusSides"
                        name="Main + Side"
                        fill="#f97316"
                      />
                      <Bar
                        dataKey="completionist"
                        name="Completionist"
                        fill="#a855f7"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>
                <p
                style={{
                  marginTop: 12,
                  fontSize: 13,
                  color: "#9ca3af",
                  maxWidth: 800,
                }}
                >
                Grafik ini membandingkan tiga jenis durasi bermain (Main Story, Main + Side,
                Completionist) pada berbagai genre. Genre tertentu seperti RPG atau Strategy
                biasanya memiliki durasi completionist jauh lebih besar dibanding genre lain,
                menandakan bahwa game tersebut menawarkan lebih banyak konten opsional dan
                eksplorasi.
                </p>
              </div>
            </section>

            {/* 5. Distribution All Styles */}
            <section
              style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                padding: "32px 0",
              }}
            >
              <div
                style={{
                  maxWidth: 1120,
                  margin: "0 auto",
                  padding: "0 24px",
                  width: "100%",
                }}
              >
                <ChartCard
                  title="Distribution of All Styles duration"
                  description="Rough histogram showing how long games take to fully complete."
                >
                  <ResponsiveContainer>
                    <BarChart
                      data={data.playtimeHistogram}
                      margin={{ left: 0, right: 0, top: 10, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                      <XAxis
                        dataKey="binLabel"
                        interval={0}
                        angle={-30}
                        textAnchor="end"
                        height={70}
                      />
                      <YAxis />
                      <Tooltip />
                      <Bar
                        dataKey="count"
                        name="Number of games"
                        fill="#e11d48"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>
                <p
                  style={{
                    marginTop: 12,
                    fontSize: 13,
                    color: "#9ca3af",
                    maxWidth: 800,
                  }}
                >
                  Histogram ini menunjukkan persebaran durasi All Styles. Mayoritas game berada
                  pada durasi pendek–menengah, sementara hanya sebagian kecil yang memiliki
                  durasi sangat panjang. Distribusi ini membantu mengidentifikasi apakah pemain
                  lebih sering menemui game yang cepat selesai atau game dengan konten yang
                  panjang.
                </p>
              </div>
            </section>

            {/* 6. Scatter main vs completionist */}
            <section
              style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                padding: "32px 0",
              }}
            >
              <div
                style={{
                  maxWidth: 1120,
                  margin: "0 auto",
                  padding: "0 24px",
                  width: "100%",
                }}
              >
                <ChartCard
                  title="Main Story vs Completionist"
                  description="Relationship between just finishing the game and going for 100% completion."
                >
                  <ResponsiveContainer>
                    <ScatterChart
                      margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
                    >
                      <CartesianGrid stroke="#1f2937" />
                      <XAxis
                        type="number"
                        dataKey="main_story"
                        name="Main Story"
                        unit="h"
                      />
                      <YAxis
                        type="number"
                        dataKey="completionist"
                        name="Completionist"
                        unit="h"
                      />
                      <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                      <Scatter
                        name="Game"
                        data={data.mainVsCompletionist}
                        fill="#22c55e"
                      />
                    </ScatterChart>
                  </ResponsiveContainer>
                </ChartCard>
                <p
                  style={{
                    marginTop: 12,
                    fontSize: 13,
                    color: "#9ca3af",
                    maxWidth: 800,
                  }}
                >
                  Scatter plot ini memperlihatkan hubungan antara durasi Main Story dan
                  Completionist. Titik-titik yang semakin jauh dari garis diagonal menandakan
                  adanya jurang besar antara menyelesaikan cerita utama dan melakukan 100%
                  completion. Pola ini biasanya muncul pada game open-world atau RPG yang kaya
                  konten tambahan.
                </p>
              </div>
            </section>

            {/* 7. Releases per year by type */}
            <section
              style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                padding: "32px 0",
              }}
            >
              <div
                style={{
                  maxWidth: 1120,
                  margin: "0 auto",
                  padding: "0 24px",
                  width: "100%",
                }}
              >
                <ChartCard
                  title="Releases per year by type"
                  description="Distribution of game, DLC, and expansion releases over time."
                >
                  <ResponsiveContainer>
                    <BarChart data={data.yearCountByType}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                      <XAxis dataKey="year" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="gameCount" name="Game" fill="#3b82f6" />
                      <Bar dataKey="dlcCount" name="DLC" fill="#22c55e" />
                      <Bar
                        dataKey="expansionCount"
                        name="Expansion"
                        fill="#f97316"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>
                <p
                  style={{
                    marginTop: 12,
                    fontSize: 13,
                    color: "#9ca3af",
                    maxWidth: 800,
                  }}
                >
                  Grafik ini menampilkan jumlah game, DLC, dan expansion yang dirilis setiap
                  tahun. Puncak rilis seringkali mencerminkan momentum industri, seperti
                  transisi generasi konsol atau peningkatan tren pengembangan konten tambahan
                  (DLC). Perbandingan antar tahun dapat menunjukkan evolusi model bisnis game.
                </p>
              </div>
            </section>

            {/* 8. Game modes pie chart */}
            <section
              style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                padding: "32px 0",
              }}
            >
              <div
                style={{
                  maxWidth: 1120,
                  margin: "0 auto",
                  padding: "0 24px",
                  width: "100%",
                }}
              >
                <ChartCard
                  title="Game modes"
                  description="Number of titles that support single-player, co-op, and versus modes."
                >
                  <ResponsiveContainer>
                    <PieChart>
                      <Tooltip />
                      <Legend />
                      <Pie
                        data={data.coopVsSingleCounts}
                        dataKey="count"
                        nameKey="mode"
                        innerRadius={60}
                        outerRadius={100}
                      >
                        {data.coopVsSingleCounts.map((entry, index) => (
                          <Cell
                            key={entry.mode}
                            fill={PIE_COLORS[index % PIE_COLORS.length]}
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </ChartCard>
                <p
                  style={{
                    marginTop: 12,
                    fontSize: 13,
                    color: "#9ca3af",
                    maxWidth: 800,
                  }}
                >
                  Diagram ini menunjukkan persentase game berdasarkan mode permainan yang
                  didukung, seperti single-player, co-op, atau versus. Dominasi single-player
                  dapat mengindikasikan bahwa sebagian besar game dirancang untuk pengalaman
                  solo, sementara proporsi co-op dan versus memberikan gambaran tentang tren
                  multiplayer dalam dataset Anda.
                </p>
              </div>
            </section>

            {/* 9. Average duration by month */}
            <section
              style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                padding: "32px 0",
              }}
            >
              <div
                style={{
                  maxWidth: 1120,
                  margin: "0 auto",
                  padding: "0 24px",
                  width: "100%",
                }}
              >
                <ChartCard
                  title="Average duration by release month"
                  description="Do games released in certain months tend to be longer?"
                >
                  <ResponsiveContainer>
                    <LineChart data={data.releaseMonthAverages}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                      <XAxis
                        dataKey="month"
                        tickFormatter={(m) => `Month ${m}`}
                      />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="avgAllStyles"
                        name="Avg All Styles"
                        stroke="#a855f7"
                        dot={{ r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartCard>
                <p
                  style={{
                    marginTop: 12,
                    fontSize: 13,
                    color: "#9ca3af",
                    maxWidth: 800,
                  }}
                >
                  Grafik ini memperlihatkan rata-rata durasi game berdasarkan bulan rilis.
                  Pola musiman dapat muncul, misalnya game dengan durasi lebih panjang sering
                  dirilis menjelang akhir tahun untuk memanfaatkan momentum liburan. Tren ini
                  dapat membantu memahami strategi rilis publisher.
                </p>
              </div>
            </section>

            {/* 10. Top developers */}
            <section
              style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                padding: "32px 0 40px",
              }}
            >
              <div
                style={{
                  maxWidth: 1120,
                  margin: "0 auto",
                  padding: "0 24px",
                  width: "100%",
                }}
              >
                <ChartCard
                  title="Top 10 developers"
                  description="Developers with the largest number of titles in this dataset."
                >
                  <ResponsiveContainer>
                    <BarChart
                      data={data.topDevelopers}
                      layout="vertical"
                      margin={{ left: 100, right: 20, top: 10, bottom: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                      <XAxis type="number" />
                      <YAxis
                        type="category"
                        dataKey="developer"
                        width={90}
                        tick={{ fontSize: 11 }}
                      />
                      <Tooltip />
                      <Bar
                        dataKey="count"
                        name="Number of games"
                        fill="#3b82f6"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>
                <p
                  style={{
                    marginTop: 12,
                    fontSize: 13,
                    color: "#9ca3af",
                    maxWidth: 800,
                  }}
                >
                  Grafik ini menampilkan developer dengan jumlah game terbanyak di dalam
                  dataset. Developer yang muncul di peringkat atas biasanya memiliki rekam
                  jejak panjang dalam industri atau memproduksi seri game populer. Informasi
                  ini berguna untuk mengenali studio yang paling aktif dan produktif.
                </p>
              </div>
            </section>
          </>
        )}
      </section>

      {/* ABOUT / FOOTER */}
      <section
        id="about"
        style={{
          borderTop: "1px solid #1f2937",
          padding: "20px 24px 32px",
          marginTop: 8,
          background:
            "radial-gradient(circle at bottom, rgba(15,118,110,0.35), transparent 55%)",
        }}
      >
        <div
          style={{
            maxWidth: 1120,
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div>
            <h3
              style={{
                fontSize: 16,
                fontWeight: 600,
                marginBottom: 4,
              }}
            >
              About this page
            </h3>
            <p
              style={{
                fontSize: 12,
                color: "#9ca3af",
                maxWidth: 720,
              }}
            >
              This landing page is built with Next.js and Recharts, reading your
              HowLongToBeat dataset directly on the server and turning it into a
              browseable, interactive story. You can easily extend it with
              filters, additional charts, or connect it to other data sources.
            </p>
          </div>

          <div
            style={{
              fontSize: 11,
              color: "#6b7280",
              display: "flex",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <span>© {new Date().getFullYear()} HLTB Insights · Demo dashboard</span>
            <span>Built with Next.js · Recharts · CSV data</span>
          </div>
        </div>
      </section>
    </main>
  );
}
