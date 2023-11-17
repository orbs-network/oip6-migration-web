import { createWeb3Modal, defaultWagmiConfig } from "@web3modal/wagmi/react";
import { bsc, avalanche, fantom } from "viem/chains";
import { projectId, rpcs, chainsById } from "./config";
import { configureChains } from "wagmi";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";

// 1. Get projectId

// 2. Create wagmiConfig
const metadata = {
  name: "Web3Modal",
  description: "Web3Modal Example",
  url: "https://web3modal.com",
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
};

const { chains } = configureChains(
  [avalanche, fantom, bsc],
  [
    jsonRpcProvider({
      rpc: (chain) => ({
        http: rpcs[chainsById[chain.id]],
      }),
    }),
  ]
);
export const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata });

// 3. Create modal

export type AvailableNetworks = "BSC" | "AVA" | "FTM";

createWeb3Modal({ wagmiConfig, projectId, chains });

// export const chooseNetwork = (network: AvailableNetworks) => {
//   let _network;
//   switch (network) {
//     case "BSC":
//       _network = bsc;
//       break;
//     case "AVA":
//       _network = avalanche;
//       break;
//     case "FTM":
//       _network = fantom;
//       break;
//     default:
//       throw new Error("Invalid network");
//   }
//   createWeb3Modal({ wagmiConfig, projectId, chains, defaultChain: _network });
// };
