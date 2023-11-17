import { useContractWrite, usePrepareContractWrite } from "wagmi";
import React from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any

export function useTransaction(txn: any) {
  const [errorPrepare, setError] = React.useState<Error | null>(null);

  const { config: _config } = usePrepareContractWrite({
    ...txn,
    onError: setError,
  });

  const {
    write,
    error: errorTxn,
    isLoading,
    isSuccess,
  } = useContractWrite(_config);

  return {
    write,
    errorTxn,
    errorPrepare,
    isLoading,
    isSuccess,
  };
}
