import { useToast } from "@chakra-ui/react";
import { useEffect } from "react";

export function useSuccessToast(show: boolean) {
  const toast = useToast();

  useEffect(() => {
    show &&
      toast({
        title: "Transaction Issued",
        // description: ,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
  }, [show, toast]);
}
