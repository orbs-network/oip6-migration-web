import { createWeb3Modal, defaultWagmiConfig } from "@web3modal/wagmi/react";
import { bsc, avalanche, fantom } from "viem/chains";
import { projectId, rpcs, chainsById } from "./config";
import { configureChains, createConfig } from "wagmi";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";

const { chains, publicClient } = configureChains(
  [avalanche, fantom, bsc],
  [
    jsonRpcProvider({
      rpc: (chain) => ({
        http: rpcs[chainsById[chain.id]],
      }),
    }),
  ]
);

export const wagmiConfig = createConfig({
  connectors: defaultWagmiConfig({ chains, projectId }).connectors,
  autoConnect: true,
  publicClient: publicClient,
});

export type AvailableNetworks = "BSC" | "AVA" | "FTM";
createWeb3Modal({ wagmiConfig, projectId, chains });
