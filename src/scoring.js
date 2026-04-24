// ═══ 공공기관 점수/탐지 로직 (순수) ═══
import {
  DIMS_ORDER, NEG_DIMS_ORDER, PERSONALITY_TYPES, IF_THRESHOLD, IF_FLAG_MIN,
} from "./questions.js";

// ─── 점수 보정 ───
export function adjustScore(raw) {
  return Math.min(95, Math.max(25, Math.round(raw * 0.6 + 30)));
}
export function adjustCompanyScore(raw) {
  if (typeof raw !== "number") return raw;
  return Math.min(95, Math.max(0, Math.round(raw + 10)));
}

// ─── 신뢰도 공용 빌더 ───
export function buildScore(raw, penalty) {
  const adjRaw = Math.max(0, Math.round(raw - penalty));
  const display = Math.max(35, adjRaw);
  const level = adjRaw >= 80 ? "매우 높음"
    : adjRaw >= 65 ? "양호"
    : adjRaw >= 50 ? "보통"
    : adjRaw >= 40 ? "주의"
    : "경고";
  return { raw: adjRaw, display, penalty, level };
}

export function computeStabilityScore(conP, vc) {
  let penalty = 0;
  if (vc.allSame?.detected) penalty += 20;
  if (vc.lowVariance?.detected) penalty += 15;
  return buildScore(conP, penalty);
}
export function computeAuthenticityScore(sdP, vc) {
  const honesty = 100 - sdP;
  let penalty = 0;
  if (vc.infrequency?.detected) penalty += 15;
  if (vc.extremeHigh?.detected) penalty += 10;
  return buildScore(honesty, penalty);
}

// ─── 등급 ───
export function getGrade(score) {
  if (score > 65) return { grade: "S", color: "#10b981", bg: "rgba(16,185,129,0.18)" };
  if (score > 55) return { grade: "A", color: "#3b82f6", bg: "rgba(59,130,246,0.18)" };
  if (score > 40) return { grade: "B", color: "#f97316", bg: "rgba(249,115,22,0.18)" };
  if (score > 30) return { grade: "C", color: "#ef4444", bg: "rgba(239,68,68,0.18)" };
  return { grade: "D", color: "#991b1b", bg: "rgba(153,27,27,0.25)" };
}

// ─── 이상치/무성의 탐지 ───
// 공공기관 기준: 연속 15문항 이상 동일값
export function detectAllSame(answers, questions, runThreshold = 15) {
  const ordered = questions.map(q => answers[q.id]).filter(a => a !== undefined);
  let maxRun = 1, curRun = 1;
  for (let i = 1; i < ordered.length; i++) {
    if (ordered[i] === ordered[i - 1]) { curRun++; if (curRun > maxRun) maxRun = curRun; }
    else curRun = 1;
  }
  return { detected: maxRun >= runThreshold, maxRun };
}
export function detectInfrequency(answers, ifIds) {
  let flagged = 0;
  const flaggedItems = [];
  (ifIds || []).forEach(id => {
    const a = answers[id];
    if (a !== undefined && a >= IF_THRESHOLD) { flagged++; flaggedItems.push(id); }
  });
  return { detected: flagged >= IF_FLAG_MIN, count: flagged, flaggedItems };
}
export function detectLowVariance(answers, questions) {
  // 적격 역량 문항만 (SD/CC/IF/부적격 제외)
  const vals = questions
    .filter(q => DIMS_ORDER.includes(q.dim))
    .map(q => answers[q.id])
    .filter(a => a !== undefined);
  if (vals.length < 10) return { detected: false };
  const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
  const variance = vals.reduce((a, b) => a + (b - mean) ** 2, 0) / vals.length;
  const std = Math.sqrt(variance);
  return { detected: std < 0.5 };
}
export function detectExtremeHigh(adjScores, dims) {
  const highCount = dims.filter(d => (adjScores[d] || 0) >= 85).length;
  return { detected: highCount >= 7, count: highCount, total: dims.length };
}
export function detectStatisticalOutlier(scores) {
  const vals = DIMS_ORDER.map(d => scores[d] || 0);
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
  const allAbove85 = vals.every(v => v >= 85);
  const avgAbove80 = avg >= 80;
  const extremeLows = DIMS_ORDER.filter(d => (scores[d] || 0) <= 20);
  return {
    allHigh: allAbove85,
    avgHigh: avgAbove80,
    avg: Math.round(avg),
    extremeLows,
    detected: allAbove85 || avgAbove80 || extremeLows.length > 0,
  };
}

