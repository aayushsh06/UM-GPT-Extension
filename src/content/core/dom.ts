import { BODY_CLASS, ROOT_CLASS } from "./config";

export function addRootClass(): void {
  document.documentElement.classList.add(ROOT_CLASS);
}

export function addBodyClass(): void {
  if (document.body) {
    document.body.classList.add(BODY_CLASS);
  }
}

export function markApp(): void {
  const app = document.querySelector<HTMLElement>("#app");

  if (app) {
    app.dataset.umgptPolished = "true";
  }
}

export function getLog(): HTMLElement | null {
  return document.querySelector<HTMLElement>('[role="log"]');
}

export function markMessageBlocks(): void {
  const log = getLog();
  if (!log) return;

  const messageWrappers = log.querySelectorAll<HTMLElement>(":scope > div");

  messageWrappers.forEach((wrapper) => {
    const userAligned = wrapper.querySelector('[class~="items-end"]');
    const assistantAligned = wrapper.querySelector('[class~="items-start"]');

    if (userAligned) {
      wrapper.dataset.umgptRole = "user";
    } else if (assistantAligned) {
      wrapper.dataset.umgptRole = "assistant";
    }
  });
}