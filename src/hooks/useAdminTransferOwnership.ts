import BN from "bignumber.js";
import { useConfig } from "../lib/config";
import { useTransaction } from "./useTransaction";
import migrationAbi from "../lib/oip6migration.abi.json";
import { useDebounce } from "usehooks-ts";

export type BNComparable = number | string | BN;

export function useAdminTransferOwnership(
  newAddress: string,
  onSuccess?: () => void
) {
  const config = useConfig();
  const debouncedAddress = useDebounce(newAddress, 500);

  return useTransaction({
    address: config?.migrationContract,
    abi: migrationAbi.abi,
    functionName: "transferOwnership",
    args: [newAddress],
    enabled: !!newAddress && !!config && !!debouncedAddress,
    onSuccess,
  });
}
