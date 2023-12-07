import { useWeb3Modal } from "@web3modal/wagmi/react";
import { Button } from "@chakra-ui/react";
import { Text } from "@chakra-ui/react";
import { useConnectionStatus } from "../hooks/useConnectionStatus";

export function Connect() {
  const { open } = useWeb3Modal();
  const { address } = useConnectionStatus();

  return (
    <>
      <Text>To start, connect your wallet.</Text>
      <Button
        onClick={() => {
          open({ view: address ? "Networks" : "Connect" });
        }}
        size={"lg"}
        css={{
          width: "100%",
          padding: "2rem",
        }}
        colorScheme={"blue"}
      >
        {address ? "Switch Network" : "Connect Wallet"}
      </Button>
    </>
  );
}
