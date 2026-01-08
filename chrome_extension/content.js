(() => {
  const INLINE_CONTAINER_ID = "analysis-helper-inline";

  const readText = (element) =>
    element ? element.textContent.replace(/\s+/g, " ").trim() : "";

  const isRunnerPage = () =>
    window.location.pathname.endsWith("/lapcenter/lapcombat2/runner.jsp");

  function collectRaceData() {
    const url = window.location.href;
    const urlInfo = new URL(url);
    const eventId = urlInfo.searchParams.get("event") || "";
    const fileId = urlInfo.searchParams.get("file") || "";
    const runnerId = urlInfo.searchParams.get("runner") || "";
    const classId = getClassIdFromLink() || "";

    const legRows = Array.from(document.querySelectorAll("tr.row-leg-body"));
    if (!legRows.length) {
      throw new Error("レッグ情報が見つかりません。");
    }

    const legs = legRows.map((row, index) => {
      const name = readText(row.querySelector(".btn-leg-name")) || `レッグ${index + 1}`;
      const lapTimes = row.querySelectorAll(".split-cell-laptime");
      const time = lapTimes.length ? readText(lapTimes[lapTimes.length - 1]) : "";
      const loss = readText(row.querySelector(".split-cell-loss"));
      const lapRank = readText(row.querySelector(".split-cell-laprank"));
      const totalRank = readText(row.querySelector(".split-cell-elapsedrank"));
      return {
        name,
        time,
        loss,
        lapRank,
        totalRank
      };
    });

    const metaRows = Array.from(document.querySelectorAll("#tblList tbody tr.meta"));
    const meta = {};
    metaRows.forEach((row) => {
      const label = readText(row.querySelector("b"));
      if (!label) {
        return;
      }
      const values = Array.from(row.querySelectorAll("td"))
        .map((cell) => readText(cell))
        .filter(Boolean);
      const value = values.length > 1 ? values[values.length - 1] : "";
      if (value && value !== label) {
        meta[label] = value;
      }
    });

    const runnerName =
      meta["氏名"] ||
      readText(document.querySelector("#selRunner option:checked")) ||
      readText(document.querySelector("title"));

    return {
      url,
      eventId,
      fileId,
      runnerId,
      classId,
      runnerName,
      result: {
        record: meta["記録"] || "",
        speed: meta["巡航速度"] || "",
        missRate: meta["ミス率"] || "",
        totalRank: legs.length ? legs[legs.length - 1].totalRank : ""
      },
      legs
    };
  }

  function attachInlineButton() {
    if (!isRunnerPage() || document.getElementById(INLINE_CONTAINER_ID)) {
      return;
    }

    const anchor =
      document.querySelector(".alert.alert-info") ||
      document.querySelector("#divSelectType");
    if (!anchor) {
      return;
    }

    injectInlineStyles();

    const container = document.createElement("div");
    container.id = INLINE_CONTAINER_ID;
    container.className = "analysis-helper-inline";

    const button = document.createElement("button");
    button.type = "button";
    button.className = "analysis-helper-btn";
    button.textContent = "アナリシス生成";

    const editLink = document.createElement("a");
    editLink.className = "analysis-helper-link";
    editLink.href = "https://simpliconvert.com/markdown_editor/";
    editLink.target = "_blank";
    editLink.rel = "noreferrer";
    editLink.textContent = "ファイルを編集(外部サイト)";

    const status = document.createElement("span");
    status.className = "analysis-helper-status";

    container.append(button, editLink, status);
    anchor.insertAdjacentElement("afterend", container);

    button.addEventListener("click", () => {
      try {
        button.disabled = true;
        status.textContent = "生成中...";
        const data = collectRaceData();
        const markdown = buildMarkdown(data);
        const filename = buildFileName(data);
        downloadMarkdown(markdown, filename);
        status.textContent = "ダウンロードしました。";
      } catch (error) {
        status.textContent = error.message || "生成に失敗しました。";
      } finally {
        window.setTimeout(() => {
          button.disabled = false;
          status.textContent = "";
        }, 1800);
      }
    });
  }

  function injectInlineStyles() {
    if (document.getElementById("analysis-helper-style")) {
      return;
    }
    const style = document.createElement("style");
    style.id = "analysis-helper-style";
    style.textContent = `
      .analysis-helper-inline {
        display: flex;
        align-items: center;
        gap: 10px;
        margin: 6px 0 12px 0;
      }
      .analysis-helper-btn {
        min-width: 120px;
        padding: 6px 10px;
        border-radius: 6px;
        border: 1px solid #ff9d5c;
        font-size: 12px;
        font-weight: 700;
        color: #f06d12;
        background: #ffd4b3;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(240, 109, 18, 0.15);
        transition: all 0.2s ease;
      }
      .analysis-helper-btn:hover {
        background: #ffc299;
        border-color: #ff8a3d;
        color: #c85a0e;
        box-shadow: 0 6px 16px rgba(240, 109, 18, 0.22);
        transform: translateY(-1px);
      }
      .analysis-helper-btn:active {
        transform: translateY(0);
        box-shadow: 0 2px 8px rgba(240, 109, 18, 0.18);
      }
      .analysis-helper-status {
        font-size: 12px;
        color: #1d2b2a;
      }
      .analysis-helper-link {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 6px 10px;
        border-radius: 6px;
        border: 1px solid #ffb380;
        background: #ffe8d6;
        font-size: 12px;
        font-weight: 700;
        color: #f06d12;
        text-decoration: none;
        transition: all 0.2s ease;
      }
      .analysis-helper-link:hover {
        background: #ffd4b3;
        border-color: #ff9d5c;
        color: #c85a0e;
        transform: translateY(-1px);
      }
      .analysis-helper-link:active {
        transform: translateY(0);
      }
    `;
    document.head.append(style);
  }

  function downloadMarkdown(content, filename) {
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    link.style.display = "none";
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
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
    lines.push("---");
    lines.push("");
    lines.push("## 出走前");

    data.legs.forEach((leg, index) => {
      const legName = leg.name || `レッグ${index + 1}`;
      const time = leg.time || "";
      const miss = formatMiss(leg.loss);
      const lapRank = leg.lapRank || "";
      const totalRank = leg.totalRank || "";
      lines.push(
        `## [${legName}] ${time}(${miss}) - 区間${lapRank}位, 総合${totalRank}位`
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

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", attachInlineButton);
  } else {
    attachInlineButton();
  }

  function getClassIdFromLink() {
    const classLink = document.querySelector('a[href*="result-list.jsp"]');
    if (!classLink) {
      return "";
    }
    try {
      const url = new URL(classLink.href);
      return url.searchParams.get("class") || "";
    } catch (error) {
      return "";
    }
  }

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type !== "collectRaceData") {
      return;
    }

    try {
      const data = collectRaceData();
      sendResponse({ ok: true, data });
    } catch (error) {
      sendResponse({
        ok: false,
        error: error.message || "レース情報の取得に失敗しました。"
      });
    }
  });
})();
