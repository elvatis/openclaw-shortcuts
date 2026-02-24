import fs from "node:fs";
import path from "node:path";
import os from "node:os";

export default function register(api: any) {
  const cfg = (api.pluginConfig ?? {}) as {
    enabled?: boolean;
    includeTips?: boolean;
    workspacePath?: string;
    // Optional: user-supplied help sections. Keep defaults generic.
    sections?: Array<{ title: string; lines: string[] }>;
  };
  if (cfg.enabled === false) return;

  const includeTips = cfg.includeTips !== false;
  const workspacePath = String(cfg.workspacePath ?? "~/.openclaw/workspace");
  const resolvedWorkspace = workspacePath.startsWith("~")
    ? path.join(os.homedir(), workspacePath.slice(1))
    : workspacePath;

  function listProjects(): string[] {
    try {
      const entries = fs.readdirSync(resolvedWorkspace, { withFileTypes: true });
      return entries
        .filter((e) => e.isDirectory())
        .map((e) => e.name)
        .filter((name) => !name.startsWith("."))
        .filter((name) => fs.existsSync(path.join(resolvedWorkspace, name, ".git")))
        .sort((a, b) => a.localeCompare(b));
    } catch {
      return [];
    }
  }


  api.registerCommand({
    name: "shortcuts",
    description: "Show local shortcuts and helper commands (generic by default)",
    requireAuth: false,
    acceptsArgs: false,
    handler: async () => {
      const lines: string[] = [];
      lines.push("Shortcuts");
      lines.push("");

      // Generic placeholders only. Users can configure their own sections.
      const sections = cfg.sections ?? [
        {
          title: "Shortcuts",
          lines: [
            "- /<project>   - Project shortcut (configured by user)",
            "- /<command>   - A custom command (configured by user)",
          ],
        },
        {
          title: "Memory",
          lines: [
            "- /remember-<x> <text>  - Save a note (if installed)",
            "- <trigger phrase>: ... - Optional explicit capture trigger",
          ],
        },
        {
          title: "TODO",
          lines: [
            "- /todo-list",
            "- /todo-add <text>",
            "- /todo-done <index>",
          ],
        },
      ];

      for (const s of sections) {
        lines.push(s.title + ":");
        for (const ln of s.lines) lines.push(ln);
        lines.push("");
      }

      if (includeTips) {
        lines.push("Tips:");
        lines.push("- Keep infrastructure changes ask-first.");
        lines.push("- Keep secrets out of repos.");
        lines.push("");
      }

      lines.push("(This /help output is intentionally generic. Configure your own sections in plugin config.)");

      return { text: lines.join("\n") };
    },
  });

  api.registerCommand({
    name: "projects",
    description: "List local projects (git repos) in the workspace",
    requireAuth: false,
    acceptsArgs: false,
    handler: async () => {
      const projects = listProjects();
      if (projects.length === 0) {
        return { text: `No git projects found under ${resolvedWorkspace}.` };
      }
      const lines: string[] = [];
      lines.push(`Projects (${projects.length}):`);
      for (const p of projects) lines.push(`- ${p}`);
      return { text: lines.join("\n") };
    },
  });
}

