/**
 * TUTTI 테스트 공고 시드 스크립트
 * - 테스트 유저 6명 생성 (개인 4 + 단체 2)
 * - 공고 10개 생성 (구인 4 + 구직 3 + 프로젝트 3)
 *
 * 실행: npx tsx scripts/seed-test-gigs.ts
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://krotxjppdiyxvfuoqdqp.supabase.co";
const SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtyb3R4anBwZGl5eHZmdW9xZHFwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTMzOTg5NSwiZXhwIjoyMDg2OTE1ODk1fQ.GWwKOBsuQr0yznDjiZ2Dj3TaYuUi2irbQDGqfRr9vMs";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ── 참조 ID 맵 ────────────────────────────────────────────────
const REGIONS: Record<string, string> = {
  서울: "73d5cff6-35f7-42b0-b652-e666a0641d99",
  경기: "800cff31-fa15-4896-9e4b-8340cf0a3e5f",
  인천: "ce45b0d6-fa7c-4bbe-8109-ec8b7da44c57",
  부산: "c8204dd4-9fb5-4549-a94f-da8a25d70a6c",
  대구: "08f53542-acdc-4e20-adcd-e95b3f672809",
};

const INSTRUMENTS: Record<string, string> = {
  바이올린: "1a0d97ff-63f0-4df0-8c39-8fe64a39e538",
  비올라: "33346c24-4a51-4bb4-8187-ce8537167996",
  첼로: "a61c59c7-d5e5-4089-b3b5-67d91c8ab786",
  콘트라베이스: "fc40f5e8-a1e2-4baf-b06a-d8e40a8fa986",
  플루트: "df84520d-a7bc-4d8c-8de6-77489160a788",
  오보에: "5df168b6-5432-41d1-8680-f14fe117e6ad",
  클라리넷: "f52e3a51-06a4-4c7a-b1e5-0c5a3c991204",
  트럼펫: "426b43cc-12f6-4007-9ece-19b2872ef6c8",
  호른: "60b374f4-4069-45fe-8688-f387308f119a",
  팀파니: "6b6c73ea-420a-4bcc-8fe0-2a5027fffc8c",
  타악기: "ba0c471d-a7a9-4d40-8e0a-315f479b3b6d",
};

const COMPOSERS: Record<string, string> = {
  베토벤: "4bcae955-db26-4859-94a1-cc70438c12e2",
  차이콥스키: "313b995f-32e4-4816-8828-bed8b5d93732",
  모차르트: "3ed4d25c-b219-4331-9f1e-a9e2d47db534",
};

// ── 테스트 유저 정의 ──────────────────────────────────────────
interface TestUser {
  email: string;
  password: string;
  display_name: string;
  user_type: "individual" | "organization";
  region: string;
}

const TEST_USERS: TestUser[] = [
  // 개인 유저 4명
  {
    email: "violin_kim@test.tutti.kr",
    password: "Test1234!",
    display_name: "김바이올린",
    user_type: "individual",
    region: "서울",
  },
  {
    email: "cello_park@test.tutti.kr",
    password: "Test1234!",
    display_name: "박첼리스트",
    user_type: "individual",
    region: "부산",
  },
  {
    email: "flute_lee@test.tutti.kr",
    password: "Test1234!",
    display_name: "이플루티스트",
    user_type: "individual",
    region: "대구",
  },
  {
    email: "horn_choi@test.tutti.kr",
    password: "Test1234!",
    display_name: "최호르니스트",
    user_type: "individual",
    region: "인천",
  },
  // 단체 유저 2명
  {
    email: "seoul_phil@test.tutti.kr",
    password: "Test1234!",
    display_name: "서울시민오케스트라",
    user_type: "organization",
    region: "서울",
  },
  {
    email: "busan_chamber@test.tutti.kr",
    password: "Test1234!",
    display_name: "부산챔버앙상블",
    user_type: "organization",
    region: "부산",
  },
];

// ── 공고 정의 ─────────────────────────────────────────────────
interface GigDef {
  /** 테스트 유저 배열 인덱스 (0-5) */
  userIdx: number;
  gig_type: "hiring" | "seeking";
  is_project: boolean;
  title: string;
  description: string;
  region: string;
  required_skill_level: string;
  instruments: { name: string; count: number }[];
  is_online: boolean;
  event_date?: string;
  event_date_flexible: boolean;
  rehearsal_info?: string;
  compensation?: string;
  is_paid: boolean;
  max_applicants?: number;
  piece_name?: string;
  composer?: string;
}

