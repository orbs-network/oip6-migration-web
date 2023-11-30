import oip6migration from "../lib/oip6migration.abi.json";
import { useTokenInfo } from "./useTokenInfo";
import { useConfig } from "../lib/config";
import { useTransaction } from "./useTransaction";
import { useDebounce } from "usehooks-ts";
import { useAtom } from "jotai";
import { amountToMigrateAtom } from "../lib/amountToMigrateAtom";
import { fromUI } from "../lib/utils/fromUI";

export function useMigrate(onSuccess?: () => void) {
  const config = useConfig();
  const { data: tokenInfo } = useTokenInfo();
  const [amount] = useAtom(amountToMigrateAtom);
  const debouncedAmount = useDebounce(
    fromUI(amount ?? 0, tokenInfo?.old.decimals ?? 0),
    500
  );

  return useTransaction({
    address: config?.migrationContract,
    abi: oip6migration.abi,
    functionName: "swap",
    args: [debouncedAmount],
    enabled: !!debouncedAmount && !!config && !!tokenInfo?.old.isApproved,
    onSuccess,
  });
}
