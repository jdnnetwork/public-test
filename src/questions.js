// ═══ 공공기관 인성검사 문항 풀 + 랜덤 선정 시스템 ═══
// 적격 역량 9개 × 60(정 40 + 역 20) = 540
// SD 15풀(5출제) · CC 20풀(9출제) · IF 8풀(4출제) · 부적격 요인 25(전원 출제)
// 세션당 정확히 200문항 (본검사 157 + SD 5 + CC 9 + IF 4 + 부적격 25)

// ─── 공통 메타 ───
export const DIM_LABELS = {
  EMO: "감정조절력", RES: "자기복원력", ETH: "윤리민감성",
  TSK: "과업몰입도", FLX: "사고유연성", GRW: "성장추진력",
  REL: "관계형성력", EMP: "정서이해력", COM: "공동체기여도",
};
export const DIM_ONELINE = {
  EMO: "감정과 스트레스 상황에서 안정적인 심리를 유지",
  RES: "실패·좌절 후 빠르게 회복하고 다시 도전",
  ETH: "규범·공익을 우선시하며 공정하게 행동",
  TSK: "맡은 역할에 책임감을 가지고 끈기있게 수행",
  FLX: "새로운 지식·관점에 열려 있음",
  GRW: "목표를 세우고 자기계발에 투자",
  REL: "사교적이고 건설적인 관계를 형성",
  EMP: "타인의 감정·입장을 편견 없이 이해",
  COM: "팀·조직을 위해 자발적으로 협력·기여",
};
export const DIMS_ORDER = ["EMO","RES","ETH","TSK","FLX","GRW","REL","EMP","COM"];

export const NEG_LABELS = {
  NRM: "규범이탈성", RAV: "관계회피성", AGR: "감정과잉성",
  PSN: "압박민감성", VIC: "피해의식성",
};
export const NEG_ONELINE = {
  NRM: "사회 규범·규칙을 무시하고 자기 판단을 우선시",
  RAV: "타인을 불신하고 소통을 거부, 독단적",
  AGR: "분노·적대감을 쉽게 드러내고 공격적 반응",
  PSN: "스트레스에 극도로 취약, 쉽게 무너짐",
  VIC: "비현실적 의심·피해의식에 쉽게 지배됨",
};
export const NEG_DIMS_ORDER = ["NRM","RAV","AGR","PSN","VIC"];

export const IF_THRESHOLD = 4;
export const IF_FLAG_MIN = 2;

const w = (d, arr) => arr.map(q => ({...q, dim: d}));

// ══════════════════════════════════════
// 감정조절력 (EMO) — 정 40 + 역 20
// ══════════════════════════════════════
const EMO_POOL = w("EMO", [
  {id:1001,text:"예상치 못한 상황에서도 평정심을 유지한다.",rev:false},
  {id:1002,text:"스트레스 상황에서도 차분하게 판단한다.",rev:false},
  {id:1003,text:"감정 기복이 크지 않은 편이다.",rev:false},
  {id:1004,text:"사소한 일에 쉽게 화내지 않는다.",rev:false},
  {id:1005,text:"비판을 받아도 금방 털어낸다.",rev:false},
  {id:1006,text:"짜증이 나도 겉으로 드러내지 않는다.",rev:false},
  {id:1007,text:"당황스러운 상황에서도 금방 마음을 가라앉힌다.",rev:false},
  {id:1008,text:"감정을 다스리는 법을 안다.",rev:false},
  {id:1009,text:"일상에서 편안함을 자주 느낀다.",rev:false},
  {id:1010,text:"불안감이 들어도 금방 이겨낸다.",rev:false},
  {id:1011,text:"타인의 자극에 마음이 흔들리지 않는다.",rev:false},
  {id:1012,text:"예민하게 반응하지 않는 편이다.",rev:false},
  {id:1013,text:"감정을 이성적으로 다룰 수 있다.",rev:false},
  {id:1014,text:"분위기가 격해져도 평정을 유지한다.",rev:false},
  {id:1015,text:"마음이 쉽게 흔들리지 않는다.",rev:false},
  {id:1016,text:"상황이 어려워도 감정적으로 대응하지 않는다.",rev:false},
  {id:1017,text:"화가 나도 합리적으로 대처한다.",rev:false},
  {id:1018,text:"기분 변화가 적은 편이다.",rev:false},
  {id:1019,text:"심리적으로 안정된 상태를 유지한다.",rev:false},
  {id:1020,text:"감정이 앞서지 않도록 주의한다.",rev:false},
  {id:1021,text:"격앙된 상황에서도 한 발 물러선다.",rev:false},
  {id:1022,text:"부정적 감정을 오래 붙잡고 있지 않는다.",rev:false},
  {id:1023,text:"내 감정을 잘 다룬다는 말을 듣는다.",rev:false},
  {id:1024,text:"차분하다는 평가를 자주 받는다.",rev:false},
  {id:1025,text:"작은 스트레스에 과민반응하지 않는다.",rev:false},
  {id:1026,text:"감정적 흥분에서 빨리 빠져나온다.",rev:false},
  {id:1027,text:"상대가 격하게 나와도 차분히 응대한다.",rev:false},
  {id:1028,text:"작은 지적에도 크게 개의치 않는다.",rev:false},
  {id:1029,text:"무너지지 않는 마음 상태를 유지한다.",rev:false},
  {id:1030,text:"침착함이 나의 강점이다.",rev:false},
  {id:1031,text:"흥분해야 할 상황에서도 냉정을 지킨다.",rev:false},
  {id:1032,text:"감정이 격해질 때 잠시 숨을 고른다.",rev:false},
  {id:1033,text:"초조함을 잘 이겨내는 편이다.",rev:false},
  {id:1034,text:"갑작스러운 변화에도 평정심을 잃지 않는다.",rev:false},
  {id:1035,text:"감정 표현을 상황에 맞게 조절한다.",rev:false},
  {id:1036,text:"내 감정에 휘둘리지 않는 편이다.",rev:false},
  {id:1037,text:"불편한 상황에서도 차분하게 행동한다.",rev:false},
  {id:1038,text:"일상적 압박에 잘 견디는 편이다.",rev:false},
  {id:1039,text:"감정의 파동이 크지 않다.",rev:false},
  {id:1040,text:"안정적인 감정 상태가 오래 유지된다.",rev:false},
  {id:1041,text:"사소한 일에도 쉽게 화가 난다.",rev:true},
  {id:1042,text:"기분이 자주 변하는 편이다.",rev:true},
  {id:1043,text:"짜증이 잘 나는 편이다.",rev:true},
  {id:1044,text:"작은 자극에도 예민하게 반응한다.",rev:true},
  {id:1045,text:"감정이 쉽게 요동친다.",rev:true},
  {id:1046,text:"감정 조절이 어려울 때가 자주 있다.",rev:true},
  {id:1047,text:"기분 나쁜 일이 있으면 오래 끌고 간다.",rev:true},
  {id:1048,text:"화가 나면 금방 참기 어렵다.",rev:true},
  {id:1049,text:"감정이 얼굴에 바로 드러난다.",rev:true},
  {id:1050,text:"별것 아닌 일에 불쾌해지는 편이다.",rev:true},
  {id:1051,text:"감정이 격해지면 말이 거칠어진다.",rev:true},
  {id:1052,text:"감정이 쉽게 폭발하는 편이다.",rev:true},
  {id:1053,text:"작은 일에도 크게 반응하는 편이다.",rev:true},
  {id:1054,text:"스트레스에 감정이 먼저 반응한다.",rev:true},
  {id:1055,text:"감정 기복이 있다는 말을 듣는다.",rev:true},
  {id:1056,text:"짜증을 숨기기 어려워한다.",rev:true},
  {id:1057,text:"불쾌한 감정을 잘 털어내지 못한다.",rev:true},
  {id:1058,text:"감정적으로 흥분하기 쉽다.",rev:true},
  {id:1059,text:"감정 조절 때문에 후회할 때가 있다.",rev:true},
  {id:1060,text:"예민하다는 말을 자주 듣는다.",rev:true},
]);

