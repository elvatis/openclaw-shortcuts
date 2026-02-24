# openclaw-help

Enhanced `/help` command for OpenClaw.

## Security note

This plugin is intentionally **generic by default**. Do not hardcode personal commands, group names, phone numbers, or private workflow details into the repository.

Instead, customize the output via plugin config.

## Install (dev)

```bash
openclaw plugins install -l ~/.openclaw/workspace/openclaw-help
openclaw gateway restart
```

## Configure

Example:

```json
{
  "plugins": {
    "entries": {
      "openclaw-help": {
        "enabled": true,
        "config": {
          "includeTips": true,
          "sections": [
            {
              "title": "Shortcuts",
              "lines": [
                "- /aegis - show PRIVATE_PROJECT status",
                "- /bmas - show BMAS status"
              ]
            }
          ]
        }
      }
    }
  }
}
```

(Keep sensitive details out of the repo. Config lives on your machine.)
