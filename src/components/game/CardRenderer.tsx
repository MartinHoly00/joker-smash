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
      src={cardPath}
      className={`${combinedClassName} ${
        isHoverable ? "play-card--hoverable" : ""
      } 
        ${isSelected ? "play-card--selected" : ""}`}
      {...props}
    />
  );
}