const GIGS: GigDef[] = [
  // ────── 구인 공고 4개 (단체가 개인 모집) ──────
  {
    userIdx: 4, // 서울시민오케스트라
    gig_type: "hiring",
    is_project: false,
    title: "서울시민오케 정기연주 객원 바이올린 모집",
    description:
      "서울시민오케스트라 2026 시즌 상반기 정기연주회 객원 바이올린 단원을 모집합니다.\n\n• 리허설: 매주 토요일 14:00-17:00\n• 연주회: 2026년 5월 중 예정\n• 현재 1st 바이올린 1석 공석\n• 안정적인 톤과 합주 경험 우대\n\n편하게 지원해주세요!",
    region: "서울",
    required_skill_level: "advanced",
    instruments: [{ name: "바이올린", count: 1 }],
    is_online: false,
    event_date: "2026-05-15",
    event_date_flexible: true,
    rehearsal_info: "매주 토요일 14:00-17:00 (서대문구 연습실)",
    compensation: "연주회 당일 소정의 출연료",
    is_paid: true,
    max_applicants: 5,
  },
  {
    userIdx: 5, // 부산챔버앙상블
    gig_type: "hiring",
    is_project: false,
    title: "부산챔버앙상블 클라리넷 정단원 모집",
    description:
      "부산에서 활동하는 실내악 앙상블에서 클라리넷 연주자를 모집합니다.\n\n• 주 1회 정기 합주 (수요일 저녁)\n• 연 4회 이상 정기 공연 참여\n• 다양한 실내악 레퍼토리 경험 가능\n• 장기 활동 가능하신 분 환영\n\n클라리넷 전공자 또는 동등 실력 보유자 지원 바랍니다.",
    region: "부산",
    required_skill_level: "professional",
    instruments: [{ name: "클라리넷", count: 1 }],
    is_online: false,
    event_date_flexible: true,
    rehearsal_info: "매주 수요일 19:00-21:30 (해운대 연습실)",
    is_paid: false,
    max_applicants: 3,
  },
  {
    userIdx: 4, // 서울시민오케스트라
    gig_type: "hiring",
    is_project: false,
    title: "오케스트라 타악기 파트 추가 모집",
    description:
      "서울시민오케스트라에서 타악기 파트원을 추가 모집합니다.\n\n• 팀파니 및 보조 타악기 연주 가능자\n• 오케스트라 합주 경험 있으면 좋습니다\n• 초보자도 열정 있으면 환영!\n• 악기 보유 필수 아님 (합주실 악기 있음)\n\n부담없이 지원해주세요.",
    region: "서울",
    required_skill_level: "intermediate",
    instruments: [
      { name: "팀파니", count: 1 },
      { name: "타악기", count: 1 },
    ],
    is_online: false,
    event_date_flexible: true,
    rehearsal_info: "매주 토요일 14:00-17:00",
    is_paid: false,
    max_applicants: 4,
  },
  {
    userIdx: 5, // 부산챔버앙상블
    gig_type: "hiring",
    is_project: false,
    title: "앙상블 비올라 단원 구합니다 (초급 환영)",
    description:
      "부산챔버앙상블에서 비올라 연주자를 찾고 있습니다.\n\n• 초급~중급 수준 환영\n• 현악기 경험 있으시면 비올라 전향도 OK\n• 따뜻하고 편안한 분위기에서 함께 연주해요\n• 첫 합주 후 가입 여부 결정 가능\n\n편하게 연락주세요 :)",
    region: "부산",
    required_skill_level: "beginner",
    instruments: [{ name: "비올라", count: 1 }],
    is_online: false,
    event_date_flexible: true,
    rehearsal_info: "격주 토요일 오전 10:00-12:00",
    is_paid: false,
    max_applicants: 2,
  },

  // ────── 구직 공고 3개 (개인이 단체 찾기) ──────
  {
    userIdx: 1, // 박첼리스트
    gig_type: "seeking",
    is_project: false,
    title: "첼로 연주자, 경기 지역 앙상블/오케스트라 찾습니다",
    description:
      "안녕하세요, 첼로 연주 경력 8년차입니다.\n\n• 음대 졸업, 시민오케스트라 활동 2년\n• 현재 경기 수원 거주\n• 주말 합주 선호\n• 정기 공연 참여 적극적\n• 실내악, 오케스트라 모두 관심 있습니다\n\n따뜻한 단체에서 함께 연주하고 싶습니다.",
    region: "경기",
    required_skill_level: "advanced",
    instruments: [{ name: "첼로", count: 1 }],
    is_online: false,
    event_date_flexible: true,
    is_paid: false,
  },
  {
    userIdx: 2, // 이플루티스트
    gig_type: "seeking",
    is_project: false,
    title: "플루트 초급, 함께 연습할 팀 구해요",
    description:
      "플루트 배운 지 2년 된 아마추어입니다.\n\n• 대구 거주\n• 평일 저녁이나 주말 가능\n• 앙상블이나 소규모 합주 희망\n• 실력보다는 즐겁게 연주하는 분위기 선호\n• 온라인 합주도 괜찮습니다\n\n비슷한 수준의 분들과 함께하고 싶어요!",
    region: "대구",
    required_skill_level: "elementary",
    instruments: [{ name: "플루트", count: 1 }],
    is_online: true,
    event_date_flexible: true,
    is_paid: false,
  },
  {
    userIdx: 3, // 최호르니스트
    gig_type: "seeking",
    is_project: false,
    title: "호른 전문가, 인천/서울 오케스트라 입단 희망",
    description:
      "호른 전공, 대학원 졸업 후 프리랜서 활동 중입니다.\n\n• 시민오케스트라/아마추어 오케스트라 입단 희망\n• 인천 또는 서울 활동 가능\n• 주중/주말 모두 가능\n• 오케스트라 스탠다드 레퍼토리 대부분 경험\n• 금관 섹션 리더 경험 있음\n\n진지하게 활동할 수 있는 단체를 찾습니다.",
    region: "인천",
    required_skill_level: "professional",
    instruments: [{ name: "호른", count: 1 }],
    is_online: false,
    event_date_flexible: true,
    is_paid: false,
  },

  // ────── 프로젝트 공고 3개 (곡 기반) ──────
  {
    userIdx: 0, // 김바이올린
    gig_type: "hiring",
    is_project: true,
    title: "베토벤 교향곡 5번 '운명' 프로젝트 오케스트라",
    description:
      "베토벤 교향곡 5번 C단조 '운명'을 함께 연주할 프로젝트 오케스트라 단원을 모집합니다!\n\n• 연주회: 2026년 7월 예정\n• 리허설: 5월부터 주 1회 (토요일)\n• 장소: 서울 마포구 연습실\n• 오보에, 트럼펫 파트 모집\n• 고급 이상 실력 필요\n\n클래식 불멸의 명곡을 함께 만들어봐요!",
    region: "서울",
    required_skill_level: "advanced",
    instruments: [
      { name: "오보에", count: 2 },
      { name: "트럼펫", count: 2 },
    ],
    is_online: false,
    event_date: "2026-07-20",
    event_date_flexible: false,
    rehearsal_info: "5월~7월 매주 토요일 13:00-17:00 (마포 연습실)",
    compensation: "참가비 5만원 (연습실 대관료)",
    is_paid: false,
    max_applicants: 8,
    piece_name: "교향곡 5번 C단조, Op. 67 '운명'",
    composer: "베토벤",
  },
  {
    userIdx: 1, // 박첼리스트
    gig_type: "hiring",
    is_project: true,
    title: "차이콥스키 '백조의 호수' 하이라이트 앙상블",
    description:
      "차이콥스키 백조의 호수 모음곡을 소규모 앙상블 편성으로 연주할 멤버를 모집합니다.\n\n• 편곡 버전 (현악 + 관악 8중주 정도 규모)\n• 단 1회 공연 목표\n• 연주회: 2026년 9월 부산 공연\n• 바이올린, 콘트라베이스 파트 모집\n• 중급 이상이면 충분합니다\n\n아름다운 백조의 호수를 함께해요 🦢",
    region: "부산",
    required_skill_level: "intermediate",
    instruments: [
      { name: "바이올린", count: 2 },
      { name: "콘트라베이스", count: 1 },
    ],
    is_online: false,
    event_date: "2026-09-14",
    event_date_flexible: true,
    rehearsal_info: "7월부터 격주 일요일 오후 (부산 수영구)",
    is_paid: false,
    max_applicants: 6,
    piece_name: "백조의 호수 모음곡, Op. 20",
    composer: "차이콥스키",
  },
  {
    userIdx: 3, // 최호르니스트
    gig_type: "hiring",
    is_project: true,
    title: "모차르트 레퀴엠 합창+오케스트라 프로젝트",
    description:
      "모차르트 레퀴엠 K.626 전곡 연주 프로젝트입니다.\n\n• 합창단과 함께하는 대규모 프로젝트\n• 2026년 12월 공연 예정\n• 인천 + 서울 통합 연습\n• 첼로, 호른 파트 모집\n• 전문가급 실력 필요 (전공자 우대)\n• 레퀴엠 연주 경험자 특히 환영\n\n올해 가장 뜻깊은 무대가 될 것입니다.",
    region: "인천",
    required_skill_level: "professional",
    instruments: [
      { name: "첼로", count: 2 },
      { name: "호른", count: 2 },
    ],
    is_online: false,
    event_date: "2026-12-20",
    event_date_flexible: false,
    rehearsal_info: "9월부터 주 1회 (일요일 오후, 인천/서울 교대)",
    compensation: "출연료 지급 예정",
    is_paid: true,
    max_applicants: 10,
    piece_name: "레퀴엠 D단조, K. 626",
    composer: "모차르트",
  },
];

