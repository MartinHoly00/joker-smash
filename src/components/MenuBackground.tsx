import "./MenuBackground.css";
import { cardImages } from "../assets/Cards";

export function MenuBackground({ children }: { children: React.ReactNode }) {
  return (
    <div className="menu-background">
      <div className="card-background" aria-hidden>
        {[
          cardImages.back,
          cardImages.hearts.A,
          cardImages.spades.K,
          cardImages.diamonds["10"],
          cardImages.clubs["7"],
          cardImages.joker.red,
          cardImages.joker.black,
          cardImages.hearts["3"],
        ].map((src, i) => (
          <img
            key={i}
            src={src}
            className={`bg-card bg-${i + 1}`}
            alt={String(i)}
          />
        ))}
      </div>
      {children}
    </div>
  );
}
