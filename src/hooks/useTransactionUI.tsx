import { useErrorToast } from "./useErrorToast";
import { useSuccessToast } from "./useSuccessToast";
import { UseTransactionResult } from "./useTransaction";

export function useTransactionUI(result: UseTransactionResult) {
  const { issue, txn } = result;
  useErrorToast(issue.error);
  useErrorToast(txn.error);
  useSuccessToast(issue.isSuccess, "Transaction Issued");
  useSuccessToast(txn.isSuccess, "Transaction Successful");
}
