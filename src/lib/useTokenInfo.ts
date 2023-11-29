import {
  chainsById,
  migrationContracts,
  newTokens,
  oldTokens,
  web3Providers,
} from "./config";
import { useAccount, useNetwork } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { amountToMigrateAtom } from "../App";
import BN from "bignumber.js";
import { fromUI } from "./utils/fromUI";

export function useTokenInfo() {
  const network = useNetwork();
  const account = useAccount();
  const [amount] = useAtom(amountToMigrateAtom);

  return useQuery({
    queryKey: ["tokenInfo", network.chain?.name, account.address, amount],
    enabled: !!network.chain?.id && !!account.address,
    queryFn: async () => {
      const _network = chainsById[network.chain!.id];
      const web3Provider = web3Providers[_network];

      const tokenInfo = await web3Provider.tokenInfo(
        oldTokens[_network],
        newTokens[_network],
        account.address!,
        migrationContracts[_network]!
      );

      return {
        ...tokenInfo,
        old: {
          ...tokenInfo.old,
          isApproved:
            new BN(fromUI(amount ?? 0, tokenInfo.old.decimals)).gt(0) &&
            new BN(tokenInfo.old.allowance).gte(
              fromUI(amount ?? 0, tokenInfo.old.decimals)
            ),
        },
      };
    },
  });
}
