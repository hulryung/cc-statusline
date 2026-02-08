#!/usr/bin/env node
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// node_modules/tsup/assets/esm_shims.js
import path from "path";
import { fileURLToPath } from "url";
var init_esm_shims = __esm({
  "node_modules/tsup/assets/esm_shims.js"() {
    "use strict";
  }
});

// src/utils/tester.ts
var tester_exports = {};
__export(tester_exports, {
  analyzeTestResult: () => analyzeTestResult,
  generateMockCcusageOutput: () => generateMockCcusageOutput,
  generateMockClaudeInput: () => generateMockClaudeInput,
  testStatuslineScript: () => testStatuslineScript
});
import { spawn } from "child_process";
import { promises as fs2 } from "fs";
import path3 from "path";
async function testStatuslineScript(script, mockData) {
  const startTime = Date.now();
  try {
    const tempDir = "/tmp";
    const scriptPath = path3.join(tempDir, `statusline-test-${Date.now()}.sh`);
    await fs2.writeFile(scriptPath, script, { mode: 493 });
    const input = mockData || generateMockClaudeInput();
    const result = await executeScript(scriptPath, JSON.stringify(input));
    await fs2.unlink(scriptPath).catch(() => {
    });
    const executionTime = Date.now() - startTime;
    return {
      success: result.success,
      output: result.output,
      error: result.error,
      executionTime
    };
  } catch (error) {
    return {
      success: false,
      output: "",
      error: error instanceof Error ? error.message : String(error),
      executionTime: Date.now() - startTime
    };
  }
}
function generateMockClaudeInput(config) {
  return {
    session_id: "test-session-123",
    transcript_path: "/home/user/.claude/conversations/test.jsonl",
    cwd: "/home/user/projects/my-project",
    workspace: {
      current_dir: "/home/user/projects/my-project",
      project_dir: "/home/user/projects/my-project"
    },
    model: {
      id: "claude-opus-4-1-20250805",
      display_name: "Opus 4.1",
      version: "20250805"
    },
    version: "1.0.80",
    output_style: {
      name: "default"
    },
    cost: {
      total_cost_usd: 0.42,
      total_duration_ms: 18e4,
      // 3 minutes
      total_api_duration_ms: 2300,
      total_lines_added: 156,
      total_lines_removed: 23
    },
    context_window: {
      total_input_tokens: 15234,
      total_output_tokens: 4521,
      context_window_size: 2e5,
      current_usage: {
        input_tokens: 8500,
        output_tokens: 1200,
        cache_creation_input_tokens: 5e3,
        cache_read_input_tokens: 2e3
      }
    }
  };
}
function generateMockCcusageOutput() {
  return {
    blocks: [
      {
        id: "2025-08-13T08:00:00.000Z",
        startTime: "2025-08-13T08:00:00.000Z",
        endTime: "2025-08-13T13:00:00.000Z",
        usageLimitResetTime: "2025-08-13T13:00:00.000Z",
        actualEndTime: "2025-08-13T09:30:34.698Z",
        isActive: true,
        isGap: false,
        entries: 12,
        tokenCounts: {
          inputTokens: 1250,
          outputTokens: 2830,
          cacheCreationInputTokens: 15e3,
          cacheReadInputTokens: 45e3
        },
        totalTokens: 64080,
        costUSD: 3.42,
        models: ["claude-opus-4-1-20250805"],
        burnRate: {
          tokensPerMinute: 850.5,
          tokensPerMinuteForIndicator: 850,
          costPerHour: 12.45
        },
        projection: {
          totalTokens: 128e3,
          totalCost: 6.84,
          remainingMinutes: 210
        }
      }
    ]
  };
}
async function executeScript(scriptPath, input) {
  return new Promise((resolve) => {
    const process2 = spawn("bash", [scriptPath], {
      stdio: ["pipe", "pipe", "pipe"]
    });
    let stdout = "";
    let stderr = "";
    process2.stdout.on("data", (data) => {
      stdout += data.toString();
    });
    process2.stderr.on("data", (data) => {
      stderr += data.toString();
    });
    process2.on("close", (code) => {
      resolve({
        success: code === 0,
        output: stdout.trim(),
        error: stderr.trim() || void 0
      });
    });
    process2.on("error", (err) => {
      resolve({
        success: false,
        output: "",
        error: err.message
      });
    });
    process2.stdin.write(input);
    process2.stdin.end();
    setTimeout(() => {
      process2.kill();
      resolve({
        success: false,
        output: stdout,
        error: "Script execution timed out (5s)"
      });
    }, 5e3);
  });
}
function analyzeTestResult(result, config) {
  const issues = [];
  const suggestions = [];
  let performance;
  if (result.executionTime > 1e3) {
    performance = "timeout";
    issues.push("Script execution is very slow (>1s)");
  } else if (result.executionTime > 500) {
    performance = "slow";
    issues.push("Script execution is slow (>500ms)");
  } else if (result.executionTime > 100) {
    performance = "good";
  } else {
    performance = "excellent";
  }
  let hasRequiredFeatures = true;
  if (config.features.includes("directory") && !result.output.includes("projects")) {
    hasRequiredFeatures = false;
    issues.push("Directory feature not working properly");
  }
  if (config.features.includes("model") && !result.output.includes("Opus")) {
    hasRequiredFeatures = false;
    issues.push("Model feature not working properly");
  }
  if (config.features.includes("git") && config.ccusageIntegration && !result.output.includes("git")) {
    suggestions.push("Git integration may require actual git repository");
  }
  if (result.error) {
    issues.push(`Script errors: ${result.error}`);
  }
  if (!result.success) {
    issues.push("Script failed to execute successfully");
  }
  if (config.features.length > 6) {
    suggestions.push("Consider reducing number of features for better performance");
  }
  if (config.ccusageIntegration && result.executionTime > 200) {
    suggestions.push("ccusage integration may slow down statusline - consider caching");
  }
  return {
    performance,
    hasRequiredFeatures,
    issues,
    suggestions
  };
}
var init_tester = __esm({
  "src/utils/tester.ts"() {
    "use strict";
    init_esm_shims();
  }
});

