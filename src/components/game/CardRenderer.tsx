import type { ImgHTMLAttributes } from "react";
import "./CardRenderer.css";

type CardRendererProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  cardPath: string;
  isHoverable: boolean;
  isSelected?: boolean;
};

export function CardRenderer({
  cardPath,
  className,
  isHoverable,
  isSelected,
  ...props
}: CardRendererProps) {
  const combinedClassName = ["play-card", className].filter(Boolean).join(" ");
  return (
    <img
      src={new URL(cardPath, import.meta.url).href}
      className={`${combinedClassName}
        
        ${
          isSelected
            ? "play-card--selected"
            : isHoverable
            ? "play-card--hoverable"
            : ""
        }`}
      {...props}
    />
  );
}
