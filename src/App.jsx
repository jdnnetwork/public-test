import { useState, useMemo, useEffect } from "react";
import { selectQuestions } from "./questions.js";
import { computeResults as computeResultsLib } from "./scoring.js";
import ResultView from "./ResultView.jsx";
import IntroScreen from "./IntroScreen.jsx";

const PER_PAGE = 10;
const DEV_MODE = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("dev") === "true";

function Spinner({ text }) {
  return (
    <div style={{ textAlign: "center", padding: 40 }}>
      <div style={{ width: 44, height: 44, border: "3px solid rgba(129,140,248,0.2)", borderTop: "3px solid #818cf8", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
      <div style={{ color: "#e2e8f0", fontSize: 16, fontWeight: 600, whiteSpace: "pre-line", lineHeight: 1.6 }}>{text}</div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

function DeepHeader({ subtitle }) {
  return (
    <div style={{ textAlign: "center", marginBottom: 24 }}>
      <img src="/deepdungi.png" alt="딥둥이" style={{ width: 100, height: 100, borderRadius: "50%", objectFit: "cover", marginBottom: 12, border: "3px solid rgba(129,140,248,0.3)" }} />
      <div style={{ fontSize: 12, letterSpacing: 6, color: "#94a3b8", textTransform: "uppercase", marginBottom: 4, fontWeight: 700 }}>457deep · public</div>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: "#e5e7eb", lineHeight: 1.3, marginBottom: 8 }}>딥둥이 공공기관 모의 인성검사</h1>
      {subtitle && <p style={{ color: "#cbd5e0", fontSize: 14, lineHeight: 1.6, whiteSpace: "pre-line" }}>{subtitle}</p>}
    </div>
  );
}

export default function App() {
  const [stage, setStage] = useState("intro");
  const [companyName, setCompanyName] = useState("");
  const [companyData, setCompanyData] = useState(null);
  const [page, setPage] = useState(1);
  const [answers, setAnswers] = useState({});
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [aiResults, setAiResults] = useState(null);
  const [aiError, setAiError] = useState("");
  const [basicResults, setBasicResults] = useState(null);
  const [testSet, setTestSet] = useState(null);
  const [companyValidation, setCompanyValidation] = useState(null);
  const [skipCompanyAI, setSkipCompanyAI] = useState(false);

  const questions = testSet?.questions || [];
  const TOTAL_Q = questions.length;
  const TOTAL_PAGES = Math.max(1, Math.ceil(TOTAL_Q / PER_PAGE));

  function startNewSession() {
    const seed = Math.floor(Math.random() * 2147483647);
    const set = selectQuestions(seed);
    setTestSet({ ...set, seed });
    setPage(1);
    setAnswers({});
    setStartTime(Date.now());
    setStage("test");
  }

  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [page, stage]);

  const curQs = useMemo(() => {
    if (stage !== "test") return [];
    return questions.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  }, [page, stage, questions]);
  const allAnswered = useMemo(() => curQs.every(q => answers[q.id] !== undefined), [answers, curQs]);
  const total = Object.keys(answers).length;
  const pct = Math.round(total / TOTAL_Q * 100);

  function computeResults() {
    return computeResultsLib({
      questions, answers,
      ccPairs: testSet?.ccPairs || [],
      revPairs: testSet?.revPairs || [],
      ifIds: testSet?.ifIds || [],
    });
  }

  async function analyzeCompanyInBackground(nameArg) {
    const name = (nameArg ?? companyName).trim();
    if (!name) return;
    try {
      const res = await fetch("/api/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "analyze_company", companyName: name }) });
      if (res.ok) { const data = await res.json(); if (!data.error && !data.parseError) setCompanyData(data); }
    } catch (e) {}
  }

  function proceedToTest(finalName) {
    setCompanyValidation(null);
    setSkipCompanyAI(false);
    if (finalName) { setCompanyName(finalName); analyzeCompanyInBackground(finalName); }
    setStage("pre_tip");
  }
  function proceedAsIs() {
    setCompanyValidation(null);
    setSkipCompanyAI(true);
    setStage("pre_tip");
  }

  async function validateCompanyAndStart() {
    const input = companyName.trim();
    if (!input) { setCompanyValidation(null); setStage("pre_tip"); return; }
    setCompanyValidation({ state: "validating" });
    try {
      const res = await fetch("/api/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "validate_company", companyName: input }) });
      if (!res.ok) throw new Error(`검증 서버 오류 (${res.status})`);
      const data = await res.json();
      if (data.error || data.parseError) throw new Error(data.error || "검증 결과 파싱 실패");
      if (!data.valid) {
        setCompanyValidation({ state: "error", message: data.message || "기관을 찾을 수 없습니다. 정확한 기관명을 입력해주세요." });
        return;
      }
      const corrected = (data.correctedName || "").trim();
      if (corrected && corrected !== input) {
        setCompanyValidation({ state: "confirm", correctedName: corrected, message: data.message || `'${corrected}'를 말씀하시나요?` });
        return;
      }
      proceedToTest(input);
    } catch (e) {
      setCompanyValidation({ state: "error", message: `검증 중 오류가 발생했어요. 다시 시도해주세요. (${e.message})` });
    }
  }
  function acceptCorrection() { if (companyValidation?.state === "confirm") proceedToTest(companyValidation.correctedName); }
  function rejectCorrection() { setCompanyValidation(null); }

  async function generateAiResults(basic) {
    setStage("test_loading"); setAiError("");
    const aiCompanyName = skipCompanyAI ? "일반" : (companyData?.companyName || companyName || "일반");
    const aiCompanyProfile = skipCompanyAI ? null : (companyData || null);
    try {
      const res = await fetch("/api/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
        type: "generate_results",
        testResults: {
          companyName: aiCompanyName,
          companyProfile: aiCompanyProfile,
          scores: basic.scores,
          adjustedScores: basic.adjustedScores,
          negScores: basic.negScores,
          personalityType: basic.personalityType.name,
          consistencyScore: basic.consistencyPct,
          honestyScore: 100 - basic.sdPct,
          stabilityScore: basic.stabilityScore?.display,
          authenticityScore: basic.authenticityScore?.display,
          validityChecks: basic.validityChecks,
        }
      }) });
      if (!res.ok) { setAiError(`서버 오류 (${res.status})`); setStage("result"); return; }
      const data = await res.json();
      if (data.error || data.parseError) { setAiError(data.error || "AI 결과 생성 실패"); setStage("result"); return; }
      setAiResults(data); setStage("result");
    } catch (e) { setAiError("결과 생성 오류: " + e.message); setStage("result"); }
  }
  function handleTestComplete() { setEndTime(Date.now()); const basic = computeResults(); setBasicResults(basic); generateAiResults(basic); }

  function devAutoFill(fillFn) {
    if (!testSet) return;
    const filled = {};
    testSet.questions.forEach(q => { filled[q.id] = fillFn(q); });
    setAnswers(filled);
    setEndTime(Date.now());
    const basic = computeResultsLib({
      questions: testSet.questions, answers: filled,
      ccPairs: testSet.ccPairs || [], revPairs: testSet.revPairs || [], ifIds: testSet.ifIds || [],
    });
    setBasicResults(basic);
    generateAiResults(basic);
  }

  const S = {
    wrap: { minHeight: "100vh", background: "#0a0c10", color: "#e5e7eb", fontFamily: "'Pretendard Variable', Pretendard, -apple-system, sans-serif", padding: 0 },
    box: { maxWidth: 640, margin: "0 auto", padding: "20px 16px" },
    card: { background: "rgba(22,32,50,0.9)", border: "1px solid rgba(71,85,105,0.3)", borderRadius: 14, padding: 22, marginBottom: 16 },
    progBg: { width: "100%", height: 6, background: "rgba(71,85,105,0.3)", borderRadius: 3, overflow: "hidden", marginBottom: 6 },
    progFill: w => ({ width: `${w}%`, height: "100%", background: "linear-gradient(90deg,#818cf8,#a78bfa)", borderRadius: 3, transition: "width .4s" }),
    qNum: { fontSize: 13, color: "#94a3b8", fontWeight: 700, marginBottom: 8, fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.08em" },
    qTxt: { fontSize: 17, fontWeight: 600, lineHeight: 1.7, color: "#f1f5f9", marginBottom: 16 },
    scRow: { display: "flex", gap: 8, justifyContent: "center" },
    scBtn: a => ({ flex: 1, minWidth: 52, padding: "12px 4px", border: a ? "2px solid #818cf8" : "1px solid rgba(71,85,105,0.4)", borderRadius: 10, background: a ? "rgba(129,140,248,0.15)" : "rgba(15,23,42,0.5)", color: a ? "#c7d2fe" : "#94a3b8", cursor: "pointer", fontSize: 15, fontWeight: a ? 800 : 600, textAlign: "center", transition: "all .15s" }),
    scLbl: { display: "flex", justifyContent: "space-between", fontSize: 12, color: "#94a3b8", marginTop: 6, padding: "0 4px" },
    nav: { display: "flex", gap: 10, justifyContent: "space-between", marginTop: 20 },
    btn: p => ({ padding: "15px 28px", border: "1px solid #818cf8", borderRadius: 12, background: p ? "rgba(129,140,248,0.15)" : "rgba(71,85,105,0.25)", color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer", flex: p ? 1 : undefined }),
    btnOff: { padding: "15px 28px", border: "1px solid rgba(71,85,105,0.2)", borderRadius: 12, background: "rgba(71,85,105,0.1)", color: "rgba(100,116,139,0.4)", fontSize: 16, fontWeight: 700, cursor: "not-allowed", flex: 1 },
    input: { width: "100%", padding: "16px 20px", border: "1px solid rgba(71,85,105,0.4)", borderRadius: 12, background: "rgba(15,23,42,0.6)", color: "#f1f5f9", fontSize: 18, fontWeight: 600, outline: "none", fontFamily: "inherit" },
  };

  // INTRO
  if (stage === "intro") return <IntroScreen onStart={() => setStage("company_input")} />;

  // COMPANY INPUT
  if (stage === "company_input") {
    const vs = companyValidation?.state;
    const isValidating = vs === "validating", isConfirm = vs === "confirm", isError = vs === "error";
    return (
      <div style={S.wrap}><div style={S.box}>
        <div style={{ height: 32 }} />
        <DeepHeader subtitle={"공공기관 인성검사 · 200문항 · 약 25분"} />
        <div style={S.card}>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 14, color: "#f1f5f9" }}>지원 기관 (선택)</div>
          <div style={{ marginBottom: 16 }}>
            <input style={{ ...S.input, borderColor: isError ? "rgba(248,113,113,0.5)" : S.input.border }} placeholder="정확한 기관명을 쓰세요  건보 X → 건강보험공단" value={companyName} disabled={isValidating || isConfirm} onChange={e => { setCompanyName(e.target.value); if (companyValidation) setCompanyValidation(null); }} onKeyDown={e => { if (e.key === "Enter" && !isValidating && !isConfirm) validateCompanyAndStart(); }} />
          </div>
          {isConfirm && <div style={{ marginBottom: 14, padding: "14px 16px", background: "rgba(129,140,248,0.08)", border: "1px solid rgba(129,140,248,0.3)", borderRadius: 12 }}>
            <div style={{ fontSize: 14, color: "#cbd5e0", lineHeight: 1.7, marginBottom: 12 }}>
              혹시 <span style={{ fontWeight: 800, color: "#c7d2fe" }}>"{companyValidation.correctedName}"</span>을(를) 말씀하시나요?
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={{ ...S.btn(true), flex: 1, padding: "12px" }} onClick={acceptCorrection}>네, 맞아요</button>
              <button style={{ padding: "12px 20px", border: "1px solid rgba(71,85,105,0.5)", borderRadius: 12, background: "rgba(15,23,42,0.5)", color: "#cbd5e0", fontSize: 15, fontWeight: 700, cursor: "pointer" }} onClick={rejectCorrection}>다시 입력</button>
            </div>
          </div>}
          {isError && <div style={{ marginBottom: 14, padding: "14px 16px", background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.3)", borderRadius: 10 }}>
            <div style={{ fontSize: 13, color: "#fca5a5", lineHeight: 1.7, marginBottom: 12 }}>⚠️ {companyValidation.message}</div>
            <button style={{ width: "100%", padding: "10px 14px", fontSize: 13, fontWeight: 600, border: "1px solid rgba(248,113,113,0.5)", borderRadius: 8, background: "rgba(15,23,42,0.4)", color: "#fca5a5", cursor: "pointer" }} onClick={proceedAsIs}>그래도 이 이름으로 검사 진행하기 →</button>
            <div style={{ fontSize: 11, color: "#fca5a5", opacity: 0.7, lineHeight: 1.6, marginTop: 8, textAlign: "center" }}>기관 맞춤 분석 없이 기본 결과만 표시됩니다</div>
          </div>}
          <button style={{ ...S.btn(true), width: "100%", opacity: isValidating || isConfirm ? 0.55 : 1, cursor: isValidating || isConfirm ? "not-allowed" : "pointer" }} disabled={isValidating || isConfirm} onClick={validateCompanyAndStart}>
            {isValidating ? "기관명 확인 중..." : "검사 시작하기"}
          </button>
          <div style={{ textAlign: "center", marginTop: 12, fontSize: 13, color: "#94a3b8" }}>입력하지 않아도 검사는 진행됩니다</div>
        </div>
      </div></div>
    );
  }

  // PRE-TIP (4 tips)
  if (stage === "pre_tip") {
    const tips = [
      { emoji: "⚖️", title: "적격/부적격으로 나뉘어요", body: "공공기관은 적격·부적격이 중요해요. 극단적 성향이 감지되면 다른 점수와 관계없이 부적격 판정을 받을 수 있어요." },
      { emoji: "🏛️", title: "공익 관련 문항이 포함돼요", body: '"남이 보지 않아도 규칙을 지키는가" 같은 문항이 나와요. 공공기관에서는 이 영역도 중요합니다.' },
      { emoji: "🙅", title: "완벽한 답변은 오히려 불리해요", body: "인성검사는 통계 기반이에요. 좋은 답변만 하려고 하면 비현실적 응답으로 분류돼요." },
      { emoji: "⏱️", title: "나머지는 일반 인성검사와 동일해요", body: "비슷한 질문이 반복되고 역문항이 섞여 있고 과장 응답은 탐지돼요. 솔직하게, 문항 끝까지 읽고 직감적으로 답하세요." },
    ];
    return (
      <div style={S.wrap}><div style={S.box}>
        <div style={{ height: 24 }} />
        <DeepHeader subtitle={"검사 전 꼭 읽어주세요"} />
        <div style={{ ...S.card, background: "rgba(129,140,248,0.06)", border: "1px solid rgba(129,140,248,0.3)", padding: "16px 18px", marginBottom: 14 }}>
          <div style={{ fontSize: 14, lineHeight: 1.7, color: "#cbd5e0" }}>
            공공기관 인성검사 전에 <span style={{ color: "#c7d2fe", fontWeight: 700 }}>4가지 핵심 팁</span>을 확인해 주세요.
          </div>
        </div>
        {tips.map((t, i) => (
          <div key={i} style={{ ...S.card, padding: "18px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 24 }}>{t.emoji}</span>
              <span style={{ fontSize: 11, fontWeight: 900, color: "#c7d2fe", background: "rgba(129,140,248,0.15)", padding: "2px 8px", borderRadius: 6, letterSpacing: 1, fontFamily: "'JetBrains Mono', monospace" }}>TIP {i + 1}</span>
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#f1f5f9", marginBottom: 8, lineHeight: 1.5 }}>{t.title}</div>
            <div style={{ fontSize: 14, lineHeight: 1.8, color: "#cbd5e0" }}>{t.body}</div>
          </div>
        ))}
        <button style={{ ...S.btn(true), display: "block", width: "100%", padding: "18px", fontSize: 18, fontWeight: 800, marginTop: 8, boxShadow: "0 6px 24px rgba(129,140,248,0.3)" }} onClick={startNewSession}>확인했어요, 검사 시작 →</button>
        <button style={{ display: "block", width: "100%", marginTop: 10, padding: "12px", background: "transparent", border: "none", color: "#94a3b8", fontSize: 13, cursor: "pointer" }} onClick={() => setStage("company_input")}>← 기관명 다시 입력</button>
        <div style={{ height: 32 }} />
      </div></div>
    );
  }

  if (stage === "test_loading") return (<div style={S.wrap}><div style={S.box}><div style={{ height: 60 }} /><DeepHeader /><Spinner text={"딥둥이가 맞춤 결과 리포트를 만들고 있어요\n최대 2-3분까지 소요될 수 있어요"} /></div></div>);

  // RESULT
  if (stage === "result" && basicResults) {
    const mins = endTime && startTime ? Math.round((endTime - startTime) / 60000) : "–";
    return (
      <ResultView
        basicResults={basicResults}
        aiResults={aiResults}
        aiError={aiError}
        companyData={companyData}
        companyName={companyName}
        mins={mins}
        total={total}
        totalQ={TOTAL_Q}
        skipCompanyAI={skipCompanyAI}
        onRetry={() => { setStage("company_input"); setPage(1); setAnswers({}); setAiResults(null); setAiError(""); setBasicResults(null); setStartTime(null); setEndTime(null); setTestSet(null); setCompanyValidation(null); setSkipCompanyAI(false); }}
        onAiRetry={() => { if (basicResults) generateAiResults(basicResults); }}
      />
    );
  }

  // TEST
  return (
    <div style={S.wrap}><div style={S.box}>
      <div style={{ position: "sticky", top: 0, zIndex: 10, background: "rgba(10,12,16,0.97)", backdropFilter: "blur(10px)", padding: "12px 0 8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <img src="/deepdungi.png" alt="" style={{ width: 30, height: 30, borderRadius: "50%", objectFit: "cover" }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: "#cbd5e0" }}>딥둥이 공공기관 인성검사</span>
          {companyName && <span style={{ fontSize: 12, color: "#94a3b8", marginLeft: "auto" }}>{companyName}</span>}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8", fontFamily: "'JetBrains Mono', monospace" }}>{total}/{TOTAL_Q}</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#818cf8", fontFamily: "'JetBrains Mono', monospace" }}>{pct}%</span>
        </div>
        <div style={S.progBg}><div style={S.progFill(pct)} /></div>
      </div>
      {DEV_MODE && <div style={{ margin: "12px 0", padding: "12px 14px", background: "rgba(250,204,21,0.08)", border: "1px dashed rgba(250,204,21,0.45)", borderRadius: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: 1.5, color: "#fde047", background: "rgba(250,204,21,0.15)", padding: "3px 8px", borderRadius: 6 }}>🛠 DEV MODE</span>
          <span style={{ fontSize: 12, color: "#cbd5e0" }}>200문항 스킵 · 바로 결과로</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 6 }}>
          <button style={{ padding: "10px 12px", border: "1px solid rgba(250,204,21,0.4)", borderRadius: 8, background: "rgba(15,23,42,0.5)", color: "#fde047", fontSize: 12, fontWeight: 700, cursor: "pointer" }} onClick={() => devAutoFill(() => 4)}>전부 4로 자동 채우기</button>
          <button style={{ padding: "10px 12px", border: "1px solid rgba(250,204,21,0.4)", borderRadius: 8, background: "rgba(15,23,42,0.5)", color: "#fde047", fontSize: 12, fontWeight: 700, cursor: "pointer" }} onClick={() => devAutoFill(() => Math.floor(Math.random() * 5) + 1)}>랜덤 자동 채우기</button>
          <button style={{ padding: "10px 12px", border: "1px solid rgba(250,204,21,0.4)", borderRadius: 8, background: "rgba(15,23,42,0.5)", color: "#fde047", fontSize: 12, fontWeight: 700, cursor: "pointer" }} onClick={() => devAutoFill(() => 5)}>극단 테스트 (전부 5)</button>
          <button style={{ padding: "10px 12px", border: "1px solid rgba(250,204,21,0.4)", borderRadius: 8, background: "rgba(15,23,42,0.5)", color: "#fde047", fontSize: 12, fontWeight: 700, cursor: "pointer" }} onClick={() => devAutoFill(() => 3)}>무성의 테스트 (전부 3)</button>
        </div>
      </div>}
      <div style={{ textAlign: "center", fontSize: 14, color: "#94a3b8", marginBottom: 14, fontWeight: 600 }}>페이지 {page} / {TOTAL_PAGES}</div>
      {curQs.map((q, idx) => {
        const gi = (page - 1) * PER_PAGE + idx + 1;
        return (
          <div key={q.id} style={{ ...S.card, padding: 20 }}>
            <div style={S.qNum}>Q{gi}</div>
            <div style={S.qTxt}>{q.text}</div>
            <div style={S.scRow}>{[1, 2, 3, 4, 5].map(v => <button key={v} style={S.scBtn(answers[q.id] === v)} onClick={() => setAnswers(p => ({ ...p, [q.id]: v }))}>{v}</button>)}</div>
            <div style={S.scLbl}><span>전혀 아니다</span><span>매우 그렇다</span></div>
          </div>
        );
      })}
      <div style={S.nav}>
        {page > 1 && <button style={S.btn(false)} onClick={() => setPage(page - 1)}>← 이전</button>}
        <button style={allAnswered ? S.btn(true) : S.btnOff} onClick={allAnswered ? () => { if (page === TOTAL_PAGES) handleTestComplete(); else setPage(page + 1); } : undefined} disabled={!allAnswered}>
          {page === TOTAL_PAGES ? "결과 분석 →" : "다음 →"}
        </button>
      </div>
      <div style={{ height: 32 }} />
    </div></div>
  );
}
