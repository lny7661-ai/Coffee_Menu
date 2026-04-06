import { spawn } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const port = process.env.PORT || "3000";
const url = `http://127.0.0.1:${port}`;
const nextCli = join(root, "node_modules", "next", "dist", "bin", "next");

const devEnv = { ...process.env };
const ipv4Flag = "--dns-result-order=ipv4first";
const existingOpt = devEnv.NODE_OPTIONS ?? "";
if (!existingOpt.includes("dns-result-order")) {
  devEnv.NODE_OPTIONS = [existingOpt.trim(), ipv4Flag].filter(Boolean).join(" ");
}

// 호스트는 기본(0.0.0.0) — 터미널에 나오는 Network URL 로 폰 등에서도 접속 가능
const child = spawn(process.execPath, [nextCli, "dev", "-p", String(port)], {
  cwd: root,
  stdio: "inherit",
  env: devEnv,
});

const skipOpen = process.env.BROWSER === "none";

if (!skipOpen) {
  const { default: open } = await import("open");
  setTimeout(() => {
    open(url).catch(() => {});
  }, 2000);
}

child.on("exit", (code) => process.exit(code ?? 0));
