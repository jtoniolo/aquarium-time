import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

function ensureDefaultConfig() {
  const configDir = path.join(process.cwd(), "public", "config");
  const configPath = path.join(configDir, "config.json");

  // Create config directory if it doesn't exist
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  // Write default config if it doesn't exist
  if (!fs.existsSync(configPath)) {
    const defaultConfig = {
      API_BASE_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
    };
    fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
  }
}

export async function GET() {
  // Ensure config.json exists with default values
  ensureDefaultConfig();

  // Read and serve the config file
  const configPath = path.join(
    process.cwd(),
    "public",
    "config",
    "config.json"
  );
  const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

  return NextResponse.json(config);
}
