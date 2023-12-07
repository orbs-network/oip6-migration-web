import { Web3Provider } from "./Web3Provider";
import web3 from "web3";
import { AvailableNetworks } from "./wallet-connect";
import { useNetwork } from "wagmi";
export const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;

export const chainsById: Record<number, AvailableNetworks> = {
  43114: "AVA",
  250: "FTM",
  56: "BSC",
};

export const chainIdsByName = {
  AVA: 43114,
  FTM: 250,
  BSC: 56,
};

export const rpcs = {
  // AVA: `https://rpc.walletconnect.com/v1?chainId=eip155:43114&projectId=${projectId}`,
  AVA: import.meta.env.VITE_ALCHEMY_RPC_AVA,
  FTM: import.meta.env.VITE_ALCHEMY_RPC_FTM,
  BSC: import.meta.env.VITE_ALCHEMY_RPC_BSC,
};

export const oldTokens: Record<string, string> = {
  AVA: "0x340fe1d898eccaad394e2ba0fc1f93d27c7b717a",
  FTM: "0x3e01b7e242d5af8064cb9a8f9468ac0f8683617c",
  BSC: "0xebd49b26169e1b52c04cfd19fcf289405df55f80",
};

export const newTokens: Record<string, string> = {
  AVA: "0x3Ab1C9aDb065F3FcA0059652Cd7A52B05C98f9a9",
  FTM: "0x43a8cab15D06d3a5fE5854D714C37E7E9246F170",
  BSC: "0x43a8cab15D06d3a5fE5854D714C37E7E9246F170",
};

// TODO
export const migrationContracts: Record<string, `0x${string}` | null> = {
  AVA: "0xeC1d3b4B554CC9D9F13E524c3dE5D92F1518568c",
  FTM: "0xeC1d3b4B554CC9D9F13E524c3dE5D92F1518568c",
  BSC: "0x8C5d47b366dD865848b5b8B60166072B8bC7D268",
};

export const web3Providers: Record<AvailableNetworks, Web3Provider> = {
  AVA: new Web3Provider(new web3(rpcs.AVA)),
  FTM: new Web3Provider(new web3(rpcs.FTM)),
  BSC: new Web3Provider(new web3(rpcs.BSC)),
};

export function useConfig() {
  const _network = useNetwork();
  if (!_network.chain) return null;

  const network = chainsById[_network.chain!.id];

  return {
    web3Provider: web3Providers[network],
    oldToken: oldTokens[network] as `0x${string}`,
    newToken: newTokens[network] as `0x${string}`,
    migrationContract: migrationContracts[network] as `0x${string}`,
  };
}
