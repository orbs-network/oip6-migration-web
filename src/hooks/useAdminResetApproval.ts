import { erc20ABI } from "wagmi";
import { useTokenInfo } from "./useTokenInfo";
import { useConfig } from "../lib/config";
import { useTransaction } from "./useTransaction";

export function useAdminResetApproval(onSuccess?: () => void) {
  const config = useConfig();
  const { data: tokenInfo } = useTokenInfo();

  return useTransaction({
    address: config!.oldToken,
    abi: erc20ABI,
    functionName: "approve",
    args: [config!.migrationContract, 0],
    enabled: !!config && !!tokenInfo,
    onSuccess,
  });
}
