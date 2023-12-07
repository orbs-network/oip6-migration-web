import {
  Alert,
  AlertIcon,
  AlertTitle, Card,
  CardBody, Spacer
} from "@chakra-ui/react";
import { Text } from "@chakra-ui/react";
import { useTokenInfo } from "../hooks/useTokenInfo";
import { useAtom } from "jotai";
import React from "react";
import { amountToMigrateAtom } from "../lib/amountToMigrateAtom";
import { TokenAmount } from "./TokenAmount";
import { EditAmountPopup } from "./EditAmountPopup";
import { Address } from "./Address";

export function Balances() {
  const { data } = useTokenInfo();
  const [amount] = useAtom(amountToMigrateAtom);

  return (
    <Card>
      <CardBody>
        <Text
          sx={{ mb: 3 }}
          textColor={"whiteAlpha.500"}
          fontSize={"sm"}
          fontWeight={"medium"}
          textTransform={"uppercase"}
        >
          Balances
        </Text>
        <Card bgColor={"red.800"}>
          <CardBody>
            <TokenAmount
              title={"OLD TOKEN"}
              balance={amount ?? ""}
              symbol={data?.old.symbol} />
            <EditAmountPopup />
            <Spacer h={2} />
            <Address address={data?.old.address ?? ""} />
            {data?.old.balanceOf === "0" && (
              <>
                <Spacer h={2} />
                <Alert status="error">
                  <AlertIcon />
                  <AlertTitle>No tokens to migrate</AlertTitle>
                </Alert>
              </>
            )}
          </CardBody>
        </Card>
        <Spacer h={4} />
        <Card bgColor={"green.800"}>
          <CardBody>
            <TokenAmount
              title={"NEW TOKEN"}
              balance={data?.new.balanceOfUI}
              symbol={data?.new.symbol} />
            <Address address={data?.new.address ?? ""} />
          </CardBody>
        </Card>
      </CardBody>
    </Card>
  );
}
