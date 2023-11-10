import {
  chainsById,
  migrationContracts,
  newTokens,
  oldTokens,
  web3Providers,
} from "./config";
import BN from "bignumber.js";
import oip6migration from "./oip6migration.abi.json";
import {
  erc20ABI,
  useAccount,
  useContractWrite,
  useNetwork,
  usePrepareContractWrite,
} from "wagmi";
import { useDebounce } from "usehooks-ts";
import { AvailableNetworks } from "./wallet-connect";
import { useBalances } from "../App";
import { useQuery } from "@tanstack/react-query";

function convertRawToDecimal(rawBalance: string, decimals: number) {
  return new BN(rawBalance).div(Math.pow(10, decimals)).toString();
}

class MigrationProvider {
  async getBalances(account: string, network: AvailableNetworks) {
    const web3Provider = web3Providers[network];

    const balances = await web3Provider.balancesOf(account, [
      oldTokens[network],
      newTokens[network],
    ]);

    const decimalsOld = await web3Provider.decimals(oldTokens[network]);
    const decimalsNew = await web3Provider.decimals(newTokens[network]);

    if (decimalsOld !== decimalsNew) throw new Error("Decimals don't match");

    return {
      old: balances[oldTokens[network]],
      new: balances[newTokens[network]],
      oldUI: convertRawToDecimal(balances[oldTokens[network]], decimalsOld),
      newUI: convertRawToDecimal(balances[newTokens[network]], decimalsNew),
      oldContract: oldTokens[network],
      newContract: newTokens[network],
    };
  }
}

export function useIsApproved() {
  const account = useAccount();
  const network = useNetwork();

  const { data: balances } = useBalances();

  return useQuery({
    queryKey: ["isApproved", account.address, network.chain?.name],
    enabled: !!account.address && !!network.chain?.id && !!balances,
    refetchInterval: (isApproved) => (isApproved ? 0 : 3000),
    queryFn: async () => {
      const web3Provider =
        web3Providers[network.chain!.name as AvailableNetworks];
      const erc20 = web3Provider.getContract(
        erc20ABI,
        oldTokens[network.chain!.name]
      );

      const allowance = new BN(
        await erc20.methods
          .allowance(
            account.address as string,
            migrationContracts[network.chain!.name] as string
          )
          .call()
      );

      return allowance.isGreaterThanOrEqualTo(balances!.old);
    },
  });
}

export function useAuthorize(network?: AvailableNetworks) {
  const { config } = usePrepareContractWrite({
    address: (network ? oldTokens[network] : "0x0") as `0x${string}`,
    abi: erc20ABI,
    functionName: "approve",
    args: [
      (network ? migrationContracts[network] : "0x0") as `0x${string}`,
      BigInt(100),
    ],
    enabled: !!network,
  });

  const { write } = useContractWrite(config);

  return write;
}

export function useMigrate(network?: AvailableNetworks, amount?: number) {
  // const web3Provider = web3Providers[network];

  const debouncedAmount = useDebounce(amount, 500);

  const { config } = usePrepareContractWrite({
    address: migrationContracts[network ?? ""] ?? `0x${"0".repeat(40)}`,
    abi: oip6migration.abi,
    functionName: "swap",
    args: [debouncedAmount],
    enabled: !!debouncedAmount && !!network,
  });

  const { write } = useContractWrite(config);

  return write;
}

export function useBalances() {
  const account = useAccount();
  const network = useNetwork();
  return useQuery({
    queryKey: ["balances", account.address, network.chain?.id],
    enabled: !!account.address && !!network.chain?.id,
    refetchInterval: 3000,
    queryFn: async () =>
      migrationProvider.getBalances(
        account.address!,
        chainsById[network.chain!.id]
      ),
  });
}

export const migrationProvider = new MigrationProvider();
