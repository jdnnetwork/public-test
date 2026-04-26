// ═══ 공공기관 인성검사 로직 검증 ═══
// 실행: node test-public-verification.mjs
import { selectQuestions, DIMS_ORDER, DIM_LABELS, NEG_DIMS_ORDER, NEG_LABELS } from "./src/questions.js";
import { computeResults, getGrade } from "./src/scoring.js";

function seededRandom(seed) {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6D2B79F5) >>> 0;
    let r = t;
    r = Math.imul(r ^ (r >>> 15), r | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}
const randInt = (rand, min, max) => Math.floor(rand() * (max - min + 1)) + min;

const SESSION_SEED = 42;
const ANSWER_SEED = 2024;

function buildAnswers(questions, answerFn, rand) {
  const answers = {};
  questions.forEach(q => { answers[q.id] = answerFn(q, rand); });
  return answers;
}

// ─── 시나리오 ───
const scenarios = [
  {
    name: "1. 전부 5 찍기 (모순+과장)",
    answer: () => 5,
    expect: {
      stabilityLow:   r => r.stabilityScore.raw < 40,
      authZero:       r => r.authenticityScore.raw < 10,
      disqualified:   r => r.validityChecks.disqualifying.disqualified === true,
      warningFired:   r => r.validityChecks.allSame.detected || r.validityChecks.lowVariance.detected || r.validityChecks.extremeHigh.detected || r.validityChecks.outlier.extremeLows.length > 0,
    },
  },
  {
    name: "2. 전부 3 찍기 (무성의)",
    answer: () => 3,
    expect: {
      lowVarianceFired: r => r.validityChecks.lowVariance.detected,
      notDisqualified:  r => !r.validityChecks.disqualifying.disqualified,
      dimsAround60:     r => DIMS_ORDER.every(d => r.adjustedScores[d] >= 55 && r.adjustedScores[d] <= 65),
    },
  },
  {
    name: "3. 완벽한 척 (정=5, 역=1, SD=5, IF=1, 부적격=1)",
    answer: (q) => {
      if (q.dim === "SD") return 5;
      if (q.dim === "IF") return 1;
      if (NEG_DIMS_ORDER.includes(q.dim)) return 1;
      if (q.rev) return 1;
      return 5;
    },
    expect: {
      allMainHigh:      r => DIMS_ORDER.every(d => r.adjustedScores[d] >= 85),
      authZero:         r => r.authenticityScore.raw < 10,
      extremeHighFired: r => r.validityChecks.extremeHigh.detected,
      notDisqualified:  r => !r.validityChecks.disqualifying.disqualified,
    },
  },
  {
    name: "4. 부적격 요인만 높게",
    answer: (q, rand) => {
      if (q.dim === "SD") return randInt(rand, 1, 2);
      if (q.dim === "IF") return randInt(rand, 1, 2);
      if (NEG_DIMS_ORDER.includes(q.dim)) return 5;
      if (q.rev) return randInt(rand, 2, 3);
      return randInt(rand, 3, 4);
    },
    expect: {
      disqualified:     r => r.validityChecks.disqualifying.disqualified === true,
      allDisqHigh:      r => NEG_DIMS_ORDER.every(d => r.negScores[d] >= 80),
      mainNotExtreme:   r => DIMS_ORDER.every(d => r.adjustedScores[d] < 85 && r.adjustedScores[d] >= 50),
    },
  },
  {
    name: "5. 솔직한 보통 응시자",
    answer: (q, rand) => {
      if (q.dim === "SD") return randInt(rand, 1, 2);
      if (q.dim === "IF") return randInt(rand, 1, 2);
      if (NEG_DIMS_ORDER.includes(q.dim)) return randInt(rand, 1, 2);
      if (q.rev) return randInt(rand, 2, 3);
      return randInt(rand, 3, 4);
    },
    expect: {
      notDisqualified:  r => !r.validityChecks.disqualifying.disqualified,
      stabilityHigh:    r => r.stabilityScore.raw >= 70,
      authHigh:         r => r.authenticityScore.raw >= 65,
      noAllSame:        r => !r.validityChecks.allSame.detected,
      noLowVariance:    r => !r.validityChecks.lowVariance.detected,
      noExtremeHigh:    r => !r.validityChecks.extremeHigh.detected,
    },
  },
  {
    name: "6. 윤리민감성(ETH) 낮은 응시자",
    answer: (q, rand) => {
      if (q.dim === "SD") return randInt(rand, 1, 2);
      if (q.dim === "IF") return randInt(rand, 1, 2);
      if (NEG_DIMS_ORDER.includes(q.dim)) return randInt(rand, 1, 2);
      if (q.dim === "ETH") return q.rev ? randInt(rand, 4, 5) : randInt(rand, 1, 2);
      if (q.rev) return randInt(rand, 2, 3);
      return randInt(rand, 3, 4);
    },
    expect: {
      notDisqualified:  r => !r.validityChecks.disqualifying.disqualified,
      ethLowest:        r => {
        const sorted = DIMS_ORDER.map(d => ({ d, s: r.adjustedScores[d] })).sort((a, b) => a.s - b.s);
        return sorted[0].d === "ETH";
      },
      ethLow:           r => r.adjustedScores.ETH <= 50,
      othersNormal:     r => DIMS_ORDER.filter(d => d !== "ETH").every(d => r.adjustedScores[d] >= 55 && r.adjustedScores[d] <= 80),
    },
  },
  {
    name: "7. 약간 과장한 응시자 (정=4~5, 역=1~2, SD=3~4)",
    answer: (q, rand) => {
      if (q.dim === "SD") return randInt(rand, 3, 4);
      if (q.dim === "IF") return randInt(rand, 1, 2);
      if (NEG_DIMS_ORDER.includes(q.dim)) return randInt(rand, 1, 2);
      if (q.rev) return randInt(rand, 1, 2);
      return randInt(rand, 4, 5);
    },
    expect: {
      notDisqualified:  r => !r.validityChecks.disqualifying.disqualified,
      dimsHigh:         r => DIMS_ORDER.every(d => r.adjustedScores[d] >= 70),
      authLow:          r => r.authenticityScore.raw < 60,
    },
  },
  // ─── 유형 다양성 시나리오 (8~13) ───
  // 원점수(sc)로 판정하는지 확인 — 강 차원: 정=5/역=1 → raw≈100, 보통: randInt(2,4) → raw≈50
  {
    name: "8. 안정형 공직자 (EMO+RES+TSK 강, 나머지 보통)",
    answer: (q, rand) => {
      if (q.dim === "SD") return randInt(rand, 1, 2);
      if (q.dim === "IF") return randInt(rand, 1, 2);
      if (NEG_DIMS_ORDER.includes(q.dim)) return randInt(rand, 1, 2);
      const strong = q.dim === "EMO" || q.dim === "RES" || q.dim === "TSK";
      if (strong) return q.rev ? 1 : 5;
      return randInt(rand, 2, 4);
    },
    expect: {
      typeMatches:      r => r.personalityType.name === "안정형 공직자",
      rawEMOHigh:       r => r.scores.EMO >= 70,
      rawRESHigh:       r => r.scores.RES >= 65,
      rawTSKHigh:       r => r.scores.TSK >= 65,
      notDisqualified:  r => !r.validityChecks.disqualifying.disqualified,
    },
  },
  {
    name: "9. 윤리형 봉사자 (ETH+COM+EMP 강, 나머지 보통)",
    answer: (q, rand) => {
      if (q.dim === "SD") return randInt(rand, 1, 2);
      if (q.dim === "IF") return randInt(rand, 1, 2);
      if (NEG_DIMS_ORDER.includes(q.dim)) return randInt(rand, 1, 2);
      const strong = q.dim === "ETH" || q.dim === "COM" || q.dim === "EMP";
      if (strong) return q.rev ? 1 : 5;
      return randInt(rand, 2, 4);
    },
    expect: {
      typeMatches:      r => r.personalityType.name === "윤리형 봉사자",
      rawETHHigh:       r => r.scores.ETH >= 70,
      rawCOMHigh:       r => r.scores.COM >= 65,
      rawEMPHigh:       r => r.scores.EMP >= 65,
      notDisqualified:  r => !r.validityChecks.disqualifying.disqualified,
    },
  },
  {
    name: "10. 혁신형 추진자 (FLX+GRW+TSK 강, 나머지 보통)",
    answer: (q, rand) => {
      if (q.dim === "SD") return randInt(rand, 1, 2);
      if (q.dim === "IF") return randInt(rand, 1, 2);
      if (NEG_DIMS_ORDER.includes(q.dim)) return randInt(rand, 1, 2);
      const strong = q.dim === "FLX" || q.dim === "GRW" || q.dim === "TSK";
      if (strong) return q.rev ? 1 : 5;
      return randInt(rand, 2, 4);
    },
    expect: {
      typeMatches:      r => r.personalityType.name === "혁신형 추진자",
      rawFLXHigh:       r => r.scores.FLX >= 70,
      rawGRWHigh:       r => r.scores.GRW >= 70,
      rawTSKHigh:       r => r.scores.TSK >= 65,
      notDisqualified:  r => !r.validityChecks.disqualifying.disqualified,
    },
  },
  {
    name: "11. 소통형 조율자 (REL+EMP+COM 강, 나머지 보통)",
    answer: (q, rand) => {
      if (q.dim === "SD") return randInt(rand, 1, 2);
      if (q.dim === "IF") return randInt(rand, 1, 2);
      if (NEG_DIMS_ORDER.includes(q.dim)) return randInt(rand, 1, 2);
      const strong = q.dim === "REL" || q.dim === "EMP" || q.dim === "COM";
      if (strong) return q.rev ? 1 : 5;
      return randInt(rand, 2, 4);
    },
    expect: {
      typeMatches:      r => r.personalityType.name === "소통형 조율자",
      rawRELHigh:       r => r.scores.REL >= 70,
      rawEMPHigh:       r => r.scores.EMP >= 65,
      rawCOMHigh:       r => r.scores.COM >= 65,
      notDisqualified:  r => !r.validityChecks.disqualifying.disqualified,
    },
  },
  {
    name: "12. 실무형 전문가 (TSK+FLX+EMO 강, REL 낮음, 나머지 보통)",
    answer: (q, rand) => {
      if (q.dim === "SD") return randInt(rand, 1, 2);
      if (q.dim === "IF") return randInt(rand, 1, 2);
      if (NEG_DIMS_ORDER.includes(q.dim)) return randInt(rand, 1, 2);
      if (q.dim === "REL") return q.rev ? 5 : 1;
      const strong = q.dim === "TSK" || q.dim === "FLX" || q.dim === "EMO";
      if (strong) return q.rev ? 1 : 5;
      return randInt(rand, 2, 4);
    },
    expect: {
      typeMatches:      r => r.personalityType.name === "실무형 전문가",
      rawTSKHigh:       r => r.scores.TSK >= 70,
      rawFLXHigh:       r => r.scores.FLX >= 65,
      rawEMOHigh:       r => r.scores.EMO >= 65,
      rawRELLow:        r => r.scores.REL < 60,
      notDisqualified:  r => !r.validityChecks.disqualifying.disqualified,
    },
  },
  {
    name: "13. 균형형 공직자 (전부 보통)",
    answer: (q, rand) => {
      if (q.dim === "SD") return randInt(rand, 1, 2);
      if (q.dim === "IF") return randInt(rand, 1, 2);
      if (NEG_DIMS_ORDER.includes(q.dim)) return randInt(rand, 1, 2);
      return randInt(rand, 2, 4);
    },
    expect: {
      typeMatches:      r => r.personalityType.name === "균형형 공직자",
      noDimAbove65:     r => DIMS_ORDER.every(d => r.scores[d] < 65),
      notDisqualified:  r => !r.validityChecks.disqualifying.disqualified,
    },
  },
];

