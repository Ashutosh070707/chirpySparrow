// Description:
// This is the ultimate-parent File whose children is App.js. In this, App component is wrapped with various other components
// which helps us to use various things like routing, Chakra components, Socket features (from socketContext file), etc inside our application.

import { StrictMode } from "react";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { ColorModeScript } from "@chakra-ui/react";
import { mode } from "@chakra-ui/theme-tools";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { RecoilRoot } from "recoil";
import { SocketContextProvider } from "../context/SocketContext.jsx";

// This whole block contains code which provides styling globally to App. I mean, this is template to provide global styling
// (color, font, etc) in chakra UI. (Nothing Special)
const styles = {
  global: (props) => ({
    body: {
      color: mode("gray.800", "whiteAlpha.900")(props),
      bg: mode("gray.100", "#101010")(props),
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
