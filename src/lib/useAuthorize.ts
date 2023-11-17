import { erc20ABI } from "wagmi";
import { useTokenInfo } from "./useTokenInfo";
import { useConfig } from "./config";
import { useTransaction } from "./useTransaction";

export function useAuthorize() {
  const config = useConfig();
  const { data: tokenInfo } = useTokenInfo();

  return useTransaction({
    address: config!.oldToken,
    abi: erc20ABI,
    functionName: "approve",
    args: [config!.migrationContract, BigInt(tokenInfo?.old.balanceOf ?? 0)],
    enabled: !!config && !!tokenInfo,
  });
}
