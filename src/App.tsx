import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./App.css";
import { HomePage } from "./pages/HomePage";
import { LocalGame } from "./pages/LocalGame";
import { OnlineGame } from "./pages/OnlineGame";
import { CreateOnlineGame } from "./pages/CreateOnlineGame";
import { BASE_URL } from "./config";

function App() {
  const router = createBrowserRouter(
    [
      { path: "/", element: <HomePage /> },
      { path: "/how-to-play", element: null },
      { path: "/local", element: <LocalGame /> },
      { path: "/online/:id", element: <OnlineGame /> },
      { path: "/create-online", element: <CreateOnlineGame /> },
    ],
    { basename: BASE_URL }
  );
  return <RouterProvider router={router} />;
}

export default App;
