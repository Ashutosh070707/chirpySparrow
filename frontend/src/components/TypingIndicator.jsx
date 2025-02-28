// TypingIndicator.jsx
import { Flex, keyframes } from "@chakra-ui/react";

const bounceAnimation = keyframes`
  0%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-5px); }
`;

export const TypingIndicator = () => {
  return (
    // <Flex
    //   justifyContent="center"
    //   alignItems="center"
    //   p={1}
    //   bgColor="#CBC3E3"
    //   borderRadius={40}
    // >
    <Flex gap={1} p={1} alignItems="center">
      {[1, 2, 3].map((dot) => (
        <Flex
          key={dot}
          w="6px"
          h="6px"
          bgColor="#FFC300"
          borderRadius="full"
          animation={`${bounceAnimation} 1.4s ease-in-out ${
            dot * 0.12
          }s infinite`}
        />
      ))}
    </Flex>
    // </Flex>
  );
};