// ══════════════════════════════════════
// 자기복원력 (RES) — 정 40 + 역 20
// ══════════════════════════════════════
const RES_POOL = w("RES", [
  {id:1061,text:"실패해도 빠르게 회복한다.",rev:false},
  {id:1062,text:"좌절 후에도 다시 도전하는 편이다.",rev:false},
  {id:1063,text:"실패에서 배움을 얻는 편이다.",rev:false},
  {id:1064,text:"안 좋은 일도 시간이 지나면 잘 털어낸다.",rev:false},
  {id:1065,text:"부정적 경험을 성장의 기회로 본다.",rev:false},
  {id:1066,text:"어려움을 겪어도 의욕을 되찾는다.",rev:false},
  {id:1067,text:"실패 후 빠르게 다시 일어선다.",rev:false},
  {id:1068,text:"좌절은 일시적이라고 생각한다.",rev:false},
  {id:1069,text:"나쁜 결과에서도 긍정적인 면을 찾는다.",rev:false},
  {id:1070,text:"힘든 경험을 오래 끌고 가지 않는다.",rev:false},
  {id:1071,text:"회복탄력성이 높은 편이다.",rev:false},
  {id:1072,text:"실패를 개인 성장의 일부로 받아들인다.",rev:false},
  {id:1073,text:"좌절해도 금방 마음을 재정비한다.",rev:false},
  {id:1074,text:"어려운 시기를 잘 이겨내는 편이다.",rev:false},
  {id:1075,text:"같은 실수를 반복하지 않기 위해 배운다.",rev:false},
  {id:1076,text:"실망스러운 일이 있어도 다음을 준비한다.",rev:false},
  {id:1077,text:"스트레스 후 마음이 빨리 회복된다.",rev:false},
  {id:1078,text:"실패 경험이 나를 단단하게 만들었다.",rev:false},
  {id:1079,text:"힘든 일도 언젠가 지나간다고 믿는다.",rev:false},
  {id:1080,text:"난관을 헤쳐 나간 경험이 여러 번 있다.",rev:false},
  {id:1081,text:"목표가 어긋나도 방향을 다시 잡는다.",rev:false},
  {id:1082,text:"마음의 상처가 오래 남지 않는다.",rev:false},
  {id:1083,text:"실패를 두려워하지 않는다.",rev:false},
  {id:1084,text:"슬럼프에서 비교적 빠르게 빠져나온다.",rev:false},
  {id:1085,text:"어려운 상황 속에서도 힘을 낸다.",rev:false},
  {id:1086,text:"시련을 겪은 후에도 낙관적이다.",rev:false},
  {id:1087,text:"다시 시작할 용기가 있다.",rev:false},
  {id:1088,text:"실패 이후에도 집중력을 회복한다.",rev:false},
  {id:1089,text:"감정적 타격을 건강하게 소화한다.",rev:false},
  {id:1090,text:"좌절해도 결국 다시 움직인다.",rev:false},
  {id:1091,text:"회복이 빠른 사람이라는 말을 듣는다.",rev:false},
  {id:1092,text:"실패가 나를 정의하지 않는다고 생각한다.",rev:false},
  {id:1093,text:"역경 속에서 배운 것이 많다.",rev:false},
  {id:1094,text:"실패 후에도 자신을 지나치게 탓하지 않는다.",rev:false},
  {id:1095,text:"어려움 속에서도 해결책을 찾는다.",rev:false},
  {id:1096,text:"회복 속도가 다른 사람보다 빠른 편이다.",rev:false},
  {id:1097,text:"충격적 경험 후 일상으로 빠르게 돌아온다.",rev:false},
  {id:1098,text:"부정적 사건을 객관적으로 재해석한다.",rev:false},
  {id:1099,text:"실패도 나의 자산이 된다고 믿는다.",rev:false},
  {id:1100,text:"다시 일어서는 힘이 있다.",rev:false},
  {id:1101,text:"실패하면 오래 좌절한다.",rev:true},
  {id:1102,text:"안 좋은 일이 있으면 마음이 오래 무거워진다.",rev:true},
  {id:1103,text:"실수 후 자책을 오래 한다.",rev:true},
  {id:1104,text:"실패를 털어내기 어려워한다.",rev:true},
  {id:1105,text:"좌절감이 쉽게 사라지지 않는다.",rev:true},
  {id:1106,text:"실패 후 의욕을 잃는 편이다.",rev:true},
  {id:1107,text:"슬럼프에 빠지면 오래간다.",rev:true},
  {id:1108,text:"나쁜 일이 반복될 것 같은 불안이 든다.",rev:true},
  {id:1109,text:"실패하면 다시 시도할 힘이 없다.",rev:true},
  {id:1110,text:"좌절하면 집중이 어려워진다.",rev:true},
  {id:1111,text:"나쁜 경험의 여파가 오래 간다.",rev:true},
  {id:1112,text:"실패 후 스스로를 심하게 탓한다.",rev:true},
  {id:1113,text:"한 번의 실수가 자존감을 크게 떨어뜨린다.",rev:true},
  {id:1114,text:"회복이 더디다는 말을 들은 적이 있다.",rev:true},
  {id:1115,text:"역경을 겪으면 많이 흔들린다.",rev:true},
  {id:1116,text:"실패 후 쉽게 포기하게 된다.",rev:true},
  {id:1117,text:"나쁜 기분이 오래 지속된다.",rev:true},
  {id:1118,text:"좌절 이후 무기력해진다.",rev:true},
  {id:1119,text:"어려운 일이 있으면 오래 끌어안고 있다.",rev:true},
  {id:1120,text:"한 번 무너지면 다시 일어서기 힘들다.",rev:true},
]);

// ══════════════════════════════════════
// 윤리민감성 (ETH) — 정 40 + 역 20
// ══════════════════════════════════════
const ETH_POOL = w("ETH", [
  {id:1121,text:"규칙이 불편해도 지키려고 노력한다.",rev:false},
  {id:1122,text:"공과 사를 명확히 구분한다.",rev:false},
  {id:1123,text:"부당한 지시는 거절할 수 있다.",rev:false},
  {id:1124,text:"정해진 절차를 따르는 것이 옳다고 생각한다.",rev:false},
  {id:1125,text:"작은 편법도 용납하지 않는다.",rev:false},
  {id:1126,text:"남이 보지 않아도 규칙을 지킨다.",rev:false},
  {id:1127,text:"공공의 이익을 개인 이익보다 우선한다.",rev:false},
  {id:1128,text:"투명하게 일하는 것이 중요하다고 믿는다.",rev:false},
  {id:1129,text:"금전적 유혹에 흔들리지 않을 자신이 있다.",rev:false},
  {id:1130,text:"청렴한 조직문화에 기여하고 싶다.",rev:false},
  {id:1131,text:"양심에 따라 행동하는 것이 중요하다.",rev:false},
  {id:1132,text:"접대나 선물을 받는 것에 거부감이 있다.",rev:false},
  {id:1133,text:"조직의 부정이 있으면 바로잡아야 한다고 본다.",rev:false},
  {id:1134,text:"규범을 존중하는 태도를 유지한다.",rev:false},
  {id:1135,text:"공익을 해치는 행동은 하지 않는다.",rev:false},
  {id:1136,text:"결과보다 과정의 정당성을 중시한다.",rev:false},
  {id:1137,text:"원칙을 지키는 것이 나에게 중요하다.",rev:false},
  {id:1138,text:"윤리적 기준을 쉽게 타협하지 않는다.",rev:false},
  {id:1139,text:"사적 이익을 위해 공적 지위를 이용하지 않는다.",rev:false},
  {id:1140,text:"불공정한 상황을 그냥 넘어가지 않는다.",rev:false},
  {id:1141,text:"이해충돌 상황을 피하려 한다.",rev:false},
  {id:1142,text:"공공의 자원을 사적으로 쓰지 않는다.",rev:false},
  {id:1143,text:"정직하게 행동하는 것이 편하다.",rev:false},
  {id:1144,text:"법과 제도를 존중한다.",rev:false},
  {id:1145,text:"동료의 부당 행위도 모른 척하지 않는다.",rev:false},
  {id:1146,text:"내 행동이 공정한지 자주 점검한다.",rev:false},
  {id:1147,text:"규정을 벗어난 요청은 거절할 수 있다.",rev:false},
  {id:1148,text:"원칙이 흔들리지 않는 편이다.",rev:false},
  {id:1149,text:"정당한 절차를 생략하지 않는다.",rev:false},
  {id:1150,text:"사소한 부정에도 민감하게 반응한다.",rev:false},
  {id:1151,text:"모두가 지켜야 할 규칙은 나도 지킨다.",rev:false},
  {id:1152,text:"공공 이익에 관심이 많다.",rev:false},
  {id:1153,text:"사회적 약자에 대한 책임감을 느낀다.",rev:false},
  {id:1154,text:"내가 받은 정보를 사적으로 이용하지 않는다.",rev:false},
  {id:1155,text:"정직함이 나의 기본 가치다.",rev:false},
  {id:1156,text:"공정성을 중시하는 조직을 선호한다.",rev:false},
  {id:1157,text:"규정 위반은 작든 크든 문제라고 생각한다.",rev:false},
  {id:1158,text:"합법과 도덕 사이를 분별할 줄 안다.",rev:false},
  {id:1159,text:"나의 윤리 기준은 상황에 따라 변하지 않는다.",rev:false},
  {id:1160,text:"정당한 방법으로 결과를 얻고 싶다.",rev:false},
  {id:1161,text:"결과가 좋으면 과정에서의 편법은 괜찮다.",rev:true},
  {id:1162,text:"규정이 불합리하면 지키지 않아도 된다고 생각한다.",rev:true},
  {id:1163,text:"업무상 알게 된 정보를 사적으로 이용한 적이 있다.",rev:true},
  {id:1164,text:"주변 사람이 하니까 따라 한 적이 있다.",rev:true},
  {id:1165,text:"접대를 받는 것에 크게 거부감이 없다.",rev:true},
  {id:1166,text:"규정을 어기더라도 상사의 지시를 따라야 한다.",rev:true},
  {id:1167,text:"작은 편법은 효율을 위해 필요하다.",rev:true},
  {id:1168,text:"법적 문제만 없으면 도덕적으로도 괜찮다.",rev:true},
  {id:1169,text:"공과 사의 경계가 엄격할 필요는 없다고 본다.",rev:true},
  {id:1170,text:"조직의 이익을 위해 원칙을 조정할 수 있다.",rev:true},
  {id:1171,text:"규칙보다 실적이 더 중요하다고 생각한다.",rev:true},
  {id:1172,text:"부당한 관행도 어쩔 수 없다고 받아들인다.",rev:true},
  {id:1173,text:"공공 자원을 적당히 쓰는 건 괜찮다고 본다.",rev:true},
  {id:1174,text:"편의를 위해 절차를 생략하기도 한다.",rev:true},
  {id:1175,text:"원칙은 상황에 따라 달라질 수 있다.",rev:true},
  {id:1176,text:"법규를 엄격하게 지키는 것은 답답하다.",rev:true},
  {id:1177,text:"동료의 작은 부정은 모른 척하는 편이다.",rev:true},
  {id:1178,text:"규정보다 인간관계가 우선이라고 생각한다.",rev:true},
  {id:1179,text:"편법을 쓰면 시간을 아낄 수 있다고 본다.",rev:true},
  {id:1180,text:"공익보다 개인 이익을 챙기는 것이 현실적이다.",rev:true},
]);

