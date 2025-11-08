// Description:
// This is the ultimate-parent File whose children is App.js. In this, App component is wrapped with various other components
// which helps us to use various things like routing, Chakra components, Socket features (from socketContext file), etc inside our application.

import { StrictMode } from "react";
import theme from "./theme";
import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { RecoilRoot } from "recoil";
import { SocketContextProvider } from "../context/SocketContext.jsx";

const container = document.getElementById("root");
const root = createRoot(container);
root.render(
  <StrictMode>
    <ChakraProvider theme={theme}>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <RecoilRoot>
        <BrowserRouter>
          <SocketContextProvider>
            <App />
          </SocketContextProvider>
        </BrowserRouter>
      </RecoilRoot>
    </ChakraProvider>
  </StrictMode>
);
