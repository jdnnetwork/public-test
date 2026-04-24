// Vercel Serverless Function — Anthropic Claude 프록시 (공공기관용)
// POST /api/analyze
// env: ANTHROPIC_API_KEY
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

    // validate_company: AI 호출 없이 서버측 heuristic만 수행
    if (type === "validate_company") {
      const name = (companyName || "").trim();
      if (name.length < 2) {
        return res.status(200).json({
          valid: false,
          correctedName: null,
          message: "해당 기관을 찾을 수 없습니다. 정확한 기관명을 입력해주세요.",
        });
      }
      return res.status(200).json({ valid: true, correctedName: name, message: null });
    }

    let systemPrompt, userPrompt;

    if (type === "analyze_company") {
      // 기관 분석: 공공기관/공기업 톤으로
      systemPrompt = `당신은 한국 공공기관 채용 전문가입니다. 공공기관의 인재상과 공직 가치관을 분석하여 리포트를 생성합니다.
반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트 없이 JSON만 출력하세요.`;
      userPrompt = `"${companyName}" 기관(공공기관/공기업)을 분석해주세요.

입력값이 약칭·영문 표기(예: 한전→한국전력공사, LH→한국토지주택공사, 코레일→한국철도공사, 건보→국민건강보험공단)라면 가장 일반적인 정식 명칭으로 해석해서 분석하세요. "companyName" 필드에는 반드시 정식 명칭을 넣으세요 (입력이 이미 정식이면 그대로).

이 기관의 공직 가치, 조직 문화, 인성검사에서 중요하게 보는 영역을 아래 JSON으로 채워주세요:

{
  "companyName": "정식 명칭",
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

면접 질문 20개 배분:
- 점수가 가장 낮은 3개 적격 역량에서 각 4개씩 = 12개 (약점 검증 행동 기반 질문)
- 나머지 6개 역량 + 기관 적합성에서 총 8개
- 카테고리: 인성/가치관 5개, 공직윤리/청렴 5개, 대인관계/소통 5개, 업무태도/자세 5개
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
