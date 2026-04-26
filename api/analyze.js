// Vercel Serverless Function — Anthropic Claude 프록시 (공공기관용)
// POST /api/analyze
// env: ANTHROPIC_API_KEY

// 약자 → 정식명칭 매핑 (공공기관·공기업·준정부기관·국립병원)
const ABBREV_MAP = {
  // ── 공기업·공공기관 ──
  "한전": "한국전력공사", "한수원": "한국수력원자력",
  "LH": "한국토지주택공사",
  "코레일": "한국철도공사", "KTX": "한국철도공사",
  "가스공사": "한국가스공사", "지역난방": "한국지역난방공사",
  "건보": "국민건강보험공단", "건강보험": "국민건강보험공단",
  "국민연금": "국민연금공단", "공무원연금": "공무원연금공단",
  "사학연금": "사립학교교직원연금공단",
  "근로복지": "근로복지공단",
  "한국은행": "한국은행", "수출입은행": "한국수출입은행",
  "산업은행": "KDB산업은행", "기업은행": "IBK기업은행",
  "주택금융": "한국주택금융공사",
  "도로공사": "한국도로공사", "수자원": "한국수자원공사",
  "농어촌공사": "한국농어촌공사",
  "조폐공사": "한국조폐공사", "환경공단": "한국환경공단",
  "서울교통": "서울교통공사", "부산교통": "부산교통공사",
  "인천공항": "인천국제공항공사", "공항공사": "한국공항공사",
  "관광공사": "한국관광공사",
  // ── 국립병원 ──
  "서울대병원": "서울대학교병원", "분당서울대": "분당서울대학교병원",
  "국립중앙의료원": "국립중앙의료원", "국중원": "국립중앙의료원",
  "국립암센터": "국립암센터",
  "국립정신건강": "국립정신건강센터",
  "경북대병원": "경북대학교병원", "전남대병원": "전남대학교병원",
  "부산대병원": "부산대학교병원", "충남대병원": "충남대학교병원",
  "충북대병원": "충북대학교병원", "전북대병원": "전북대학교병원",
  "강원대병원": "강원대학교병원", "제주대병원": "제주대학교병원",
};

