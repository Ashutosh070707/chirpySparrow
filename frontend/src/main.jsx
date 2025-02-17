import { StrictMode } from "react";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { ColorModeScript } from "@chakra-ui/react";
import { mode } from "@chakra-ui/theme-tools";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { RecoilRoot } from "recoil";
import { SocketContextProvider } from "../context/SocketContext.jsx";

// const styles = {
//   global: (props) => ({
//     body: {
//       color: mode("gray.800", "whiteAlpha.900")(props),
//       bg: mode("gray.100", "#101010")(props),
//     },
//   }),
// };

const styles = {
  global: (props) => ({
    body: {
      color: mode("gray.800", "whiteAlpha.900")(props),
      bg: mode("gray.100", "#101010")(props),
    },
    // Add scrollbar styling here
    "::-webkit-scrollbar": {
      width: "8px",
    },
    "::-webkit-scrollbar-track": {
      background: mode("#f1f1f1", "#2d2d2d")(props),
      borderRadius: "10px",
    },
    "::-webkit-scrollbar-thumb": {
      background: mode("#888", "#555")(props),
      borderRadius: "10px",
    },
    "::-webkit-scrollbar-thumb:hover": {
      background: mode("#555", "#777")(props),
    },
    // Add Firefox compatibility
    "*": {
      scrollbarWidth: "thin",
      scrollbarColor: mode("#888 #f1f1f1", "#555 #2d2d2d")(props),
    },
  }),
};

const config = {
  initialColorMode: "dark",
  useSystemColorMode: true,
};

const colors = {
  gray: {
    light: "#616261",
    dark: "#1e1e1e",
  },
};

const theme = extendTheme({ config, styles, colors });

createRoot(document.getElementById("root")).render(
  //Because of this strict-mode, react is rendering everything/every component twice on development.
  <StrictMode>
    <RecoilRoot>
      <BrowserRouter>
        <ChakraProvider theme={theme}>
          <ColorModeScript initialColorMode={theme.config.initialColorMode} />
          <SocketContextProvider>
            <App />
          </SocketContextProvider>
        </ChakraProvider>
      </BrowserRouter>
    </RecoilRoot>
  </StrictMode>
);
