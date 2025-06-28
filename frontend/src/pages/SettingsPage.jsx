import {
  Box,
  Divider,
  Flex,
  Grid,
  GridItem,
  Link,
  Switch,
  Text,
  useColorMode,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";

export const SettingsPage = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <Flex w="full" justifyContent="center">
      <Box
        w={{ base: "95%", md: "80%", lg: "60%" }}
        mt={8}
        borderWidth={1}
        borderRadius={10}
        p={4}
        boxShadow="md"
      >
        <Grid templateRows="repeat(5, auto)" gap={3}>
          {[
            { label: "Followers", to: "/followers" },
            { label: "Following", to: "/following" },
            { label: "Update Profile", to: "/update" },
            { label: "Freeze Account", to: "/freeze" },
            { label: "Delete Account", to: "/delete" },
          ].map((item, index) => (
            <GridItem key={index}>
              <Flex gap={2} direction="column">
                <Link
                  as={RouterLink}
                  to={item.to}
                  _hover={{ textDecoration: "none" }}
                >
                  <Flex
                    justifyContent="space-between"
                    alignItems="center"
                    borderRadius={8}
                    p={3}
                    _hover={{ bg: "gray.800" }}
                  >
                    <Text fontSize={{ base: "md", sm: "lg" }}>
                      {item.label}
                    </Text>
                    <FaArrowRight size={20} />
                  </Flex>
                </Link>
                <Divider />
              </Flex>
            </GridItem>
          ))}
          <GridItem>
            <Flex
              justifyContent="space-between"
              alignItems="center"
              borderRadius={8}
              p={3}
              _hover={{ bg: "gray.800" }}
            >
              <Text fontSize={{ base: "md", sm: "lg" }}>Appearance</Text>
              <Switch
                isChecked={colorMode === "dark"}
                onChange={toggleColorMode}
                // colorScheme="blue.700"
                sx={{
                  ".chakra-switch__track": {
                    bg: colorMode === "dark" ? "green.600" : "gray.800",
                  },
                }}
              />
            </Flex>
          </GridItem>
        </Grid>
      </Box>
    </Flex>
  );
};
