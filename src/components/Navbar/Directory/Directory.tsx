import { ChevronDownIcon } from "@chakra-ui/icons";
import {
  Box,
  Flex,
  Icon,
  Image,
  Menu,
  MenuButton,
  MenuList,
  Text,
} from "@chakra-ui/react";
import { TiHome } from "react-icons/ti";
import useDirectory from "../../../hooks/useDirectory";
import Communities from "./Communities";

const Directory: React.FC = () => {
  const { directoryState, toggleMenuOpen } = useDirectory();
  return (
    <Menu isOpen={directoryState.isOpen}>
      <MenuButton
        cursor="pointer"
        padding="0px 6px"
        borderRadius={4}
        mr={3}
        ml={{ base: 3, md: 2 }}
        _hover={{ outline: "1px solid", outlineColor: "gray.200" }}
        onClick={toggleMenuOpen}
      >
        <Flex
          align="center"
          justify="space-between"
          width={{ base: "auto", lg: "flex" }}
        >
          <Flex alignItems="center">
            <>
              {directoryState.selectedMenuItem.imageURL ? (
                <Image
                  borderRadius="full"
                  boxSize="24px"
                  src={directoryState.selectedMenuItem.imageURL}
                  mr={2}
                />
              ) : (
                <Icon
                  fontSize={24}
                  mr={{ base: 1, md: 2 }}
                  color={directoryState.selectedMenuItem.iconColor}
                  as={directoryState.selectedMenuItem.icon}
                />
              )}
              <Box
                display={{ base: "none", lg: "flex" }}
                flexDirection="column"
                fontSize="10pt"
              >
                <Text fontWeight={600}>
                  {directoryState.selectedMenuItem.displayText}
                </Text>
              </Box>
            </>
          </Flex>
          <ChevronDownIcon />
        </Flex>
      </MenuButton>
      <MenuList>
        <Communities />
      </MenuList>
    </Menu>
  );
};
export default Directory;
