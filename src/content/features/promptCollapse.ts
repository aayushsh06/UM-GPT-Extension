import { LONG_PROMPT_CHAR_LIMIT } from "../core/config";
import { getLog } from "../core/dom";
import { getRawPromptText } from "./promptRaw";
import type { Feature } from "./types";

function collapseLongUserPrompts(): void {
  const log = getLog();
  if (!log) return;

  const userWrappers = log.querySelectorAll<HTMLElement>(
    ':scope > div[data-umgpt-role="user"]'
  );

  userWrappers.forEach((wrapper) => {
    if (wrapper.dataset.umgptPromptCollapseReady === "true") return;

    const markdown = wrapper.querySelector<HTMLElement>(".markdown-body");
    if (!markdown) return;

    const text = getRawPromptText(markdown, wrapper);
    if (text.length < LONG_PROMPT_CHAR_LIMIT) return;

    const bubble =
      markdown.closest<HTMLElement>('[class*="rounded-3xl"]') ||
      markdown.closest<HTMLElement>('[class*="overflow-x-auto"]');

    if (!bubble) return;

    wrapper.dataset.umgptPromptCollapseReady = "true";
    bubble.classList.add("umgpt-collapsible-prompt", "umgpt-is-collapsed");

    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "umgpt-prompt-toggle";
    toggle.textContent = "Show more";
    toggle.setAttribute("aria-expanded", "false");

    toggle.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();

      const collapsed = bubble.classList.toggle("umgpt-is-collapsed");

      toggle.textContent = collapsed ? "Show more" : "Show less";
      toggle.setAttribute("aria-expanded", collapsed ? "false" : "true");
    });

    bubble.appendChild(toggle);
  });
}

export const promptCollapseFeature: Feature = {
  run: collapseLongUserPrompts
};