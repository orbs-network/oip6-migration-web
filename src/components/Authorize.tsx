import { useAuthorize } from "../hooks/useAuthorize";
import {
  Alert,
  AlertIcon, VStack
} from "@chakra-ui/react";
import BN from "bignumber.js";
import { CheckCircleIcon } from "@chakra-ui/icons";
import { useTokenInfo } from "../hooks/useTokenInfo";
import { useAtom } from "jotai";
import React from "react";
import { fromUI } from "../lib/utils/fromUI";
import { TransactionButton } from "./TransactionButton";
import { useTransactionUI } from "../hooks/useTransactionUI";
import { amountToMigrateAtom } from "../lib/amountToMigrateAtom";


export function Authorize() {
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
