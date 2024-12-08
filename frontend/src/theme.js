import { createContext, useState, useMemo } from "react";
import { createTheme } from "@mui/material/styles";

// color design tokens export
export const tokens = (mode) => ({
  ...(mode === "dark"
    ? {
        grey: {
          100: "#e0e0e0",
          200: "#c2c2c2",
          300: "#a3a3a3",
          400: "#858585",
          500: "#666666",
          600: "#525252",
          700: "#3d3d3d",
          800: "#292929",
          900: "#141414",
        },
        contrast: { 100: "#fff", 200: "#ccc" },
        primary: {
          100: "#d0d1d5",
          200: "#a1a4ab",
          300: "#727681",
          400: "#1F2A40",
          500: "#141b2d",
          600: "#101624",
          700: "#0c101b",
          800: "#080b12",
          900: "#040509",
        },
        omegaDeluxPurple: {
          100: "#f1e1f0",
          200: "#e3c3e1",
          300: "#d4a4d2",
          400: "#c686c3",
          500: "#b868b4",
          600: "#935390",
          700: "#6e3e6c",
          800: "#4a2a48",
          900: "#251524",
        },
        greenAccent: {
          100: "#dbf5ee",
          200: "#b7ebde",
          300: "#94e2cd",
          400: "#70d8bd",
          500: "#4cceac",
          600: "#3da58a",
          700: "#2e7c67",
          800: "#1e5245",
          900: "#0f2922",
        },
        ciboInnerGreen: {
          100: "#e3f0e1",
          200: "#c7e1c3",
          300: "#abd3a5",
          400: "#8fc487",
          500: "#73b569",
          600: "#5c9154",
          700: "#456d3f",
          800: "#2e482a",
          900: "#172415",
        },
        ciboOuterGreen: {
          100: "#cce5d9",
          200: "#99ccb4",
          300: "#66b28e",
          400: "#339969",
          500: "#007f43",
          600: "#006636",
          700: "#004c28",
          800: "#00331b",
          900: "#00190d",
        },
        redAccent: {
          100: "#f8dcdb",
          200: "#f1b9b7",
          300: "#e99592",
          400: "#e2726e",
          500: "#db4f4a",
          600: "#af3f3b",
          700: "#832f2c",
          800: "#58201e",
          900: "#2c100f",
        },
        yoggieRed: {
          100: "#ffdfdb",
          200: "#ffbfb7",
          300: "#ff9e94",
          400: "#ff7e70",
          500: "#ff5e4c",
          600: "#cc4b3d",
          700: "#99382e",
          800: "#66261e",
          900: "#33130f",
        },
        crusta: {
          50: "#fff5ed",
          100: "#fee8d6",
          200: "#fcceac",
          300: "#faab77",
          400: "#f77838",
          500: "#f55b1a",
          600: "#e64010",
          700: "#be2e10",
          800: "#972615",
          900: "#7a2214",
          950: "#420e08",
        },
        orangeAccent: {
          100: "#FFE0B2",
          200: "#FFCC80",
          300: "#FFB74D",
          400: "#FFA726",
          500: "#FF9800",
          600: "#FB8C00",
          700: "#F57C00",
          800: "#EF6C00",
          900: "#E65100",
        },
        blueAccent: {
          100: "#e1e2fe",
          200: "#c3c6fd",
          300: "#a4a9fc",
          400: "#868dfb",
          500: "#6870fa",
          600: "#535ac8",
          700: "#3e4396",
          800: "#2a2d64",
          900: "#151632",
        },
      }
    : {
        grey: {
          100: "#141414",
          200: "#292929",
          300: "#3d3d3d",
          400: "#525252",
          500: "#666666",
          600: "#858585",
          700: "#a3a3a3",
          800: "#c2c2c2",
          900: "#e0e0e0",
        },
        contrast: { 100: "#000", 200: "#333" },
        primary: {
          100: "#040509",
          200: "#080b12",
          300: "#0c101b",
          400: "#f2f0f0", // manually changed
          500: "#141b2d",
          600: "#1F2A40",
          700: "#727681",
          800: "#a1a4ab",
          900: "#d0d1d5",
        },
        omegaDeluxPurple: {
          100: "#251524",
          200: "#4a2a48",
          300: "#6e3e6c",
          400: "#935390",
          500: "#b868b4",
          600: "#c686c3",
          700: "#d4a4d2",
          800: "#e3c3e1",
          900: "#f1e1f0",
        },
        greenAccent: {
          100: "#0f2922",
          200: "#1e5245",
          300: "#2e7c67",
          400: "#3da58a",
          500: "#4cceac",
          600: "#70d8bd",
          700: "#94e2cd",
          800: "#b7ebde",
          900: "#dbf5ee",
        },
        ciboInnerGreen: {
          100: "#172415",
          200: "#2e482a",
          300: "#456d3f",
          400: "#5c9154",
          500: "#73b569",
          600: "#8fc487",
          700: "#abd3a5",
          800: "#c7e1c3",
          900: "#e3f0e1",
        },
        ciboOuterGreen: {
          100: "#00190d",
          200: "#00331b",
          300: "#004c28",
          400: "#006636",
          500: "#007f43",
          600: "#339969",
          700: "#66b28e",
          800: "#99ccb4",
          900: "#cce5d9",
        },
        redAccent: {
          100: "#2c100f",
          200: "#58201e",
          300: "#832f2c",
          400: "#af3f3b",
          500: "#db4f4a",
          600: "#e2726e",
          700: "#e99592",
          800: "#f1b9b7",
          900: "#f8dcdb",
        },
        yoggieRed: {
          100: "#33130f",
          200: "#66261e",
          300: "#99382e",
          400: "#cc4b3d",
          500: "#ff5e4c",
          600: "#ff7e70",
          700: "#ff9e94",
          800: "#ffbfb7",
          900: "#ffdfdb",
        },
        crusta: {
          950: "#fff5ed",
          900: "#fee8d6",
          800: "#fcceac",
          700: "#faab77",
          600: "#f77838",
          500: "#f55b1a",
          400: "#e64010",
          300: "#be2e10",
          200: "#972615",
          100: "#7a2214",
          50: "#420e08",
        },

        orangeAccent: {
          100: "#E65100",
          200: "#EF6C00",
          300: "#F57C00",
          400: "#FB8C00",
          500: "#FF9800",
          600: "#FFA726",
          700: "#FFB74D",
          800: "#FFCC80",
          900: "#FFE0B2",
        },
        blueAccent: {
          100: "#151632",
          200: "#2a2d64",
          300: "#3e4396",
          400: "#535ac8",
          500: "#6870fa",
          600: "#868dfb",
          700: "#a4a9fc",
          800: "#c3c6fd",
          900: "#e1e2fe",
        },
      }),
});