// ══════════════════════════════════════
// 과업몰입도 (TSK) — 정 40 + 역 20
// ══════════════════════════════════════
const TSK_POOL = w("TSK", [
  {id:1181,text:"맡은 일은 끝까지 책임진다.",rev:false},
  {id:1182,text:"어려운 일도 끈기 있게 해낸다.",rev:false},
  {id:1183,text:"약속한 결과는 반드시 만들어낸다.",rev:false},
  {id:1184,text:"목표를 정하면 끝까지 간다.",rev:false},
  {id:1185,text:"세부사항까지 꼼꼼하게 챙긴다.",rev:false},
  {id:1186,text:"주어진 일을 끝내야 마음이 놓인다.",rev:false},
  {id:1187,text:"계획한 일을 제때 마친다.",rev:false},
  {id:1188,text:"책임감 있다는 말을 자주 듣는다.",rev:false},
  {id:1189,text:"어려움이 있어도 포기하지 않는다.",rev:false},
  {id:1190,text:"내 일에 대한 주인의식이 강하다.",rev:false},
  {id:1191,text:"품질 기준을 스스로 높게 잡는다.",rev:false},
  {id:1192,text:"완성도에 신경을 많이 쓴다.",rev:false},
  {id:1193,text:"납기를 엄수한다.",rev:false},
  {id:1194,text:"시작한 일은 반드시 완료한다.",rev:false},
  {id:1195,text:"과제에 몰입해 집중한다.",rev:false},
  {id:1196,text:"대충 마무리하지 않는다.",rev:false},
  {id:1197,text:"맡은 일이라면 최선을 다한다.",rev:false},
  {id:1198,text:"어려운 과제일수록 더 매달린다.",rev:false},
  {id:1199,text:"완수하지 못하면 불편함을 느낀다.",rev:false},
  {id:1200,text:"내 일에 자부심을 갖는다.",rev:false},
  {id:1201,text:"성실하게 일한다는 평가를 받는다.",rev:false},
  {id:1202,text:"업무에 대한 집중력이 오래간다.",rev:false},
  {id:1203,text:"일을 맡으면 책임을 끝까지 진다.",rev:false},
  {id:1204,text:"꼼꼼함이 중요한 일을 잘 해낸다.",rev:false},
  {id:1205,text:"내가 맡은 일의 품질을 높인다.",rev:false},
  {id:1206,text:"실패 없이 완수하려 노력한다.",rev:false},
  {id:1207,text:"업무에 몰입할 줄 안다.",rev:false},
  {id:1208,text:"끝까지 파고드는 편이다.",rev:false},
  {id:1209,text:"끈기 있게 도전한다.",rev:false},
  {id:1210,text:"결과를 만들어내는 사람이 되고 싶다.",rev:false},
  {id:1211,text:"과업을 중단하지 않는 편이다.",rev:false},
  {id:1212,text:"장기간 고강도 업무도 해낸다.",rev:false},
  {id:1213,text:"기한을 넘긴 적이 거의 없다.",rev:false},
  {id:1214,text:"세밀한 부분까지 점검한다.",rev:false},
  {id:1215,text:"내 일에 대한 자율적 책임감이 있다.",rev:false},
  {id:1216,text:"완수에 대한 열의가 크다.",rev:false},
  {id:1217,text:"실수를 최소화하려 점검한다.",rev:false},
  {id:1218,text:"잘 끝맺는 것을 중요시한다.",rev:false},
  {id:1219,text:"성실하게 마무리하는 편이다.",rev:false},
  {id:1220,text:"책임을 회피하지 않는다.",rev:false},
  {id:1221,text:"해야 할 일을 자꾸 미룬다.",rev:true},
  {id:1222,text:"어려운 일은 쉽게 포기한다.",rev:true},
  {id:1223,text:"일을 대충 마무리할 때가 있다.",rev:true},
  {id:1224,text:"마감을 놓치는 경우가 있다.",rev:true},
  {id:1225,text:"세부사항을 놓치는 편이다.",rev:true},
  {id:1226,text:"끝까지 해내지 못한 일이 많다.",rev:true},
  {id:1227,text:"일이 지루해지면 집중하지 않는다.",rev:true},
  {id:1228,text:"꼼꼼함이 부족하다는 말을 듣는다.",rev:true},
  {id:1229,text:"끈기가 부족한 편이다.",rev:true},
  {id:1230,text:"약속한 결과를 못 만드는 경우가 있다.",rev:true},
  {id:1231,text:"힘들면 중도에 그만둔다.",rev:true},
  {id:1232,text:"일 마무리가 허술한 편이다.",rev:true},
  {id:1233,text:"책임을 회피하고 싶을 때가 있다.",rev:true},
  {id:1234,text:"중요한 일을 깜빡할 때가 있다.",rev:true},
  {id:1235,text:"대강 넘기는 게 편할 때가 있다.",rev:true},
  {id:1236,text:"끝까지 파고드는 것이 힘들다.",rev:true},
  {id:1237,text:"관심이 없으면 일에 집중이 안 된다.",rev:true},
  {id:1238,text:"완성도를 크게 신경 쓰지 않는다.",rev:true},
  {id:1239,text:"맡은 일을 대신해 달라고 한 적 있다.",rev:true},
  {id:1240,text:"업무 중 딴짓을 자주 한다.",rev:true},
]);

