import "./App.css";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { useAccount, useNetwork } from "wagmi";
import {
  useAuthorize,
  useBalances,
  useIsApproved,
  useMigrate,
} from "./lib/MigrationProvider";
import {
  Box,
  Button,
  Card,
  CardBody,
  HStack,
  Heading,
  Skeleton,
  Spacer,
  Stat,
  StatHelpText,
  StatLabel,
  StatNumber,
  Tooltip,
  VStack,
  useToast,
} from "@chakra-ui/react";
import { Text } from "@chakra-ui/react";
import BN from "bignumber.js";
import { chainsById } from "./lib/config";
import { useEffect } from "react";
import { CheckCircleIcon } from "@chakra-ui/icons";

function AddressWidget() {
  return <w3m-account-button />;
}

function Migrate() {
  const network = useNetwork();
  const { data } = useBalances();
  const toast = useToast();

  const { write: authorize, error: errorAuthorize } = useAuthorize(
    chainsById[network.chain?.id],
    data?.old
  );
  const { data: isApproved } = useIsApproved();
  const { data: balances } = useBalances();
  const migrate = useMigrate(
    chainsById[network.chain?.id],
    data?.old,
    isApproved
  );

  useEffect(() => {
    if (errorAuthorize) {
      toast({
        title: errorAuthorize.name,
        description: errorAuthorize.message,
        status: "error",
        duration: 9000,
        isClosable: true,
      });
    }
  }, [errorAuthorize, toast]);

  return (
    <VStack align={"stretch"}>
      <Button
        isDisabled={
          !authorize || !!isApproved || new BN(balances?.old ?? "0").eq(0)
        }
        sx={{ py: 6 }}
        bgColor={isApproved ? "gray.500" : "blue.500"}
        leftIcon={isApproved ? <CheckCircleIcon /> : undefined}
        onClick={() => {
          authorize?.();
        }}
      >
        Authorize Migration Contract
      </Button>
      <Button
        bgColor={"gray.500"}
        sx={{
          py: 6,
        }}
        isDisabled={!migrate || !isApproved}
        onClick={() => {
          migrate?.();
        }}
      >
        Migrate to New ORBS
      </Button>
    </VStack>
  );
}

function Balances() {
  const { data } = useBalances();

  return (
    <VStack align={"stretch"}>
      <Card bgColor={"red.800"}>
        <CardBody>
          <Stat>
            <StatLabel color={"whiteAlpha.500"}>OLD TOKEN</StatLabel>
            <HStack align={"baseline"} gap={1}>
              <StatNumber fontSize={"1.8rem"}>
                {data ? data?.oldUI : <Skeleton>0</Skeleton>}
              </StatNumber>
              <StatHelpText color="whiteAlpha.600">ORBS</StatHelpText>
            </HStack>
          </Stat>
          <Tooltip label={data?.oldContract}>
            <Text
              fontFamily={"monospace"}
              noOfLines={1}
              color="whiteAlpha.700"
              fontSize={"0.9rem"}
            >
              {data ? data?.oldContract : <Skeleton>0</Skeleton>}
            </Text>
          </Tooltip>
        </CardBody>
      </Card>
      <Card bgColor={"green.800"}>
        <CardBody>
          <Stat>
            <StatLabel color={"whiteAlpha.500"}>NEW TOKEN</StatLabel>
            <HStack align={"baseline"} gap={1}>
              <StatNumber fontSize={"1.8rem"}>
                {data ? data?.newUI : <Skeleton>0</Skeleton>}
              </StatNumber>
              <StatHelpText color="whiteAlpha.600">ORBS</StatHelpText>
            </HStack>
          </Stat>
          <Tooltip label={data?.newContract}>
            <Text
              fontFamily={"monospace"}
              noOfLines={1}
              color="whiteAlpha.700"
              fontSize={"0.9rem"}
            >
              {data ? data?.newContract : <Skeleton>0</Skeleton>}
            </Text>
          </Tooltip>
        </CardBody>
      </Card>
      {/* </HStack> */}
    </VStack>
  );
}

function ChooseNetwork() {
  const { open } = useWeb3Modal();

  return (
    <>
      <Text>To start, connect your wallet.</Text>
      <Button
        onClick={() => {
          open({ view: "Networks" });
        }}
        size={"lg"}
        css={{
          width: "100%",
          padding: "2rem",
        }}
        colorScheme={"blue"}
      >
        Connect Wallet
      </Button>
    </>
  );
}

function App() {
  const { isConnected } = useAccount();

  return (
    <Box>
      <VStack spacing={4} align={"stretch"}>
        {isConnected && <AddressWidget />}
        <HStack>
          <img src="https://www.orbs.com/assets/img/common/logo.svg" />
          <Heading fontSize={24}>ORBS Migrator</Heading>
        </HStack>
        <Card w="100%">
          <CardBody>
            <Text>
              This tool lets you safely migrate defunct multichain ORBS to the
              new ORBS token, as decided in OIP-6.
            </Text>
          </CardBody>
        </Card>
        <Spacer h={4} />
        {!isConnected && <ChooseNetwork />}
        {isConnected && <Balances />}
        <Spacer h={4} />
        {isConnected && <Migrate />}
      </VStack>
    </Box>
  );
}

export default App;
