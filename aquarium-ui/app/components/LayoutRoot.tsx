"use client";

import { Container } from "@mui/material";
import { ReactNode } from "react";
import StoreProvider from "../StoreProvider";
import ThemeRegistry from "../ThemeRegistry";
import InitialDataLoader from "./InitialDataLoader";
import RootLayoutClient from "./RootLayoutClient";

export default function LayoutRoot({ children }: { children: ReactNode }) {
  return (
    <StoreProvider>
      <InitialDataLoader />
      <ThemeRegistry>
        <RootLayoutClient>{children}</RootLayoutClient>
      </ThemeRegistry>
    </StoreProvider>
  );
}
