/**
 * 사용자 제공 원본 → public/images/menu/ 고해상도 정사각형 PNG
 * 실행: node scripts/process-user-menu-images.mjs
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "public", "images", "menu");

const PEACH_SRC = path.join(
  "C:",
  "Users",
  "NY.LEE25",
  ".cursor",
  "projects",
  "d-Codes-cafe-menu",
  "assets",
  "c__Users_NY.LEE25_AppData_Roaming_Cursor_User_workspaceStorage_824c10aefc09b169ecf753848f45beee_images_thumbnail_1_202409050445580211-9b3cb524-ccc3-4b53-bd65-8c16d121ab91.png",
);

const BOARD_SRC = path.join(
  "C:",
  "Users",
  "NY.LEE25",
  ".cursor",
  "projects",
  "d-Codes-cafe-menu",
  "assets",
  "c__Users_NY.LEE25_AppData_Roaming_Cursor_User_workspaceStorage_824c10aefc09b169ecf753848f45beee_images_20250811_062243509_02787-48b6b776-c95b-450d-81b9-3f7b3ddf06e4.png",
);

const OUT_SIZE = 1024;

async function enhanceSquare(input, outputPath) {
  await sharp(input)
    .rotate()
    .resize(OUT_SIZE, OUT_SIZE, {
      fit: "cover",
      position: "attention",
      kernel: sharp.kernel.lanczos3,
    })
    .sharpen({ sigma: 0.9, m1: 0.8, m2: 3, x1: 3, y2: 15, y3: 15 })
    .normalize()
    .png({ compressionLevel: 9, effort: 10 })
    .toFile(outputPath);
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });

  if (!fs.existsSync(PEACH_SRC)) {
    console.error("Peach source missing:", PEACH_SRC);
    process.exit(1);
  }
  if (!fs.existsSync(BOARD_SRC)) {
    console.error("Board source missing:", BOARD_SRC);
    process.exit(1);
  }

  await enhanceSquare(
    PEACH_SRC,
    path.join(OUT, "peach-iced-tea.png"),
  );
  console.log("OK peach-iced-tea.png");

  const meta = await sharp(BOARD_SRC).metadata();
  const W = meta.width ?? 800;
  const H = meta.height ?? 450;

  // 3열 중 시그니처 열 시작 직후, [음료][텍스트] 중 왼쪽 잔 영역만
  const colStart = Math.round(W * (2 / 3));
  const drinkW = Math.round(W * 0.145);
  const left = colStart;
  const width = Math.min(drinkW, W - left - 2);
  const padTop = Math.round(H * 0.085);
  const padBottom = Math.round(H * 0.11);
  const usableH = H - padTop - padBottom;
  const sliceH = Math.floor(usableH / 3);

  const sigIds = ["tri-blend-ade", "orange-bianco", "honey-ginger-latte"];
  for (let i = 0; i < 3; i++) {
    const top = padTop + i * sliceH;
    const buf = await sharp(BOARD_SRC)
      .extract({
        left,
        top,
        width,
        height: sliceH,
      })
      .toBuffer();

    await enhanceSquare(buf, path.join(OUT, `${sigIds[i]}.png`));
    console.log("OK", `${sigIds[i]}.png`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