// ══════════════════════════════════════
// 사고유연성 (FLX) — 정 40 + 역 20
// ══════════════════════════════════════
const FLX_POOL = w("FLX", [
  {id:1241,text:"새로운 방식을 시도하는 것을 좋아한다.",rev:false},
  {id:1242,text:"다양한 관점을 존중한다.",rev:false},
  {id:1243,text:"변화에 빠르게 적응한다.",rev:false},
  {id:1244,text:"내 방식이 아닌 것도 열려 있다.",rev:false},
  {id:1245,text:"문제를 여러 각도에서 본다.",rev:false},
  {id:1246,text:"다른 의견도 기꺼이 듣는다.",rev:false},
  {id:1247,text:"새로운 방법을 배우려 노력한다.",rev:false},
  {id:1248,text:"고정관념에 얽매이지 않는 편이다.",rev:false},
  {id:1249,text:"다양한 배경의 사람들과 어울린다.",rev:false},
  {id:1250,text:"변화를 두려워하지 않는다.",rev:false},
  {id:1251,text:"기존 방식을 자주 돌아본다.",rev:false},
  {id:1252,text:"더 나은 방법이 있는지 찾아본다.",rev:false},
  {id:1253,text:"창의적인 해결을 즐긴다.",rev:false},
  {id:1254,text:"색다른 접근을 시도해본 적 있다.",rev:false},
  {id:1255,text:"새로운 기술을 배우는 것이 즐겁다.",rev:false},
  {id:1256,text:"변화가 생겼을 때 긍정적으로 대응한다.",rev:false},
  {id:1257,text:"내 관점을 수정하는 데 거부감이 없다.",rev:false},
  {id:1258,text:"다른 문화를 이해하려 한다.",rev:false},
  {id:1259,text:"다양한 경험에 열려 있다.",rev:false},
  {id:1260,text:"틀에 박히지 않은 아이디어를 환영한다.",rev:false},
  {id:1261,text:"학습에 열린 태도를 갖고 있다.",rev:false},
  {id:1262,text:"새로운 환경에 호기심을 느낀다.",rev:false},
  {id:1263,text:"기존과 다른 시각으로 본다.",rev:false},
  {id:1264,text:"예상 밖 상황을 즐기는 편이다.",rev:false},
  {id:1265,text:"모호함을 잘 견디는 편이다.",rev:false},
  {id:1266,text:"내 사고를 유연하게 바꿀 수 있다.",rev:false},
  {id:1267,text:"낯선 문제도 해결해보려 한다.",rev:false},
  {id:1268,text:"옳다고 생각한 것도 재검토한다.",rev:false},
  {id:1269,text:"다른 사람의 제안을 열린 마음으로 받아들인다.",rev:false},
  {id:1270,text:"융통성이 있다는 말을 듣는다.",rev:false},
  {id:1271,text:"다양한 아이디어를 결합한다.",rev:false},
  {id:1272,text:"새 정보를 쉽게 받아들인다.",rev:false},
  {id:1273,text:"답이 하나가 아닐 수 있다고 본다.",rev:false},
  {id:1274,text:"새로운 도전이 흥미롭다.",rev:false},
  {id:1275,text:"관점의 차이를 이해하려 노력한다.",rev:false},
  {id:1276,text:"사고의 폭이 넓다는 말을 듣는다.",rev:false},
  {id:1277,text:"기존 규칙을 질문할 때가 있다.",rev:false},
  {id:1278,text:"새로운 발견에 기뻐한다.",rev:false},
  {id:1279,text:"의견 차이를 배우는 기회로 본다.",rev:false},
  {id:1280,text:"새로운 해석을 찾는 것을 즐긴다.",rev:false},
  {id:1281,text:"내 방식이 맞다고 생각하는 편이다.",rev:true},
  {id:1282,text:"기존 방식을 바꾸는 것이 불편하다.",rev:true},
  {id:1283,text:"다른 의견을 받아들이기 어렵다.",rev:true},
  {id:1284,text:"새로운 시도는 피하는 편이다.",rev:true},
  {id:1285,text:"변화보다 안정이 좋다.",rev:true},
  {id:1286,text:"한 번 익힌 방식을 고수한다.",rev:true},
  {id:1287,text:"검증된 방식만 신뢰한다.",rev:true},
  {id:1288,text:"예상 밖 상황이 불편하다.",rev:true},
  {id:1289,text:"고집이 세다는 말을 듣는다.",rev:true},
  {id:1290,text:"정해진 틀을 벗어나기 어렵다.",rev:true},
  {id:1291,text:"새로운 환경에 적응이 느리다.",rev:true},
  {id:1292,text:"낯선 방식은 경계부터 한다.",rev:true},
  {id:1293,text:"내 생각을 쉽게 바꾸지 않는다.",rev:true},
  {id:1294,text:"다양성보다 일관성이 편하다.",rev:true},
  {id:1295,text:"익숙하지 않은 방법은 피한다.",rev:true},
  {id:1296,text:"다른 시각을 이해하기 어렵다.",rev:true},
  {id:1297,text:"관습대로 하는 것이 마음이 놓인다.",rev:true},
  {id:1298,text:"변화가 스트레스를 준다.",rev:true},
  {id:1299,text:"새로운 아이디어보다 기존 방법이 낫다.",rev:true},
  {id:1300,text:"내 방식을 고집하는 편이다.",rev:true},
]);

// ══════════════════════════════════════
// 성장추진력 (GRW) — 정 40 + 역 20
// ══════════════════════════════════════
const GRW_POOL = w("GRW", [
  {id:1301,text:"장기적인 목표를 세운다.",rev:false},
  {id:1302,text:"자기계발에 꾸준히 투자한다.",rev:false},
  {id:1303,text:"성장하려는 의지가 강하다.",rev:false},
  {id:1304,text:"새로운 것을 배우는 것을 즐긴다.",rev:false},
  {id:1305,text:"주도적으로 경력을 설계한다.",rev:false},
  {id:1306,text:"더 나아지기 위해 노력한다.",rev:false},
  {id:1307,text:"현재에 안주하지 않는다.",rev:false},
  {id:1308,text:"목표 달성에 꾸준히 매진한다.",rev:false},
  {id:1309,text:"발전 가능성을 믿는다.",rev:false},
  {id:1310,text:"학습에 시간을 투자한다.",rev:false},
  {id:1311,text:"자기 발전을 위한 계획이 있다.",rev:false},
  {id:1312,text:"스스로 과제를 찾아 공부한다.",rev:false},
  {id:1313,text:"피드백을 성장 기회로 받아들인다.",rev:false},
  {id:1314,text:"도전적인 목표를 좋아한다.",rev:false},
  {id:1315,text:"나아가려는 동기가 강하다.",rev:false},
  {id:1316,text:"자기 주도적 학습을 한다.",rev:false},
  {id:1317,text:"꾸준히 실력을 키운다.",rev:false},
  {id:1318,text:"잘하고 싶다는 의욕이 크다.",rev:false},
  {id:1319,text:"나를 다듬어 가는 것을 즐긴다.",rev:false},
  {id:1320,text:"새 기술을 배우는 데 적극적이다.",rev:false},
  {id:1321,text:"무엇이든 더 해내려 한다.",rev:false},
  {id:1322,text:"배움을 일상으로 삼는다.",rev:false},
  {id:1323,text:"개선점을 찾아 적용한다.",rev:false},
  {id:1324,text:"목표를 세우면 끝까지 추진한다.",rev:false},
  {id:1325,text:"자기계발 루틴이 있다.",rev:false},
  {id:1326,text:"매일 조금씩 성장한다고 믿는다.",rev:false},
  {id:1327,text:"발전하는 자신을 느낄 때 뿌듯하다.",rev:false},
  {id:1328,text:"배움에 돈과 시간을 아끼지 않는다.",rev:false},
  {id:1329,text:"새 환경에서 배울 점을 찾는다.",rev:false},
  {id:1330,text:"경쟁보다 성장 자체에 의미를 둔다.",rev:false},
  {id:1331,text:"스스로 기회를 만들어간다.",rev:false},
  {id:1332,text:"목표가 있으면 방법을 찾는다.",rev:false},
  {id:1333,text:"지식을 확장하는 것을 즐긴다.",rev:false},
  {id:1334,text:"기술적 성장에 관심이 많다.",rev:false},
  {id:1335,text:"발전하려는 노력이 끊이지 않는다.",rev:false},
  {id:1336,text:"적극적으로 기회를 찾는다.",rev:false},
  {id:1337,text:"자기 반성을 통해 나아간다.",rev:false},
  {id:1338,text:"무엇이든 실력으로 만들려 한다.",rev:false},
  {id:1339,text:"도전이 나를 성장시킨다고 믿는다.",rev:false},
  {id:1340,text:"배움에 끝이 없다고 생각한다.",rev:false},
  {id:1341,text:"시키는 것만 하는 편이다.",rev:true},
  {id:1342,text:"발전 욕구가 크지 않다.",rev:true},
  {id:1343,text:"자기계발에 관심이 없다.",rev:true},
  {id:1344,text:"현재 수준에 만족한다.",rev:true},
  {id:1345,text:"목표를 세우지 않는 편이다.",rev:true},
  {id:1346,text:"학습에 시간을 거의 쓰지 않는다.",rev:true},
  {id:1347,text:"배움보다 현상 유지가 편하다.",rev:true},
  {id:1348,text:"도전을 피하는 편이다.",rev:true},
  {id:1349,text:"성장에 의욕이 잘 안 생긴다.",rev:true},
  {id:1350,text:"변화보다 안주가 좋다.",rev:true},
  {id:1351,text:"새로운 것을 익히는 것이 귀찮다.",rev:true},
  {id:1352,text:"나아지려는 마음이 약하다.",rev:true},
  {id:1353,text:"주도적으로 무언가 시도하지 않는다.",rev:true},
  {id:1354,text:"피드백을 듣고도 개선이 느리다.",rev:true},
  {id:1355,text:"발전보다 휴식이 우선이다.",rev:true},
  {id:1356,text:"목표 달성에 대한 의지가 약하다.",rev:true},
  {id:1357,text:"성취감에 큰 의미를 두지 않는다.",rev:true},
  {id:1358,text:"배울 필요성을 자주 느끼지 못한다.",rev:true},
  {id:1359,text:"지금 상태가 편하다.",rev:true},
  {id:1360,text:"발전에 투자할 여유가 없다.",rev:true},
]);