// ─── 출력 ───
const GREEN = "\x1b[32m", RED = "\x1b[31m", YELLOW = "\x1b[33m", DIM = "\x1b[2m", RESET = "\x1b[0m", BOLD = "\x1b[1m";

function summarizeMain(r) {
  return DIMS_ORDER.map(d => {
    const adj = r.adjustedScores[d];
    const g = getGrade(adj);
    return `${d}:${String(adj).padStart(3)}[${g.grade}]`;
  }).join(" ");
}
function summarizeNeg(r) {
  return NEG_DIMS_ORDER.map(d => {
    const v = r.negScores[d];
    const tag = v >= 80 ? "위험" : v >= 60 ? "주의" : "안전";
    return `${d}:${String(v).padStart(3)}[${tag}]`;
  }).join(" ");
}
function summarizeWarnings(vc) {
  const flags = [];
  if (vc.allSame.detected) flags.push(`올-세임(run=${vc.allSame.maxRun})`);
  if (vc.lowVariance.detected) flags.push("로우-배리언스");
  if (vc.infrequency.detected) flags.push(`비빈도(${vc.infrequency.count})`);
  if (vc.extremeHigh.detected) flags.push(`극단값-상(${vc.extremeHigh.count}/${vc.extremeHigh.total})`);
  if (vc.outlier.avgHigh) flags.push(`평균과도(${vc.outlier.avg})`);
  if (vc.outlier.extremeLows.length > 0) flags.push(`극단값-하(${vc.outlier.extremeLows.join(",")})`);
  if (vc.disqualifying.disqualified) flags.push(`부적격(${vc.disqualifying.high.join(",")})`);
  return flags.length ? flags.join(" · ") : "(없음)";
}

