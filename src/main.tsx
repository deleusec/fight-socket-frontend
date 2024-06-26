import React from "react";
import ReactDOM from "react-dom/client";
import App from "./views/App";
import FightRoom from "./views/FightRoom";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./assets/styles/index.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/room/:roomId",
    element: <FightRoom />,
  }
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
