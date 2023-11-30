import { useToast } from "@chakra-ui/react";
import { useEffect } from "react";

export function useSuccessToast(show: boolean, message: string) {
  const toast = useToast();

  useEffect(() => {
    show &&
      toast({
        title: message,
        // description: ,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
  }, [show, toast, message]);
}
