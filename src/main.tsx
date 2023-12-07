import ReactDOM from "react-dom/client";
import App from "./components/App.tsx";
import "./index.css";
import { WagmiConfig } from "wagmi";
import { wagmiConfig } from "./lib/wallet-connect";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ChakraBaseProvider, ColorModeScript } from "@chakra-ui/react";
import theme from "./theme.ts";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <WagmiConfig config={wagmiConfig}>
    <QueryClientProvider client={queryClient}>
      <ChakraBaseProvider theme={theme}>
        <ColorModeScript initialColorMode={theme.config.initialColorMode} />
        <App />
      </ChakraBaseProvider>
    </QueryClientProvider>
  </WagmiConfig>
);
