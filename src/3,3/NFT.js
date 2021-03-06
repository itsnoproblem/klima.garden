import {useCallback, useEffect, useState} from "react";
import {useInterval} from "usehooks-ts";
import {Box, HStack, IconButton, Link, Progress, SimpleGrid, Text, useMediaQuery, useToast} from "@chakra-ui/react";
import {ChevronLeftIcon, ExternalLinkIcon, Icon} from "@chakra-ui/icons";
import {FaFileImage} from "react-icons/fa";
import {GiSailboat} from "react-icons/gi";
import {BlueRidgeLoFi} from "./BlueRidgeLoFi";
import PageVisibility from 'react-page-visibility';
import {
    convertHMS,
    getKlimaGardenContract,
    getKlimaStakingContract,
    getSvg,
    removeAllChildNodes,
    secondsUntilBlock,
    sklimaBalancesForOwner,
    toastError
} from "./nftutils";

import * as Constants from '../constants';
import {ethers} from "ethers";


export const NFT = () => {
    const url = new URL(window.location);
    const tokenFromPath = url.pathname.substring(url.pathname.lastIndexOf('/')+1)

    const [sklimaBalance, setSklimaBalance] = useState('--.---');
    const [lastUpdate, setLastUpdate] = useState();
    const [rebaseBlock, setRebaseBlock] = useState(0);
    const [epochNumber, setEpochNumber] = useState(0);
    const [secUntilRebase, setSecUntilRebase] = useState(0);
    const [percentageComplete, setPercentComplete] = useState(0);
    const [nftOwnerAddress, setNftOwnerAddress] = useState("");
    const [nftMetadata, setNftMetadata] = useState();
    const [browserIsVisible, setBrowserIsVisible] = useState(true);
    const [tokenId, ] = useState(tokenFromPath);
    const [isUpdating, setIsUpdating] = useState(false);
    const toast = useToast();
    const [isLargerThan800] = useMediaQuery("(min-width: 800px)")
    const imgWidth = isLargerThan800 ? "1024px" : "100%";

    useInterval(() => {
        epochUpdate();
    }, 60000);

    useInterval(() => {
        if(!isUpdating) {
            setSecUntilRebase(secUntilRebase - 1);
        }
    }, 1000);

    const updateSklimaBalance = useCallback(async (owner) => {
        try {
            let bal = await sklimaBalancesForOwner(owner);
            let formattedBalance = ethers.utils.formatUnits(bal, 9);
            console.log("sklimaBalabcesForOwner: ", formattedBalance);
            setSklimaBalance(formattedBalance);
        }
        catch(err) {
            toastError(toast, err)
        }

    }, [toast]);

    const fetchNFTData = useCallback(async () => {
        if(nftMetadata !== undefined) {
            return;
        }

        try {
            const contract = getKlimaGardenContract();
            contract.ownerOf(tokenId).then((owner) => {
                setNftOwnerAddress(owner);
                updateSklimaBalance(owner);
            });

            contract.tokenURI(tokenId).then((uri) => {
                const metadata = JSON.parse(atob(uri.replace("data:application/json;base64,", "")));
                metadata.imgUrl = metadata.image?.replace('ipfs://', process.env.REACT_APP_IPFS_GATEWAY_URL)
                setNftMetadata(metadata);
                console.log("tokenURI", metadata);
            });
        }
        catch(err) {
            console.log(err);
            setNftOwnerAddress("failed");
            console.log(err.args)
            toastError(toast, err);
        }
    }, [nftMetadata, setNftMetadata, tokenId, toast, updateSklimaBalance]);

    const epochUpdate = useCallback(async () => {
        console.log("browserIsVisible", browserIsVisible);
        if(!browserIsVisible) {
            return;
        }

        const updateTime = Date.now();
        console.log("Epoch update", updateTime);
        setIsUpdating(true);
        setLastUpdate(updateTime);

        const EPOCH_SECONDS = 7.2 * 60 * 60;
        let rebaseBlk;
        let epochNum;
        let rebaseBlock;
        let seconds;
        let pcomplete;

        try {
            const rebaseInfo = await getKlimaStakingContract().epoch();

            console.log("rebaseInfo",
                rebaseInfo[0].toNumber(),
                rebaseInfo[1].toNumber(),
                rebaseInfo[2].toNumber(),
                rebaseInfo[3].toNumber(),
                rebaseInfo.distribute.toNumber(),
                rebaseInfo.endBlock.toNumber(),
                rebaseInfo.number.toNumber()
            );
            console.log(rebaseInfo);

            epochNum = rebaseInfo[1].toNumber();
            rebaseBlk = rebaseInfo[2].toNumber();
            seconds = await secondsUntilBlock(rebaseBlk);
            const perc = ((EPOCH_SECONDS - seconds) / EPOCH_SECONDS) * 100;
            pcomplete = Math.round(perc);
        }
        catch(err) {
            console.error(err);
            epochNum = 0;
            rebaseBlock = 0;
            seconds = 0;
            pcomplete = 0;
        }

        setEpochNumber(epochNum);
        setRebaseBlock(rebaseBlock);
        setSecUntilRebase(seconds);
        setPercentComplete(pcomplete);
        console.log("percentage complete", pcomplete);

        if(nftOwnerAddress && nftOwnerAddress !== "failed") {
            updateSklimaBalance(nftOwnerAddress);
        }

        setIsUpdating(false);
    },[browserIsVisible, setIsUpdating, setLastUpdate, nftOwnerAddress, rebaseBlock, updateSklimaBalance]);

    useEffect(() => {

        if(lastUpdate < (Date.now() - 60000)) {
            epochUpdate();
        }

        window.addEventListener('load', () => {
            fetchNFTData().then(() => {
                epochUpdate().catch((err) => {
                    toastError(toast, err);
                });
            }).catch((err) => {
                toastError(toast, err);
            });
        });

        const svgObject = getSvg();
        if(svgObject) {
            const prog = svgObject.getElementById('progress');
            if(prog) {
                prog.setAttribute('width', (percentageComplete / 100) * 640);
                prog.setAttribute('opacity', 0.75);
            }

            const bal = new Number(sklimaBalance).toPrecision(4).toString();
            const txt = document.createTextNode(bal);
            const element = svgObject.getElementById('sklima');
            if(element) {
                removeAllChildNodes(element);
                element.appendChild(txt);
            }
        }

    }, [sklimaBalance, percentageComplete, nftOwnerAddress, lastUpdate, epochUpdate, fetchNFTData]);

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
        setBrowserIsVisible(visible);
    }

    const mintedWithSklima = getNftAttribute('Minted with sKLIMA') / 1000000000;
    let percChange = 100 * (sklimaBalance - mintedWithSklima) / sklimaBalance;
    percChange = percChange.toPrecision(4);

    return (
        <PageVisibility onChange={handleVisibilityChange}>
            <>
            <Box mb={3} ml={6} position={"absolute"} top={2} left={0} color="gray.600" textAlign="left" width={"100vw"}>
                <IconButton onClick={() => {window.location="/"}} icon={(<ChevronLeftIcon/>)} size={"2xl"}/>
            </Box>
            <Box w={["100vw", "inherit"]}>
                <Box borderColor="gray.50" borderWidth="14px" overflow={"hidden"}>
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

                        <Box align={"left"}>Balance: {sklimaBalance} sKLIMA <Text d="inline" color={percChange > 0 ? "green.500" : "red.400"}>({percChange > 0 && (<>+</>)}{percChange}%)</Text></Box>
                        <Box textAlign={["left", "right"]}>
                            Minted with {mintedWithSklima} sKLIMA
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
                                        {nftOwnerAddress.substring(0, 5)+"..."+nftOwnerAddress.substring(nftOwnerAddress.length - 4, nftOwnerAddress.length)}
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
            </>
        </PageVisibility>
    );
}

