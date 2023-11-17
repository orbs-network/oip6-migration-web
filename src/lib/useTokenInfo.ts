import {
  chainsById,
  migrationContracts,
  newTokens,
  oldTokens,
  web3Providers,
} from "./config";
import { useAccount, useNetwork } from "wagmi";
import { useQuery } from "@tanstack/react-query";

export function useTokenInfo() {
  const network = useNetwork();
  const account = useAccount();

  return useQuery({
    queryKey: ["tokenInfo", network.chain?.name, account.address],
    enabled: !!network.chain?.id && !!account.address,
    queryFn: async () => {
      const _network = chainsById[network.chain!.id];
      const web3Provider = web3Providers[_network];

      return web3Provider.tokenInfo(
        oldTokens[_network],
        newTokens[_network],
        account.address!,
        migrationContracts[_network]!
      );
    },
  });
}
