import {
  addBodyClass,
  addRootClass,
  markApp,
  markMessageBlocks
} from "./core/dom";
import { features } from "./features";

function run(): void {
  addBodyClass();
  markApp();

  /*
    Important order:
    1. Mark message roles.
    2. Run promptRaw first through feature order.
    3. Add utility UI.
  */
  markMessageBlocks();

  features.forEach((feature) => {
    feature.run();
  });
}

function init(): void {
  addRootClass();
  addBodyClass();
  markApp();

  features.forEach((feature) => {
    feature.init?.();
  });

  run();
  observe();
}

let scheduled = false;

function scheduleRun(): void {
  if (scheduled) return;

  scheduled = true;

  requestAnimationFrame(() => {
    scheduled = false;
    run();
  });
}

function observe(): void {
  const observer = new MutationObserver(scheduleRun);

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true
  });
}

init();