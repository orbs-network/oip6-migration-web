import { useMigrate } from "../hooks/useMigrate";
import { useTokenInfo } from "../hooks/useTokenInfo";
import { useAtom } from "jotai";
import React from "react";
import { TransactionButton } from "./TransactionButton";
import { useTransactionUI } from "../hooks/useTransactionUI";
import { amountToMigrateAtom } from "../lib/amountToMigrateAtom";


export function Migrate() {
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
