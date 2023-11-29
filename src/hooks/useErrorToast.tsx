import { useToast } from "@chakra-ui/react";
import { useEffect } from "react";


export function useErrorToast(error: Error | null) {
  const toast = useToast();

  useEffect(() => {
    error &&
      toast({
        title: error.name,
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
  }, [error, toast]);
}
