import BN from "bignumber.js";
import { useConfig } from "./config";
import { useTransaction } from "./useTransaction";
import { useDebounce } from "usehooks-ts";
import migrationAbi from "./oip6migration.abi.json";
import { useConnectionStatus } from "../App";

export type BNComparable = number | string | BN;

export function useAdminRecover(amount: BNComparable) {
  const config = useConfig();
  const { address } = useConnectionStatus();

  const debouncedAmount = useDebounce(amount, 500);

  return useTransaction({
    address: config?.migrationContract,
    abi: migrationAbi.abi,
    functionName: "sendTokens",
    args: [config?.newToken, address, debouncedAmount],
    enabled: !!debouncedAmount && !!config && !!address,
  });
}
