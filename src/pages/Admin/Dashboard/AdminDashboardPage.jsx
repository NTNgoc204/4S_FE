import { useEffect, useState } from "react";
import { adminAPI } from "../../../feature/admin/adminAPI";
import { financeAPI } from "../../../feature/finance/financeAPI";

function fmtShort(n) {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    totalUsers: 0,
    activeUsers: 0,
    proUsers: 0,
    monthlyRevenue: 0,
    totalWebVisits: 0,
    totalUserVisits: 0,
    dailyStats: [],
    planBreakdown: [],
    monthlyGrowth: [],
    roleComposition: { newUser: 0, proUser: 0, schoolUser: 0, staffUser: 0 },
    mobileDownloads: 0,
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const today = new Date();
        const currentMonth = today.getMonth() + 1;
        const currentYear = today.getFullYear();

        const [usersRes, summaryRes, webVisitsRes, userVisitsRes, githubDownloads] = await Promise.all([
          adminAPI.getUsers(),
          financeAPI.getSummary(currentMonth, currentYear).catch((err) => {
            console.warn("Failed to fetch finance summary in AdminDashboardPage:", err);
            return { data: { grossRevenue: 0 } };
          }),
          adminAPI.getDailyWebVisits().catch((err) => {
            console.warn("Failed to fetch daily web visits:", err);
            return { data: { data: [] } };
          }),
          adminAPI.getDailyUserVisits().catch((err) => {
            console.warn("Failed to fetch daily user visits:", err);
            return { data: { data: [] } };
          }),
          fetch("https://api.github.com/repos/NTNgoc204/4S_Mobile/releases/tags/dev-build")
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
              const apkAsset = (data?.assets || []).find((asset) => asset.name === "CareerGuidanceAI.apk");
              return apkAsset ? apkAsset.download_count : 0;
            })
            .catch((err) => {
              console.warn("Failed to fetch GitHub downloads:", err);
              return 0;
            }),
        ]);

        const usersList = usersRes.data || [];
        const total = usersList.length;
        const active = usersList.filter((u) => u.isActive).length;
        
        // Count Pro/Premium accounts
        const pro = usersList.filter((u) => {
          const p = (u.planName || "").toLowerCase();
          return p.includes("pro") || p.includes("premium");
        }).length;

        const webVisitsList = Array.isArray(webVisitsRes?.data?.data)
          ? webVisitsRes.data.data
          : (Array.isArray(webVisitsRes?.data) ? webVisitsRes.data : []);

        const userVisitsList = Array.isArray(userVisitsRes?.data?.data)
          ? userVisitsRes.data.data
          : (Array.isArray(userVisitsRes?.data) ? userVisitsRes.data : []);

        const totalWebVisits = webVisitsList.reduce((sum, item) => sum + (item.visitCount || 0), 0);
        const totalUserVisits = userVisitsList.reduce((sum, item) => sum + (item.userCount || 0), 0);

        // Generate last 30 days list
        const dailyStats = [];
        for (let i = 29; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dateStr = d.toISOString().split("T")[0]; // YYYY-MM-DD
          
          const webMatch = webVisitsList.find(item => {
            const itemDate = (item.date || "").split("T")[0];
            return itemDate === dateStr;
          });
          
          const userMatch = userVisitsList.find(item => {
            const itemDate = (item.date || "").split("T")[0];
            return itemDate === dateStr;
          });
          
          const label = `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}`;
          
          dailyStats.push({
            dateStr,
            label,
            visits: webMatch ? (webMatch.visitCount || 0) : 0,
            users: userMatch ? (userMatch.userCount || 0) : 0,
          });
        }

        // Group by roles
        let newUser = 0;
        let proUser = 0;
        let schoolUser = 0;
        let staffUser = 0;

        usersList.forEach((u) => {
          const role = (u.roleName || "").toLowerCase();
          const plan = (u.planName || "").toLowerCase();

          if (role === "student") {
            if (plan.includes("pro") || plan.includes("premium")) {
              proUser++;
            } else if (plan.includes("edu") || plan.includes("school")) {
              schoolUser++;
            } else {
              newUser++;
            }
          } else {
            // School managers, school assistants, counselors, admins, accountants all go to Ban quản trị (Staff)
            staffUser++;
          }
        });

        // Registration trends by month for current year
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const growthCounts = monthNames.map((m) => ({ month: m, count: 0 }));

        usersList.forEach((u) => {
          const regDate = u.createdAt || u.createAt;
          if (regDate) {
            const d = new Date(regDate);
            if (!isNaN(d.getTime()) && d.getFullYear() === currentYear) {
              const mIdx = d.getMonth();
              if (mIdx >= 0 && mIdx < 12) {
                growthCounts[mIdx].count += 1;
              }
            }
          }
        });

        // Plan distribution breakdown (only calculated for Student accounts)
        const studentUsers = usersList.filter((u) => (u.roleName || "").toLowerCase() === "student");
        const freeCount = studentUsers.filter((u) => !u.planName || (u.planName || "").toLowerCase().includes("free")).length;
        const proCount = studentUsers.filter((u) => (u.planName || "").toLowerCase().includes("pro") || (u.planName || "").toLowerCase().includes("premium")).length;
        const eduCount = studentUsers.filter((u) => (u.planName || "").toLowerCase().includes("edu")).length;
        const totalBase = freeCount + proCount + eduCount || 1;

        const breakdown = [
          { name: "Free", users: freeCount, ratio: Math.round((freeCount / totalBase) * 100) || 0, gradient: "from-teal-500 to-emerald-400" },
          { name: "Pro / Premium", users: proCount, ratio: Math.round((proCount / totalBase) * 100) || 0, gradient: "from-amber-500 to-yellow-400" },
          { name: "Edu", users: eduCount, ratio: Math.round((eduCount / totalBase) * 100) || 0, gradient: "from-indigo-500 to-purple-400" },
        ];

        const baseOffset = Number(import.meta.env.VITE_BASE_DOWNLOADS || 0);
        const mobileDownloads = (githubDownloads || 0) + baseOffset;

        setData({
          totalUsers: total,
          activeUsers: active,
          proUsers: pro,
          monthlyRevenue: summaryRes.data?.grossRevenue || 0,
          totalWebVisits,
          totalUserVisits,
          dailyStats,
          planBreakdown: breakdown,
          monthlyGrowth: growthCounts,
          roleComposition: { newUser, proUser, schoolUser, staffUser },
          mobileDownloads,
        });
      } catch (err) {
        console.error("Failed to load admin dashboard summary:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-teal-600" />
      </div>
    );
  }

  const kpis = [
    {
      id: "totalUsers",
      label: "Total Users",
      value: data.totalUsers.toLocaleString("vi-VN"),
      icon: (
        <svg className="h-5 w-5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      id: "activeUsers",
      label: "Active Users",
      value: data.activeUsers.toLocaleString("vi-VN"),
      icon: (
        <svg className="h-5 w-5 text-[#8b99ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      id: "proUsers",
      label: "Pro Accounts",
      value: data.proUsers.toLocaleString("vi-VN"),
      icon: (
        <svg className="h-5 w-5 text-[#ecc741]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    {
      id: "monthlyRevenue",
      label: "Monthly Revenue",
      value: `${fmtShort(data.monthlyRevenue)} VND`,
      icon: (
        <svg className="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      id: "mobileDownloads",
      label: "Mobile Downloads",
      value: data.mobileDownloads.toLocaleString("vi-VN"),
      icon: (
        <svg className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* KPI Section */}
      <section className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
        {kpis.map((item) => (
          <article
            key={item.id}
            className="rounded-2xl border border-slate-200/80 bg-white p-5 flex flex-col justify-between hover:border-slate-300 shadow-xs transition-all duration-300"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">{item.label}</span>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 border border-slate-100">
                {item.icon}
              </span>
            </div>
            <div className="mt-4">
              <p className="font-['Sora'] text-3xl font-extrabold text-slate-800">{item.value}</p>
            </div>
          </article>
        ))}
      </section>

      {/* Web Traffic Spline Chart (Last 30 Days) */}
      <WebStatsSplineChart data={data.dailyStats} />

      {/* Dynamic User Growth splined Area Chart */}
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <UserGrowthSplineChart data={data.monthlyGrowth} />
        <UserCompositionBar composition={data.roleComposition} />
      </div>

      {/* Plan Breakdown */}
      <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs max-w-2xl">
        <h3 className="font-['Sora'] text-base font-bold text-slate-800">Plan Distribution</h3>
        <p className="mt-1 text-xs text-slate-400">Users grouped by current package</p>

        <div className="mt-6 space-y-3">
          {data.planBreakdown.map((item) => (
            <div key={item.name} className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5">
              <div className="mb-2 flex items-center justify-between text-xs">
                <p className="font-bold text-slate-700">{item.name}</p>
                <p className="text-slate-500 font-semibold">{item.users.toLocaleString()} users</p>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-150">
                <span
                  className={`block h-full rounded-full bg-gradient-to-r ${item.gradient}`}
                  style={{ width: `${item.ratio}%` }}
                />
              </div>
              <p className="mt-1.5 text-[10px] text-slate-400 font-medium">{item.ratio}% of active students</p>
            </div>
          ))}
        </div>
      </article>
    </div>
  );
}

// ── Sub-component: UserGrowthSplineChart ───────────────────────────────────
function UserGrowthSplineChart({ data }) {
  if (!data || data.length === 0) return null;
  const maxVal = Math.max(...data.map(d => d.count), 5);
  const width = 600;
  const height = 240;
  const paddingX = 40;
  const paddingY = 40;

  const points = data.map((d, index) => {
    const x = paddingX + (index * (width - paddingX * 2)) / (data.length - 1);
    const y = height - paddingY - (d.count * (height - paddingY * 2)) / maxVal;
    return { x, y, label: d.month, value: d.count };
  });

  const pathD = points.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = points[i - 1];
    const cpX1 = prev.x + (p.x - prev.x) / 2;
    const cpY1 = prev.y;
    const cpX2 = prev.x + (p.x - prev.x) / 2;
    const cpY2 = p.y;
    return `${acc} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p.x} ${p.y}`;
  }, "");

  const fillD = points.length > 0 
    ? `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`
    : "";

  return (
    <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs text-slate-850 flex flex-col justify-between">
      <div>
        <h3 className="font-['Sora'] text-base font-bold text-slate-800">Đăng ký mới ({new Date().getFullYear()})</h3>
        <p className="mt-1 text-xs text-slate-400">Xu hướng tài khoản học sinh &amp; nhà trường đăng ký mới hàng tháng</p>
      </div>
      
      <div className="mt-6 w-full overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full overflow-visible">
          <defs>
            <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0d9488" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#0d9488" stopOpacity="0.00" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
            const y = paddingY + ratio * (height - paddingY * 2);
            return (
              <line
                key={index}
                x1={paddingX}
                y1={y}
                x2={width - paddingX}
                y2={y}
                stroke="#f1f5f9"
                strokeWidth={1.5}
                strokeDasharray="4 4"
              />
            );
          })}

          {/* Gradient Area */}
          {fillD && <path d={fillD} fill="url(#growthGradient)" />}

          {/* Smooth spline curve line */}
          {pathD && (
            <path
              d={pathD}
              fill="none"
              stroke="#0d9488"
              strokeWidth={3}
              strokeLinecap="round"
            />
          )}

          {/* Circles */}
          {points.map((p, index) => (
            <g key={index} className="group">
              <circle
                cx={p.x}
                cy={p.y}
                r={4.5}
                className="fill-white stroke-teal-600 stroke-[3.5px] transition-all duration-300 hover:r-6 cursor-pointer"
              />
              <text
                x={p.x}
                y={p.y - 12}
                textAnchor="middle"
                className="fill-slate-800 text-[10px] font-extrabold opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              >
                {p.value}
              </text>
            </g>
          ))}

          {/* Labels */}
          {points.map((p, index) => (
            <text
              key={index}
              x={p.x}
              y={height - 10}
              textAnchor="middle"
              className="fill-slate-400 text-[10px] font-bold"
            >
              {p.label}
            </text>
          ))}
        </svg>
      </div>
    </article>
  );
}

