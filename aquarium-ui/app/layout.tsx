import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import StoreProvider from './StoreProvider';
import ThemeRegistry from './ThemeRegistry';
import NavigationTabs from './components/NavigationTabs';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aquarium Sun",
  description: "Control your aquarium lights naturally",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} style={{ margin: 0 }}>
        <StoreProvider>
          <ThemeRegistry>
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
          </ThemeRegistry>
        </StoreProvider>
      </body>
    </html>
  );
}
