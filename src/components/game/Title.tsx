import "./Title.css";

export function Title({ text }: { text: string }) {
  return <h1 className="menu-title">{text}</h1>;
}