// ── Sub-component: UserCompositionBar ──────────────────────────────────────
function UserCompositionBar({ composition = {} }) {
  // Defensive fallbacks in case of old hot-reload cache or undefined state keys
  const comp = composition || {};
  const newUser = comp.newUser !== undefined ? comp.newUser : (comp.student || 0);
  const proUser = comp.proUser || 0;
  const schoolUser = comp.schoolUser !== undefined ? comp.schoolUser : (comp.school || 0);
  const staffUser = comp.staffUser !== undefined ? comp.staffUser : (comp.staff || 0);

  const total = newUser + proUser + schoolUser + staffUser || 1;
  const pctNew = ((newUser / total) * 100).toFixed(0);
  const pctPro = ((proUser / total) * 100).toFixed(0);
  const pctSchool = ((schoolUser / total) * 100).toFixed(0);
  const pctStaff = ((staffUser / total) * 100).toFixed(0);

  return (
    <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs text-slate-850 flex flex-col justify-between">
      <div>
        <h3 className="font-['Sora'] text-base font-bold text-slate-800">Cơ cấu người dùng</h3>
        <p className="mt-1 text-xs text-slate-400">Tỷ lệ phân bổ các nhóm tài khoản hệ thống</p>
      </div>
      
      <div className="my-auto">
        <div className="flex h-5 w-full overflow-hidden rounded-full bg-slate-100 shadow-inner">
          <div style={{ width: `${pctNew}%` }} className="bg-teal-500 hover:opacity-90 transition-all duration-300" title={`Người dùng mới: ${pctNew}%`} />
          <div style={{ width: `${pctPro}%` }} className="bg-amber-500 hover:opacity-90 transition-all duration-300" title={`Tài khoản Pro: ${pctPro}%`} />
          <div style={{ width: `${pctSchool}%` }} className="bg-indigo-500 hover:opacity-90 transition-all duration-300" title={`Học sinh trường học: ${pctSchool}%`} />
          <div style={{ width: `${pctStaff}%` }} className="bg-slate-400 hover:opacity-90 transition-all duration-300" title={`Ban quản trị: ${pctStaff}%`} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-teal-500" />
          <span className="text-slate-600 font-medium">Người dùng mới ({newUser} - {pctNew}%)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-amber-500" />
          <span className="text-slate-650 font-medium">Tài khoản Pro ({proUser} - {pctPro}%)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-indigo-500" />
          <span className="text-slate-650 font-medium">Học sinh trường học ({schoolUser} - {pctSchool}%)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-slate-400" />
          <span className="text-slate-650 font-medium">Ban quản trị ({staffUser} - {pctStaff}%)</span>
        </div>
      </div>
    </article>
  );
}

