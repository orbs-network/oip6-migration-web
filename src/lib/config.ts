import { Web3Provider } from "./Web3Provider";
import web3, { Web3 } from "web3";
import { AvailableNetworks } from "./wallet-connect";
// export const projectId = "78a4e3a1e2f3495dc2cbc51d7755783e";
export const projectId = "78a4e3a1e2f3495dc2cbc51d7755783e";

export const chainsById: Record<number, AvailableNetworks> = {
  43114: "AVA",
  250: "FTM",
  56: "BSC",
};

export const rpcs = {
  AVA: `https://rpc.walletconnect.com/v1?chainId=eip155:43114&projectId=${projectId}`,
  // AVA: import.meta.env.VITE_ALCHEMY_RPC,
  FTM: undefined,
  BSC: undefined,
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
  AVA: "0x43a8cab15D06d3a5fE5854D714C37E7E9246F170", //TODO
  FTM: "0x0000000000000000000000000000000000000000",
  BSC: "0x0000000000000000000000000000000000000000",
};

export const web3Providers: Record<AvailableNetworks, Web3Provider> = {
  AVA: new Web3Provider(new web3(rpcs.AVA)),
  FTM: new Web3Provider(new web3(rpcs.FTM)),
  BSC: new Web3Provider(new web3(rpcs.BSC)),
};
