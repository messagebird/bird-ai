#!/usr/bin/env node
// PostToolUseFailure on a Bird MCP tool or bird:* skill: asks the agent, once
// per session and tool, to offer the user feedback for the Bird team. It must
// never get in the agent's way, so every error ends in silence and exit 0.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const BIRD_MCP_PREFIXES = [
  "mcp__plugin_bird_bird__",
  "mcp__bird__",
  "mcp__claude_ai_Bird__",
];

function birdToolKey(event) {
  const tool = event?.tool_name;
  if (typeof tool !== "string") return null;
  if (BIRD_MCP_PREFIXES.some((prefix) => tool.startsWith(prefix))) return tool;
  const skill = event?.tool_input?.skill;
  if (
    tool === "Skill" &&
    typeof skill === "string" &&
    skill.startsWith("bird:")
  ) {
    return `Skill:${skill}`;
  }
  return null;
}

function feedbackMessage(key) {
  return [
    `A Bird tool failed (${key}).`,
    "Draft short, honest feedback for the Bird team: what you were trying to do, what you called, and what failed. Leave out secrets and personal data.",
    "Show the draft to the user and ask whether to send it.",
    'Only if they approve, send it with the `platform_feedback` MCP tool, or with `bird platform feedback "<text>"`.',
    "Then continue resolving the failure and the user's task.",
  ].join(" ");
}

// Records the key and reports whether it is new for this session.
function firstForSession(dir, sessionId, key) {
  const file = join(
    dir,
    `feedback-${sessionId.replace(/[^A-Za-z0-9_-]/g, "_")}.json`,
  );
  let seen = [];
  try {
    seen = JSON.parse(readFileSync(file, "utf8"));
  } catch {
    // First failure this session, or an unreadable file: start over.
  }
  if (!Array.isArray(seen)) seen = [];
  if (seen.includes(key)) return false;
  mkdirSync(dir, { recursive: true });
  writeFileSync(file, JSON.stringify([...seen, key]));
  return true;
}

function handle(raw, dir) {
  const event = JSON.parse(raw);
  const key = birdToolKey(event);
  const sessionId = event?.session_id;
  if (!key || typeof sessionId !== "string" || !sessionId) return null;
  if (!firstForSession(dir, sessionId, key)) return null;
  return {
    hookSpecificOutput: {
      hookEventName: "PostToolUseFailure",
      additionalContext: feedbackMessage(key),
    },
  };
}

async function main() {
  setTimeout(() => process.exit(0), 4000).unref();
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  const dir =
    process.env.CLAUDE_PLUGIN_DATA || join(tmpdir(), "bird-plugin-feedback");
  const output = handle(Buffer.concat(chunks).toString("utf8"), dir);
  if (output) process.stdout.write(JSON.stringify(output));
}

main()
  .catch(() => {})
  .finally(() => process.exit(0));
