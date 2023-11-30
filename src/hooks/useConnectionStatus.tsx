import { useAccount, useNetwork } from "wagmi";
import { chainsById } from "../lib/config";


export function useConnectionStatus() {
  const { isConnected: _isConnected, address } = useAccount();
  const network = useNetwork();
  const isConnected = _isConnected &&
    Object.keys(chainsById).includes(`${network.chain?.id ?? 0}`);

  return {
    isConnected,
    address,
    network: isConnected ? chainsById[network.chain!.id] : undefined,
  };
}
