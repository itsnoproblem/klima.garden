import {useCallback, useEffect, useState} from "react";
import {useInterval} from "usehooks-ts";
import {Box, HStack, IconButton, Link, Progress, SimpleGrid, useMediaQuery, useToast} from "@chakra-ui/react";
import {ChevronLeftIcon, ExternalLinkIcon, Icon} from "@chakra-ui/icons";
import {FaFileImage} from "react-icons/fa";
import {GiSailboat} from "react-icons/gi";
import {BlueRidgeLoFi} from "./BlueRidgeLoFi";
import PageVisibility from 'react-page-visibility';
import {
    convertHMS,
    getKlimaGardenContract,
    getKlimaStakingContract,
    getSklimaContract,
    getSvg, getWSklimaContract,
    removeAllChildNodes,
    secondsUntilBlock,
    toastError
} from "./nftutils";

import * as Constants from '../constants';


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

    const updateSklimaBalance = useCallback((owner) => {
        const sklimaContract = getSklimaContract();

        sklimaContract.balanceOf(owner).then(async (sklima) => {
            let totalSklima = sklima.toNumber();
            const wsklimaContract = getWSklimaContract();
            const wsklima = await wsklimaContract.balanceOf(owner);
            console.log("got wsklima balance", wsklima);

            if(wsklima > 0) {
                try {
                    const wsklimaAsKlima = await wsklimaContract.wKLIMATosKLIMA(wsklima);
                    console.log("which is this much sklima", wsklimaAsKlima);
                    if(wsklimaAsKlima.toNumber() > 0) {
                        totalSklima += wsklimaAsKlima;
                    }
                }
                catch(err) {
                    toastError("Failed to convert wsKLIMA to sKLIMA value: " + err.toString());
                }

            }

            const formattedBalance = totalSklima / 1000000000;
            const sKlimaBalance = formattedBalance.toPrecision(5).toString();
            setSklimaBalance(sKlimaBalance);

        }).catch((err) => {
            toastError(toast, err);
        });
    }, [toast]);

    const fetchNFTData = useCallback(async () => {
        if(nftMetadata !== undefined) {
            return;
        }

        try {
            const contract = getKlimaGardenContract();
            contract.ownerOf(tokenId).then((owner) => {
                owner = "0x9B394B315Ada446A1fAe283b7C84Cc139B30bd16";
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
        const seconds = await secondsUntilBlock(rebaseBlk);
        const perc = ((EPOCH_SECONDS - seconds) / EPOCH_SECONDS) * 100;
        const pcomplete = Math.round(perc);
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
            fetchNFTData();
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

    return (
        <PageVisibility onChange={handleVisibilityChange}>
            <>
            <Box mb={3} ml={6} color="gray.600" textAlign="left" width={"100vw"}>
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

