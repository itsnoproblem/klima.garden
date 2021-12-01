import {Box, Grid, HStack, IconButton} from "@chakra-ui/react";
import {ChevronLeftIcon} from "@chakra-ui/icons";
import {MenuLink} from "../MenuLink";
import {FaGithub, FaImage, FaQuestion} from "react-icons/all";

const WelcomeMenu = () => {
    return (
        <HStack top={4} w={"100vw"} backgroundColor={"blue.100"}>
            {window.location.pathname !== "/" && (<IconButton
                variant={"link"}
                onClick={() => { window.location.href="/"; }}
                backgroundColor={"blue.100"}
                _hover={{background: "blue.100", color: "purple.400"}}
                aria-label={ "back"}
                icon={(<ChevronLeftIcon fontSize="lg" _hover={{color: "purple.400" }} color={"blue.500"} />)}
            ></IconButton>)}
            <Grid templateColumns="repeat(3, 1fr)" w="100%" backgroundColor={"blue.100"}>
                <Box>
                    <MenuLink Href={"/3,3/gallery/1"} value={(<HStack><b>gallery</b><FaImage/></HStack>)} color={"blue.500"} hoverColor={"purple.500"}/>
                </Box>
                <Box>
                    <MenuLink Href={"/faq"} value={(<HStack><b>faq</b><FaQuestion/></HStack>)} color={"blue.500"} hoverColor={"purple.500"}/>
                </Box>
                <Box>
                    <MenuLink Href={"https://www.github.com/itsnoproblem/klima.garden"} value={(<HStack><b>github</b><FaGithub/></HStack>)} color={"blue.500"} hoverColor={"purple.500"}/>
                </Box>
            </Grid>
        </HStack>
    )
}

export default WelcomeMenu;