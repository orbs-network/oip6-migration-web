import oip6migration from "./oip6migration.abi.json";
import { useTokenInfo } from "./useTokenInfo";
import { useConfig } from "./config";
import { useTransaction } from "./useTransaction";
import { useDebounce } from "usehooks-ts";
import { useAtom } from "jotai";
import { amountToMigrateAtom } from "../App";
import { fromUI } from "./utils/fromUI";

export function useMigrate() {
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
  });
}
