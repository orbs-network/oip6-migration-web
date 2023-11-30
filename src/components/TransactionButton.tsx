import {
  Button,
  ButtonProps, Tooltip
} from "@chakra-ui/react";
import { WarningIcon } from "@chakra-ui/icons";
import { UseTransactionResult } from "../hooks/useTransaction";

export function TransactionButton(
  params: { result: UseTransactionResult; tooltip?: string; } & ButtonProps
) {
  const isDisabled = !params.result.write || params.isDisabled;
  let bgColor;
  if (params.result.prepare.error) {
    bgColor = "red.500";
  } else if (isDisabled) {
    bgColor = "gray.500";
  } else {
    bgColor = params.bgColor ?? "blue.500";
  }

  return (
    <Tooltip label={params.result.prepare.error?.message ?? params.tooltip}>
      <Button
        isLoading={params.isLoading || params.result.isLoading}
        sx={{
          py: 6,
          ...params.sx,
        }}
        bgColor={bgColor}
        isDisabled={isDisabled}
        leftIcon={params.result.prepare.error ? <WarningIcon /> : params.leftIcon}
        onClick={() => {
          params.result.write?.();
        }}
      >
        {params.children}
      </Button>
    </Tooltip>
  );
}
