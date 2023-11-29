import "./App.css";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { useAccount, useNetwork } from "wagmi";
import { useMigrate } from "./lib/useMigrate";
import { useAuthorize } from "./lib/useAuthorize";
import {
  Alert,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  ButtonProps,
  Card,
  CardBody,
  HStack,
  Heading,
  Select,
  Skeleton,
  Spacer,
  Stat,
  StatHelpText,
  StatLabel,
  StatNumber,
  Tooltip,
  VStack,
} from "@chakra-ui/react";
import { Text } from "@chakra-ui/react";
import BN from "bignumber.js";
import { chainsById } from "./lib/config";
import { CheckCircleIcon, WarningIcon } from "@chakra-ui/icons";
import { useTokenInfo } from "./lib/useTokenInfo";
import { AdminPanel } from "./components/AdminPanel";
import { useErrorToast } from "./hooks/useErrorToast";
import { useSuccessToast } from "./hooks/useSuccessToast";

function AddressWidget() {
  return <w3m-account-button />;
}

function Migrate() {
  const { data: tokenInfo } = useTokenInfo();
  const {
    write: migrate,
    errorPrepare,
    errorTxn,
    isLoading,
    isSuccess,
  } = useMigrate();
  useErrorToast(errorTxn);
  useSuccessToast(isSuccess);

  let bgColor;
  if (errorPrepare) {
    bgColor = "red.500";
  } else if (!tokenInfo?.old.isApproved) {
    bgColor = "gray.500";
  } else {
    bgColor = "blue.500";
  }

  return (
    <Tooltip label={errorPrepare?.message}>
      <Button
        isLoading={isLoading}
        bgColor={bgColor}
        sx={{
          py: 6,
        }}
        isDisabled={!migrate || !tokenInfo?.old.isApproved}
        leftIcon={errorPrepare ? <WarningIcon /> : undefined}
        onClick={() => {
          migrate?.();
        }}
      >
        Migrate to New ORBS
      </Button>
    </Tooltip>
  );
}

function Authorize() {
  const {
    write: authorize,
    errorPrepare,
    errorTxn,
    isLoading,
    isSuccess,
  } = useAuthorize();
  const { data: tokenInfo } = useTokenInfo();
  useErrorToast(errorTxn);
  useSuccessToast(isSuccess);

  let bgColor;

  if (errorPrepare) {
    bgColor = "red.500";
  } else if (tokenInfo?.old.isApproved) {
    bgColor = "gray.500";
  } else {
    bgColor = "blue.500";
  }

  const oldBalance = new BN(tokenInfo?.old.balanceOf ?? 0);

  return (
    <Tooltip
      label={
        oldBalance.isZero() ? "No tokens to migrate" : errorPrepare?.message
      }
    >
      <Button
        isLoading={isLoading}
        isDisabled={
          !authorize || !!tokenInfo?.old.isApproved || oldBalance.isZero()
        }
        sx={{ py: 6 }}
        bgColor={bgColor}
        leftIcon={tokenInfo?.old.isApproved ? <CheckCircleIcon /> : undefined}
        onClick={() => {
          authorize?.();
        }}
      >
        Authorize Migration Contract
      </Button>
    </Tooltip>
  );
}

export function TokenAmount(params: {
  title: string;
  balance?: string;
  symbol?: string;
}) {
  const { title, balance, symbol } = params;
  return (
    <Stat>
      <StatLabel color={"whiteAlpha.500"}>{title}</StatLabel>
      <HStack align={"baseline"} gap={1}>
        <StatNumber fontSize={"1.8rem"}>
          {balance ? balance : <Skeleton>0</Skeleton>}
        </StatNumber>
        <StatHelpText color="whiteAlpha.600">{symbol}</StatHelpText>
      </HStack>
    </Stat>
  );
}

function Balances() {
  const { data } = useTokenInfo();

  return (
    <VStack align={"stretch"}>
      <Card bgColor={"red.800"}>
        <CardBody>
          <TokenAmount
            title={"OLD TOKEN"}
            balance={data?.old.balanceOfUI}
            symbol={data?.old.symbol}
          />
          <Tooltip label={data?.old.address}>
            <Text
              fontFamily={"monospace"}
              noOfLines={1}
              color="whiteAlpha.700"
              fontSize={"0.9rem"}
            >
              {data?.old.address}
            </Text>
          </Tooltip>
          {data?.old.balanceOf === "0" && (
            <>
              <Spacer h={2} />
              <Alert status="error">
                <AlertIcon />
                <AlertTitle>No tokens to migrate</AlertTitle>
              </Alert>
            </>
          )}
        </CardBody>
      </Card>
      <Card bgColor={"green.800"}>
        <CardBody>
          <TokenAmount
            title={"NEW TOKEN"}
            balance={data?.new.balanceOfUI}
            symbol={data?.new.symbol}
          />
          <Tooltip label={data?.new.address}>
            <Text
              fontFamily={"monospace"}
              noOfLines={1}
              color="whiteAlpha.700"
              fontSize={"0.9rem"}
            >
              {data?.new.address}
            </Text>
          </Tooltip>
        </CardBody>
      </Card>
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

export function useConnectionStatus() {
  const { isConnected: _isConnected, address } = useAccount();
  const network = useNetwork();
  const isConnected =
    _isConnected &&
    Object.keys(chainsById).includes(`${network.chain?.id ?? 0}`);

  return {
    isConnected,
    address,
    network: isConnected ? chainsById[network.chain!.id] : undefined,
  };
}

function App() {
  const { isConnected } = useConnectionStatus();

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
        {isConnected && (
          <VStack align={"stretch"}>
            <Authorize />
            <Migrate />
          </VStack>
        )}
        {isConnected && <AdminPanel />}
      </VStack>
    </Box>
  );
}

export default App;
