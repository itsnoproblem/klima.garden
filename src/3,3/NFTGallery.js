import {useEffect, useState} from "react";
import {useInterval} from "usehooks-ts";
import {Box, HStack, IconButton, Link, Progress, SimpleGrid, Stack, useMediaQuery, useToast} from "@chakra-ui/react";
import {ChevronLeftIcon, ExternalLinkIcon, Icon} from "@chakra-ui/icons";
import {FaFileImage} from "react-icons/fa";
import {GiSailboat} from "react-icons/gi";
import {BlueRidgeLoFi} from "./BlueRidgeLoFi";
import {
    convertHMS,
    getKlimaStakingContract,
    getSvg,
    removeAllChildNodes,
    secondsUntilBlock,
    toastError,
} from "./nftutils";
import {MenuLink} from "../MenuLink";
import * as Constants from '../constants';
import {useParams} from "react-router-dom";
import {usePageVisibility} from "react-page-visibility";
import PageVisibility from 'react-page-visibility';


export const NFTGallery = () => {

    const sklimaBalance = "323.00";
    const nftOwnerAddress = "0x0";
    const tokenId = 0;

    const [rebaseBlock, setRebaseBlock] = useState(0);
    const [epochNumber, setEpochNumber] = useState(0);
    const [secUntilRebase, setSecUntilRebase] = useState(0);
    const {variant} = useParams();
    const [percentageComplete, setPercentComplete] = useState(0);
    const [isUpdating, setIsUpdating] = useState(false);
    const toast = useToast();
    const isVisible = usePageVisibility();

    let nftMetadata;

    switch(variant) {
        case "1":
            nftMetadata = {
                "name": "Blue Ridge Lo-Fi",
                "description": "A tribute to the earth's natural beauty made visible by human ingenuity.",
                "image": "ipfs://QmVEsS6qQvatbArCSNYiJUJAKUi28orDH1dD2LoGUb6vZG",
                "external_link": "https://klima.garden/3,3/1",
                "attributes": [
                    {
                        "trait_type": "rarity",
                        "value": "common - 1 of 1000"
                    },
                    {
                        "trait_type": "Minted with sKLIMA",
                        "display_type": "number",
                        "value": "0"
                    }
                ],
                "imgUrl": "https://gateway.pinata.cloudQmVEsS6qQvatbArCSNYiJUJAKUi28orDH1dD2LoGUb6vZG"
            }
            break;

        case "2":
            nftMetadata = {
                "name": "Comfy (🌳, 🌳)",
                "description": "",
                "image": "ipfs://QmSmb8rvwNpPAbqa7Wipr3oeBHYjTsqS236pAyWw4rhup9",
                "external_link": "https://klima.garden/3,3/1",
                "attributes": [
                    {
                        "trait_type": "rarity",
                        "value": "rare - 1 of 323"
                    },
                    {
                        "trait_type": "Minted with sKLIMA",
                        "display_type": "number",
                        "value": "0"
                    }
                ],
                "imgUrl": "https://gateway.pinata.cloudQmVEsS6qQvatbArCSNYiJUJAKUi28orDH1dD2LoGUb6vZG"
            }
            break;

        case "3":
            nftMetadata = {
                "name": "Sequestered",
                "description": "",
                "image": "ipfs://QmU3jXcdu8jGbfdRLuU2hPDLMK93hiH8aPx1MPobaSosfF",
                "external_link": "https://klima.garden/3,3/1",
                "attributes": [
                    {
                        "trait_type": "rarity",
                        "value": "ultra-rare - 1 of 33"
                    },
                    {
                        "trait_type": "Minted with sKLIMA",
                        "display_type": "number",
                        "value": "0"
                    }
                ],
                "imgUrl": "https://gateway.pinata.cloudQmVEsS6qQvatbArCSNYiJUJAKUi28orDH1dD2LoGUb6vZG"
            }
            break;


    }


    useInterval(() => {
        epochUpdate();
    }, 60000);

    useInterval(() => {
        if(!isUpdating) {
            setSecUntilRebase(secUntilRebase - 1);
        }
    }, 1000);


    const epochUpdate = async () => {
        console.log("pageIsVisible", isVisible);
        if(!isVisible) {
            return;
        }

        console.log("Epoch update", Date.now());
        setIsUpdating(true);

        const EPOCH_SECONDS = 8 * 60 * 60;
        const rebaseInfo = await getKlimaStakingContract().epoch();
        console.log("ebaseInfo",
            rebaseInfo[0].toNumber(),
            rebaseInfo[1].toNumber(),
            rebaseInfo[2].toNumber(),
            rebaseInfo[3].toNumber(),
            rebaseInfo.distribute.toNumber(),
            rebaseInfo.endBlock.toNumber(),
            rebaseInfo.number.toNumber()
        );
        console.log(rebaseInfo);

        const epochNum = rebaseInfo[1].toNumber();
        const rebaseBlk = rebaseInfo[2].toNumber();
        const seconds = await secondsUntilBlock(rebaseBlk).catch((e) => {
            toastError(toast, e);
            return -1;
        });
        const perc = ((EPOCH_SECONDS - seconds) / EPOCH_SECONDS) * 100;
        const pcomplete = Math.round(perc);
        setEpochNumber(epochNum);
        setRebaseBlock(rebaseBlock);
        setSecUntilRebase(seconds);
        setPercentComplete(pcomplete);
        console.log("percentage complete", pcomplete);
        setIsUpdating(false);
    }

    useEffect(() => {
        window.addEventListener('load', () => {
           epochUpdate();
        });

        const svgObject = getSvg();
        if(svgObject) {
            const prog = svgObject.getElementById('progress');
            if(prog) {
                prog.setAttribute('width', (percentageComplete / 100) * 640);
                prog.setAttribute('opacity', 0.75);
            }

            const txt = document.createTextNode(sklimaBalance);
            const element = svgObject.getElementById('sklima');
            if(element) {
                removeAllChildNodes(element);
                element.appendChild(txt);
            }
        }

    }, [sklimaBalance, percentageComplete, nftOwnerAddress, epochUpdate]);

    const [isLargerThan800] = useMediaQuery("(min-width: 800px)")
    const imgWidth = isLargerThan800 ? "1024px" : "100%";

    const getNftAttribute = (name) => {
        let attr;
        if(nftMetadata?.attributes) {
            // console.log("attributes", nftMetadata?.attributes);
            let t; for(t of nftMetadata?.attributes) {
                if(t.trait_type === name) {
                    return t.value;
                }
            };
        }
        return attr;
    }

    const handleVisibilityChange = (visible) => {
        if(visible) {
            epochUpdate();
        }
    }

    return (
        <PageVisibility onChange={handleVisibilityChange}>
            <Box mb={3} color="gray.600" textAlign="left" width={"100vw"}>

                <Stack
                    ml={[0, 4]}
                    spacing={8}
                    align="center"
                    justify={["center", "space-between", "flex-start", "flex-start"]}
                    direction={["row", "row", "row", "row"]}
                    pt={[4, 4, 0, 0]}
                >
                    <Box>
                        <IconButton onClick={() => {window.location="/"}} icon={(<ChevronLeftIcon/>)} size={"2xl"}/>
                    </Box>
                    <MenuLink isSelected={variant === "1"} Href="/3,3/gallery/1" value="common"/>
                    <MenuLink isSelected={variant === "2"} Href="/3,3/gallery/2" value="rare"/>
                    <MenuLink isSelected={variant === "3"} Href="/3,3/gallery/3" value="ultra rare"/>
                    <MenuLink isSelected={variant === "4"} Href="/3,3/gallery/4" value="one-of-a-kind"/>
                </Stack>
                {/*<SimpleGrid columns={2} top={3} width={"100%"}>*/}
                {/*    <Box>*/}
                {/*        <IconButton onClick={() => {window.location="/"}} icon={(<ChevronLeftIcon/>)} size={"2xl"}/>*/}
                {/*    </Box>*/}
                {/*    <Box>*/}
                {/*        <Tabs>*/}
                {/*            <TabList>*/}
                {/*                <Tab>One</Tab>*/}
                {/*                <Tab>Two</Tab>*/}
                {/*                <Tab>Three</Tab>*/}
                {/*            </TabList>*/}
                {/*        </Tabs>*/}
                {/*    </Box>*/}
                {/*</SimpleGrid>*/}
            </Box>
            <Box w={["100vw", "inherit"]}>
                <Box borderColor="gray.50" borderWidth="14px" m={0}>
                    {/* **************** */}
                    {/* blue ridge lo-fi */}
                    {/* **************** */}
                    {(nftMetadata?.image === "ipfs://QmVEsS6qQvatbArCSNYiJUJAKUi28orDH1dD2LoGUb6vZG") && (
                        <BlueRidgeLoFi width={imgWidth} name={nftMetadata?.name} onLoad={epochUpdate}/>
                    )}

                    {/* *********** */}
                    {/* sequestered */}
                    {/* *********** */}
                    {(nftMetadata?.image === "ipfs://QmU3jXcdu8jGbfdRLuU2hPDLMK93hiH8aPx1MPobaSosfF") && (
                        <video width={1024} autoPlay loop>
                            <source src="https://gateway.pinata.cloud/ipfs/QmU3jXcdu8jGbfdRLuU2hPDLMK93hiH8aPx1MPobaSosfF" type="video/mp4"/>
                            Your browser does not support the video tag.
                        </video>
                    )}

                    {/* *********** */}
                    {/* tree tree   */}
                    {/* *********** */}
                    {(nftMetadata?.image === "ipfs://QmSmb8rvwNpPAbqa7Wipr3oeBHYjTsqS236pAyWw4rhup9") && (
                        <video width={1024} autoPlay loop>
                            <source src="https://gateway.pinata.cloud/ipfs/QmSmb8rvwNpPAbqa7Wipr3oeBHYjTsqS236pAyWw4rhup9" type="video/mp4"/>
                            Your browser does not support the video tag.
                        </video>
                    )}


                    <SimpleGrid columns={[1,2]} w="100%" fontSize="sm" backgroundColor="gray.50" paddingTop="14px" color={"green.700"}>
                        <Box>
                            <SimpleGrid columns={[1,2]}>
                                <Box alignItems={"bottom"}><Progress mt={1} mr={4} isIndeterminate={false} size="md" min={0} max={100} value={percentageComplete} backgroundColor={"gray.200"}/></Box>
                                <Box align="left">
                                    <code>rebase in {convertHMS(secUntilRebase)}</code>
                                </Box>
                            </SimpleGrid>
                        </Box>
                        <Box textAlign={{base: "left", lg: "right"}}>
                            epoch {epochNumber}
                        </Box>

                        <Box align={"left"}>Balance: {sklimaBalance} sKLIMA</Box>
                        <Box textAlign={["left", "right"]}>
                            Minted with {getNftAttribute('Minted with sKLIMA')} sKLIMA
                        </Box>

                        <Box textAlign="left">
                            <HStack>
                                <code>
                                    <Link
                                        color="green.700"
                                        target="_blank"
                                        href={Constants.OPENSEA_URL + "/assets/" + Constants.KLIMAGARDEN_CONTRACT_ADDRESS + "/" + tokenId}
                                    >
                                        OpenSea
                                        <Icon as={GiSailboat} w={5} h={5} marginLeft={2}/>
                                    </Link>
                                    <Link ml={4} color="green.700" href={process.env.REACT_APP_EXPLORER_URL + "/address/" + nftOwnerAddress}  target="_blank">
                                        {nftOwnerAddress.substring(0, 5)+"..."+nftOwnerAddress.substring(-4, 4)}
                                        <ExternalLinkIcon marginLeft={2}/>
                                    </Link>
                                </code>
                            </HStack>

                        </Box>
                        <Box textAlign={["left", "right"]}>
                            <Link color="green.700" href={nftMetadata?.imgUrl} target="_blank" cursor="pointer" alignSelf={"end"}>
                                {nftMetadata?.name} ({getNftAttribute("rarity")})
                                <Icon as={FaFileImage} marginLeft={2}/>
                            </Link>
                        </Box>
                    </SimpleGrid>
                </Box>
            </Box>
        </PageVisibility>
    );
}

