import "./App.css";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { useMigrate } from "./hooks/useMigrate";
import { useAuthorize } from "./hooks/useAuthorize";
import {
  Alert,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  Card,
  CardBody,
  FormControl,
  FormLabel,
  HStack,
  Heading,
  Input,
  InputGroup,
  InputRightElement,
  Link,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Skeleton,
  Spacer,
  Stat,
  StatHelpText,
  StatLabel,
  StatNumber,
  Tooltip,
  VStack,
  useDisclosure,
} from "@chakra-ui/react";
import { Text } from "@chakra-ui/react";
import BN from "bignumber.js";
import { CheckCircleIcon } from "@chakra-ui/icons";
import { useTokenInfo } from "./hooks/useTokenInfo";
import { AdminPanel } from "./components/AdminPanel";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import React from "react";
import { fromUI } from "./lib/utils/fromUI";
import { useConnectionStatus } from "./hooks/useConnectionStatus";
import { TransactionButton } from "./components/TransactionButton";
import { useTransactionUI } from "./hooks/useTransactionUI";
import { amountToMigrateAtom } from "./lib/amountToMigrateAtom";
import { useNetwork } from "wagmi";
import { useConfig } from "./lib/config";

function AddressWidget() {
  return <w3m-account-button />;
}

function Migrate() {
  const [amount] = useAtom(amountToMigrateAtom);
  const { data: tokenInfo, refetch } = useTokenInfo();
  const result = useMigrate(refetch);
  useTransactionUI(result);

  const isDisabled = !tokenInfo?.old.isApproved;

  return (
    <TransactionButton
      bgColor={"green.500"}
      result={result}
      isDisabled={isDisabled}
    >
      Exchange {amount} ORBS
    </TransactionButton>
  );
}

function Authorize() {
  const [amount] = useAtom(amountToMigrateAtom);
  const { data: tokenInfo, refetch } = useTokenInfo();
  const result = useAuthorize(refetch);
  useTransactionUI(result);

  const oldBalance = new BN(
    fromUI(amount ?? "0", tokenInfo?.old.decimals ?? 1)
  );

  const isDisabled = !!tokenInfo?.old.isApproved || oldBalance.isZero();

  return (
    <VStack align={"stretch"}>
      {!isDisabled && (
        <Alert status="info" color={"whiteAlpha.800"}>
          <AlertIcon />
          By authorizing, you allow the migration contract to transfer
          {" " + amount} old ORBS tokens from your wallet and swap to new ORBS
        </Alert>
      )}
      <TransactionButton
        isDisabled={isDisabled}
        leftIcon={tokenInfo?.old.isApproved ? <CheckCircleIcon /> : undefined}
        tooltip={oldBalance.isZero() ? "No tokens to migrate" : undefined}
        result={result}
      >
        Authorize Migration Contract
      </TransactionButton>
    </VStack>
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

function EditAmountPopup() {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [amount, setAmount] = useAtom(amountToMigrateAtom);
  const [value, setValue] = useState(amount ?? "");
  const initialRef = React.useRef(null);
  const { data } = useTokenInfo();
  const { network } = useConnectionStatus();

  useEffect(() => {
    setAmount(null);
  }, [network, setAmount]);

  useEffect(() => {
    if (amount === null && data?.old.balanceOfUI) {
      setAmount(data?.old.balanceOfUI);
      setValue(data?.old.balanceOfUI);
    }
  }, [data?.old.balanceOfUI, amount, setAmount]);

  const isInvalid = new BN(value).gt(data?.old.balanceOfUI ?? "0");

  return (
    <>
      <Button size={"sm"} onClick={onOpen}>
        SET AMOUNT
      </Button>
      <Modal initialFocusRef={initialRef} isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>SET AMOUNT</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl mt={4}>
              <FormLabel>Amount</FormLabel>
              <InputGroup>
                <Input
                  type="number"
                  onChange={(e) => setValue(e.target.value)}
                  ref={initialRef}
                  value={value}
                  isInvalid={isInvalid}
                />
                <InputRightElement>
                  <Button
                    onClick={() => {
                      setValue(data?.old.balanceOfUI ?? "0");
                    }}
                    size={"sm"}
                  >
                    MAX
                  </Button>
                </InputRightElement>
              </InputGroup>
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button
              isDisabled={isInvalid}
              onClick={() => {
                setAmount(value);
                onClose();
              }}
              colorScheme="blue"
              mr={3}
            >
              Save
            </Button>
            <Button onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

function Address({ address }: { address: string }) {
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

function Balances() {
  const { data } = useTokenInfo();
  const [amount] = useAtom(amountToMigrateAtom);

  return (
    <Card>
      <CardBody>
        <Text
          sx={{ mb: 3 }}
          textColor={"whiteAlpha.500"}
          fontSize={"sm"}
          fontWeight={"medium"}
          textTransform={"uppercase"}
        >
          Balances
        </Text>
        <Card bgColor={"red.800"}>
          <CardBody>
            <TokenAmount
              title={"OLD TOKEN"}
              balance={amount ?? ""}
              symbol={data?.old.symbol}
            />
            <EditAmountPopup />
            <Spacer h={2} />
            <Address address={data?.old.address ?? ""} />
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
        <Spacer h={4} />
        <Card bgColor={"green.800"}>
          <CardBody>
            <TokenAmount
              title={"NEW TOKEN"}
              balance={data?.new.balanceOfUI}
              symbol={data?.new.symbol}
            />
            <Address address={data?.new.address ?? ""} />
          </CardBody>
        </Card>
      </CardBody>
    </Card>
  );
}

function Connect() {
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

function MigrateProcess() {
  const config = useConfig();
  return (
    <VStack align={"stretch"}>
      <Card>
        <CardBody>
          <Text
            sx={{ mb: 3 }}
            textColor={"whiteAlpha.500"}
            fontSize={"sm"}
            fontWeight={"medium"}
            textTransform={"uppercase"}
          >
            Migration Process
          </Text>
          <VStack align={"stretch"}>
            <Authorize />
            <Migrate />
            <Card>
              <CardBody bgColor={"whiteAlpha.100"}>
                <Text color="whiteAlpha.500">Migration Contract</Text>
                <Address address={config?.migrationContract ?? ""} />
              </CardBody>
            </Card>
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  );
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
              This tool enables you to exchange superseded ORBS tokens that were bridged on Multichain for current ORBS tokens bridged through Axelar,
              as decided in{" "}
              <Link
                isExternal
                color="blue.400"
                fontWeight={"bold"}
                href={
                  "https://www.orbs.com/OIP-6-Relief-for-Multichain-bridged-ORBS-Token-Holders/"
                }
              >
                OIP-6
              </Link>
            </Text>
          </CardBody>
        </Card>
        <Spacer h={4} />
        {!isConnected && <Connect />}
        {isConnected && <Balances />}
        <Spacer h={4} />
        {isConnected && <MigrateProcess />}
        <Spacer h={4} />
        {isConnected && <AdminPanel />}
        <Box as="footer" mt={10}>
          <Link
            href="https://github.com/orbs-network/oip6-migration-web"
            isExternal
          >
            <HStack>
              <Text>View on GitHub</Text>
            </HStack>
          </Link>
        </Box>
      </VStack>
    </Box>
  );
}

export default App;