// ══════════════════════════════════════
// 관계형성력 (REL) — 정 40 + 역 20
// ══════════════════════════════════════
const REL_POOL = w("REL", [
  {id:1361,text:"사람들과 어울리는 것을 좋아한다.",rev:false},
  {id:1362,text:"새로운 사람을 만나는 것이 즐겁다.",rev:false},
  {id:1363,text:"먼저 말을 거는 편이다.",rev:false},
  {id:1364,text:"네트워킹 자리에 적극 참여한다.",rev:false},
  {id:1365,text:"대화를 주도하는 편이다.",rev:false},
  {id:1366,text:"친근하게 다가간다.",rev:false},
  {id:1367,text:"여러 사람과 연결되는 것을 즐긴다.",rev:false},
  {id:1368,text:"낯선 환경에서도 곧잘 친구를 만든다.",rev:false},
  {id:1369,text:"모임에서 분위기를 밝게 만든다.",rev:false},
  {id:1370,text:"활기찬 관계를 좋아한다.",rev:false},
  {id:1371,text:"사람을 편하게 해주는 편이다.",rev:false},
  {id:1372,text:"친구가 많은 편이다.",rev:false},
  {id:1373,text:"대화에 자신이 있다.",rev:false},
  {id:1374,text:"다양한 사람과 교류한다.",rev:false},
  {id:1375,text:"관계를 잘 만들어간다.",rev:false},
  {id:1376,text:"먼저 인사하는 편이다.",rev:false},
  {id:1377,text:"공개적인 자리에서도 자연스럽게 말한다.",rev:false},
  {id:1378,text:"네트워크를 중요하게 여긴다.",rev:false},
  {id:1379,text:"발표나 대화에 자신감이 있다.",rev:false},
  {id:1380,text:"대인관계의 폭이 넓다.",rev:false},
  {id:1381,text:"사람들과 활발히 교류한다.",rev:false},
  {id:1382,text:"분위기를 띄우는 편이다.",rev:false},
  {id:1383,text:"낯선 사람과도 친해지기 쉽다.",rev:false},
  {id:1384,text:"사교성이 있다는 말을 듣는다.",rev:false},
  {id:1385,text:"사람을 연결해주는 역할을 한다.",rev:false},
  {id:1386,text:"다양한 사람을 소개하고 싶어 한다.",rev:false},
  {id:1387,text:"새로운 친구를 금방 만든다.",rev:false},
  {id:1388,text:"처음 보는 사람과도 편하게 이야기한다.",rev:false},
  {id:1389,text:"공공장소에서 위축되지 않는다.",rev:false},
  {id:1390,text:"사교 활동이 즐겁다.",rev:false},
  {id:1391,text:"관계 형성이 자연스럽다.",rev:false},
  {id:1392,text:"사람들 속에서 에너지를 얻는다.",rev:false},
  {id:1393,text:"먼저 다가가는 것이 부담스럽지 않다.",rev:false},
  {id:1394,text:"사람들과 함께할 때 활기차다.",rev:false},
  {id:1395,text:"회식 같은 자리가 기다려진다.",rev:false},
  {id:1396,text:"낯선 사람을 만나는 것이 흥미롭다.",rev:false},
  {id:1397,text:"대화에서 주도권을 잡는 편이다.",rev:false},
  {id:1398,text:"친밀감을 빠르게 형성한다.",rev:false},
  {id:1399,text:"폭넓은 인맥을 유지한다.",rev:false},
  {id:1400,text:"많은 사람과 어울리는 것이 즐겁다.",rev:false},
  {id:1401,text:"사람 만나는 것이 피곤하다.",rev:true},
  {id:1402,text:"먼저 말 걸기가 어렵다.",rev:true},
  {id:1403,text:"혼자 있는 것이 편하다.",rev:true},
  {id:1404,text:"모임 자리가 불편하다.",rev:true},
  {id:1405,text:"대화에 끼어들기 어려워한다.",rev:true},
  {id:1406,text:"낯선 사람과는 말을 잘 못 한다.",rev:true},
  {id:1407,text:"사교 활동이 피곤하다.",rev:true},
  {id:1408,text:"사람 많은 곳이 부담스럽다.",rev:true},
  {id:1409,text:"말수가 적은 편이다.",rev:true},
  {id:1410,text:"공개 자리에서는 조용해진다.",rev:true},
  {id:1411,text:"적극적으로 다가가는 것이 어렵다.",rev:true},
  {id:1412,text:"관계를 넓히는 것이 힘들다.",rev:true},
  {id:1413,text:"네트워킹은 어색하다.",rev:true},
  {id:1414,text:"혼자가 가장 편하다.",rev:true},
  {id:1415,text:"사람 사귀는 데 시간이 오래 걸린다.",rev:true},
  {id:1416,text:"새로운 사람과 어울리는 것이 어렵다.",rev:true},
  {id:1417,text:"먼저 인사하기 꺼려진다.",rev:true},
  {id:1418,text:"그룹 활동이 부담스럽다.",rev:true},
  {id:1419,text:"사교적이지 않다는 말을 듣는다.",rev:true},
  {id:1420,text:"대화가 어렵게 느껴진다.",rev:true},
]);

// ══════════════════════════════════════
// 정서이해력 (EMP) — 정 40 + 역 20
// ══════════════════════════════════════
const EMP_POOL = w("EMP", [
  {id:1421,text:"다른 사람의 감정을 잘 이해한다.",rev:false},
  {id:1422,text:"상대방의 입장에서 생각하려 한다.",rev:false},
  {id:1423,text:"공감 능력이 있다는 말을 듣는다.",rev:false},
  {id:1424,text:"남의 이야기를 잘 들어준다.",rev:false},
  {id:1425,text:"상대방의 감정을 배려한다.",rev:false},
  {id:1426,text:"편견 없이 사람을 본다.",rev:false},
  {id:1427,text:"다른 사람의 아픔에 같이 슬퍼한다.",rev:false},
  {id:1428,text:"대화에서 상대방을 존중한다.",rev:false},
  {id:1429,text:"감정에 민감한 편이다.",rev:false},
  {id:1430,text:"상대의 기분을 잘 알아챈다.",rev:false},
  {id:1431,text:"상처받지 않게 말하려 노력한다.",rev:false},
  {id:1432,text:"타인의 감정을 소중히 여긴다.",rev:false},
  {id:1433,text:"경청하는 것이 편하다.",rev:false},
  {id:1434,text:"힘든 사람을 그냥 지나치지 못한다.",rev:false},
  {id:1435,text:"따뜻한 말을 건네는 편이다.",rev:false},
  {id:1436,text:"타인의 처지를 이해하려 한다.",rev:false},
  {id:1437,text:"감정 표현에 주의를 기울인다.",rev:false},
  {id:1438,text:"다름을 인정하는 편이다.",rev:false},
  {id:1439,text:"상대의 속마음을 헤아린다.",rev:false},
  {id:1440,text:"내 감정보다 상대의 감정을 먼저 본다.",rev:false},
  {id:1441,text:"위로를 잘 한다는 말을 듣는다.",rev:false},
  {id:1442,text:"사람들의 감정 변화에 관심이 있다.",rev:false},
  {id:1443,text:"상대방이 편안하도록 배려한다.",rev:false},
  {id:1444,text:"눈치가 빠른 편이다.",rev:false},
  {id:1445,text:"타인의 감정을 존중한다.",rev:false},
  {id:1446,text:"경청 후 말하는 편이다.",rev:false},
  {id:1447,text:"공감력이 내 강점이다.",rev:false},
  {id:1448,text:"타인의 고통을 가볍게 여기지 않는다.",rev:false},
  {id:1449,text:"사람의 감정을 섬세하게 읽는다.",rev:false},
  {id:1450,text:"관계에서 감정을 중요하게 여긴다.",rev:false},
  {id:1451,text:"사람의 마음을 이해하려 노력한다.",rev:false},
  {id:1452,text:"상대방을 배려한다는 말을 듣는다.",rev:false},
  {id:1453,text:"감정적으로 연결되는 것을 중시한다.",rev:false},
  {id:1454,text:"남의 감정을 흘려듣지 않는다.",rev:false},
  {id:1455,text:"다른 사람을 이해하기 위해 관찰한다.",rev:false},
  {id:1456,text:"공감을 통해 문제를 풀어가려 한다.",rev:false},
  {id:1457,text:"상대방이 속상할 때 함께 있어준다.",rev:false},
  {id:1458,text:"경청의 중요성을 안다.",rev:false},
  {id:1459,text:"사람을 섬세하게 대한다.",rev:false},
  {id:1460,text:"타인의 감정에 진심으로 반응한다.",rev:false},
  {id:1461,text:"남의 감정에 무관심한 편이다.",rev:true},
  {id:1462,text:"다른 사람 기분을 잘 모르겠다.",rev:true},
  {id:1463,text:"남의 고민에 관심이 없다.",rev:true},
  {id:1464,text:"공감이 잘 안 된다.",rev:true},
  {id:1465,text:"감정적인 대화가 불편하다.",rev:true},
  {id:1466,text:"편견이 있다는 말을 들은 적이 있다.",rev:true},
  {id:1467,text:"경청이 힘들다.",rev:true},
  {id:1468,text:"상대 입장을 이해하는 게 귀찮다.",rev:true},
  {id:1469,text:"감정 읽기를 어려워한다.",rev:true},
  {id:1470,text:"무덤덤한 편이다.",rev:true},
  {id:1471,text:"타인의 고통에 크게 반응하지 않는다.",rev:true},
  {id:1472,text:"다른 사람의 슬픔에 공감이 어렵다.",rev:true},
  {id:1473,text:"관심을 기울이기 어렵다.",rev:true},
  {id:1474,text:"감정적인 사람을 이해하기 힘들다.",rev:true},
  {id:1475,text:"상대의 마음을 헤아리는 게 서툴다.",rev:true},
  {id:1476,text:"감정보다 논리가 우선이다.",rev:true},
  {id:1477,text:"다른 사람의 이야기가 지루하게 느껴진다.",rev:true},
  {id:1478,text:"눈치가 없다는 말을 들은 적이 있다.",rev:true},
  {id:1479,text:"남의 감정 변화를 잘 놓친다.",rev:true},
  {id:1480,text:"공감력이 부족한 것 같다.",rev:true},
]);

