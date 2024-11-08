import { createBrowserRouter } from "react-router-dom";

import { HooksPage } from "./routes/hooks.tsx";
import { UseApiPage } from "./routes/hooks/use-api.tsx";
import { UseEffectAfterMountPage } from "./routes/hooks/use-effect-after-mount.tsx";
import { Root } from "./routes/root.tsx";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
  },
  {
    path: "/hooks",
    element: <HooksPage />,
    children: [
      {
        path: "/hooks/use-effect-after-mount",
        element: <UseEffectAfterMountPage />,
      },
      {
        path: "/hooks/use-api",
        element: <UseApiPage />,
      },
    ],
  },
]);
