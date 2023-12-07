import {
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import React, { useEffect } from "react";

export type TXNOpts = {
  address?: `0x${string}`;
  abi: any;
  functionName: string;
  args: any[];
  enabled?: boolean;
  onSuccess?: () => void;
};

export type UseTransactionResult = {
  write: (() => void) | undefined;
  isLoading: boolean;
  prepare: {
    error: Error | null;
  };
  issue: {
    error: Error | null;
    isSuccess: boolean;
  };
  txn: {
    error: Error | null;
    isSuccess: boolean;
  };
};

export function useTransaction(txn: TXNOpts): UseTransactionResult {
  const [errorPrepare, setError] = React.useState<Error | null>(null);

  const { config: _config, isLoading: isPrepareLoading } =
    usePrepareContractWrite({
      ...txn,
      onError: setError,
      onSuccess: () => setError(null),
    });

  const {
    write,
    error: errorIssue,
    isLoading,
    isSuccess: isSuccessIssue,
    data,
  } = useContractWrite(_config);

  const {
    error: errorTXN,
    isLoading: loadingTXN,
    isSuccess: isSuccessTXN,
    // data: dataTXN,
  } = useWaitForTransaction({
    hash: data?.hash,
    confirmations: 2,
  });

  console.log(errorTXN);

  useEffect(() => {
    isSuccessTXN && txn.onSuccess?.();
  }, [isSuccessTXN, txn]);

  return {
    write,
    isLoading: isLoading || isPrepareLoading || loadingTXN,
    prepare: { error: errorPrepare },
    issue: { error: errorIssue, isSuccess: isSuccessIssue },
    txn: {
      error: errorTXN,
      isSuccess: isSuccessTXN,
    },
  };
}