// mui theme settings
export const themeSettings = (mode) => {
  const colors = tokens(mode);
  return {
    palette: {
      mode: mode,
      ...(mode === "dark"
        ? {
            // palette values for dark mode
            primary: {
              main: colors.primary[500],
            },
            secondary: {
              main: colors.crusta[400],
            },
            neutral: {
              dark: colors.grey[700],
              main: colors.grey[500],
              light: colors.grey[100],
            },
            background: {
              default: colors.primary[500],
            },
          }
        : {
            // palette values for light mode
            primary: {
              main: colors.primary[100],
            },
            secondary: {
              main: colors.crusta[500],
            },
            neutral: {
              dark: colors.grey[700],
              main: colors.grey[500],
              light: colors.grey[100],
            },
            background: {
              default: "#fcfcfc",
            },
          }),
    },
    typography: {
      fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
      fontSize: 12,
      h1: {
        fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
        fontSize: 40,
      },
      h2: {
        fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
        fontSize: 32,
      },
      h3: {
        fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
        fontSize: 24,
      },
      h4: {
        fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
        fontSize: 20,
      },
      h5: {
        fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
        fontSize: 16,
      },
      h6: {
        fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
        fontSize: 14,
      },
      h7: {
        fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
        fontSize: 13,
      },
    },
  };
};

// context for color mode
export const ColorModeContext = createContext({
  toggleColorMode: () => {},
});

export const useMode = () => {
  const [mode, setMode] = useState(
    localStorage.getItem("theme") ? localStorage.getItem("theme") : "light",
  );

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () =>
        setMode((prev) => {
          const current = prev === "light" ? "dark" : "light";
          localStorage.setItem("theme", current);
          return current;
        }),
    }),
    [],
  );

  const theme = useMemo(() => createTheme(themeSettings(mode)), [mode]);
  return [theme, colorMode];
};
