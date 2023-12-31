import { Card, CardBody, VStack } from "@chakra-ui/react";
import { Text } from "@chakra-ui/react";
import { useConfig } from "../lib/config";
import { Address } from "./Address";
import { Authorize } from "./Authorize";
import { Migrate } from "./Migrate";
import { EditAmountPopup } from "./EditAmountPopup";

export function MigrateProcess() {
  const config = useConfig();
  return (
    <VStack align={"stretch"}>
      <Card>
        <CardBody>
          <Text
            sx={{ mb: 3 }}
            textColor={"whiteAlpha.500"}
            fontSize={"sm"}
            fontWeight={"medium"}
            textTransform={"uppercase"}
          >
            Migration Process
          </Text>
          <VStack align={"stretch"}>
            <Authorize />
            <Migrate />
            <EditAmountPopup />
            <Card>
              <CardBody bgColor={"whiteAlpha.100"}>
                <Text>Migration Contract</Text>
                <Address address={config?.migrationContract ?? ""} />
              </CardBody>
            </Card>
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  );
}
