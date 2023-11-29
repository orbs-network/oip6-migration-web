import {
  Button,
  Card,
  CardBody,
  HStack,
  Input,
  Spacer,
  Tooltip,
  VStack,
} from "@chakra-ui/react";
import { Text } from "@chakra-ui/react";
import { useTokenInfo } from "../lib/useTokenInfo";
import { toUI } from "../lib/utils/toUI";
import { useConnectionStatus, TokenAmount } from "../App";
import { useErrorToast } from "../hooks/useErrorToast";
import { useSuccessToast } from "../hooks/useSuccessToast";
import { useAdminTransfer } from "../lib/useAdminTransfer";
import { useAdminRecover } from "../lib/useAdminRecover";
import React from "react";
import { fromUI } from "../lib/utils/fromUI";
import { useAdminResetApproval } from "../lib/useAdminResetApproval";

function ResetApproval() {
  const { data: tokenInfo } = useTokenInfo();

  const {
    write: resetApproval,
    errorPrepare,
    errorTxn,
    isLoading,
    isSuccess,
  } = useAdminResetApproval();

  useErrorToast(errorTxn);
  useSuccessToast(isSuccess);

  if (!tokenInfo) return null;

  return (
    <HStack>
      <VStack>
        <Text color={"whiteAlpha.500"}>
          Reset approval (current:{" "}
          {toUI(tokenInfo?.old.allowance, tokenInfo.old.decimals)})
        </Text>
      </VStack>
      <Tooltip label={errorPrepare?.message}>
        <Button
          onClick={() => {
            resetApproval?.();
          }}
          isLoading={isLoading}
          isDisabled={!resetApproval}
        >
          Reset
        </Button>
      </Tooltip>
    </HStack>
  );
}

function TransferFromMigrationContract() {
  const { data: tokenInfo } = useTokenInfo();
  const [value, setValue] = React.useState(
    tokenInfo?.new.balanceMigrationContractUI ?? "0"
  );

  const {
    write: recover,
    errorPrepare,
    errorTxn,
    isLoading,
    isSuccess,
  } = useAdminRecover(fromUI(value, tokenInfo?.new.decimals ?? 0));

  useErrorToast(errorTxn);
  useSuccessToast(isSuccess);

  if (!tokenInfo) return null;

  return (
    <HStack align={"end"}>
      <VStack>
        <Text color={"whiteAlpha.500"}>
          Recover NEW from migration contract to admin
        </Text>
        <Text></Text>
        <Input onChange={(e) => setValue(e.target.value)} value={value} />
      </VStack>
      <Tooltip label={errorPrepare?.message}>
        <Button
          onClick={() => {
            recover?.();
          }}
          isLoading={isLoading}
          isDisabled={!recover}
        >
          Recover
        </Button>
      </Tooltip>
    </HStack>
  );
}

function TransferToMigrationContract() {
  const { data: tokenInfo } = useTokenInfo();
  const [value, setValue] = React.useState(tokenInfo?.new.balanceOfUI ?? "0");

  const {
    write: transfer,
    errorPrepare,
    errorTxn,
    isLoading,
    isSuccess,
  } = useAdminTransfer(fromUI(value, tokenInfo?.new.decimals ?? 0));

  useErrorToast(errorTxn);
  useSuccessToast(isSuccess);

  if (!tokenInfo) return null;

  return (
    <HStack align={"end"}>
      <VStack>
        <Text color={"whiteAlpha.500"}>Transfer NEW to migration contract</Text>
        <Text></Text>
        <Input value={value} onChange={(e) => setValue(e.target.value)} />
      </VStack>
      <Tooltip label={errorPrepare?.message ?? ""}>
        <Button
          onClick={() => {
            transfer?.();
          }}
          isLoading={isLoading}
          isDisabled={!transfer}
        >
          Transfer
        </Button>
      </Tooltip>
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
        <Spacer h={6} />
        <TransferToMigrationContract />
        <Spacer h={2} />
        <TransferFromMigrationContract />
        <Spacer h={2} />
        <ResetApproval />
      </CardBody>
    </Card>
  );
}