// ─── 부적격 요인 판정 ───
// 부적격 원점수(0~100): 응답 평균 정규화 (정문항이므로 높을수록 위험)
export function detectDisqualifying(negScores) {
  const high = []; // 80+ 위험
  const warn = []; // 60~79 주의
  NEG_DIMS_ORDER.forEach(d => {
    const v = negScores[d] || 0;
    if (v >= 80) high.push(d);
    else if (v >= 60) warn.push(d);
  });
  return {
    high, warn,
    disqualified: high.length >= 1, // 80+ 1개라도 있으면 부적격 판정
  };
}

// ─── 결과 계산 (순수) ───
export function computeResults({ questions, answers, ccPairs = [], revPairs = [], ifIds = [] }) {
  // 1) 적격 역량 9개 원점수 (정문항 그대로, 역문항 6-a)
  const ds = {}; DIMS_ORDER.forEach(d => { ds[d] = []; });
  questions.forEach(q => {
    if (!DIMS_ORDER.includes(q.dim)) return;
    const a = answers[q.id]; if (a === undefined) return;
    ds[q.dim].push(q.rev ? (6 - a) : a);
  });
  const sc = {};
  DIMS_ORDER.forEach(d => {
    const arr = ds[d];
    sc[d] = arr.length ? Math.round((arr.reduce((a, b) => a + b, 0) / arr.length - 1) / 4 * 100) : 50;
  });

  // 2) 부적격 요인 원점수 (정문항만, 전원 출제되므로 항상 5문항)
  const nds = {}; NEG_DIMS_ORDER.forEach(d => { nds[d] = []; });
  questions.forEach(q => {
    if (!NEG_DIMS_ORDER.includes(q.dim)) return;
    const a = answers[q.id]; if (a === undefined) return;
    nds[q.dim].push(a); // 정문항이므로 그대로
  });
  const negScores = {};
  NEG_DIMS_ORDER.forEach(d => {
    const arr = nds[d];
    negScores[d] = arr.length ? Math.round((arr.reduce((a, b) => a + b, 0) / arr.length - 1) / 4 * 100) : 0;
  });

  // 3) SD 점수
  const sdQ = questions.filter(q => q.dim === "SD");
  const sdS = sdQ.reduce((s, q) => s + (answers[q.id] || 3), 0);
  const sdP = sdQ.length ? Math.round(sdS / (sdQ.length * 5) * 100) : 50;

  // 4) 일관성
  const ccDiffs = [];
  ccPairs.forEach(([c, o]) => {
    const a1 = answers[c], a2 = answers[o];
    if (a1 !== undefined && a2 !== undefined) ccDiffs.push(Math.abs(a1 - a2));
  });
  const dimDiffs = [];
  revPairs.forEach(([p, r]) => {
    const a1 = answers[p], a2 = answers[r];
    if (a1 !== undefined && a2 !== undefined) {
      const q = questions.find(q => q.id === r);
      if (q && q.rev) dimDiffs.push(Math.abs(a1 - (6 - a2)));
      else dimDiffs.push(Math.abs(a1 - a2));
    }
  });
  let conP = 50;
  const allD = [...ccDiffs, ...dimDiffs];
  if (allD.length > 0) conP = Math.max(0, Math.round((1 - allD.reduce((a, b) => a + b, 0) / allD.length / 4) * 100));

  // 5) 보정 점수 (적격 역량만)
  const adjScores = { ...sc };
  DIMS_ORDER.forEach(d => { adjScores[d] = adjustScore(sc[d] || 0); });

  // 6) 탐지
  const allSame = detectAllSame(answers, questions, 15);
  const ifResult = detectInfrequency(answers, ifIds);
  const outlier = detectStatisticalOutlier(sc);
  const lowVariance = detectLowVariance(answers, questions);
  const extremeHigh = detectExtremeHigh(adjScores, DIMS_ORDER);
  const disqualifying = detectDisqualifying(negScores);

  const vc = { allSame, infrequency: ifResult, outlier, lowVariance, extremeHigh, disqualifying };
  const stability = computeStabilityScore(conP, vc);
  const authenticity = computeAuthenticityScore(sdP, vc);

  const pType = PERSONALITY_TYPES.find(t => t.condition(sc)) || PERSONALITY_TYPES[PERSONALITY_TYPES.length - 1];

  return {
    scores: sc,
    adjustedScores: adjScores,
    negScores,
    sdPct: sdP,
    consistencyPct: conP,
    stabilityScore: stability,
    authenticityScore: authenticity,
    personalityType: pType,
    validityChecks: vc,
  };
}