// ══════════════════════════════════════
// 공동체기여도 (COM) — 정 40 + 역 20
// ══════════════════════════════════════
const COM_POOL = w("COM", [
  {id:1481,text:"팀의 성공을 위해 나서서 돕는다.",rev:false},
  {id:1482,text:"팀원의 부담을 기꺼이 나눈다.",rev:false},
  {id:1483,text:"공동 목표를 중시한다.",rev:false},
  {id:1484,text:"자발적으로 협력한다.",rev:false},
  {id:1485,text:"공동체의 발전에 관심이 많다.",rev:false},
  {id:1486,text:"내 일만큼 팀 일도 중요하게 본다.",rev:false},
  {id:1487,text:"팀을 위한 기여가 의미 있다고 느낀다.",rev:false},
  {id:1488,text:"조직에 도움이 되려 노력한다.",rev:false},
  {id:1489,text:"팀원들과 협력하는 것을 즐긴다.",rev:false},
  {id:1490,text:"공동의 이익을 우선시한다.",rev:false},
  {id:1491,text:"팀 일을 귀찮아하지 않는다.",rev:false},
  {id:1492,text:"내 일이 아니어도 도와준다.",rev:false},
  {id:1493,text:"조직에 기여하는 것이 보람이다.",rev:false},
  {id:1494,text:"공동 프로젝트에 적극 참여한다.",rev:false},
  {id:1495,text:"팀원과의 협업이 즐겁다.",rev:false},
  {id:1496,text:"공동 성과에 기여하는 사람이 되고 싶다.",rev:false},
  {id:1497,text:"팀 내 역할을 충실히 수행한다.",rev:false},
  {id:1498,text:"집단 목표에 헌신한다.",rev:false},
  {id:1499,text:"팀의 분위기를 챙긴다.",rev:false},
  {id:1500,text:"동료가 힘들 때 먼저 돕는다.",rev:false},
  {id:1501,text:"팀의 성공을 내 성공으로 여긴다.",rev:false},
  {id:1502,text:"공동체 의식이 강하다.",rev:false},
  {id:1503,text:"조직을 위해 추가 노력을 기꺼이 한다.",rev:false},
  {id:1504,text:"팀원의 의견을 잘 반영한다.",rev:false},
  {id:1505,text:"집단 활동에 적극적이다.",rev:false},
  {id:1506,text:"공동의 책임을 함께 진다.",rev:false},
  {id:1507,text:"팀 일에 주도적으로 나선다.",rev:false},
  {id:1508,text:"협력적인 사람이라는 말을 듣는다.",rev:false},
  {id:1509,text:"팀 분위기 개선에 기여한다.",rev:false},
  {id:1510,text:"조직 활동에 자주 참여한다.",rev:false},
  {id:1511,text:"팀의 성장을 지원한다.",rev:false},
  {id:1512,text:"공동 성과를 중요하게 여긴다.",rev:false},
  {id:1513,text:"동료의 성공을 축하한다.",rev:false},
  {id:1514,text:"팀을 위해 양보할 수 있다.",rev:false},
  {id:1515,text:"내 역할 이상을 해내려 한다.",rev:false},
  {id:1516,text:"협업으로 더 큰 결과를 낸다.",rev:false},
  {id:1517,text:"집단의 발전에 자부심을 느낀다.",rev:false},
  {id:1518,text:"팀 목표 달성에 기여한다.",rev:false},
  {id:1519,text:"팀원 간 소통을 촉진한다.",rev:false},
  {id:1520,text:"공동체의 일원으로 자부한다.",rev:false},
  {id:1521,text:"내 일만 집중하는 편이다.",rev:true},
  {id:1522,text:"팀 활동이 귀찮게 느껴진다.",rev:true},
  {id:1523,text:"개인 성과가 더 중요하다.",rev:true},
  {id:1524,text:"공동 업무에 소극적이다.",rev:true},
  {id:1525,text:"다른 팀원의 일까지 신경 쓰지 않는다.",rev:true},
  {id:1526,text:"팀에 맞추는 것이 피곤하다.",rev:true},
  {id:1527,text:"조직보다 개인이 우선이다.",rev:true},
  {id:1528,text:"공동 프로젝트가 번거롭다.",rev:true},
  {id:1529,text:"팀 모임을 피하는 편이다.",rev:true},
  {id:1530,text:"혼자 하는 일을 선호한다.",rev:true},
  {id:1531,text:"팀에 헌신할 의지가 약하다.",rev:true},
  {id:1532,text:"공동 목표에 큰 관심이 없다.",rev:true},
  {id:1533,text:"남의 일은 내 일이 아니다.",rev:true},
  {id:1534,text:"팀 분위기에 무관심하다.",rev:true},
  {id:1535,text:"동료를 돕는 것이 내키지 않는다.",rev:true},
  {id:1536,text:"팀 회의가 시간 낭비로 느껴진다.",rev:true},
  {id:1537,text:"협력보다 독립적으로 하고 싶다.",rev:true},
  {id:1538,text:"팀 일에 끌려가기 싫다.",rev:true},
  {id:1539,text:"내 공이 아니면 신경 쓰지 않는다.",rev:true},
  {id:1540,text:"공동 책임이 부담스럽다.",rev:true},
]);

// ══════════════════════════════════════
// SD (사회적 바람직성) — 15풀
// ══════════════════════════════════════
const SD_POOL = w("SD", [
  {id:1601,text:"나는 살면서 한 번도 거짓말을 한 적이 없다.",rev:false},
  {id:1602,text:"나는 어떤 사람도 싫어해본 적이 없다.",rev:false},
  {id:1603,text:"나는 한 번도 화를 낸 적이 없다.",rev:false},
  {id:1604,text:"내가 한 약속은 단 한 번도 어긴 적이 없다.",rev:false},
  {id:1605,text:"나는 어떤 규칙도 어긴 적이 없다.",rev:false},
  {id:1606,text:"나는 늘 모든 사람에게 친절했다.",rev:false},
  {id:1607,text:"나는 한 번도 누구를 험담한 적이 없다.",rev:false},
  {id:1608,text:"나는 어떤 실수도 한 적이 없다.",rev:false},
  {id:1609,text:"나는 매 순간 완벽하게 자기관리를 한다.",rev:false},
  {id:1610,text:"나는 한 번도 게으름을 피운 적이 없다.",rev:false},
  {id:1611,text:"나는 어려움 앞에서 절대 포기하지 않는다.",rev:false},
  {id:1612,text:"나는 한 번도 남을 원망한 적이 없다.",rev:false},
  {id:1613,text:"나는 어떤 상황에서도 완벽하게 평정을 유지했다.",rev:false},
  {id:1614,text:"나는 살면서 한 번도 부정적인 생각을 한 적이 없다.",rev:false},
  {id:1615,text:"나는 언제나 완벽하게 공정하다.",rev:false},
]);

