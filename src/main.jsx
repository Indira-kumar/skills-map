import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import SkillsMap from "./SkillsMap";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <SkillsMap />
  </StrictMode>
);