// src/cli/preview.ts
var preview_exports = {};
__export(preview_exports, {
  previewCommand: () => previewCommand
});
import { promises as fs3 } from "fs";
import chalk2 from "chalk";
import ora2 from "ora";
async function previewCommand(scriptPath) {
  console.log(chalk2.cyan("\u{1F50D} Statusline Preview Mode\n"));
  let script;
  try {
    const spinner = ora2(`Loading statusline script from ${scriptPath}...`).start();
    script = await fs3.readFile(scriptPath, "utf-8");
    spinner.succeed("Script loaded!");
    const headerMatch = script.match(/# Theme: (\w+) \| Colors: (\w+) \| Features: ([^\n]+)/i);
    if (headerMatch) {
      console.log(chalk2.yellow("Detected Configuration:"));
      console.log(`   Theme: ${headerMatch[1]}`);
      console.log(`   Colors: ${headerMatch[2]}`);
      console.log(`   Features: ${headerMatch[3]}
`);
    }
    const generationMatch = script.match(/# Generated by cc-statusline.*\n# Custom Claude Code statusline - Created: ([^\n]+)/i);
    if (generationMatch) {
      console.log(chalk2.gray(`Generated: ${generationMatch[1]}
`));
    }
  } catch (error) {
    console.error(chalk2.red(`\u274C Failed to load script: ${error instanceof Error ? error.message : String(error)}`));
    return;
  }
  const testSpinner = ora2("Testing statusline with mock data...").start();
  const mockInput = generateMockClaudeInput();
  console.log(chalk2.gray("\nMock Claude Code Input:"));
  console.log(chalk2.gray(JSON.stringify(mockInput, null, 2)));
  const testResult = await testStatuslineScript(script, mockInput);
  if (testResult.success) {
    testSpinner.succeed(`Test completed in ${testResult.executionTime}ms`);
    console.log(chalk2.green("\n\u2705 Statusline Output:"));
    console.log(chalk2.white("\u2501".repeat(60)));
    console.log(testResult.output);
    console.log(chalk2.white("\u2501".repeat(60)));
    console.log(chalk2.cyan(`
\u{1F4CA} Performance: ${getPerformanceEmoji(getPerformanceLevel(testResult.executionTime))} ${getPerformanceLevel(testResult.executionTime)} (${testResult.executionTime}ms)`));
    if (testResult.output.includes("\u{1F4C1}") || testResult.output.includes("\u{1F33F}") || testResult.output.includes("\u{1F916}")) {
      console.log(chalk2.green("\u2705 Statusline features appear to be working"));
    } else {
      console.log(chalk2.yellow("\u26A0\uFE0F  Basic features may not be displaying correctly"));
    }
  } else {
    testSpinner.fail("Test failed");
    console.error(chalk2.red(`
\u274C Error: ${testResult.error}`));
    if (testResult.output) {
      console.log(chalk2.gray("\nPartial output:"));
      console.log(testResult.output);
    }
  }
  console.log(chalk2.green("\n\u2728 Preview complete! Use `cc-statusline init` to generate a new statusline."));
}
function getPerformanceEmoji(performance) {
  switch (performance) {
    case "excellent":
      return "\u{1F680}";
    case "good":
      return "\u2705";
    case "slow":
      return "\u26A0\uFE0F";
    case "timeout":
      return "\u{1F40C}";
    default:
      return "\u2753";
  }
}
function getPerformanceLevel(executionTime) {
  if (executionTime > 1e3) return "timeout";
  if (executionTime > 500) return "slow";
  if (executionTime > 100) return "good";
  return "excellent";
}
var init_preview = __esm({
  "src/cli/preview.ts"() {
    "use strict";
    init_esm_shims();
    init_tester();
  }
});

// src/index.ts
init_esm_shims();
import { Command } from "commander";

// src/cli/commands.ts
init_esm_shims();

// src/cli/prompts.ts
init_esm_shims();
import inquirer from "inquirer";
async function collectConfiguration() {
  console.log("\u{1F680} Welcome to cc-statusline! Let's create your custom Claude Code statusline.\n");
  console.log("\u2728 All features are enabled by default. Use \u2191/\u2193 arrows to navigate, SPACE to toggle, ENTER to continue.\n");
  const config = await inquirer.prompt([
    {
      type: "checkbox",
      name: "features",
      message: "Select statusline features (scroll down for more options):",
      choices: [
        { name: "\u{1F4C1} Working Directory", value: "directory", checked: true },
        { name: "\u{1F33F} Git Branch", value: "git", checked: true },
        { name: "\u{1F916} Model Name & Version", value: "model", checked: true },
        { name: "\u{1F9E0} Context Remaining", value: "context", checked: true },
        { name: "\u{1F4B5} Usage & Cost", value: "usage", checked: true },
        { name: "\u{1F4CA} Token Statistics", value: "tokens", checked: true },
        { name: "\u26A1 Burn Rate ($/hr & tokens/min)", value: "burnrate", checked: true },
        { name: "\u231B Session Reset Time (requires ccusage)", value: "session", checked: false }
      ],
      validate: (answer) => {
        if (answer.length < 1) {
          return "You must choose at least one feature.";
        }
        return true;
      },
      pageSize: 10
    },
    {
      type: "confirm",
      name: "colors",
      message: "\n\u{1F3A8} Enable modern color scheme and emojis?",
      default: true
    },
    {
      type: "confirm",
      name: "logging",
      message: "\n\u{1F4DD} Enable debug logging to .claude/statusline.log?",
      default: false
    },
    {
      type: "list",
      name: "installLocation",
      message: "\n\u{1F4CD} Where would you like to install the statusline?",
      choices: [
        { name: "\u{1F3E0} Global (~/.claude) - Use across all projects", value: "global" },
        { name: "\u{1F4C2} Project (./.claude) - Only for this project", value: "project" }
      ],
      default: "project"
    }
  ]);
  const needsCcusage = config.features.includes("session");
  return {
    features: config.features,
    runtime: "bash",
    colors: config.colors,
    theme: "detailed",
    ccusageIntegration: needsCcusage,
    logging: config.logging,
    customEmojis: false,
    installLocation: config.installLocation
  };
}

// src/generators/bash-generator.ts
init_esm_shims();

// src/features/colors.ts
init_esm_shims();
function generateColorBashCode(config) {
  if (!config.enabled) {
    return `
# ---- color helpers (disabled) ----
use_color=0
C() { :; }
RST() { :; }
`;
  }
  return `
# ---- color helpers (force colors for Claude Code) ----
use_color=1
[ -n "$NO_COLOR" ] && use_color=0

C() { if [ "$use_color" -eq 1 ]; then printf '\\033[%sm' "$1"; fi; }
RST() { if [ "$use_color" -eq 1 ]; then printf '\\033[0m'; fi; }
`;
}
function generateBasicColors() {
  return `
# ---- modern sleek colors ----
dir_color() { if [ "$use_color" -eq 1 ]; then printf '\\033[38;5;117m'; fi; }    # sky blue
model_color() { if [ "$use_color" -eq 1 ]; then printf '\\033[38;5;147m'; fi; }  # light purple  
version_color() { if [ "$use_color" -eq 1 ]; then printf '\\033[38;5;180m'; fi; } # soft yellow
cc_version_color() { if [ "$use_color" -eq 1 ]; then printf '\\033[38;5;249m'; fi; } # light gray
style_color() { if [ "$use_color" -eq 1 ]; then printf '\\033[38;5;245m'; fi; } # gray
rst() { if [ "$use_color" -eq 1 ]; then printf '\\033[0m'; fi; }
`;
}

// src/features/git.ts
init_esm_shims();
function generateGitBashCode(config, colors) {
  if (!config.enabled) return "";
  const colorCode = colors ? `
# ---- git colors ----
git_color() { if [ "$use_color" -eq 1 ]; then printf '\\033[38;5;150m'; fi; }  # soft green
rst() { if [ "$use_color" -eq 1 ]; then printf '\\033[0m'; fi; }
` : `
git_color() { :; }
rst() { :; }
`;
  return `${colorCode}
# ---- git ----
git_branch=""
if git rev-parse --git-dir >/dev/null 2>&1; then
  git_branch=$(git branch --show-current 2>/dev/null || git rev-parse --short HEAD 2>/dev/null)
fi`;
}
function generateGitUtilities() {
  return `
# git utilities
num_or_zero() { v="$1"; [[ "$v" =~ ^[0-9]+$ ]] && echo "$v" || echo 0; }`;
}

// src/features/usage.ts
init_esm_shims();
function generateUsageBashCode(config, colors) {
  if (!config.enabled) return "";
  const colorCode = colors ? `
# ---- usage colors ----
usage_color() { if [ "$use_color" -eq 1 ]; then printf '\\033[38;5;189m'; fi; }  # lavender
cost_color() { if [ "$use_color" -eq 1 ]; then printf '\\033[38;5;222m'; fi; }   # light gold
burn_color() { if [ "$use_color" -eq 1 ]; then printf '\\033[38;5;220m'; fi; }   # bright gold
session_color() { 
  rem_pct=$(( 100 - session_pct ))
  if   (( rem_pct <= 10 )); then SCLR='38;5;210'  # light pink
  elif (( rem_pct <= 25 )); then SCLR='38;5;228'  # light yellow  
  else                          SCLR='38;5;194'; fi  # light green
  if [ "$use_color" -eq 1 ]; then printf '\\033[%sm' "$SCLR"; fi
}
` : `
usage_color() { :; }
cost_color() { :; }
burn_color() { :; }
session_color() { :; }
`;
  const needsCcusage = config.showSession;
  return `${colorCode}
# ---- cost and usage extraction ----
session_txt=""; session_pct=0; session_bar=""
cost_usd=""; cost_per_hour=""; tpm=""; tot_tokens=""

# Extract cost and token data from Claude Code's native input
if [ "$HAS_JQ" -eq 1 ]; then
  # Cost data
  cost_usd=$(echo "$input" | jq -r '.cost.total_cost_usd // empty' 2>/dev/null)
  total_duration_ms=$(echo "$input" | jq -r '.cost.total_duration_ms // empty' 2>/dev/null)

  # Calculate burn rate ($/hour) from cost and duration
  if [ -n "$cost_usd" ] && [ -n "$total_duration_ms" ] && [ "$total_duration_ms" -gt 0 ]; then
    cost_per_hour=$(echo "$cost_usd $total_duration_ms" | awk '{printf "%.2f", $1 * 3600000 / $2}')
  fi
${config.showTokens ? `
  # Token data from native context_window (no ccusage needed)
  input_tokens=$(echo "$input" | jq -r '.context_window.total_input_tokens // 0' 2>/dev/null)
  output_tokens=$(echo "$input" | jq -r '.context_window.total_output_tokens // 0' 2>/dev/null)

  if [ "$input_tokens" != "null" ] && [ "$output_tokens" != "null" ]; then
    tot_tokens=$(( input_tokens + output_tokens ))
    [ "$tot_tokens" -eq 0 ] && tot_tokens=""
  fi` : ""}
${config.showBurnRate && config.showTokens ? `
  # Calculate tokens per minute from native data
  if [ -n "$tot_tokens" ] && [ -n "$total_duration_ms" ] && [ "$total_duration_ms" -gt 0 ]; then
    # Convert ms to minutes and calculate rate
    tpm=$(echo "$tot_tokens $total_duration_ms" | awk '{if ($2 > 0) printf "%.0f", $1 * 60000 / $2; else print ""}')
  fi` : ""}
else
  # Bash fallback for cost extraction
  cost_usd=$(echo "$input" | grep -o '"total_cost_usd"[[:space:]]*:[[:space:]]*[0-9.]*' | sed 's/.*:[[:space:]]*\\([0-9.]*\\).*/\\1/')
  total_duration_ms=$(echo "$input" | grep -o '"total_duration_ms"[[:space:]]*:[[:space:]]*[0-9]*' | sed 's/.*:[[:space:]]*\\([0-9]*\\).*/\\1/')

  # Calculate burn rate ($/hour) from cost and duration
  if [ -n "$cost_usd" ] && [ -n "$total_duration_ms" ] && [ "$total_duration_ms" -gt 0 ]; then
    cost_per_hour=$(echo "$cost_usd $total_duration_ms" | awk '{printf "%.2f", $1 * 3600000 / $2}')
  fi
${config.showTokens ? `
  # Token data from native context_window (bash fallback)
  input_tokens=$(echo "$input" | grep -o '"total_input_tokens"[[:space:]]*:[[:space:]]*[0-9]*' | sed 's/.*:[[:space:]]*\\([0-9]*\\).*/\\1/')
  output_tokens=$(echo "$input" | grep -o '"total_output_tokens"[[:space:]]*:[[:space:]]*[0-9]*' | sed 's/.*:[[:space:]]*\\([0-9]*\\).*/\\1/')

  if [ -n "$input_tokens" ] && [ -n "$output_tokens" ]; then
    tot_tokens=$(( input_tokens + output_tokens ))
    [ "$tot_tokens" -eq 0 ] && tot_tokens=""
  fi` : ""}
${config.showBurnRate && config.showTokens ? `
  # Calculate tokens per minute from native data
  if [ -n "$tot_tokens" ] && [ -n "$total_duration_ms" ] && [ "$total_duration_ms" -gt 0 ]; then
    tpm=$(echo "$tot_tokens $total_duration_ms" | awk '{if ($2 > 0) printf "%.0f", $1 * 60000 / $2; else print ""}')
  fi` : ""}
fi
${needsCcusage ? `
# Session reset time requires ccusage (only feature that needs external tool)
if command -v ccusage >/dev/null 2>&1 && [ "$HAS_JQ" -eq 1 ]; then
  blocks_output=""

  # Try ccusage with timeout
  if command -v timeout >/dev/null 2>&1; then
    blocks_output=$(timeout 5s ccusage blocks --json 2>/dev/null)
  elif command -v gtimeout >/dev/null 2>&1; then
    blocks_output=$(gtimeout 5s ccusage blocks --json 2>/dev/null)
  else
    blocks_output=$(ccusage blocks --json 2>/dev/null)
  fi

  if [ -n "$blocks_output" ]; then
    active_block=$(echo "$blocks_output" | jq -c '.blocks[] | select(.isActive == true)' 2>/dev/null | head -n1)
    if [ -n "$active_block" ]; then
      # Session time calculation from ccusage
      reset_time_str=$(echo "$active_block" | jq -r '.usageLimitResetTime // .endTime // empty')
      start_time_str=$(echo "$active_block" | jq -r '.startTime // empty')

      if [ -n "$reset_time_str" ] && [ -n "$start_time_str" ]; then
        start_sec=$(to_epoch "$start_time_str"); end_sec=$(to_epoch "$reset_time_str"); now_sec=$(date +%s)
        total=$(( end_sec - start_sec )); (( total<1 )) && total=1
        elapsed=$(( now_sec - start_sec )); (( elapsed<0 ))&&elapsed=0; (( elapsed>total ))&&elapsed=$total
        session_pct=$(( elapsed * 100 / total ))
        remaining=$(( end_sec - now_sec )); (( remaining<0 )) && remaining=0
        rh=$(( remaining / 3600 )); rm=$(( (remaining % 3600) / 60 ))
        end_hm=$(fmt_time_hm "$end_sec")${config.showSession ? `
        session_txt="$(printf '%dh %dm until reset at %s (%d%%)' "$rh" "$rm" "$end_hm" "$session_pct")"` : ""}
      fi
    fi
  fi
fi` : ""}
${config.showSession ? `
# Native fallback: show session elapsed time from total_duration_ms when ccusage unavailable
if [ -z "$session_txt" ] && [ -n "$total_duration_ms" ] && [ "$total_duration_ms" -gt 0 ] 2>/dev/null; then
  elapsed_sec=$(( total_duration_ms / 1000 ))
  eh=$(( elapsed_sec / 3600 )); em=$(( (elapsed_sec % 3600) / 60 )); es=$(( elapsed_sec % 60 ))
  session_pct=0
  if [ "$eh" -gt 0 ]; then
    session_txt="$(printf 'Elapsed: %dh %dm %ds' "$eh" "$em" "$es")"
  elif [ "$em" -gt 0 ]; then
    session_txt="$(printf 'Elapsed: %dm %ds' "$em" "$es")"
  else
    session_txt="$(printf 'Elapsed: %ds' "$es")"
  fi
fi` : ""}`;
}
function generateUsageUtilities() {
  return `
# ---- time helpers ----
to_epoch() {
  ts="$1"
  if command -v gdate >/dev/null 2>&1; then gdate -d "$ts" +%s 2>/dev/null && return; fi
  date -u -j -f "%Y-%m-%dT%H:%M:%S%z" "\${ts/Z/+0000}" +%s 2>/dev/null && return
  python3 - "$ts" <<'PY' 2>/dev/null
import sys, datetime
s=sys.argv[1].replace('Z','+00:00')
print(int(datetime.datetime.fromisoformat(s).timestamp()))
PY
}

fmt_time_hm() {
  epoch="$1"
  if date -r 0 +%s >/dev/null 2>&1; then date -r "$epoch" +"%H:%M"; else date -d "@$epoch" +"%H:%M"; fi
}

progress_bar() {
  pct="\${1:-0}"; width="\${2:-10}"
  [[ "$pct" =~ ^[0-9]+$ ]] || pct=0; ((pct<0))&&pct=0; ((pct>100))&&pct=100
  filled=$(( pct * width / 100 )); empty=$(( width - filled ))
  printf '%*s' "$filled" '' | tr ' ' '='
  printf '%*s' "$empty" '' | tr ' ' '-'
}`;
}

// src/generators/bash-generator.ts
var VERSION = "1.4.0";
function generateBashStatusline(config) {
  const hasGit = config.features.includes("git");
  const hasUsage = config.features.some((f) => ["usage", "session", "tokens", "burnrate"].includes(f));
  const hasDirectory = config.features.includes("directory");
  const hasModel = config.features.includes("model");
  const hasContext = config.features.includes("context");
  const usageConfig = {
    enabled: hasUsage && config.ccusageIntegration,
    showCost: config.features.includes("usage"),
    showTokens: config.features.includes("tokens"),
    showBurnRate: config.features.includes("burnrate"),
    showSession: config.features.includes("session")
  };
  const gitConfig = {
    enabled: hasGit,
    showBranch: hasGit,
    showChanges: false,
    // Removed delta changes per user request
    compactMode: config.theme === "compact"
  };
  const timestamp = (/* @__PURE__ */ new Date()).toISOString();
  const script = `#!/bin/bash
# Generated by cc-statusline v${VERSION} (https://www.npmjs.com/package/@chongdashu/cc-statusline)
# Custom Claude Code statusline - Created: ${timestamp}
# Theme: ${config.theme} | Colors: ${config.colors} | Features: ${config.features.join(", ")}
STATUSLINE_VERSION="${VERSION}"

input=$(cat)

# ---- check jq availability ----
HAS_JQ=0
if command -v jq >/dev/null 2>&1; then
  HAS_JQ=1
fi
${config.logging ? generateLoggingCode() : ""}
${generateColorBashCode({ enabled: config.colors, theme: config.theme })}
${config.colors ? generateBasicColors() : ""}
${hasUsage ? generateUsageUtilities() : ""}
${hasGit ? generateGitUtilities() : ""}
${generateBasicDataExtraction(hasDirectory, hasModel, hasContext)}
${hasGit ? generateGitBashCode(gitConfig, config.colors) : ""}
${hasContext ? generateContextBashCode(config.colors) : ""}
${hasUsage ? generateUsageBashCode(usageConfig, config.colors) : ""}
${config.logging ? generateLoggingOutput() : ""}
${generateDisplaySection(config, gitConfig, usageConfig)}
`;
  return script.replace(/\n\n\n+/g, "\n\n").trim() + "\n";
}
function generateLoggingCode() {
  return `
# Get the directory where this statusline script is located
SCRIPT_DIR="$(cd "$(dirname "\${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="\${SCRIPT_DIR}/statusline.log"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# ---- logging ----
{
  echo "[$TIMESTAMP] Status line triggered (cc-statusline v\${STATUSLINE_VERSION})"
  echo "[$TIMESTAMP] Input:"
  if [ "$HAS_JQ" -eq 1 ]; then
    echo "$input" | jq . 2>/dev/null || echo "$input"
    echo "[$TIMESTAMP] Using jq for JSON parsing"
  else
    echo "$input"
    echo "[$TIMESTAMP] WARNING: jq not found, using bash fallback for JSON parsing"
  fi
  echo "---"
} >> "$LOG_FILE" 2>/dev/null
`;
}
function generateJsonExtractorCode() {
  return `
# ---- JSON extraction utilities ----
# Pure bash JSON value extractor (fallback when jq not available)
extract_json_string() {
  local json="$1"
  local key="$2"
  local default="\${3:-}"
  
  # For nested keys like workspace.current_dir, get the last part
  local field="\${key##*.}"
  field="\${field%% *}"  # Remove any jq operators
  
  # Try to extract string value (quoted)
  local value=$(echo "$json" | grep -o "\\"\\\${field}\\"[[:space:]]*:[[:space:]]*\\"[^\\"]*\\"" | head -1 | sed 's/.*:[[:space:]]*"\\([^"]*\\)".*/\\1/')
  
  # Convert escaped backslashes to forward slashes for Windows paths
  if [ -n "$value" ]; then
    value=$(echo "$value" | sed 's/\\\\\\\\/\\//g')
  fi
  
  # If no string value found, try to extract number value (unquoted)
  if [ -z "$value" ] || [ "$value" = "null" ]; then
    value=$(echo "$json" | grep -o "\\"\\\${field}\\"[[:space:]]*:[[:space:]]*[0-9.]\\+" | head -1 | sed 's/.*:[[:space:]]*\\([0-9.]\\+\\).*/\\1/')
  fi
  
  # Return value or default
  if [ -n "$value" ] && [ "$value" != "null" ]; then
    echo "$value"
  else
    echo "$default"
  fi
}
`;
}
function generateBasicDataExtraction(hasDirectory, hasModel, hasContext) {
  return `
${generateJsonExtractorCode()}
# ---- basics ----
if [ "$HAS_JQ" -eq 1 ]; then${hasDirectory ? `
  current_dir=$(echo "$input" | jq -r '.workspace.current_dir // .cwd // "unknown"' 2>/dev/null | sed "s|^$HOME|~|g")` : ""}${hasModel ? `
  model_name=$(echo "$input" | jq -r '.model.display_name // "Claude"' 2>/dev/null)
  model_version=$(echo "$input" | jq -r '.model.version // ""' 2>/dev/null)` : ""}${hasContext ? `
  session_id=$(echo "$input" | jq -r '.session_id // ""' 2>/dev/null)` : ""}
  cc_version=$(echo "$input" | jq -r '.version // ""' 2>/dev/null)
  output_style=$(echo "$input" | jq -r '.output_style.name // ""' 2>/dev/null)
else${hasDirectory ? `
  # Bash fallback for JSON extraction
  # Extract current_dir from workspace object - look for the pattern workspace":{"current_dir":"..."}
  current_dir=$(echo "$input" | grep -o '"workspace"[[:space:]]*:[[:space:]]*{[^}]*"current_dir"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/.*"current_dir"[[:space:]]*:[[:space:]]*"\\([^"]*\\)".*/\\1/' | sed 's/\\\\\\\\/\\//g')
  
  # Fall back to cwd if workspace extraction failed
  if [ -z "$current_dir" ] || [ "$current_dir" = "null" ]; then
    current_dir=$(echo "$input" | grep -o '"cwd"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/.*"cwd"[[:space:]]*:[[:space:]]*"\\([^"]*\\)".*/\\1/' | sed 's/\\\\\\\\/\\//g')
  fi
  
  # Fallback to unknown if all extraction failed
  [ -z "$current_dir" ] && current_dir="unknown"
  current_dir=$(echo "$current_dir" | sed "s|^$HOME|~|g")` : ""}${hasModel ? `
  
  # Extract model name from nested model object
  model_name=$(echo "$input" | grep -o '"model"[[:space:]]*:[[:space:]]*{[^}]*"display_name"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/.*"display_name"[[:space:]]*:[[:space:]]*"\\([^"]*\\)".*/\\1/')
  [ -z "$model_name" ] && model_name="Claude"
  # Model version is in the model ID, not a separate field  
  model_version=""  # Not available in Claude Code JSON` : ""}${hasContext ? `
  session_id=$(extract_json_string "$input" "session_id" "")` : ""}
  # CC version is at the root level
  cc_version=$(echo "$input" | grep -o '"version"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*"version"[[:space:]]*:[[:space:]]*"\\([^"]*\\)".*/\\1/')
  # Output style is nested
  output_style=$(echo "$input" | grep -o '"output_style"[[:space:]]*:[[:space:]]*{[^}]*"name"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/.*"name"[[:space:]]*:[[:space:]]*"\\([^"]*\\)".*/\\1/')
fi
`;
}
function generateContextBashCode(colors) {
  return `
# ---- context window calculation (native) ----
context_pct=""
context_remaining_pct=""
context_color() { if [ "$use_color" -eq 1 ]; then printf '\\033[1;37m'; fi; }  # default white

if [ "$HAS_JQ" -eq 1 ]; then
  # Get context window size and current usage from native Claude Code input
  CONTEXT_SIZE=$(echo "$input" | jq -r '.context_window.context_window_size // 200000' 2>/dev/null)
  USAGE=$(echo "$input" | jq '.context_window.current_usage' 2>/dev/null)

  if [ "$USAGE" != "null" ] && [ -n "$USAGE" ]; then
    # Calculate current context from current_usage fields
    # Formula: input_tokens + cache_creation_input_tokens + cache_read_input_tokens
    CURRENT_TOKENS=$(echo "$USAGE" | jq '(.input_tokens // 0) + (.cache_creation_input_tokens // 0) + (.cache_read_input_tokens // 0)' 2>/dev/null)

    if [ -n "$CURRENT_TOKENS" ] && [ "$CURRENT_TOKENS" -gt 0 ] 2>/dev/null; then
      context_used_pct=$(( CURRENT_TOKENS * 100 / CONTEXT_SIZE ))
      context_remaining_pct=$(( 100 - context_used_pct ))
      # Clamp to valid range
      (( context_remaining_pct < 0 )) && context_remaining_pct=0
      (( context_remaining_pct > 100 )) && context_remaining_pct=100

      # Set color based on remaining percentage
      if [ "$context_remaining_pct" -le 20 ]; then
        context_color() { if [ "$use_color" -eq 1 ]; then printf '\\033[38;5;203m'; fi; }  # coral red
      elif [ "$context_remaining_pct" -le 40 ]; then
        context_color() { if [ "$use_color" -eq 1 ]; then printf '\\033[38;5;215m'; fi; }  # peach
      else
        context_color() { if [ "$use_color" -eq 1 ]; then printf '\\033[38;5;158m'; fi; }  # mint green
      fi

      context_pct="\${context_remaining_pct}%"
    fi
  fi
fi
`;
}
function generateLoggingOutput() {
  return `
# ---- log extracted data ----
{
  echo "[$TIMESTAMP] Extracted: dir=\${current_dir:-}, model=\${model_name:-}, version=\${model_version:-}, git=\${git_branch:-}, context=\${context_pct:-}, cost=\${cost_usd:-}, cost_ph=\${cost_per_hour:-}, tokens=\${tot_tokens:-}, tpm=\${tpm:-}, session_pct=\${session_pct:-}"
  if [ "$HAS_JQ" -eq 0 ]; then
    echo "[$TIMESTAMP] Note: Context, tokens, and session info require jq for full functionality"
  fi
} >> "$LOG_FILE" 2>/dev/null
`;
}
function generateDisplaySection(config, gitConfig, usageConfig) {
  const emojis = config.colors && !config.customEmojis;
  return `
# ---- render statusline ----
# Line 1: Core info (directory, git, model, claude code version, output style)
${config.features.includes("directory") ? `printf '\u{1F4C1} %s%s%s' "$(dir_color)" "$current_dir" "$(rst)"` : ""}${gitConfig.enabled ? `
if [ -n "$git_branch" ]; then
  printf '  \u{1F33F} %s%s%s' "$(git_color)" "$git_branch" "$(rst)"
fi` : ""}${config.features.includes("model") ? `
printf '  \u{1F916} %s%s%s' "$(model_color)" "$model_name" "$(rst)"
if [ -n "$model_version" ] && [ "$model_version" != "null" ]; then
  printf '  \u{1F3F7}\uFE0F %s%s%s' "$(version_color)" "$model_version" "$(rst)"
fi` : ""}
if [ -n "$cc_version" ] && [ "$cc_version" != "null" ]; then
  printf '  \u{1F4DF} %sv%s%s' "$(cc_version_color)" "$cc_version" "$(rst)"
fi
if [ -n "$output_style" ] && [ "$output_style" != "null" ]; then
  printf '  \u{1F3A8} %s%s%s' "$(style_color)" "$output_style" "$(rst)"
fi

# Line 2: Context and session time
line2=""${config.features.includes("context") ? `
if [ -n "$context_pct" ]; then
  line2="\u{1F9E0} $(context_color)Context Remaining: \${context_pct}$(rst)"
fi` : ""}${usageConfig.showSession ? `
if [ -n "$session_txt" ]; then
  if [ -n "$line2" ]; then
    line2="$line2  \u231B $(session_color)\${session_txt}$(rst)"
  else
    line2="\u231B $(session_color)\${session_txt}$(rst)"
  fi
fi` : ""}${config.features.includes("context") ? `
if [ -z "$line2" ] && [ -z "$context_pct" ]; then
  line2="\u{1F9E0} $(context_color)Context Remaining: TBD$(rst)"
fi` : ""}

# Line 3: Cost and usage analytics
line3=""${usageConfig.showCost ? `
if [ -n "$cost_usd" ] && [[ "$cost_usd" =~ ^[0-9.]+$ ]]; then${usageConfig.showBurnRate ? `
  if [ -n "$cost_per_hour" ] && [[ "$cost_per_hour" =~ ^[0-9.]+$ ]]; then
    cost_per_hour_formatted=$(printf '%.2f' "$cost_per_hour")
    line3="\u{1F4B0} $(cost_color)\\$$(printf '%.2f' "$cost_usd")$(rst) ($(burn_color)\\$\${cost_per_hour_formatted}/h$(rst))"
  else
    line3="\u{1F4B0} $(cost_color)\\$$(printf '%.2f' "$cost_usd")$(rst)"
  fi` : `
  line3="\u{1F4B0} $(cost_color)\\$$(printf '%.2f' "$cost_usd")$(rst)"`}
fi` : ""}${usageConfig.showTokens ? `
if [ -n "$tot_tokens" ] && [[ "$tot_tokens" =~ ^[0-9]+$ ]]; then${usageConfig.showBurnRate ? `
  if [ -n "$tpm" ] && [[ "$tpm" =~ ^[0-9.]+$ ]]; then
    tpm_formatted=$(printf '%.0f' "$tpm")
    if [ -n "$line3" ]; then
      line3="$line3  \u{1F4CA} $(usage_color)\${tot_tokens} tok (\${tpm_formatted} tpm)$(rst)"
    else
      line3="\u{1F4CA} $(usage_color)\${tot_tokens} tok (\${tpm_formatted} tpm)$(rst)"
    fi
  else
    if [ -n "$line3" ]; then
      line3="$line3  \u{1F4CA} $(usage_color)\${tot_tokens} tok$(rst)"
    else
      line3="\u{1F4CA} $(usage_color)\${tot_tokens} tok$(rst)"
    fi
  fi` : `
  if [ -n "$line3" ]; then
    line3="$line3  \u{1F4CA} $(usage_color)\${tot_tokens} tok$(rst)"
  else
    line3="\u{1F4CA} $(usage_color)\${tot_tokens} tok$(rst)"
  fi`}
fi` : ""}

# Print lines
if [ -n "$line2" ]; then
  printf '\\n%s' "$line2"
fi
if [ -n "$line3" ]; then
  printf '\\n%s' "$line3"
fi
printf '\\n'`;
}

// src/utils/validator.ts
init_esm_shims();
function validateConfig(config) {
  const errors = [];
  const warnings = [];
  if (!config.features || config.features.length === 0) {
    errors.push("At least one display feature must be selected");
  }
  if (!["bash", "python", "node"].includes(config.runtime)) {
    errors.push(`Invalid runtime: ${config.runtime}`);
  }
  if (!["minimal", "detailed", "compact"].includes(config.theme)) {
    errors.push(`Invalid theme: ${config.theme}`);
  }
  const usageFeatures = ["usage", "session", "tokens", "burnrate"];
  const hasUsageFeatures = config.features.some((f) => usageFeatures.includes(f));
  if (hasUsageFeatures && !config.ccusageIntegration) {
    warnings.push("Usage features selected but ccusage integration is disabled. Some features may not work properly.");
  }
  if (config.features.length > 5) {
    warnings.push("Many features selected. This may impact statusline performance.");
  }
  if (config.customEmojis && !config.colors) {
    warnings.push("Custom emojis enabled but colors disabled. Visual distinction may be limited.");
  }
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

// src/utils/installer.ts
init_esm_shims();
import { promises as fs } from "fs";
import path2 from "path";
import os from "os";
import inquirer2 from "inquirer";
async function installStatusline(script, outputPath, config) {
  try {
    const isGlobal = config.installLocation === "global";
    const claudeDir = isGlobal ? path2.join(os.homedir(), ".claude") : "./.claude";
    const scriptPath = path2.join(claudeDir, "statusline.sh");
    await fs.mkdir(claudeDir, { recursive: true });
    let shouldWrite = true;
    try {
      await fs.access(scriptPath);
      const { confirmOverwrite } = await inquirer2.prompt([{
        type: "confirm",
        name: "confirmOverwrite",
        message: `\u26A0\uFE0F  ${isGlobal ? "Global" : "Project"} statusline.sh already exists. Overwrite?`,
        default: false
      }]);
      shouldWrite = confirmOverwrite;
    } catch {
    }
    if (shouldWrite) {
      await fs.writeFile(scriptPath, script, { mode: 493 });
    } else {
      throw new Error("USER_CANCELLED_OVERWRITE");
    }
    await updateSettingsJson(claudeDir, "statusline.sh", isGlobal);
  } catch (error) {
    throw new Error(`Failed to install statusline: ${error instanceof Error ? error.message : String(error)}`);
  }
}
async function updateSettingsJson(claudeDir, scriptName, isGlobal) {
  var _a;
  const settingsPath = path2.join(claudeDir, "settings.json");
  try {
    let settings = {};
    let existingStatusLine = null;
    try {
      const settingsContent = await fs.readFile(settingsPath, "utf-8");
      settings = JSON.parse(settingsContent);
      existingStatusLine = settings.statusLine;
    } catch {
    }
    if (existingStatusLine && existingStatusLine.command) {
      const isOurStatusline = (_a = existingStatusLine.command) == null ? void 0 : _a.includes("statusline.sh");
      if (!isOurStatusline) {
        const { confirmReplace } = await inquirer2.prompt([{
          type: "confirm",
          name: "confirmReplace",
          message: `\u26A0\uFE0F  ${isGlobal ? "Global" : "Project"} settings.json already has a statusLine configured (${existingStatusLine.command}). Replace it?`,
          default: false
        }]);
        if (!confirmReplace) {
          console.warn("\n\u26A0\uFE0F  Statusline script was saved but settings.json was not updated.");
          console.warn("   Your existing statusLine configuration was preserved.");
          return;
        }
      }
    }
    const commandPath = process.platform === "win32" ? `bash ${isGlobal ? ".claude" : ".claude"}/${scriptName}` : isGlobal ? `~/.claude/${scriptName}` : `.claude/${scriptName}`;
    settings.statusLine = {
      type: "command",
      command: commandPath,
      padding: 0
    };
    await fs.writeFile(settingsPath, JSON.stringify(settings, null, 2));
  } catch (error) {
    console.warn(`Warning: Could not update settings.json: ${error instanceof Error ? error.message : String(error)}`);
    throw new Error("SETTINGS_UPDATE_FAILED");
  }
}

// src/cli/commands.ts
import chalk from "chalk";
import ora from "ora";
import path4 from "path";
import os2 from "os";
import { execSync } from "child_process";
function checkJqInstallation() {
  try {
    execSync("command -v jq", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}
function getJqInstallInstructions() {
  const platform = process.platform;
  if (platform === "darwin") {
    return `
${chalk.cyan("\u{1F4E6} Install jq for better performance and reliability:")}

${chalk.green("Using Homebrew (recommended):")}
  brew install jq

${chalk.green("Using MacPorts:")}
  sudo port install jq

${chalk.green("Or download directly:")}
  https://github.com/jqlang/jq/releases
`;
  } else if (platform === "linux") {
    return `
${chalk.cyan("\u{1F4E6} Install jq for better performance and reliability:")}

${chalk.green("Ubuntu/Debian:")}
  sudo apt-get install jq

${chalk.green("CentOS/RHEL/Fedora:")}
  sudo yum install jq

${chalk.green("Arch Linux:")}
  sudo pacman -S jq

${chalk.green("Or download directly:")}
  https://github.com/jqlang/jq/releases
`;
  } else if (platform === "win32") {
    return `
${chalk.cyan("\u{1F4E6} Install jq for better performance and reliability:")}

${chalk.green("Option 1: Using Package Manager")}
  ${chalk.dim("Chocolatey:")} choco install jq
  ${chalk.dim("Scoop:")} scoop install jq

${chalk.green("Option 2: Manual Download")}
  1. Download from: https://github.com/jqlang/jq/releases/latest
  2. Choose file:
     ${chalk.dim("\u2022 64-bit Windows:")} jq-windows-amd64.exe
     ${chalk.dim("\u2022 32-bit Windows:")} jq-windows-i386.exe
  3. Rename to: jq.exe
  4. Move to: C:\\Windows\\System32\\ ${chalk.dim("(or add to PATH)")}
  5. Test: Open new terminal and run: jq --version
`;
  } else {
    return `
${chalk.cyan("\u{1F4E6} Install jq for better performance and reliability:")}

${chalk.green("Download for your platform:")}
  https://github.com/jqlang/jq/releases
`;
  }
}
async function initCommand(options) {
  try {
    const spinner = ora("Initializing statusline generator...").start();
    await new Promise((resolve) => setTimeout(resolve, 500));
    spinner.stop();
    const hasJq = checkJqInstallation();
    if (!hasJq) {
      console.log(chalk.yellow("\n\u26A0\uFE0F  jq is not installed"));
      console.log(chalk.dim("Your statusline will work without jq, but with limited functionality:"));
      console.log(chalk.dim("  \u2022 Context remaining percentage won't be displayed"));
      console.log(chalk.dim("  \u2022 Token statistics may not work"));
      console.log(chalk.dim("  \u2022 Performance will be slower"));
      console.log(getJqInstallInstructions());
      const inquirer3 = (await import("inquirer")).default;
      const { continueWithoutJq } = await inquirer3.prompt([{
        type: "confirm",
        name: "continueWithoutJq",
        message: "Continue without jq?",
        default: true
      }]);
      if (!continueWithoutJq) {
        console.log(chalk.cyan("\n\u{1F44D} Install jq and run this command again"));
        process.exit(0);
      }
    }
    const config = await collectConfiguration();
    const validation = validateConfig(config);
    if (!validation.isValid) {
      console.error(chalk.red("\u274C Configuration validation failed:"));
      validation.errors.forEach((error) => console.error(chalk.red(`   \u2022 ${error}`)));
      process.exit(1);
    }
    const generationSpinner = ora("Generating statusline script...").start();
    const script = generateBashStatusline(config);
    const filename = "statusline.sh";
    generationSpinner.succeed("Statusline script generated!");
    console.log(chalk.cyan("\n\u2728 Your statusline will look like:"));
    console.log(chalk.white("\u2501".repeat(60)));
    const { testStatuslineScript: testStatuslineScript2, generateMockClaudeInput: generateMockClaudeInput2 } = await Promise.resolve().then(() => (init_tester(), tester_exports));
    const mockInput = generateMockClaudeInput2();
    const testResult = await testStatuslineScript2(script, mockInput);
    if (testResult.success) {
      console.log(testResult.output);
    } else {
      console.log(chalk.gray("\u{1F4C1} ~/projects/my-app  \u{1F33F} main  \u{1F916} Claude  \u{1F4B5} $2.48 ($12.50/h)"));
      console.log(chalk.gray("(Preview unavailable - will work when Claude Code runs it)"));
    }
    console.log(chalk.white("\u2501".repeat(60)));
    const isGlobal = config.installLocation === "global";
    const baseDir = isGlobal ? os2.homedir() : ".";
    const outputPath = options.output || path4.join(baseDir, ".claude", filename);
    const resolvedPath = path4.resolve(outputPath);
    if (options.install !== false) {
      console.log(chalk.cyan("\n\u{1F4E6} Installing statusline..."));
      try {
        await installStatusline(script, resolvedPath, config);
        console.log(chalk.green("\n\u2705 Statusline installed!"));
        console.log(chalk.green("\n\u{1F389} Success! Your custom statusline is ready!"));
        console.log(chalk.cyan(`
\u{1F4C1} ${isGlobal ? "Global" : "Project"} installation complete: ${chalk.white(resolvedPath)}`));
        console.log(chalk.cyan("\nNext steps:"));
        console.log(chalk.white("   1. Restart Claude Code to see your new statusline"));
        if (config.features.includes("session")) {
          console.log(chalk.white("   2. Session reset time requires ccusage: npx ccusage@latest"));
        }
      } catch (error) {
        console.log(chalk.red("\n\u274C Failed to install statusline"));
        if (error instanceof Error && error.message === "USER_CANCELLED_OVERWRITE") {
          console.log(chalk.yellow("\n\u26A0\uFE0F  Installation cancelled. Existing statusline.sh was not overwritten."));
        } else if (error instanceof Error && error.message === "SETTINGS_UPDATE_FAILED") {
          const commandPath = isGlobal ? "~/.claude/statusline.sh" : ".claude/statusline.sh";
          console.log(chalk.yellow("\n\u26A0\uFE0F  Settings.json could not be updated automatically."));
          console.log(chalk.cyan("\nManual Configuration Required:"));
          console.log(chalk.white(`Add this to your ${isGlobal ? "~/.claude" : ".claude"}/settings.json file:`));
          console.log(chalk.gray("\n{"));
          console.log(chalk.gray('  "statusLine": {'));
          console.log(chalk.gray('    "type": "command",'));
          console.log(chalk.gray(`    "command": "${commandPath}",`));
          console.log(chalk.gray('    "padding": 0'));
          console.log(chalk.gray("  }"));
          console.log(chalk.gray("}"));
          console.log(chalk.cyan(`
\u{1F4C1} Statusline script saved to: ${chalk.white(resolvedPath)}`));
        } else {
          console.error(chalk.red(`Error: ${error instanceof Error ? error.message : String(error)}`));
          console.log(chalk.cyan(`
\u{1F4C1} You can manually save the script to: ${chalk.white(resolvedPath)}`));
        }
      }
    } else {
      console.log(chalk.green("\n\u2705 Statusline generated successfully!"));
      console.log(chalk.cyan(`
\u{1F4C1} Save this script to: ${chalk.white(resolvedPath)}`));
      console.log(chalk.cyan("\nThen restart Claude Code to see your new statusline."));
    }
  } catch (error) {
    console.error(chalk.red("\u274C An error occurred:"));
    console.error(chalk.red(error instanceof Error ? error.message : String(error)));
    process.exit(1);
  }
}

// src/index.ts
import chalk3 from "chalk";
var VERSION2 = "1.4.0";
var program = new Command();
program.name("cc-statusline").description("Interactive CLI tool for generating custom Claude Code statuslines").version(VERSION2);
program.command("init").description("Create a custom statusline with interactive prompts").option("-o, --output <path>", "Output path for statusline.sh", "./.claude/statusline.sh").option("--no-install", "Don't automatically install to .claude/statusline.sh").action(initCommand);
program.command("preview").description("Preview existing statusline.sh with mock data").argument("<script-path>", "Path to statusline.sh file to preview").action(async (scriptPath) => {
  const { previewCommand: previewCommand2 } = await Promise.resolve().then(() => (init_preview(), preview_exports));
  await previewCommand2(scriptPath);
});
program.command("test").description("Test statusline with real Claude Code JSON input").option("-c, --config <path>", "Configuration file to test").action(() => {
  console.log(chalk3.yellow("Test command coming soon!"));
});
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
program.parse(process.argv);
//# sourceMappingURL=index.js.map