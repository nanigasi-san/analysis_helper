const analyzeButton = document.getElementById("analyzeButton");
const pageStatus = document.getElementById("pageStatus");
const message = document.getElementById("message");

let activeTab = null;
let isReady = false;

document.addEventListener("DOMContentLoaded", () => {
  analyzeButton.addEventListener("click", handleAnalyze);
  init();
});

async function init() {
  activeTab = await getActiveTab();
  if (!activeTab || !activeTab.url) {
    updateStatus({
      ok: false,
      label: "対象ページを取得できませんでした。",
      message: "LapCenterの記録ページを開いてから再度お試しください。"
    });
    return;
  }

  const evaluation = evaluateUrl(activeTab.url);
  updateStatus(evaluation);
}

function updateStatus({ ok, label, message: hint }) {
  pageStatus.textContent = label;
  pageStatus.classList.toggle("ok", ok);
  pageStatus.classList.toggle("bad", !ok);
  analyzeButton.classList.toggle("is-hidden", !ok);
  analyzeButton.disabled = !ok;
  isReady = ok;
  message.textContent = hint || "";
  message.className = `message ${ok ? "" : "bad"}`.trim();
}

async function handleAnalyze() {
  if (!isReady || !activeTab?.id) {
    return;
  }

  setLoading(true);
  try {
    const data = await collectFromTab(activeTab.id);
    const markdown = buildMarkdown(data);
    const filename = buildFileName(data);
    await downloadMarkdown(markdown, filename);
    showMessage("ダウンロードを開始しました。", "ok");
  } catch (error) {
    showMessage(error.message || "解析に失敗しました。", "bad");
  } finally {
    setLoading(false);
  }
}

function setLoading(isLoading) {
  analyzeButton.disabled = isLoading;
  analyzeButton.textContent = isLoading ? "生成中..." : "アナリシス生成";
}

function showMessage(text, tone) {
  message.textContent = text;
  message.className = `message ${tone || ""}`.trim();
}

function evaluateUrl(url) {
  try {
    const parsed = new URL(url);
    const isTarget =
      parsed.hostname === "mulka2.com" &&
      parsed.pathname.endsWith("/lapcenter/lapcombat2/runner.jsp");
    if (!isTarget) {
      return {
        ok: false,
        label: "対象外のページ",
        message: "LapCenterの記録ページ (runner.jsp) を開いてください。"
      };
    }
    return {
      ok: true,
      label: parsed.href,
      message: ""
    };
  } catch (error) {
    return {
      ok: false,
      label: "URLを取得できませんでした。",
      message: "対象ページを開いた状態で再度お試しください。"
    };
  }
}

function getActiveTab() {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      resolve(tabs[0]);
    });
  });
}

function collectFromTab(tabId) {
  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(tabId, { type: "collectRaceData" }, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      if (!response || !response.ok) {
        reject(new Error(response?.error || "解析データを取得できませんでした。"));
        return;
      }
      resolve(response.data);
    });
  });
}

function downloadMarkdown(content, filename) {
  return new Promise((resolve, reject) => {
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    chrome.downloads.download(
      {
        url,
        filename,
        saveAs: true
      },
      (downloadId) => {
        if (chrome.runtime.lastError) {
          URL.revokeObjectURL(url);
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        resolve(downloadId);
      }
    );
  });
}

function buildFileName(data) {
  const parts = [];
  if (data.eventId) {
    parts.push(`event-${data.eventId}`);
  }
  if (data.runnerName) {
    parts.push(data.runnerName);
  }
  const base = sanitizeFileName(parts.join("_")) || "analysis";
  return `${base}.md`;
}

function sanitizeFileName(value) {
  return value
    .replace(/[\\/:*?"<>|]/g, "_")
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function formatMiss(value) {
  const trimmed = (value || "").trim();
  if (!trimmed) {
    return "";
  }
  if (trimmed.startsWith("-") || trimmed.startsWith("+")) {
    return trimmed;
  }
  return `+${trimmed}`;
}

function buildMarkdown(data) {
  const lines = [];
  const raceTitle = data.raceTitle || "レース名 - コース";

  lines.push(`> **レース URL**：[${data.url}](${data.url})`);
  lines.push("");
  lines.push(`# ${raceTitle}`);
  lines.push("## レース結果");
  lines.push(`+ 氏名: ${data.runnerName || ""}`);
  lines.push(`+ 総合タイム: ${data.result.record || ""}`);
  lines.push(`+ 順位: ${data.result.totalRank || ""}`);
  lines.push(`+ 巡航速度: ${data.result.speed || ""}`);
  lines.push(`+ ミス率: ${data.result.missRate || ""}`);
  lines.push("");
  lines.push("## 出走前");

  data.legs.forEach((leg, index) => {
    const legName = leg.name || `レッグ${index + 1}`;
    const time = leg.time || "";
    const miss = formatMiss(leg.loss);
    const lapRank = leg.lapRank || "";
    const totalRank = leg.totalRank || "";
    lines.push(
      `## ${legName} ${time}(${miss}) - 区間${lapRank}位, 総合${totalRank}位`
    );
    lines.push("#### [Plan]");
    lines.push("#### [Do]");
    lines.push("#### [Analysis]");
  });

  lines.push("## 課題と対策");
  lines.push("## 総括");
  lines.push("");
  return lines.join("\n");
}
