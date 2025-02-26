import { createTheme } from '@mui/material/styles';
import { blue, cyan } from '@mui/material/colors';

export const theme = createTheme({
  palette: {
    primary: blue,
    secondary: cyan,
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: `linear-gradient(45deg, ${blue[700]} 30%, ${cyan[500]} 90%)`,
        },
      },
    },
  },
});