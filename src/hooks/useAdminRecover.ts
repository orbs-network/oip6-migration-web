import BN from "bignumber.js";
import { useConfig } from "../lib/config";
import { useTransaction } from "./useTransaction";
import { useDebounce } from "usehooks-ts";
import migrationAbi from "../lib/oip6migration.abi.json";
import { useConnectionStatus } from "./useConnectionStatus";

export type BNComparable = number | string | BN;

export function useAdminRecover(
  amount: BNComparable,
  type: "old" | "new",
  onSuccess?: () => void
) {
  const config = useConfig();
  const { address } = useConnectionStatus();

  const debouncedAmount = useDebounce(amount, 500);

  return useTransaction({
    address: config?.migrationContract,
    abi: migrationAbi.abi,
    functionName: "sendTokens",
    args: [
      type === "new" ? config?.newToken : config?.oldToken,
      address,
      debouncedAmount,
    ],
    enabled: !!debouncedAmount && !!config && !!address,
    onSuccess,
  });
}
