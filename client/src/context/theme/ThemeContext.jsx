import React, { createContext, useContext, useEffect, useReducer } from "react";
import { ConfigProvider, theme } from "antd";

/**
 * @typedef {object} ThemeState
 * @property {boolean} isDarkMode - Indicates if dark mode is active.
 */

/**
 * @typedef {'TOGGLE_THEME'} ThemeActionType
 */

/**
 * @typedef {object} ThemeAction
 * @property {ThemeActionType} type - The type of the action.
 */

// Action Types
export const TOGGLE_THEME = 'TOGGLE_THEME';

/**
 * Reducer function for managing theme state.
 * @param {ThemeState} state - The current theme state.
 * @param {ThemeAction} action - The dispatched action.
 * @returns {ThemeState} The new theme state.
 */
const themeReducer = (state, action) => {
  switch (action.type) {
    case TOGGLE_THEME:
      return { ...state, isDarkMode: !state.isDarkMode };
    default:
      return state;
  }
};

/**
 * @typedef {object} ThemeContextType
 * @property {ThemeState} state - The current theme state.
 * @property {React.Dispatch<ThemeAction>} dispatch - The dispatch function for theme actions.
 */

// Create Context
/** @type {React.Context<ThemeContextType | undefined>} */
const ThemeContext = createContext(undefined);

export const ThemeProvider = ({ children }) => {
  const [state, dispatch] = useReducer(themeReducer, {
    isDarkMode: localStorage.getItem("app-theme") === "dark",
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (state.isDarkMode) {
      root.classList.add("dark");
      localStorage.setItem("app-theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("app-theme", "light");
    }
  }, [state.isDarkMode]);

  const antdThemeConfig = {
    algorithm: state.isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
    token: {
      fontFamily: "Akshar, ui-sans-serif, sans-serif, system-ui",
      borderRadius: 8,
      colorPrimary: state.isDarkMode ? "#fdc700" : "#9f0712",
      colorBgLayout: state.isDarkMode ? "#111111" : "#f9f9f9",
      colorBgContainer: state.isDarkMode ? "#191919" : "#f5f5f5",
      colorTextBase: state.isDarkMode ? "#eeeeee" : "#202020",
      colorBorder: state.isDarkMode ? "#201e18" : "#d4d4d8",
      colorError: "#e54d2e",
    },
    components: {
      Button: {
        controlHeight: 40,
        primaryColor: state.isDarkMode ? "#461901" : "#ffffff",
        colorTextLightSolid: state.isDarkMode ? "#461901" : "#ffffff",
      },
      Input: {
        controlHeight: 40,
        colorBgContainer: state.isDarkMode ? "#484848" : "#f9fafb",
      },
      Card: {
        colorBgContainer: state.isDarkMode ? "#191919" : "#f5f5f5",
      },
      Layout: {
        siderBg: state.isDarkMode ? "#18181b" : "#fbfbfb",
        headerBg: state.isDarkMode ? "#18181b" : "#fbfbfb",
      },
    },
  };

  return (
    <ThemeContext.Provider value={{ state, dispatch }}>
      <ConfigProvider theme={antdThemeConfig}>{children}</ConfigProvider>
    </ThemeContext.Provider>
  );
};

// Custom hook to use the theme context
/**
 * @returns {ThemeContextType} The theme context value.
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
