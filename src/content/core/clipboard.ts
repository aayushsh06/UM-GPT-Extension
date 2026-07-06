import { cleanRawText } from "./text";

export async function copyText(
  text: string,
  button?: HTMLButtonElement | null
): Promise<void> {
  const clean = cleanRawText(text);
  if (!clean) return;

  try {
    await navigator.clipboard.writeText(clean);
    temporarilyMarkCopied(button);
  } catch {
    fallbackCopyText(clean);
    temporarilyMarkCopied(button);
  }
}

function fallbackCopyText(text: string): void {
  const textarea = document.createElement("textarea");

  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.top = "-9999px";
  textarea.style.left = "-9999px";

  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}

export function temporarilyMarkCopied(
  button?: HTMLButtonElement | null
): void {
  if (!button) return;

  const oldLabel = button.getAttribute("aria-label");
  const oldTitle = button.getAttribute("title");

  button.classList.add("umgpt-copied");
  button.setAttribute("aria-label", "Copied");
  button.setAttribute("title", "Copied");

  window.setTimeout(() => {
    button.classList.remove("umgpt-copied");

    if (oldLabel) button.setAttribute("aria-label", oldLabel);
    if (oldTitle) button.setAttribute("title", oldTitle);
  }, 300);
}