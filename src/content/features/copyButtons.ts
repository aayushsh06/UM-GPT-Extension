import { copyText } from "../core/clipboard";
import { getLog } from "../core/dom";
import { getCodeText, getNodeText } from "../core/text";
import { makeIconButton } from "../ui/buttons";
import { getRawPromptText } from "./promptRaw";
import type { Feature } from "./types";

function addCopyButtonsToCodeBlocks(): void {
  const codeBlocks =
    document.querySelectorAll<HTMLElement>(".markdown-body pre");

  codeBlocks.forEach((pre) => {
    if (pre.dataset.umgptCopyReady === "true") return;

    pre.dataset.umgptCopyReady = "true";
    pre.classList.add("umgpt-code-copy-container");

    const code = pre.querySelector<HTMLElement>("code") || pre;

    const button = makeIconButton({
      label: "Copy code",
      title: "Copy code",
      className: "umgpt-code-copy-btn",
      onClick: (_, btn) => copyText(getCodeText(code), btn)
    });

    pre.appendChild(button);
  });
}

function addCopyButtonsToMessages(): void {
  const log = getLog();
  if (!log) return;

  const wrappers = log.querySelectorAll<HTMLElement>(
    ":scope > div[data-umgpt-role]"
  );

  wrappers.forEach((wrapper) => {
    if (wrapper.dataset.umgptMessageCopyReady === "true") return;

    const markdown = wrapper.querySelector<HTMLElement>(".markdown-body");
    if (!markdown) return;

    const role = wrapper.dataset.umgptRole;

    const messageContainer =
      markdown.closest<HTMLElement>('[class*="overflow-x-auto"]') ||
      markdown.parentElement;

    if (!messageContainer) return;

    wrapper.dataset.umgptMessageCopyReady = "true";
    messageContainer.classList.add("umgpt-message-copy-container");

    const button = makeIconButton({
      label: role === "user" ? "Copy prompt" : "Copy response",
      title: role === "user" ? "Copy prompt" : "Copy response",
      className: "umgpt-message-copy-btn",
      onClick: (_, btn) => {
        if (role === "user") {
          copyText(getRawPromptText(markdown, wrapper), btn);
        } else {
          copyText(getNodeText(markdown), btn);
        }
      }
    });

    messageContainer.appendChild(button);
  });
}

function addCopyWholeChatButton(): void {
  const header =
    document.querySelector<HTMLElement>('[class*="@container/header"]');
  const log = getLog();

  if (!header || !log) return;
  if (header.querySelector(".umgpt-copy-chat-btn")) return;

  const button = makeIconButton({
    label: "Copy visible chat",
    title: "Copy visible chat",
    className: "umgpt-copy-chat-btn",
    onClick: (_, btn) => {
      const parts: string[] = [];

      const wrappers = log.querySelectorAll<HTMLElement>(
        ":scope > div[data-umgpt-role]"
      );

      wrappers.forEach((wrapper) => {
        const role =
          wrapper.dataset.umgptRole === "user" ? "User" : "Assistant";
        const markdown = wrapper.querySelector<HTMLElement>(".markdown-body");

        if (!markdown) return;

        const text =
          wrapper.dataset.umgptRole === "user"
            ? getRawPromptText(markdown, wrapper)
            : getNodeText(markdown);

        if (text) {
          parts.push(`${role}:\n${text}`);
        }
      });

      copyText(parts.join("\n\n---\n\n"), btn);
    }
  });

  header.appendChild(button);
}

export const copyButtonsFeature: Feature = {
  run() {
    addCopyButtonsToCodeBlocks();
    addCopyButtonsToMessages();
    addCopyWholeChatButton();
  }
};