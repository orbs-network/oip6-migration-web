import {
  Card,
  CardBody,
  HStack,
  Input,
  Select,
  Spacer,
  VStack,
} from "@chakra-ui/react";
import { Text } from "@chakra-ui/react";
import { useTokenInfo } from "../hooks/useTokenInfo";
import { toUI } from "../lib/utils/toUI";
import { TokenAmount } from "../App";
import { useConnectionStatus } from "../hooks/useConnectionStatus";
import { useAdminTransfer } from "../hooks/useAdminTransfer";
import { useAdminRecover } from "../hooks/useAdminRecover";
import React, { useEffect } from "react";
import { fromUI } from "../lib/utils/fromUI";
import { useAdminResetApproval } from "../hooks/useAdminResetApproval";
import { useTransactionUI } from "../hooks/useTransactionUI";
import { TransactionButton } from "./TransactionButton";
import { useAdminTransferOwnership } from "../hooks/useAdminTransferOwnership";

function ResetApproval() {
  const { data: tokenInfo, refetch } = useTokenInfo();

  const result = useAdminResetApproval(refetch);
  useTransactionUI(result);

  if (!tokenInfo) return null;

  return (
    <TransactionButton result={result}>
      Reset approval (Current:{" "}
      {toUI(tokenInfo?.old.allowance, tokenInfo.old.decimals)})
    </TransactionButton>
  );
}

function TransferOwnership() {
  const { data: tokenInfo, refetch } = useTokenInfo();
  const [value, setValue] = React.useState("");
  const result = useAdminTransferOwnership(value, refetch);
  useTransactionUI(result);

  if (!tokenInfo) return null;

  return (
    <HStack align={"end"}>
      <VStack>
        <Text color={"whiteAlpha.500"}>
          Transfer ownership of migration contract
        </Text>
        <Text></Text>
        <Input onChange={(e) => setValue(e.target.value)} value={value} />
      </VStack>
      <TransactionButton result={result}>Transfer Ownership</TransactionButton>
    </HStack>
  );
}

function TransferFromMigrationContract() {
  const { data: tokenInfo, refetch } = useTokenInfo();
  const [value, setValue] = React.useState(
    tokenInfo?.new.balanceMigrationContractUI ?? "0"
  );

  const [tokenType, setTokenType] = React.useState<"new" | "old">("new");

  useEffect(() => {
    setValue(
      tokenType === "new"
        ? tokenInfo?.new.balanceMigrationContractUI ?? "0"
        : tokenInfo?.old.balanceMigrationContractUI ?? "0"
    );
  }, [tokenType, tokenInfo]);

  const result = useAdminRecover(
    fromUI(
      value,
      tokenType === "new"
        ? tokenInfo?.new.decimals ?? 0
        : tokenInfo?.old.decimals ?? 0
    ),
    tokenType,
    refetch
  );
  useTransactionUI(result);

  if (!tokenInfo) return null;

  return (
    <HStack align={"end"}>
      <VStack>
        <Text color={"whiteAlpha.500"}>
          Recover {tokenType.toUpperCase()} Orbs from migration contract to
          admin
        </Text>
        <Text></Text>
        <Select
          onChange={(e) => setTokenType(e.target.value as "new" | "old")}
          defaultValue={tokenType}
        >
          <option value="new">NEW</option>
          <option value="old">OLD</option>
        </Select>
        <Input onChange={(e) => setValue(e.target.value)} value={value} />
      </VStack>
      <TransactionButton result={result}>Recover</TransactionButton>
    </HStack>
  );
}

function TransferToMigrationContract() {
  const { data: tokenInfo, refetch } = useTokenInfo();
  const [value, setValue] = React.useState(tokenInfo?.new.balanceOfUI ?? "0");

  const result = useAdminTransfer(
    fromUI(value, tokenInfo?.new.decimals ?? 0),
    refetch
  );
  useTransactionUI(result);

  if (!tokenInfo) return null;

  return (
    <HStack align={"end"}>
      <VStack>
        <Text color={"whiteAlpha.500"}>Transfer NEW to migration contract</Text>
        <Text></Text>
        <Input value={value} onChange={(e) => setValue(e.target.value)} />
      </VStack>
      <TransactionButton result={result}>Transfer</TransactionButton>
    </HStack>
  );
}

export function AdminPanel() {
  const { data: tokenInfo } = useTokenInfo();
  const { address } = useConnectionStatus();

  if (
    !address ||
    !tokenInfo?.migrationContract.owner ||
    tokenInfo?.migrationContract.owner.toLowerCase() !== address.toLowerCase()
  ) {
    return null;
  }

  return (
    <Card w="100%">
      <CardBody>
        <Text
          sx={{ mb: 3 }}
          textColor={"whiteAlpha.500"}
          fontSize={"sm"}
          fontWeight={"medium"}
          textTransform={"uppercase"}
        >
          ADMIN
        </Text>
        <Text>
          You are the owner of the migration contract. You can use this panel to
          perform administrative actions.
        </Text>
        <Spacer h={4} />
        <TokenAmount
          title={"MIGRATION OLD BALANCE"}
          balance={tokenInfo?.old.balanceMigrationContractUI}
          symbol={tokenInfo?.old.symbol}
        />
        <TokenAmount
          title={"MIGRATION NEW BALANCE"}
          balance={tokenInfo?.new.balanceMigrationContractUI}
          symbol={tokenInfo?.new.symbol}
        />
        <Spacer h={2} />
        <ResetApproval />
        <Spacer h={6} />
        <TransferToMigrationContract />
        <Spacer h={2} />
        <TransferFromMigrationContract />
        <Spacer h={2} />
        <TransferOwnership />
      </CardBody>
    </Card>
  );
}
