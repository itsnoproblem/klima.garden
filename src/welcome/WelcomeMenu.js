import {Box, HStack} from "@chakra-ui/react";
import {ArrowForwardIcon} from "@chakra-ui/icons";
import {MenuLink} from "../MenuLink";

export default function WelcomeMenu() {
    return (
        <HStack align={"right"} m={3}>
            <Box ml={5}>
                <MenuLink Href={"/3,3/gallery/1"} value={(<><b>gallery</b><ArrowForwardIcon/></>)} color={"blue.500"} hoverColor={"purple.500"}/>
            </Box>
        </HStack>
    )
}