// ══════════════════════════════════════
// CC (일관성 검증) — 20쌍 풀, 페어는 적격 역량 문항 ID
// ══════════════════════════════════════
const CC_POOL = w("CC", [
  {id:1621,text:"꼼꼼한 성격이라는 말을 자주 듣는다.",rev:false,pair:1185},
  {id:1622,text:"사람들 사이에 있으면 힘이 난다.",rev:false,pair:1361},
  {id:1623,text:"다른 사람의 아픔에 같이 슬퍼한다.",rev:false,pair:1427},
  {id:1624,text:"변화보다 익숙함이 편하다.",rev:false,pair:1285},
  {id:1625,text:"웬만한 일에는 동요하지 않는다.",rev:false,pair:1015},
  {id:1626,text:"실패에서 금방 회복한다.",rev:false,pair:1061},
  {id:1627,text:"공과 사를 명확히 구분한다.",rev:false,pair:1122},
  {id:1628,text:"스스로 학습에 투자하는 편이다.",rev:false,pair:1302},
  {id:1629,text:"팀의 일이 내 일처럼 느껴진다.",rev:false,pair:1486},
  {id:1630,text:"비판을 받아도 금방 털어낸다.",rev:false,pair:1005},
  {id:1631,text:"어려운 일도 끝까지 해낸다.",rev:false,pair:1182},
  {id:1632,text:"새로운 방식도 기꺼이 시도한다.",rev:false,pair:1241},
  {id:1633,text:"목표를 정하면 끝까지 밀어붙인다.",rev:false,pair:1324},
  {id:1634,text:"사람들 속에서 에너지를 얻는다.",rev:false,pair:1392},
  {id:1635,text:"상대의 감정을 잘 이해한다.",rev:false,pair:1421},
  {id:1636,text:"공동 목표를 우선한다.",rev:false,pair:1483},
  {id:1637,text:"규정은 반드시 지켜야 한다.",rev:false,pair:1151},
  {id:1638,text:"좌절 후에도 다시 도전한다.",rev:false,pair:1062},
  {id:1639,text:"감정 기복이 크지 않다.",rev:false,pair:1003},
  {id:1640,text:"스스로 기회를 만들어 간다.",rev:false,pair:1331},
]);

// ══════════════════════════════════════
// IF (비빈도) — 8풀 (사기업과 동일 구성)
// ══════════════════════════════════════
const IF_POOL = w("IF", [
  {id:1651,text:"타오르는 불꽃을 오래 바라보면 묘하게 빠져드는 기분이 든다.",rev:false},
  {id:1652,text:"거울 앞에서 내 얼굴을 오래 보고 있으면 내 얼굴이 낯설게 느껴질 때가 있다.",rev:false},
  {id:1653,text:"비가 쏟아지는 날 우산 없이 그냥 걸어보고 싶은 충동이 든다.",rev:false},
  {id:1654,text:"조용한 공공장소에서 갑자기 큰 소리를 내보고 싶다는 생각이 든 적이 있다.",rev:false},
  {id:1655,text:"가끔 시간이 평소와 다르게 흐르는 것처럼 느껴질 때가 있다.",rev:false},
  {id:1656,text:"밤에 혼자 있을 때 방 안에 누군가 더 있는 것 같은 기분이 든 적이 있다.",rev:false},
  {id:1657,text:"특정 숫자를 보면 묘하게 끌리거나 불편해진다.",rev:false},
  {id:1658,text:"높은 곳에 서면 아래로 뛰어내리고 싶은 충동이 스치듯 든다.",rev:false},
]);

// ══════════════════════════════════════
// 부적격 요인 5×5 = 25 (전원 출제)
// ══════════════════════════════════════
const NRM_POOL = w("NRM", [
  {id:1701,text:"규칙은 어기기 위해 존재한다고 생각할 때가 있다.",rev:false},
  {id:1702,text:"법적 문제만 없으면 도덕적으로도 괜찮다고 생각한다.",rev:false},
  {id:1703,text:"다른 사람이 손해를 봐도 나와 상관없다고 느낀다.",rev:false},
  {id:1704,text:"약속을 지키지 않아도 큰 문제가 안 된다고 생각한다.",rev:false},
  {id:1705,text:"남에게 피해를 주더라도 내 목표 달성이 우선이다.",rev:false},
]);
const RAV_POOL = w("RAV", [
  {id:1706,text:"대부분의 사람들은 속마음이 다르다고 생각한다.",rev:false},
  {id:1707,text:"누군가 친절하면 뭔가 의도가 있을 것이라 느낀다.",rev:false},
  {id:1708,text:"사람들을 쉽게 믿지 못한다.",rev:false},
  {id:1709,text:"동료의 조언도 일단 의심하고 본다.",rev:false},
  {id:1710,text:"사람들은 기회가 되면 나를 이용할 것이라 생각한다.",rev:false},
]);
const AGR_POOL = w("AGR", [
  {id:1711,text:"화가 나면 참기 어렵다.",rev:false},
  {id:1712,text:"부당한 일을 당하면 즉시 따진다.",rev:false},
  {id:1713,text:"논쟁에서 지면 기분이 매우 나쁘다.",rev:false},
  {id:1714,text:"다른 사람의 실수에 쉽게 짜증이 난다.",rev:false},
  {id:1715,text:"가끔 물건을 던지거나 부수고 싶은 충동을 느낀다.",rev:false},
]);
const PSN_POOL = w("PSN", [
  {id:1716,text:"작은 변화에도 크게 동요한다.",rev:false},
  {id:1717,text:"업무 스트레스로 잠을 못 잔 적이 자주 있다.",rev:false},
  {id:1718,text:"예상치 못한 상황이 오면 아무것도 할 수 없다고 느낀다.",rev:false},
  {id:1719,text:"스트레스를 받으면 몸에 증상이 나타난다.",rev:false},
  {id:1720,text:"힘든 일이 겹치면 모든 것을 포기하고 싶어진다.",rev:false},
]);
const VIC_POOL = w("VIC", [
  {id:1721,text:"사람들이 내 뒤에서 나를 험담한다고 느낀 적이 있다.",rev:false},
  {id:1722,text:"나만 불공정한 대우를 받는다고 느낄 때가 있다.",rev:false},
  {id:1723,text:"다른 사람의 성공이 나를 의도적으로 무시하려는 것 같다.",rev:false},
  {id:1724,text:"사람들이 나를 일부러 배제한다고 느낀다.",rev:false},
  {id:1725,text:"나에 대한 평가가 불공정하다고 자주 느낀다.",rev:false},
]);

// ─── Pool 매핑 + flat export ───
const DIM_POOLS = {
  EMO: EMO_POOL, RES: RES_POOL, ETH: ETH_POOL, TSK: TSK_POOL,
  FLX: FLX_POOL, GRW: GRW_POOL, REL: REL_POOL, EMP: EMP_POOL, COM: COM_POOL,
};
const NEG_POOLS = { NRM: NRM_POOL, RAV: RAV_POOL, AGR: AGR_POOL, PSN: PSN_POOL, VIC: VIC_POOL };

export const BASE_QUESTIONS = [
  ...EMO_POOL, ...RES_POOL, ...ETH_POOL, ...TSK_POOL, ...FLX_POOL,
  ...GRW_POOL, ...REL_POOL, ...EMP_POOL, ...COM_POOL,
  ...SD_POOL, ...CC_POOL, ...IF_POOL,
  ...NRM_POOL, ...RAV_POOL, ...AGR_POOL, ...PSN_POOL, ...VIC_POOL,
];
export const CC_PAIRS = CC_POOL.map(c => [c.id, c.pair]);
export const IF_IDS = IF_POOL.map(q => q.id);

// pair 기본 문항 조회용
const BASE_BY_ID = {};
Object.values(DIM_POOLS).forEach(pool => pool.forEach(q => { BASE_BY_ID[q.id] = q; }));

// ─── 랜덤 유틸 (seed 기반) ───
function mulberry32(seed) {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6D2B79F5) >>> 0;
    let r = t;
    r = Math.imul(r ^ (r >>> 15), r | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}
function shuffleArray(arr, rand) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function pickN(arr, n, rand) { return shuffleArray(arr, rand).slice(0, n); }

