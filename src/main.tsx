import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { DeckProvider } from "./providers/deckProvider.tsx";
import { AuthProvider } from "./providers/UserProvider.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <DeckProvider numberOfDecks={2}>
        <App />
      </DeckProvider>
    </AuthProvider>
  </StrictMode>
);
