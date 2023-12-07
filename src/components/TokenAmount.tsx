import {
  HStack, Skeleton, Stat,
  StatHelpText,
  StatLabel,
  StatNumber
} from "@chakra-ui/react";
import React from "react";


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
