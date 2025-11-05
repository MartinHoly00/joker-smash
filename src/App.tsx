import { createHashRouter, RouterProvider } from "react-router-dom";
import "./App.css";
import { HomePage } from "./pages/HomePage";
import { OnlineGame } from "./pages/OnlineGame";
import { CreateOnlineGame } from "./pages/CreateOnlineGame";
import { InfoPage } from "./pages/InfoPage";
import { RoomList } from "./pages/RoomList";
import { Toaster } from "sonner";

function App() {
  const router = createHashRouter([
    { path: "/", element: <HomePage /> },
    { path: "/info", element: <InfoPage /> },
    { path: "/online/:id", element: <OnlineGame /> },
    { path: "/create-online", element: <CreateOnlineGame /> },
    { path: "/rooms", element: <RoomList /> },
  ]);
  return (
    <>
      <RouterProvider router={router} />
      <Toaster position="bottom-left" richColors />
    </>
  );
}

export default App;
