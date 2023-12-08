import "./App.css";
import {
  Box,
  Card,
  CardBody,
  HStack,
  Heading,
  Link,
  Spacer,
  VStack,
} from "@chakra-ui/react";
import { Text } from "@chakra-ui/react";
import { AdminPanel } from "./AdminPanel";
import { useConnectionStatus } from "../hooks/useConnectionStatus";
import { Connect } from "./Connect";
import { MigrateProcess } from "./MigrateProcess";
import { AddressWidget } from "./AddressWidget";
import { Balances } from "./Balances";

function App() {
  const { isConnected } = useConnectionStatus();

  return (
    <Box>
      
      <VStack spacing={4} align={"stretch"}>
        {isConnected && <AddressWidget />}
        <HStack>
          <img src="https://www.orbs.com/assets/img/common/logo.svg" />
          <Heading fontSize={24}>ORBS Migrator</Heading>
        </HStack>
        <Card w="100%">
          <CardBody>
            <Text>
              This tool enables you to exchange superseded ORBS tokens that were
              bridged on Multichain for current ORBS tokens bridged through
              Axelar, as decided in{" "}
              <Link
                isExternal
                color="blue.400"
                fontWeight={"bold"}
                href={
                  "https://www.orbs.com/OIP-6-Relief-for-Multichain-bridged-ORBS-Token-Holders/"
                }
              >
                OIP-6
              </Link>
            </Text>
          </CardBody>
        </Card>
        <Spacer h={4} />
        {!isConnected && <Connect />}
        {isConnected && <Balances />}
        <Spacer h={4} />
        {isConnected && <MigrateProcess />}
        <Spacer h={4} />
        {isConnected && <AdminPanel />}
        <Box as="footer" mt={10}>
          <Link
            href="https://github.com/orbs-network/oip6-migration-web"
            isExternal
          >
            <HStack>
              <Text>View on GitHub</Text>
            </HStack>
          </Link>
        </Box>
      </VStack>
    </Box>
  );
}

export default App;
