import BN from "bignumber.js";
import { useConfig } from "../lib/config";
import { useTransaction } from "./useTransaction";
import { useDebounce } from "usehooks-ts";
import { erc20ABI } from "wagmi";

export type BNComparable = number | string | BN;

export function useAdminTransfer(amount: BNComparable, onSuccess?: () => void) {
  const config = useConfig();

  const debouncedAmount = useDebounce(amount, 500);

  return useTransaction({
    address: config?.newToken,
    abi: erc20ABI,
    functionName: "transfer",
    args: [config?.migrationContract, debouncedAmount],
    enabled: !!debouncedAmount && !!config,
    onSuccess,
  });
}