// ── 메인 ──────────────────────────────────────────────────────
async function main() {
  console.log("🎵 TUTTI 테스트 공고 시드 시작...\n");

  // 1) 테스트 유저 생성 (이미 있으면 재사용)
  const userIds: string[] = [];

  for (const u of TEST_USERS) {
    // 기존 유저 확인
    const { data: existing } = await supabase
      .from("user_profiles")
      .select("id")
      .eq("display_name", u.display_name)
      .maybeSingle();

    if (existing) {
      console.log(`  ✓ 기존 유저 재사용: ${u.display_name} (${existing.id})`);
      userIds.push(existing.id);
      continue;
    }

    // auth.users 생성 (trigger가 user_profiles도 자동 생성)
    const { data: authUser, error: authErr } =
      await supabase.auth.admin.createUser({
        email: u.email,
        password: u.password,
        email_confirm: true,
        user_metadata: {
          display_name: u.display_name,
          user_type: u.user_type,
        },
      });

    if (authErr) {
      console.error(`  ✗ 유저 생성 실패 (${u.email}):`, authErr.message);
      // 이메일 충돌이면 기존 유저 ID 조회
      const { data: users } = await supabase.auth.admin.listUsers();
      const found = users?.users?.find((x: any) => x.email === u.email);
      if (found) {
        console.log(`  ↳ 기존 auth 유저 발견: ${found.id}`);
        userIds.push(found.id);
        continue;
      }
      throw new Error(`Cannot resolve user: ${u.email}`);
    }

    const uid = authUser.user.id;
    console.log(`  ✓ 유저 생성: ${u.display_name} (${uid})`);

    // user_profiles 업데이트 (region, user_type 보정)
    await supabase
      .from("user_profiles")
      .update({
        user_type: u.user_type,
        display_name: u.display_name,
        region_id: REGIONS[u.region],
      })
      .eq("id", uid);

    // 단체면 organization_profiles 생성
    if (u.user_type === "organization") {
      await supabase.from("organization_profiles").upsert({
        user_id: uid,
        org_name: u.display_name,
        org_type: u.display_name.includes("오케스트라")
          ? "orchestra"
          : "chamber_music",
        member_count: u.display_name.includes("오케스트라") ? 45 : 12,
      });
    }

    userIds.push(uid);
  }

  console.log(`\n  총 ${userIds.length}명 준비 완료\n`);

  // 2) 기존 테스트 공고 제거 (제목으로 판별)
  const testTitles = GIGS.map((g) => g.title);
  const { data: oldGigs } = await supabase
    .from("gigs")
    .select("id, title")
    .in("title", testTitles);

  if (oldGigs && oldGigs.length > 0) {
    console.log(`  🗑 기존 테스트 공고 ${oldGigs.length}개 삭제...`);
    for (const og of oldGigs) {
      await supabase.from("gig_instruments").delete().eq("gig_id", og.id);
      await supabase.from("gigs").delete().eq("id", og.id);
    }
  }

  // 3) 공고 10개 INSERT
  let created = 0;
  for (const g of GIGS) {
    const userId = userIds[g.userIdx];

    const gigPayload: Record<string, unknown> = {
      user_id: userId,
      gig_type: g.gig_type,
      status: "active",
      title: g.title,
      description: g.description,
      region_id: REGIONS[g.region],
      is_online: g.is_online,
      required_skill_level: g.required_skill_level,
      event_date: g.event_date ?? null,
      event_date_flexible: g.event_date_flexible,
      rehearsal_info: g.rehearsal_info ?? null,
      compensation: g.compensation ?? null,
      is_paid: g.is_paid,
      max_applicants: g.max_applicants ?? null,
      is_project: g.is_project,
      piece_name: g.piece_name ?? null,
      composer_id: g.composer ? COMPOSERS[g.composer] : null,
      expires_at: new Date(
        Date.now() + 90 * 24 * 60 * 60 * 1000
      ).toISOString(),
    };

    const { data: gig, error: gigErr } = await supabase
      .from("gigs")
      .insert(gigPayload)
      .select("id")
      .single();

    if (gigErr) {
      console.error(`  ✗ 공고 생성 실패 [${g.title}]:`, gigErr.message);
      continue;
    }

    // gig_instruments
    for (const inst of g.instruments) {
      const instId = INSTRUMENTS[inst.name];
      if (!instId) {
        console.warn(`  ⚠ 악기 ID 없음: ${inst.name}`);
        continue;
      }
      await supabase.from("gig_instruments").insert({
        gig_id: gig.id,
        instrument_id: instId,
        count_needed: inst.count,
      });
    }

    const typeLabel = g.is_project
      ? "🎼 프로젝트"
      : g.gig_type === "hiring"
        ? "📢 구인"
        : "🙋 구직";
    console.log(`  ${typeLabel}  ${g.title}`);
    created++;
  }

  console.log(`\n✅ 완료! ${created}/10 공고 생성됨`);

  // 4) 검증: 전체 공고 목록
  const { data: allGigs } = await supabase
    .from("gigs")
    .select(
      `
      id, title, gig_type, is_project, status, required_skill_level,
      regions!gigs_region_id_fkey ( name ),
      user_profiles!gigs_user_id_fkey ( display_name, user_type )
    `
    )
    .order("created_at", { ascending: true });

  console.log("\n📋 전체 공고 목록:");
  allGigs?.forEach((g: any, i: number) => {
    const type = g.is_project
      ? "프로젝트"
      : g.gig_type === "hiring"
        ? "구인"
        : "구직";
    console.log(
      `  ${i + 1}. [${type}] ${g.title} — ${g.regions?.name ?? "?"} / ${g.required_skill_level} / by ${g.user_profiles?.display_name}`
    );
  });
}

main().catch((e) => {
  console.error("FATAL:", e);
  process.exit(1);
});
