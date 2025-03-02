"use client";

import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import NavigationTabs from "./NavigationTabs";
import InitialDataLoader from "./InitialDataLoader";
import { type PropsWithChildren } from "react";

export default function RootLayoutClient({ children }: PropsWithChildren) {
  return (
    <>
      <InitialDataLoader />
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Aquarium Sun
            </Typography>
          </Toolbar>
          <NavigationTabs />
        </AppBar>
      </Box>
      <Box component="main" sx={{ p: 3 }}>
        {children}
      </Box>
    </>
  );
}
