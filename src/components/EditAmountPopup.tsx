import {
  Button, FormControl,
  FormLabel, Input,
  InputGroup,
  InputRightElement, Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay, useDisclosure
} from "@chakra-ui/react";
import BN from "bignumber.js";
import { useTokenInfo } from "../hooks/useTokenInfo";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import React from "react";
import { useConnectionStatus } from "../hooks/useConnectionStatus";
import { amountToMigrateAtom } from "../lib/amountToMigrateAtom";

export function EditAmountPopup() {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [amount, setAmount] = useAtom(amountToMigrateAtom);
  const [value, setValue] = useState(amount ?? "");
  const initialRef = React.useRef(null);
  const { data } = useTokenInfo();
  const { network } = useConnectionStatus();

  useEffect(() => {
    setAmount(null);
  }, [network, setAmount]);

  useEffect(() => {
    if (amount === null && data?.old.balanceOfUI) {
      setAmount(data?.old.balanceOfUI);
      setValue(data?.old.balanceOfUI);
    }
  }, [data?.old.balanceOfUI, amount, setAmount]);

  const isInvalid = new BN(value).gt(data?.old.balanceOfUI ?? "0");

  return (
    <>
      <Button size={"sm"} onClick={onOpen}>
        SET AMOUNT
      </Button>
      <Modal initialFocusRef={initialRef} isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>SET AMOUNT</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl mt={4}>
              <FormLabel>Amount</FormLabel>
              <InputGroup>
                <Input
                  type="number"
                  onChange={(e) => setValue(e.target.value)}
                  ref={initialRef}
                  value={value}
                  isInvalid={isInvalid} />
                <InputRightElement>
                  <Button
                    onClick={() => {
                      setValue(data?.old.balanceOfUI ?? "0");
                    }}
                    size={"sm"}
                  >
                    MAX
                  </Button>
                </InputRightElement>
              </InputGroup>
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button
              isDisabled={isInvalid}
              onClick={() => {
                setAmount(value);
                onClose();
              }}
              colorScheme="blue"
              mr={3}
            >
              Save
            </Button>
            <Button onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
