/**
 * 폴바셋 공식 사이트 썸네일(/upload/product/...)을 내려받아 public/images/menu/{id}.(jpg|png) 로 저장.
 * 메뉴판과 현재 노출 메뉴명이 다를 때는 유사 음료 썸네일로 매핑.
 *
 * 회사 프록시 등으로 TLS 검증이 실패하면 아래 rejectUnauthorized 가 필요할 수 있음.
 * 일반 환경에서는 제거하는 것이 좋습니다.
 */
import fs from "fs";
import https from "https";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "public", "images", "menu");
const HOST = "www.baristapaulbassett.co.kr";

/** catalog id -> site image path */
const MAP = {
  espresso: "/upload/product/A/thumbnail_1_201912111105461651.jpg",
  lungo: "/upload/product/A/thumbnail_1_201903211031182001.jpg",
  americano: "/upload/product/A/thumbnail_1_201903211033328911.jpg",
  "cafe-latte": "/upload/product/A/thumbnail_1_201903211053056601.jpg",
  "flat-white": "/upload/product/A/thumbnail_2_202110011203537381.png",
  "vanilla-latte": "/upload/product/A/thumbnail_1_202212190200191991.png",
  "cafe-mocha": "/upload/product/A/thumbnail_1_202401160253231601.png",
  "spanish-latte": "/upload/product/A/thumbnail_1_201904110901351460.png",

  affogato: "/upload/product/C/thumbnail_1_201904100519063190.jpg",
  "ice-cream-cafe-latte": "/upload/product/C/thumbnail_1_202601150614342381.png",
  "ice-cream": "/upload/product/C/thumbnail_1_201903210546073511.jpg",

  "earl-grey": "/upload/product/B/thumbnail_1_202401250939229350.jpg",
  chamomile: "/upload/product/B/thumbnail_1_202401250906467811.png",
  peppermint: "/upload/product/B/thumbnail_1_202405290248103350.png",
  "peach-iced-tea": "/upload/product/B/thumbnail_2_202204270613441981.png",
  "red-fruit": "/upload/product/B/thumbnail_1_202401250901028661.png",
  "citron-chamomile": "/upload/product/B/thumbnail_1_201903210128273811.jpg",
  "grapefruit-honey-black": "/upload/product/B/thumbnail_1_202509301016183590.png",
  "matcha-latte": "/upload/product/B/thumbnail_1_201911201154098521.png",
  "black-tea-latte": "/upload/product/B/thumbnail_1_202401160301436681.png",
  "chocolate-latte": "/upload/product/B/thumbnail_1_201911201001439141.png",

  "grapefruit-ade": "/upload/product/B/thumbnail_1_202509301015162190.png",
  "lemon-ade": "/upload/product/B/thumbnail_2_202204260159577171.png",
  "sweet-peach-ade": "/upload/product/B/thumbnail_1_202307030621094871.png",
  "hanrabong-ade": "/upload/product/B/thumbnail_1_201903210626327311.jpg",
  "strawberry-juice": "/upload/product/B/thumbnail_1_202505160129243921.jpg",
  "strawberry-banana-juice": "/upload/product/B/thumbnail_1_202402281122347201.png",

  "plain-yogurt-smoothie": "/upload/product/B/thumbnail_1_202509301014212480.jpg",
  "strawberry-yogurt-smoothie": "/upload/product/B/thumbnail_1_202602231138039800.jpg",
  "blueberry-yogurt-smoothie": "/upload/product/B/thumbnail_1_202602231138039800.jpg",
  "ginseng-honey-smoothie": "/upload/product/B/thumbnail_1_202508181100410470.jpg",
  "healthy-yam-banana-smoothie": "/upload/product/B/thumbnail_1_202601070123279970.png",
  "java-chip-latte-frappe": "/upload/product/B/thumbnail_1_202407090228173510.png",
  "chocolate-frappe": "/upload/product/B/thumbnail_1_202407090231059010.png",
  "matcha-frappe": "/upload/product/B/thumbnail_1_202407090230271210.png",

  "tri-blend-ade": "/upload/product/B/thumbnail_1_202407090229028020.png",
  "orange-bianco": "/upload/product/B/thumbnail_2_202204270608236001.png",
  "honey-ginger-latte": "/upload/product/B/thumbnail_1_202511270920400571.png",
};

function fetchBuf(urlPath) {
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: HOST,
        path: encodeURI(urlPath),
        method: "GET",
        rejectUnauthorized: false,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; CafeMenuBot/1.0; +https://www.baristapaulbassett.co.kr)",
          Accept: "image/*,*/*",
        },
      },
      (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          reject(new Error(`Redirect ${res.statusCode}`));
          return;
        }
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode}`));
          return;
        }
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => resolve(Buffer.concat(chunks)));
      },
    );
    req.on("error", reject);
    req.end();
  });
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const ids = Object.keys(MAP);
  for (const id of ids) {
    const p = MAP[id];
    const ext = path.extname(p.split("?")[0]) || ".jpg";
    const dest = path.join(OUT, `${id}${ext}`);
    try {
      const buf = await fetchBuf(p);
      fs.writeFileSync(dest, buf);
      console.log("OK", id, buf.length);
    } catch (e) {
      console.error("FAIL", id, e.message);
    }
  }
}

main();