// ─── selectQuestions — 세션당 200문항 ───
// 본검사 157 (9 역량 × 17 + 4 역량 +1) + SD 5 + CC 9 + IF 4 + 부적격 25 = 200
export function selectQuestions(seed) {
  const rand = mulberry32(seed || Math.floor(Math.random() * 2147483647));
  const selected = [];

  // 1) 9 역량에서 157 분배 — 기본 17 × 9 = 153, 4개 역량 +1 = 157 (정:역 7:3)
  const counts = new Array(DIMS_ORDER.length).fill(17);
  const extraIdx = pickN(DIMS_ORDER.map((_, i) => i), 4, rand);
  extraIdx.forEach(i => counts[i] += 1);

  DIMS_ORDER.forEach((d, i) => {
    const total = counts[i];
    const nRev = Math.round(total * 0.3); // 17→5, 18→5
    const nPos = total - nRev;
    const pool = DIM_POOLS[d];
    const pos = pool.filter(q => !q.rev);
    const rev = pool.filter(q => q.rev);
    selected.push(...pickN(pos, nPos, rand));
    selected.push(...pickN(rev, nRev, rand));
  });

  // 2) SD 15 → 5
  selected.push(...pickN(SD_POOL, 5, rand));

  // 3) CC 20 → 9 + 페어 기본 문항 포함 보장 (동일 차원·동일 rev 문항과 교체)
  const ccSelected = pickN(CC_POOL, 9, rand);
  const idSet = new Set(selected.map(q => q.id));
  ccSelected.forEach(cc => {
    const pairQ = BASE_BY_ID[cc.pair];
    if (!pairQ) return;
    if (idSet.has(pairQ.id)) return;
    const dimMatch = selected
      .map((q, idx) => ({ q, idx }))
      .filter(x => x.q.dim === pairQ.dim && x.q.rev === pairQ.rev && x.q.id !== pairQ.id);
    if (dimMatch.length > 0) {
      const replace = dimMatch[Math.floor(rand() * dimMatch.length)];
      idSet.delete(replace.q.id);
      selected[replace.idx] = pairQ;
      idSet.add(pairQ.id);
    } else {
      selected.push(pairQ);
      idSet.add(pairQ.id);
    }
  });
  selected.push(...ccSelected);
  const ccPairs = ccSelected.map(c => [c.id, c.pair]);

  // 4) IF 8 → 4
  const ifSelected = pickN(IF_POOL, 4, rand);
  selected.push(...ifSelected);
  const ifIds = ifSelected.map(q => q.id);

  // 5) 부적격 요인 25 전부
  NEG_DIMS_ORDER.forEach(nd => selected.push(...NEG_POOLS[nd]));

  // 6) revPairs — 차원별 정/역 2쌍씩
  const revPairs = [];
  DIMS_ORDER.forEach(d => {
    const pos = selected.filter(q => q.dim === d && !q.rev).map(q => q.id);
    const rev = selected.filter(q => q.dim === d && q.rev).map(q => q.id);
    const n = Math.min(pos.length, rev.length, 2);
    const posSh = shuffleArray(pos, rand);
    const revSh = shuffleArray(rev, rand);
    for (let i = 0; i < n; i++) revPairs.push([posSh[i], revSh[i]]);
  });

  // 7) 전체 순서 셔플
  const questions = shuffleArray(selected, rand);
  return { questions, ccPairs, ifIds, revPairs };
}

// ─── 공공기관 유형 6종 ───
export const PERSONALITY_TYPES = [
  { name: "안정형 공직자", emoji: "🛡️",
    condition: s => s.EMO >= 70 && s.RES >= 65 && s.TSK >= 65,
    desc: "감정과 마음이 흔들리지 않고 맡은 일을 묵묵히 완수하는 유형이에요.",
    strengths: "정서적 안정, 회복 탄력성, 책임감",
    weaknesses: "변화에 보수적, 소극적으로 보일 수 있음",
    tips: [
      "공직자로서 가장 환영받는 프로파일이에요. 안정감을 강점으로 살려주세요.",
      "스트레스 상황 사례를 구체적으로 준비해두면 면접 포인트가 됩니다.",
      "과도한 완벽주의로 보이지 않도록 약점도 솔직하게 말하세요.",
    ],
    warnings: [
      "감정 표현이 너무 없으면 차갑게 보일 수 있어요.",
      "변화 대응력 문항에서 너무 소극적으로 답하면 '경직'으로 분류돼요.",
      "솔직성 문항에 과장하면 오히려 신뢰도 하락이에요.",
    ],
  },
  { name: "윤리형 봉사자", emoji: "⚖️",
    condition: s => s.ETH >= 70 && s.COM >= 65 && s.EMP >= 65,
    desc: "공익과 윤리를 최우선으로 여기고 따뜻한 마음으로 기여하는 유형이에요.",
    strengths: "윤리 의식, 공동체 기여, 공감력",
    weaknesses: "결단력 부족 우려, 업무 과부하 감수 경향",
    tips: [
      "공공기관에서 가장 선호하는 가치관 중심형이에요.",
      "청렴·공정 사례를 2~3개 준비하면 강한 인상을 줘요.",
      "봉사 경험을 구체 숫자·기간과 함께 정리하세요.",
    ],
    warnings: [
      "결단력·실행력 문항에서 너무 낮으면 '의지가 약한 사람'으로 보여요.",
      "감정이입이 과하면 '냉정한 판단 불가'로 분류될 수 있어요.",
      "원칙 준수만 강조하면 '경직된 조직 적응'으로 보일 수 있어요.",
    ],
  },
  { name: "혁신형 추진자", emoji: "🚀",
    condition: s => s.FLX >= 70 && s.GRW >= 70 && s.TSK >= 65,
    desc: "새로운 방식과 성장을 추구하며 맡은 일을 밀어붙이는 유형이에요.",
    strengths: "사고 유연성, 성장 의지, 실행력",
    weaknesses: "규정 준수에서 느슨해 보일 수 있음",
    tips: [
      "변화에 열려 있는 공기업·준정부에서 환영받는 프로파일이에요.",
      "윤리민감성 문항을 함께 챙기면 균형이 잘 맞아요.",
      "혁신 사례가 있으면 구체 성과 숫자까지 준비해주세요.",
    ],
    warnings: [
      "윤리·규정 문항을 가볍게 답하면 부적격으로 잡힐 수 있어요.",
      "혼자 추진하는 듯한 답변은 공직 조직에 맞지 않게 보여요.",
      "과도한 변화 지향은 '조직 적응 어려움'으로 해석될 수 있어요.",
    ],
  },
  { name: "소통형 조율자", emoji: "🤝",
    condition: s => s.REL >= 70 && s.EMP >= 65 && s.COM >= 65,
    desc: "사람들 사이에서 자연스럽게 다리를 놓는 조화형 유형이에요.",
    strengths: "대인관계, 공감, 팀 분위기 기여",
    weaknesses: "주관이 약해 보일 수 있음, 원칙 우선순위 흔들림 우려",
    tips: [
      "대민 업무·협업 중심 기관에 잘 맞는 프로파일이에요.",
      "원칙 기반 의사결정 사례를 함께 준비하면 균형이 좋아요.",
      "대화를 이끈 경험을 구체적으로 말씀해주세요.",
    ],
    warnings: [
      "갈등 회피로만 보이면 '결단 없는 사람'으로 분류돼요.",
      "사교성이 과하면 '진지함 부족'으로 해석될 수 있어요.",
      "윤리민감성을 반드시 함께 보여주세요.",
    ],
  },
  { name: "실무형 전문가", emoji: "🔧",
    condition: s => s.TSK >= 70 && s.FLX >= 65 && s.EMO >= 65 && s.REL < 60,
    desc: "업무에 몰입해 전문성을 쌓아가는 내향형 실무 전문가예요.",
    strengths: "과업 몰입, 안정적 수행, 유연성",
    weaknesses: "관계 형성 소극적, 홍보·대외 활동 어려움",
    tips: [
      "연구·기술·행정 실무 직군에 강한 프로파일이에요.",
      "혼자 하는 일과 함께 협업 경험도 2~3개 준비하세요.",
      "공동체 기여 문항을 함께 챙기세요.",
    ],
    warnings: [
      "관계형성력이 너무 낮으면 '팀 적응 어려움'으로 해석돼요.",
      "전문성만 강조하면 '조직 동화 부족'으로 보일 수 있어요.",
      "사교 관련 문항을 일부러 낮게 답하지 마세요.",
    ],
  },
  { name: "균형형 공직자", emoji: "⭐",
    condition: () => true,
    desc: "특정 영역에서 돌출 없이 전반적으로 고른 모습을 보여주는 유형이에요.",
    strengths: "범용성, 적응력, 안정감",
    weaknesses: "뚜렷한 강점 부재, 차별화 어려움",
    tips: [
      "공공기관이 선호하는 '모나지 않은' 프로파일이지만 인상이 약할 수 있어요.",
      "면접에서 '내 강점 하나'를 분명히 말씀하실 준비가 필요해요.",
      "공직 가치관 사례를 구체적으로 준비해주세요.",
    ],
    warnings: [
      "모든 문항 '보통'은 무성의 응답으로 판정돼요.",
      "뚜렷한 강점이 없으면 '굳이 뽑아야 할 이유' 설득이 어려워요.",
      "일관성이 낮으면 '대충 풀었다'로 해석되니 역문항 주의하세요.",
    ],
  },
];
