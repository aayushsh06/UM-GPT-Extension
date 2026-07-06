type IconButtonOptions = {
  label: string;
  title?: string;
  className?: string;
  onClick?: (event: MouseEvent, button: HTMLButtonElement) => void;
};

export function makeIconButton({
  label,
  title,
  className = "",
  onClick
}: IconButtonOptions): HTMLButtonElement {
  const button = document.createElement("button");

  button.type = "button";
  button.className = `umgpt-copy-icon-btn ${className}`.trim();
  button.setAttribute("aria-label", label);
  button.setAttribute("title", title || label);

  button.innerHTML = `
    <svg viewBox="0 0 24 24" aria-hidden="true" class="umgpt-copy-svg">
      <path fill="currentColor" d="M16 1H4a2 2 0 0 0-2 2v12h2V3h12V1Zm3 4H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Zm0 16H8V7h11v14Z"/>
    </svg>
  `;

  button.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    onClick?.(event, button);
  });

  return button;
}