// Generated from the bird plugin's canonical manifest. Do not edit.
import { fileURLToPath } from "node:url";

const full = {
  "bird": {
    "type": "remote",
    "url": "https://mcp.bird.com"
  }
};
const dynamic = {
  "bird": {
    "type": "remote",
    "url": "https://mcp.bird.com/dynamic"
  }
};
const fullAsk = {
  "bird_*": "ask"
};
const dynamicAsk = {
  "bird_execute": "ask"
};
const skills = fileURLToPath(new URL("./skills", import.meta.url));

// Read the way OpenCode reads it: the code-mode variable wins when set, else
// the umbrella experimental one; only "true" or "1" enable it.
const enabled = (name) => ["true", "1"].includes(process.env[name]?.toLowerCase());
const codeMode =
  process.env.OPENCODE_EXPERIMENTAL_CODE_MODE === undefined
    ? enabled("OPENCODE_EXPERIMENTAL")
    : enabled("OPENCODE_EXPERIMENTAL_CODE_MODE");

// Code mode keeps MCP tools behind its own search, so it takes Bird's full
// catalog; otherwise OpenCode adds every MCP tool to the model's context.
// Whatever the user already configured under the same name wins, including a
// blanket permission string.
export const BirdPlugin = async () => ({
  config: async (config) => {
    config.mcp = { ...(codeMode ? full : dynamic), ...config.mcp };
    config.skills = { ...config.skills, paths: [...(config.skills?.paths ?? []), skills] };
    if (typeof config.permission !== "string") {
      config.permission = { ...(codeMode ? fullAsk : dynamicAsk), ...config.permission };
    }
  },
});