const session = selectQuestions(SESSION_SEED);
console.log(`${BOLD}═══ 공공기관 인성검사 로직 검증 ═══${RESET}`);
console.log(`${DIM}세션 시드: ${SESSION_SEED} · 총 ${session.questions.length}문항${RESET}\n`);

const results = [];
for (const s of scenarios) {
  const rand = seededRandom(ANSWER_SEED);
  const answers = buildAnswers(session.questions, s.answer, rand);
  const result = computeResults({
    questions: session.questions,
    answers,
    ccPairs: session.ccPairs,
    revPairs: session.revPairs,
    ifIds: session.ifIds,
  });

  const checks = Object.entries(s.expect).map(([key, fn]) => {
    let pass = false, err = null;
    try { pass = fn(result) === true; } catch (e) { err = e.message; }
    return { key, pass, err };
  });
  const allPass = checks.every(c => c.pass);
  results.push({ scenario: s, result, checks, allPass });

  console.log(`${BOLD}[${s.name}]${RESET} ${allPass ? GREEN + "✓ PASS" : RED + "✗ FAIL"}${RESET}`);
  console.log(`  ${DIM}적격 역량:${RESET} ${summarizeMain(result)}`);
  console.log(`  ${DIM}부적격 요인:${RESET} ${summarizeNeg(result)}`);
  console.log(`  ${DIM}일관성:${RESET} ${result.consistencyPct}% · ${DIM}SD:${RESET} ${result.sdPct}%`);
  console.log(`  ${DIM}안정성:${RESET} raw=${result.stabilityScore.raw} display=${result.stabilityScore.display}`);
  console.log(`  ${DIM}진정성:${RESET} raw=${result.authenticityScore.raw} display=${result.authenticityScore.display}`);
  console.log(`  ${DIM}경고:${RESET}    ${summarizeWarnings(result.validityChecks)}`);
  console.log(`  ${DIM}유형:${RESET}    ${result.personalityType.name}`);
  console.log(`  ${DIM}체크:${RESET}`);
  for (const c of checks) {
    console.log(`    ${c.pass ? GREEN + "✓" : RED + "✗"}${RESET} ${c.key}${c.err ? ` ${YELLOW}(${c.err})${RESET}` : ""}`);
  }
  console.log();
}

const passCount = results.filter(r => r.allPass).length;
const totalCount = results.length;
const overall = passCount === totalCount;
console.log(`${BOLD}═══ 종합 ═══${RESET}`);
console.log(`${overall ? GREEN : RED}${passCount}/${totalCount} 시나리오 통과${RESET}`);
if (!overall) {
  console.log(`\n${RED}실패 시나리오:${RESET}`);
  results.filter(r => !r.allPass).forEach(r => {
    console.log(`  · ${r.scenario.name}`);
    r.checks.filter(c => !c.pass).forEach(c => console.log(`      ${RED}✗${RESET} ${c.key}`));
  });
}
process.exit(overall ? 0 : 1);
