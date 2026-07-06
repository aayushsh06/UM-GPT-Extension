import {
  LAST_COMPOSER_TEXT_KEY,
  PENDING_PROMPTS_KEY
} from "../core/config";
import { getLog } from "../core/dom";
import { cleanRawText } from "../core/text";
import type { Feature } from "./types";

type PendingPrompt = {
  text: string;
  time: number;
};

function getPendingPrompts(): PendingPrompt[] {
  try {
    const raw = sessionStorage.getItem(PENDING_PROMPTS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function setPendingPrompts(prompts: PendingPrompt[]): void {
  try {
    sessionStorage.setItem(
      PENDING_PROMPTS_KEY,
      JSON.stringify(prompts.slice(-25))
    );
  } catch {
    // Ignore storage failures.
  }
}

function setLastComposerText(text: string): void {
  try {
    sessionStorage.setItem(LAST_COMPOSER_TEXT_KEY, text || "");
  } catch {
    // Ignore storage failures.
  }
}

function getLastComposerText(): string {
  try {
    return sessionStorage.getItem(LAST_COMPOSER_TEXT_KEY) || "";
  } catch {
    return "";
  }
}

function enqueuePendingPrompt(text: string): void {
  const clean = cleanRawText(text);
  if (!clean) return;

  const prompts = getPendingPrompts();
  const last = prompts[prompts.length - 1];

  // Avoid duplicate captures from input + keydown + pointerdown + click.
  if (last && last.text === clean && Date.now() - last.time < 3500) {
    return;
  }

  prompts.push({
    text: clean,
    time: Date.now()
  });

  setPendingPrompts(prompts);
}

function dequeuePendingPrompt(): string {
  const prompts = getPendingPrompts();
  if (!prompts.length) return "";

  const next = prompts.shift();
  setPendingPrompts(prompts);

  return cleanRawText(next?.text || "");
}

function findComposerTextarea(): HTMLTextAreaElement | null {
  const active = document.activeElement;

  if (active instanceof HTMLTextAreaElement) {
    return active;
  }

  return (
    document.querySelector<HTMLTextAreaElement>(
      'textarea[placeholder*="Ask U-M GPT"]'
    ) ||
    document.querySelector<HTMLTextAreaElement>("main textarea") ||
    document.querySelector<HTMLTextAreaElement>("textarea")
  );
}

function captureComposerPrompt(): void {
  const textarea = findComposerTextarea();

  const value =
    textarea && textarea.value
      ? textarea.value
      : getLastComposerText();

  enqueuePendingPrompt(value);
}

function isSendButton(button: Element | null): boolean {
  if (!(button instanceof HTMLButtonElement)) return false;

  const label = button.getAttribute("aria-label") || "";

  return /send message/i.test(label);
}

function installPromptCaptureListeners(): void {
  if (document.documentElement.dataset.umgptPromptCaptureReady === "true") {
    return;
  }

  document.documentElement.dataset.umgptPromptCaptureReady = "true";

  // Continuously cache exactly what the user typed.
  document.addEventListener(
    "input",
    (event) => {
      if (event.target instanceof HTMLTextAreaElement) {
        setLastComposerText(event.target.value || "");
      }
    },
    true
  );

  // Capture Enter-to-send before the app mutates or clears the textarea.
  document.addEventListener(
    "keydown",
    (event) => {
      if (
        event.key === "Enter" &&
        !event.shiftKey &&
        !event.metaKey &&
        !event.ctrlKey &&
        event.target instanceof HTMLTextAreaElement
      ) {
        setLastComposerText(event.target.value || "");
        captureComposerPrompt();
      }
    },
    true
  );

  // Capture button sends as early as possible.
  ["pointerdown", "mousedown", "touchstart", "click"].forEach((type) => {
    document.addEventListener(
      type,
      (event) => {
        const target = event.target;

        if (!(target instanceof Element)) return;

        const button = target.closest("button");

        if (isSendButton(button)) {
          captureComposerPrompt();
        }
      },
      true
    );
  });

  document.addEventListener(
    "submit",
    () => {
      captureComposerPrompt();
    },
    true
  );
}

export function getRawPromptText(
  markdown: HTMLElement | null,
  wrapper?: HTMLElement | null
): string {
  if (!markdown) return "";

  if (markdown.dataset.umgptRawText) {
    return cleanRawText(markdown.dataset.umgptRawText);
  }

  if (wrapper?.dataset.umgptRawText) {
    return cleanRawText(wrapper.dataset.umgptRawText);
  }

  const captured = dequeuePendingPrompt();

  if (captured) {
    return captured;
  }

  /*
    Fallback only.

    Do NOT convert rendered HTML into Markdown.
    Do NOT render Markdown.
    Do NOT infer "# heading" from an <h1>.

    If U-M GPT already rendered the source before we captured it,
    exact raw HTML like <h1>Test HTML</h1> may already be lost.
    In that case, visible plain text is the safest fallback.
  */
  return cleanRawText(markdown.innerText || markdown.textContent || "");
}

function rawifyUserPrompts(): void {
  const log = getLog();
  if (!log) return;

  const userWrappers = log.querySelectorAll<HTMLElement>(
    ':scope > div[data-umgpt-role="user"]'
  );

  userWrappers.forEach((wrapper) => {
    const markdown = wrapper.querySelector<HTMLElement>(".markdown-body");
    if (!markdown) return;

    const raw = getRawPromptText(markdown, wrapper);
    if (!raw) return;

    wrapper.dataset.umgptPromptRawReady = "true";
    wrapper.dataset.umgptRawText = raw;

    markdown.dataset.umgptRawText = raw;
    markdown.classList.remove("umgpt-safe-markdown-prompt");
    markdown.classList.add("umgpt-raw-prompt-text");

    const currentlyDisplayed = markdown.textContent || "";
    const hasRenderedElements = markdown.children.length > 0;

    const alreadyRaw =
      currentlyDisplayed === raw &&
      !hasRenderedElements &&
      markdown.dataset.umgptLastRenderedRaw === raw;

    if (alreadyRaw) return;

    /*
      Force raw text display every time the app tries to re-render it.

      This intentionally does NOT render Markdown.
      This intentionally does NOT render HTML.
      This intentionally does NOT convert HTML DOM to Markdown.

      Examples:
      ## Test Markdown        -> displayed literally
      <h1>Test HTML</h1>      -> displayed literally
    */
    markdown.textContent = raw;
    markdown.dataset.umgptLastRenderedRaw = raw;
  });
}

export const promptRawFeature: Feature = {
  init: installPromptCaptureListeners,
  run: rawifyUserPrompts
};