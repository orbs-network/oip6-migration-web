import {
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import React from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any

export function useTransaction(txn: any) {
  const [errorPrepare, setError] = React.useState<Error | null>(null);

  const { config: _config, isLoading: isPrepareLoading } =
    usePrepareContractWrite({
      ...txn,
      onError: setError,
      onSuccess: () => setError(null),
    });

  const {
    write,
    error: errorTxn,
    isLoading,
    isSuccess,
    data,
  } = useContractWrite(_config);

  const { error: errorTXN, isLoading: loadingTXN } = useWaitForTransaction({
    hash: data?.hash,
  });

  return {
    write,
    errorTxn,
    errorPrepare: errorPrepare ?? errorTXN,
    isLoading: isLoading || isPrepareLoading || loadingTXN,
    isSuccess,
  };
}
