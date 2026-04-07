import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import {
  createServiceSupabaseClient,
  isServiceSupabaseConfigured,
  logServiceSupabaseEnvDiagnostics,
} from "@/lib/supabase/admin";

export const runtime = "nodejs";

const log = (msg: string, extra?: Record<string, unknown>) => {
  if (extra) console.log(`[api/rooms POST] ${msg}`, extra);
  else console.log(`[api/rooms POST] ${msg}`);
};

const ROOM_ID_MISSING_RE = /room_id.*does not exist|column.*room_id.*does not exist/i;

function isRoomIdMissingMessage(msg: string): boolean {
  return ROOM_ID_MISSING_RE.test(msg);
}

const ROOM_ID_USER_MESSAGE =
  "orders.room_id 컬럼이 누락되었을 수 있습니다. 005 마이그레이션을 확인하세요. (Supabase SQL Editor에서 supabase/migrations/005_orders_room_id_if_missing.sql 실행 · 또는 004 마이그레이션 전체 적용)";

export async function POST(req: Request) {
  logServiceSupabaseEnvDiagnostics("[api/rooms POST]");
  log("요청 수신");

  const configured = isServiceSupabaseConfigured();
  log("Supabase service 클라이언트 구성 여부 (URL + service role/secret)", {
    isServiceSupabaseConfigured: configured,
  });
  if (!configured) {
    log("stop — 환경 변수: NEXT_PUBLIC_SUPABASE_URL 또는 SUPABASE_SERVICE_ROLE_KEY / SUPABASE_SECRET_KEY 없음");
    return NextResponse.json(
      {
        error: "서버에 Supabase service role 이 설정되지 않았습니다.",
        hint: ".env.local 에 NEXT_PUBLIC_SUPABASE_URL 과 SUPABASE_SERVICE_ROLE_KEY(또는 SUPABASE_SECRET_KEY) 를 넣고 개발 서버를 다시 시작하세요.",
      },
      { status: 503 },
    );
  }

  let body: { room_name?: string; password?: string };
  try {
    body = (await req.json()) as { room_name?: string; password?: string };
  } catch {
    log("stop — JSON 파싱 실패");
    return NextResponse.json({ error: "JSON 본문이 필요합니다." }, { status: 400 });
  }

  const room_name = String(body.room_name ?? "").trim();
  const password = String(body.password ?? "");

  if (!room_name) {
    log("stop — 방 이름 비어 있음");
    return NextResponse.json({ error: "방 이름을 입력해 주세요." }, { status: 400 });
  }
  if (!/^\d{4,}$/.test(password)) {
    log("stop — 비밀번호 형식 (숫자 4자리 이상 아님)", { passwordLen: password.length });
    return NextResponse.json(
      { error: "비밀번호는 숫자 4자리 이상으로 설정해 주세요." },
      { status: 400 },
    );
  }

  const id = crypto.randomUUID();
  const password_hash = await bcrypt.hash(password, 10);

  try {
    log("createServiceSupabaseClient 호출 직전 (service_role, RLS 우회)");
    const supabase = createServiceSupabaseClient();
    log("rooms insert 시도", { id, room_nameLen: room_name.length });
    // 단일 객체 insert 시 스키마/캐시 이슈를 줄이기 위해 배열 + columns 쿼리로 고정.
    // Prefer: return=minimal — 불필요한 RETURNING 확장으로 인한 오류 가능성 완화.
    const { error } = await supabase
      .from("rooms")
      .insert([{ id, room_name, password_hash }])
      .setHeader("Prefer", "return=minimal");
    if (error) {
      console.error("[api/rooms POST] DB 오류:", error.message);
      log("결과: 실패 (Supabase error)", {
        code: error.code,
        message: error.message,
      });
      const msg = error.message ?? "";
      const roomIdMissing = isRoomIdMissingMessage(msg);
      return NextResponse.json(
        {
          error: roomIdMissing
            ? `방을 만들 수 없습니다. ${ROOM_ID_USER_MESSAGE}`
            : "방을 만들지 못했습니다. Supabase 에 `rooms` 테이블·마이그레이션을 적용했는지 확인해 주세요.",
          hint: [error.message, error.code].filter(Boolean).join(" · "),
        },
        { status: 500 },
      );
    }
    log("결과: 성공", { id });
  } catch (e) {
    console.error("[api/rooms POST] 예외:", e);
    const hint = e instanceof Error ? e.message : String(e);
    log("결과: 실패 (예외)", {
      name: e instanceof Error ? e.name : typeof e,
      message: hint,
      stack: e instanceof Error ? e.stack : undefined,
    });
    const looksLikeNetwork = /fetch failed|ECONNREFUSED|ENOTFOUND|ETIMEDOUT|CERT_|getaddrinfo/i.test(
      hint,
    );
    const roomIdMissing = !looksLikeNetwork && isRoomIdMissingMessage(hint);
    return NextResponse.json(
      {
        error: looksLikeNetwork
          ? "Supabase 서버에 연결하지 못했습니다. PC 인터넷·VPN·회사 방화벽을 확인하고, .env 의 NEXT_PUBLIC_SUPABASE_URL 이 대시보드와 동일한지 확인해 주세요. (Windows 에서는 터미널에 NODE_OPTIONS=--dns-result-order=ipv4first 를 켠 뒤 npm run dev 도 도움이 됩니다.)"
          : roomIdMissing
            ? `방을 만들 수 없습니다. ${ROOM_ID_USER_MESSAGE}`
            : "방을 만들지 못했습니다. DB 마이그레이션·API 키를 확인해 주세요.",
        hint,
      },
      { status: 500 },
    );
  }

  return NextResponse.json({ id, room_name });
}