function resolveAbbreviation(raw) {
  const name = (raw || "").trim();
  return ABBREV_MAP[name] || name;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const API_KEY = process.env.ANTHROPIC_API_KEY;
  if (!API_KEY) return res.status(500).json({ error: "API key not configured" });

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
    const { type, companyName, testResults } = body;

    // validate_company: AI 호출 없이 서버측 heuristic + 약자 매핑
    if (type === "validate_company") {
      const name = (companyName || "").trim();
      if (name.length < 2) {
        return res.status(200).json({
          valid: false,
          correctedName: null,
          message: "해당 기관을 찾을 수 없습니다. 정확한 기관명을 입력해주세요.",
        });
      }
      const resolved = resolveAbbreviation(name);
      const expanded = resolved !== name;
      return res.status(200).json({
        valid: true,
        correctedName: resolved,
        message: expanded ? `${resolved}(으)로 검색합니다` : null,
      });
    }

    let systemPrompt, userPrompt;

    if (type === "analyze_company") {
      // 기관 분석: 공공기관/공기업 톤으로
      systemPrompt = `당신은 한국 공공부문 채용·인재상 전문가입니다. 공공기관·공기업·준정부기관·지방공기업·국립병원을 다룹니다. 각 기관의 공직 가치와 조직 문화를 분석하여 리포트를 생성합니다.

⚠️ 절대 준수: 사용자가 입력한 **그 기관만** 분석하세요. 다른 기관으로 대체·생성 금지.

입력값은 이미 서버측에서 약칭이 풀네임으로 확장된 상태로 전달됩니다. 그대로 사용해 분석하면 됩니다.

기관 유형별 분석 지침:
- 공기업·공공기관·준정부기관: 공직 가치·청렴·공익성 중심 분석
- 국립병원(서울대병원·국립중앙의료원 등): 의료진·행정직 채용 관점의 공공 의료 철학·기관 문화 분석

반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트 없이 JSON만 출력하세요.`;

      const resolvedName = resolveAbbreviation(companyName);
      userPrompt = `분석할 기관(입력값): "${resolvedName}"

위 입력값에 해당하는 **실제 그 한국 공공기관·공기업·국립병원**을 분석하세요. 절대 다른 기관으로 바꿔 분석하지 마세요.

이 기관의 공직 가치, 조직 문화, 인성검사에서 중요하게 보는 영역을 아래 JSON으로 채워주세요:

{
  "companyName": "${resolvedName}",
  "coreValues": "핵심 공직 가치 3~4개를 쉼표로",
  "talentProfile": "이 기관이 원하는 공직자상을 2~3문장으로 설명",
  "publicTestFocus": "이 기관 인성검사에서 특히 주의할 영역(예: 윤리·청렴·공익성 중심인지, 실무 실행력 중심인지 등)을 2~3문장으로",
  "keyTraits": ["이 기관이 중요하게 보는 공직 특성 5개 배열"],
  "cultureFit": "조직문화 특성 1~2문장"
}`;
    } else if (type === "generate_results") {
      const vc = (testResults && testResults.validityChecks) || {};
      const validityWarnings = [];
      if (vc.allSame?.detected) validityWarnings.push("연속 동일값 응답 " + vc.allSame.maxRun + "문항 (무성의 응답 패턴)");
      if (vc.infrequency?.detected) validityWarnings.push("일부 응답 패턴에서 주의 신호 감지");
      if (vc.lowVariance?.detected) validityWarnings.push("응답 변동이 매우 낮음");
      if (vc.extremeHigh?.detected) validityWarnings.push("보정 후 85점 이상 역량이 " + vc.extremeHigh.count + "개 (전반적 고점 과다)");
      if (vc.outlier?.avgHigh) validityWarnings.push("전체 평균 " + vc.outlier.avg + "점: 다소 높은 수준");
      if (vc.outlier?.extremeLows?.length > 0) validityWarnings.push("극단적 저점(20이하): " + vc.outlier.extremeLows.join(", "));
      if (vc.disqualifying?.high?.length > 0) validityWarnings.push("부적격 요인 위험 수준(80+): " + vc.disqualifying.high.join(", "));
      if (vc.disqualifying?.warn?.length > 0) validityWarnings.push("부적격 요인 주의 수준(60+): " + vc.disqualifying.warn.join(", "));

      systemPrompt = `당신은 한국 공공기관 채용 인성검사 분석 전문가이자 공직 코칭 전문가입니다. 검사 결과를 분석하여 맞춤형 리포트를 생성합니다.

톤 지침:
- "부족합니다", "탈락입니다" 같은 단정·부정적 표현 금지. "여기를 이렇게 개선하면 충분히 통과 가능" 같은 진단+코칭 톤.
- "비빈도", "IF 문항", "함정 문항", "SD", "CC" 같은 전문 용어 금지. "응답 패턴", "자연스러운 응답" 같은 완곡 표현.
- 공직자 관점에서 윤리·청렴·공익성을 자연스럽게 반영.
- 약점은 "보완 포인트"로 긍정적 재구성.

반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트 없이 JSON만 출력하세요.`;

      userPrompt = `다음은 공공기관 인성검사 결과입니다:

지원 기관: ${testResults.companyName}
기관 프로파일: ${JSON.stringify(testResults.companyProfile)}

응시자 적격 역량 9개 점수(0~100 원점수):
- 감정조절력(EMO): ${testResults.scores.EMO}
- 자기복원력(RES): ${testResults.scores.RES}
- 윤리민감성(ETH): ${testResults.scores.ETH}
- 과업몰입도(TSK): ${testResults.scores.TSK}
- 사고유연성(FLX): ${testResults.scores.FLX}
- 성장추진력(GRW): ${testResults.scores.GRW}
- 관계형성력(REL): ${testResults.scores.REL}
- 정서이해력(EMP): ${testResults.scores.EMP}
- 공동체기여도(COM): ${testResults.scores.COM}

부적격 요인 5개 점수(높을수록 위험):
- 규범이탈성(NRM): ${testResults.negScores?.NRM ?? 0}
- 관계회피성(RAV): ${testResults.negScores?.RAV ?? 0}
- 감정과잉성(AGR): ${testResults.negScores?.AGR ?? 0}
- 압박민감성(PSN): ${testResults.negScores?.PSN ?? 0}
- 피해의식성(VIC): ${testResults.negScores?.VIC ?? 0}

응시자 유형: ${testResults.personalityType}
응답 안정성: ${testResults.stabilityScore !== undefined ? testResults.stabilityScore + "%" : "N/A"}
응답 진정성: ${testResults.authenticityScore !== undefined ? testResults.authenticityScore + "%" : "N/A"}
${validityWarnings.length > 0 ? "\n📌 응답 패턴 참고:\n" + validityWarnings.map(w => "- " + w).join("\n") : ""}

아래 JSON 형식으로 리포트를 생성해주세요:

{
  "coachingFocus": "이 기관 인성검사에서 이 응시자가 특히 조심해야 할 포인트 3~4문장 (적합도 점수가 아닌 '뭘 조심해야 하는지' 방향. 예: '○○ 기관은 공직윤리를 매우 엄격하게 봅니다. 윤리민감성 점수가 이미 높은 편이지만 면접에서 구체적 사례로 뒷받침하면 더 좋아요').",
  "strengths": ["이 기관에서 강점이 될 공직 특성 3개, 1문장씩"],
  "improvements": ["보완 포인트 2~3개, 1문장씩, '이렇게 개선하면 통과 가능' 톤"],
  "interviewQuestions": [
    {"question":"면접 예상 질문","intent":"출제 의도(○○ 역량(점수) 검증 뉘앙스)","tip":"답변 팁"},
    ... 총 20개
  ],
  "overallAdvice": "이 기관 면접을 위한 종합 조언 3~4문장 (진단+코칭 톤, 공직자 관점)"
}

면접 질문은 응시자의 **적격 역량 9개 점수에 기반**해 총 20개를 출제합니다. 유형 이름이나 기관 가치관이 아니라 **점수 분포**가 절대적 기준입니다.

[차원별 배분 규칙]
- **점수가 가장 낮은 3개 적격 역량**에서 각 4개씩 = **12개**
  → 면접관이 해당 역량의 약점을 검증하려는 의도의 행동 기반 질문으로 작성
  → "당신은 ○○이 부족하군요" 식으로 직접 지적하지 말고, 자연스럽게 검증하는 행동/경험 질문으로 작성
  → 각 질문의 "intent" 필드에 "○○ 역량(XX점) 약점 검증" 뉘앙스를 명시
- **나머지 6개 역량**에서 총 **8개**
  → 강점 확인 + 행동 일관성 검증 용도
  → 역량 간 균형을 유지

[카테고리 배분 — 총 20개]
- 인성/가치관 7개
- 공직윤리/청렴 7개
- 대인관계/소통 6개
※ "조직적합성/기관 적합성" 카테고리는 사용하지 않습니다.

[전체 규칙 — 매우 중요]
- **모든 20개 질문은 반드시 인성검사 차원별 점수(적격 역량 9개)에 기반해 출제**합니다. 점수와 무관한 질문은 만들지 마세요.
- **"이 기관의 가치관을 어떻게 생각하나요?", "○○공사의 공직자상에 본인이 부합한다고 보나요?", "왜 우리 기관이어야 하나요?" 같은 조직 적합성 질문은 절대 만들지 마세요.** 기관명은 질문의 **맥락**(예: "○○공사 민원 응대 상황에서 규정과 민원인 요구가 충돌하면…")에만 활용하고, 핵심은 인성검사에서 낮게 나온 역량의 **약점 검증**입니다.
- 직무역량/기술적 위기관리 질문은 제외 (인성 기반 면접)
- 응답 패턴 주의 신호가 있으면 1~2개를 자연스러운 검증 질문으로 대체 가능('비빈도/IF' 용어 금지)`;
    } else {
      return res.status(400).json({ error: "Invalid request type" });
    }

    const maxTokens = type === "analyze_company" ? 1024 : 4096;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: maxTokens,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ error: "API error: " + response.status, details: errText });
    }

    const data = await response.json();
    const text = data.content.filter(b => b.type === "text").map(b => b.text).join("");

    let parsed;
    try {
      const cleaned = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch (e) {
      return res.status(200).json({ raw: text, parseError: true });
    }
    return res.status(200).json(parsed);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
