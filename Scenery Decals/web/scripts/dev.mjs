import { spawn } from "node:child_process";
import path from "node:path";

const args = process.argv.slice(2);
let port = "3000";
let host = "0.0.0.0";

for (let i = 0; i < args.length; i += 1) {
  const arg = args[i];
  if (arg.startsWith("--port=")) {
    port = arg.slice("--port=".length);
  } else if (arg === "--port" || arg === "-p") {
    if (args[i + 1]) port = args[++i];
  } else if (arg.startsWith("--host=")) {
    host = arg.slice("--host=".length);
  } else if (arg === "--host" || arg === "--hostname" || arg === "-H") {
    if (args[i + 1]) host = args[++i];
  }
}

const nextBin = path.resolve(process.cwd(), "node_modules", ".bin", "next");
const child = spawn(nextBin, ["dev", "-p", port, "-H", host], {
  stdio: "inherit",
  env: {
    ...process.env,
    NEXT_TELEMETRY_DISABLED: "1",
  },
});

const forwardSignal = (signal) => {
  if (!child.killed) {
    child.kill(signal);
  }
};

process.on("SIGINT", () => forwardSignal("SIGINT"));
process.on("SIGTERM", () => forwardSignal("SIGTERM"));

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
  } else {
    process.exit(code ?? 0);
  }
});
