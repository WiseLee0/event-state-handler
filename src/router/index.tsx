import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { CanvasPage } from "@/pages/canvas/index.tsx";
const router = createBrowserRouter([
  {
    path: "/",
    element: <CanvasPage />,
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />
}
