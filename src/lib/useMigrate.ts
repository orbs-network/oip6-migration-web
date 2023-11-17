import oip6migration from "./oip6migration.abi.json";
import BN from "bignumber.js";
import { useTokenInfo } from "./useTokenInfo";
import { useConfig } from "./config";
import { useTransaction } from "./useTransaction";
import { useDebounce } from "usehooks-ts";

export type BNComparable = number | string | BN;

export function useMigrate() {
  const config = useConfig();
  const { data: tokenInfo } = useTokenInfo();

  const debouncedAmount = useDebounce(tokenInfo?.old.balanceOf, 500);

  return useTransaction({
    address: config?.migrationContract,
    abi: oip6migration.abi,
    functionName: "swap",
    args: [debouncedAmount],
    enabled: !!debouncedAmount && !!config && !!tokenInfo?.old.isApproved,
  });
}
