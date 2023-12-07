import { Link, Tooltip } from "@chakra-ui/react";
import { Text } from "@chakra-ui/react";
import { useNetwork } from "wagmi";


export function Address({ address }: { address: string; }) {
  const network = useNetwork();

  let addressToExplorer;
  switch (network.chain?.id) {
    case 43114:
      addressToExplorer = `https://avascan.info/blockchain/c/address/${address}`;
      break;
    case 250:
      addressToExplorer = `https://ftmscan.com/address/${address}`;
      break;
    case 56:
      addressToExplorer = `https://bscscan.com/address/${address}`;
      break;
    default:
      addressToExplorer = "";
  }

  return (
    <Tooltip label={address}>
      <Link isExternal href={addressToExplorer}>
        <Text
          fontFamily={"monospace"}
          noOfLines={1}
          color="whiteAlpha.700"
          fontSize={"0.9rem"}
        >
          {address}
        </Text>
      </Link>
    </Tooltip>
  );
}
