// Description:
// Renders Project name

import { Flex, Text, useColorMode } from "@chakra-ui/react";
import React from "react";
import { FaDove } from "react-icons/fa";

export const Brand = React.memo(() => {
  // const { colorMode, toggleColorMode } = useColorMode(); // hook - coming from chakra UI.
  return (
    <>
      <Flex justifyContent={"center"} alignItems={"center"} mb={4}>
        <Flex alignItems="center" gap={3}>
          <FaDove size={32} color="orange" />
          <Text
            fontSize={{ base: "2xl", sm: "3xl", md: "4xl" }}
            fontWeight="bold"
            fontFamily={"Comic Sans MS, Comic Sans, cursive"}
          >
            ChirpySparrow
          </Text>
          <FaDove
            size={32}
            color="orange"
            style={{ transform: "scaleX(-1)" }}
          />
        </Flex>
      </Flex>
    </>
  );
});
