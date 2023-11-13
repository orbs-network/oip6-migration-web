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
import { useQuery } from "@tanstack/react-query";

function convertRawToDecimal(rawBalance: string, decimals: number) {
  return new BN(rawBalance).div(Math.pow(10, decimals)).toString();
}

export function useIsApproved() {
  const account = useAccount();
  const network = useNetwork();

  const { data: balances } = useBalances();

  return useQuery({
    queryKey: ["isApproved", account.address, network.chain?.name],
    enabled: !!account.address && !!network.chain?.id && !!balances,
    refetchInterval: (isApproved) => (isApproved ? 0 : 8000),
    queryFn: async () => {
      const _network = chainsById[network.chain!.id];
      const web3Provider = web3Providers[_network];
      const oldTokenContract = web3Provider.getContract(
        erc20ABI,
        oldTokens[_network]
      );

      const allowance = new BN(
        await oldTokenContract.methods
          .allowance(
            account.address as string,
            migrationContracts[_network] as string
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

function useDecimals() {
  const network = useNetwork();

  return useQuery({
    queryKey: ["decimals", network.chain?.name],
    enabled: !!network.chain?.id,
    queryFn: async () => {
      const _network = chainsById[network.chain!.id];
      const web3Provider = web3Providers[_network];

      const decimalsOld = await web3Provider.decimals(oldTokens[_network]);
      const decimalsNew = await web3Provider.decimals(newTokens[_network]);

      if (decimalsOld !== decimalsNew) throw new Error("Decimals don't match");

      return decimalsOld;
    },
  });
}

export function useBalances() {
  const account = useAccount();
  const network = useNetwork();
  const { data: decimals } = useDecimals();
  return useQuery({
    queryKey: ["balances", account.address, network.chain?.id],
    enabled: !!account.address && !!network.chain?.id && decimals !== undefined,
    refetchInterval: 15000,
    queryFn: async () => {
      const _network = chainsById[network.chain!.id];
      const web3Provider = web3Providers[_network];

      const balances = await web3Provider.balancesOf(account.address!, [
        oldTokens[_network],
        newTokens[_network],
      ]);

      return {
        old: balances[oldTokens[_network]],
        new: balances[newTokens[_network]],
        oldUI: convertRawToDecimal(balances[oldTokens[_network]], decimals!),
        newUI: convertRawToDecimal(balances[newTokens[_network]], decimals!),
        oldContract: oldTokens[_network],
        newContract: newTokens[_network],
      };
    },
  });
}
