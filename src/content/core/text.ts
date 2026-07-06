export function cleanText(text: string | null | undefined): string {
  return (text || "")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function cleanRawText(text: string | null | undefined): string {
  return (text || "")
    .replace(/\u00a0/g, " ")
    .replace(/\n{4,}/g, "\n\n\n")
    .trim();
}

export function getNodeText(node: HTMLElement | null): string {
  if (!node) return "";

  if (node.dataset.umgptRawText) {
    return cleanRawText(node.dataset.umgptRawText);
  }

  return cleanText(node.innerText || node.textContent || "");
}

export function getCodeText(node: HTMLElement | null): string {
  if (!node) return "";

  const clone = node.cloneNode(true) as HTMLElement;

  clone
    .querySelectorAll(
      ".umgpt-copy-icon-btn, .umgpt-code-copy-btn, .umgpt-message-copy-btn, .umgpt-copy-chat-btn, .umgpt-prompt-toggle"
    )
    .forEach((el) => el.remove());

  return cleanRawText(clone.textContent || "");
}