// ── Sub-component: WebStatsSplineChart ──────────────────────────────────────
function WebStatsSplineChart({ data }) {
  if (!data || data.length === 0) return null;
  
  const maxVal = Math.max(...data.map(d => Math.max(d.visits, d.users)), 5);
  
  const width = 800;
  const height = 280;
  const paddingX = 50;
  const paddingY = 40;

  const visitPoints = data.map((d, index) => {
    const x = paddingX + (index * (width - paddingX * 2)) / (data.length - 1);
    const y = height - paddingY - (d.visits * (height - paddingY * 2)) / maxVal;
    return { x, y, label: d.label, value: d.visits };
  });

  const userPoints = data.map((d, index) => {
    const x = paddingX + (index * (width - paddingX * 2)) / (data.length - 1);
    const y = height - paddingY - (d.users * (height - paddingY * 2)) / maxVal;
    return { x, y, label: d.label, value: d.users };
  });

  function generatePathD(pts) {
    return pts.reduce((acc, p, i) => {
      if (i === 0) return `M ${p.x} ${p.y}`;
      const prev = pts[i - 1];
      const cpX1 = prev.x + (p.x - prev.x) / 2;
      const cpY1 = prev.y;
      const cpX2 = prev.x + (p.x - prev.x) / 2;
      const cpY2 = p.y;
      return `${acc} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p.x} ${p.y}`;
    }, "");
  }

  const visitPathD = generatePathD(visitPoints);
  const userPathD = generatePathD(userPoints);

  const visitFillD = visitPoints.length > 0 
    ? `${visitPathD} L ${visitPoints[visitPoints.length - 1].x} ${height - paddingY} L ${visitPoints[0].x} ${height - paddingY} Z`
    : "";

  const userFillD = userPoints.length > 0 
    ? `${userPathD} L ${userPoints[userPoints.length - 1].x} ${height - paddingY} L ${userPoints[0].x} ${height - paddingY} Z`
    : "";

  const labelInterval = 3;

  return (
    <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs text-slate-850 flex flex-col justify-between">
      <style>{`
        @keyframes drawLine {
          from {
            stroke-dashoffset: 1000;
          }
          to {
            stroke-dashoffset: 0;
          }
        }
        @keyframes fadeInArea {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes popCircle {
          from {
            transform: scale(0);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .path-visit {
          stroke-dasharray: 1000;
          stroke-dashoffset: 1000;
          animation: drawLine 1.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        .path-user {
          stroke-dasharray: 1000;
          stroke-dashoffset: 1000;
          animation: drawLine 1.6s cubic-bezier(0.4, 0, 0.2, 1) 0.2s forwards;
        }
        .fill-area {
          opacity: 0;
          animation: fadeInArea 1s ease-out 1.2s forwards;
        }
        .circle-point {
          transform-origin: center;
          opacity: 0;
          animation: popCircle 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="font-['Sora'] text-base font-bold text-slate-800">Lượt truy cập 30 ngày gần đây</h3>
          <p className="mt-1 text-xs text-slate-400">Biểu đồ so sánh tổng lượt truy cập chung và lượt truy cập từ tài khoản đã đăng nhập</p>
        </div>
        
        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-sky-400" />
            <span className="text-slate-650">Lượt truy cập Web</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-indigo-500" />
            <span className="text-slate-650">Tài khoản truy cập</span>
          </div>
        </div>
      </div>
      
      <div className="mt-6 w-full overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full overflow-visible">
          <defs>
            <linearGradient id="visitGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
            const y = paddingY + ratio * (height - paddingY * 2);
            return (
              <line
                key={index}
                x1={paddingX}
                y1={y}
                x2={width - paddingX}
                y2={y}
                stroke="#f8fafc"
                strokeWidth={1.5}
                strokeDasharray="4 4"
              />
            );
          })}

          {/* Fills */}
          {visitFillD && <path d={visitFillD} className="fill-area" fill="url(#visitGrad)" />}
          {userFillD && <path d={userFillD} className="fill-area" fill="url(#userGrad)" />}

          {/* Paths */}
          {visitPathD && <path d={visitPathD} className="path-visit" fill="none" stroke="#38bdf8" strokeWidth={3} strokeLinecap="round" />}
          {userPathD && <path d={userPathD} className="path-user" fill="none" stroke="#6366f1" strokeWidth={3} strokeLinecap="round" />}

          {/* Visit Points (Circles) */}
          {visitPoints.map((p, index) => {
            const isVisible = p.value > 0;
            const delay = 1.0 + (index / data.length) * 0.8;
            return (
              <g key={`v-${index}`} className="group">
                {/* Large invisible circle to capture hover events easily */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={12}
                  className="fill-transparent cursor-pointer"
                />
                {/* Visual circle point */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={4}
                  className={`circle-point fill-white stroke-sky-400 stroke-[3px] transition-all duration-300 cursor-pointer pointer-events-none group-hover:scale-125 ${
                    isVisible ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  }`}
                  style={{ animationDelay: `${delay}s`, transformOrigin: `${p.x}px ${p.y}px` }}
                />
                <text
                  x={p.x}
                  y={p.y - 12}
                  textAnchor="middle"
                  className="fill-slate-800 text-[10px] font-extrabold opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                >
                  {p.value}
                </text>
              </g>
            );
          })}

          {/* User Points (Circles) */}
          {userPoints.map((p, index) => {
            const isVisible = p.value > 0;
            const delay = 1.2 + (index / data.length) * 0.8;
            return (
              <g key={`u-${index}`} className="group">
                {/* Large invisible circle to capture hover events easily */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={12}
                  className="fill-transparent cursor-pointer"
                />
                {/* Visual circle point */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={4}
                  className={`circle-point fill-white stroke-indigo-500 stroke-[3px] transition-all duration-300 cursor-pointer pointer-events-none group-hover:scale-125 ${
                    isVisible ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  }`}
                  style={{ animationDelay: `${delay}s`, transformOrigin: `${p.x}px ${p.y}px` }}
                />
                <text
                  x={p.x}
                  y={p.y - 12}
                  textAnchor="middle"
                  className="fill-slate-800 text-[10px] font-extrabold opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                >
                  {p.value}
                </text>
              </g>
            );
          })}

          {/* X Axis Labels */}
          {data.map((d, index) => {
            if (index % labelInterval !== 0 && index !== data.length - 1) return null;
            const x = paddingX + (index * (width - paddingX * 2)) / (data.length - 1);
            return (
              <text
                key={`l-${index}`}
                x={x}
                y={height - 10}
                textAnchor="middle"
                className="fill-slate-400 text-[9px] font-bold"
              >
                {d.label}
              </text>
            );
          })}
        </svg>
      </div>
    </article>
  );
}

export default AdminDashboardPage;
