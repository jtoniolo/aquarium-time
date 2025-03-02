"use client";

import { ReactNode } from "react";
import StoreProvider from "../StoreProvider";
import ThemeRegistry from "../ThemeRegistry";
import RootLayoutClient from "./RootLayoutClient";

export default function LayoutRoot({ children }: { children: ReactNode }) {
  return (
    <StoreProvider>
      <ThemeRegistry>
        <RootLayoutClient>{children}</RootLayoutClient>
      </ThemeRegistry>
    </StoreProvider>
  );
}
