import { HISTORY_TITLE_CHAR_LIMIT } from "../core/config";
import { cleanText, getNodeText } from "../core/text";
import type { Feature } from "./types";

function extractQuestionTitle(rawTitle: string): string {
  let title = cleanText(rawTitle);

  title = title.replace(/^Select Conversation:\s*/i, "");

  if (/^Question:/i.test(title)) {
    title = title.replace(/^Question:\s*/i, "");

    const responseSplit = title.search(/\sResponse:\s/i);

    if (responseSplit > -1) {
      title = title.slice(0, responseSplit);
    }

    title = title.replace(/\.\s*$/g, "");
  }

  return cleanText(title);
}

function compactSidebarHistory(): void {
  const conversationLinks =
    document.querySelectorAll<HTMLAnchorElement>('a[id^="conversation-"]');

  conversationLinks.forEach((link) => {
    if (link.dataset.umgptHistoryReady === "true") return;

    const raw =
      link.getAttribute("title") ||
      link.getAttribute("aria-label") ||
      getNodeText(link);

    const extracted = extractQuestionTitle(raw);
    if (!extracted) return;

    const titleNode = link.querySelector<HTMLElement>(".truncate");
    if (!titleNode) return;

    link.dataset.umgptHistoryReady = "true";
    link.dataset.umgptFullTitle = extracted;
    link.classList.add("umgpt-history-link");

    titleNode.classList.add("umgpt-history-title");
    titleNode.textContent = extracted;

    link.setAttribute("title", extracted);
    link.setAttribute("aria-label", `Select Conversation: ${extracted}`);

    if (extracted.length > HISTORY_TITLE_CHAR_LIMIT) {
      link.classList.add("umgpt-history-long");
    }
  });
}

export const sidebarHistoryFeature: Feature = {
  run: compactSidebarHistory
};