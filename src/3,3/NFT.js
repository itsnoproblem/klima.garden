import blueridge from './blueridge.svg';
import KlimaGardenNFT from '../utils/KlimaGardenNFT.json';
import {useEffect, useState} from "react";
import {useInterval} from "usehooks-ts";
import {Box, HStack, IconButton, Link, useMediaQuery, useToast, Progress, SimpleGrid} from "@chakra-ui/react";
import {ethers} from "ethers";
import {ExternalLinkIcon, Icon, LinkIcon, ChevronLeftIcon, ViewIcon} from "@chakra-ui/icons";
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
    getKlimaGardenContract,
    getSklimaContract
} from "./nftutils";

import * as Constants from '../constants';


export const NFT = () => {

    const [sklimaBalance, setSklimaBalance] = useState('--.---');
    const [rebaseBlock, setRebaseBlock] = useState(0);
    const [epochNumber, setEpochNumber] = useState(0);
    const [secUntilRebase, setSecUntilRebase] = useState(0);
    const [percentageComplete, setPercentComplete] = useState(0);
    const [nftOwnerAddress, setNftOwnerAddress] = useState("");
    const [nftMetadata, setNftMetadata] = useState();
    const [tokenId, setTokenId] = useState();
    const [isUpdating, setIsUpdating] = useState(false);
    const toast = useToast();


    useInterval(() => {
        epochUpdate();
    }, 60000);

    useInterval(() => {
        if(!isUpdating) {
            setSecUntilRebase(secUntilRebase - 1);
        }
    }, 1000);


    const fetchNFTData = async () => {
        try {
            const url = new URL(window.location);
            const tokenFromPath = url.pathname.substring(url.pathname.lastIndexOf('/')+1)
            const tokenId = tokenFromPath;
            setTokenId(tokenFromPath);

            const contract = getKlimaGardenContract();
            contract.ownerOf(tokenId).then((owner) => {
                owner = "0x9B394B315Ada446A1fAe283b7C84Cc139B30bd16"; // OVERRIDE FOR TESTING
                setNftOwnerAddress(owner);
                updateSklimaBalance(owner);
            });

            contract.tokenURI(tokenId).then((uri) => {
                const metadata = JSON.parse(atob(uri.replace("data:application/json;base64,", "")));
                metadata.imgUrl = metadata.image?.replace('ipfs://', process.env.REACT_APP_IPFS_GATEWAY_URL)
                // metadata.image = 'ipfs://QmU3jXcdu8jGbfdRLuU2hPDLMK93hiH8aPx1MPobaSosfF';
                // metadata.image = 'ipfs://QmSmb8rvwNpPAbqa7Wipr3oeBHYjTsqS236pAyWw4rhup9';
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
    }

    const epochUpdate = async () => {
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
    }

    const updateSklimaBalance = (owner) => {
        const sklimaContract = getSklimaContract();
        sklimaContract.balanceOf(owner).then(async (res) => {
            console.log("got balance", res);
            const formattedBalance = res.toNumber() / 1000000000;
            const sKlimaBalance = formattedBalance.toPrecision(5).toString();
            setSklimaBalance(sKlimaBalance);

        }).catch((err) => {
            toastError(toast, err);
        });
    }

    useEffect(() => {

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

    }, [sklimaBalance, percentageComplete, fetchNFTData, epochUpdate, nftOwnerAddress]);

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

    return (
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
        </>
    );
}

