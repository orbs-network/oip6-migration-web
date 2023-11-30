import { erc20ABI } from "wagmi";
import { useTokenInfo } from "./useTokenInfo";
import { useConfig } from "../lib/config";
import { useTransaction } from "./useTransaction";
import { useAtom } from "jotai";
import { useDebounce } from "usehooks-ts";
import { amountToMigrateAtom } from "../lib/amountToMigrateAtom";
import { fromUI } from "../lib/utils/fromUI";

export function useAuthorize(onSuccess?: () => void) {
  const config = useConfig();
  const { data: tokenInfo } = useTokenInfo();
  const [amount] = useAtom(amountToMigrateAtom);
  const debouncedAmount = useDebounce(
    fromUI(amount ?? 0, tokenInfo?.old.decimals ?? 0),
    500
  );

  return useTransaction({
    address: config!.oldToken,
    abi: erc20ABI,
    functionName: "approve",
    args: [config!.migrationContract, BigInt(debouncedAmount)],
    enabled: !!config && !!tokenInfo,
    onSuccess,
  });
}
