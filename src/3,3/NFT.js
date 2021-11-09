import blueridge from './blueridge.svg';
import KlimaGardenNFT from '../utils/KlimaGardenNFT.json';
import {useEffect, useState} from "react";
import {useInterval} from "usehooks-ts";
import {Box, HStack, IconButton, Link, useMediaQuery, useToast, Progress, SimpleGrid} from "@chakra-ui/react";
import {ethers} from "ethers";
import {ExternalLinkIcon, Icon, LinkIcon, ChevronLeftIcon, ViewIcon} from "@chakra-ui/icons";
import {FaFileImage} from "react-icons/fa";
import {GiSailboat} from "react-icons/gi";

import * as Constants from '../constants';


export const NFT = () => {
    // **** Data from NFT ****
    const imgName = 'Blue Ridge Lo-Fi';
    const imgHash = 'QmVEsS6qQvatbArCSNYiJUJAKUi28orDH1dD2LoGUb6vZG';
    const imgUrl = process.env.REACT_APP_IPFS_GATEWAY_URL + '/ipfs/' + imgHash;

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

    let alchemyProvider;

    useInterval(() => {
        epochUpdate();
    }, 60000);

    useInterval(() => {
        if(!isUpdating) {
            setSecUntilRebase(secUntilRebase - 1);
        }
    }, 1000)

    const toastError = (err) => {
        let errMessage = "An error occurred";
        if(err.message !== undefined) {
            errMessage = err.message;
        }

        if(err.data !== undefined) {
            if(err.data.message !== undefined) {
                errMessage += " " + err.data.message;
            }
        }

        toast({
            title: "Error",
            description: errMessage,
            status: "error",
            duration: 9000,
            isClosable: true,
        });
    }


    const secondsUntilBlock = async (block)  => {
        try {
            const url = `https://api.polygonscan.com/api?module=block&action=getblockcountdown&blockno=${block}&apikey=${process.env.REACT_APP_POLYGONSCAN_API_KEY}`;
            const result = await fetch(url);
            const response = await result.json();
            console.log("scan response", response);
            return response['result']['EstimateTimeInSec'];
        }
        catch(e) {
            toastError(e);
            return -1;
        }
    }

    const removeAllChildNodes = (parent) => {
        while (parent.firstChild) {
            parent.removeChild(parent.firstChild);
        }
    }

    const ethersProvider = () => {
        if(alchemyProvider === undefined) {
            alchemyProvider = new ethers.providers.AlchemyProvider(process.env.REACT_APP_ALCHEMY_PROVIDER_NETWORK, process.env.REACT_APP_ALCHEMY_PROVIDER_API_KEY);
        }
        return  alchemyProvider;
    }

    const getSklimaContract = () => {
        const provider = ethersProvider();
        return new ethers.Contract(Constants.SKLIMA_CONTRACT_ADDRESS, Constants.SKLIMA_ABI, provider);
    }

    const getKlimaStakingContract = () => {
        const provider = ethersProvider();
        return new ethers.Contract(Constants.KLIMA_STAKING_CONTRACT_ADDRESS, Constants.KLIMA_STAKING_ABI, provider);
    }

    const getKlimaGardenContract =() => {
        const provider = new ethers.providers.JsonRpcProvider(process.env.REACT_APP_MUMBAI_PROVIDER_URL);
        return new ethers.Contract(Constants.KLIMAGARDEN_CONTRACT_ADDRESS, KlimaGardenNFT.abi, provider);
    }

    const getSvg = () => {
        return document.getElementById('nft')?.contentDocument;
    }


    const fetchNFTData = async () => {
        try {
            const url = new URL(window.location);
            const tokenFromPath = url.pathname.substring(url.pathname.lastIndexOf('/')+1)
            const tokenId = tokenFromPath;
            setTokenId(tokenFromPath);
            let owner;

            const contract = getKlimaGardenContract();
            contract.ownerOf(tokenId).then((owner) => {
                setNftOwnerAddress(owner);
                updateSklimaBalance(owner);
            });

            contract.tokenURI(tokenId).then((uri) => {
                const metadata = JSON.parse(atob(uri.replace("data:application/json;base64,", "")));
                setNftMetadata(metadata);
                console.log("tokenURI", metadata);
            });


        }
        catch(err) {
            console.log(err);
            setNftOwnerAddress("failed");
            console.log(err.args)
            toastError(err);
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
            toastError(err);
        });
    }

    const convertHMS = (value) => {
        const sec = parseInt(value, 10); // convert value to number if it's string
        let hours   = Math.floor(sec / 3600); // get hours
        let minutes = Math.floor((sec - (hours * 3600)) / 60); // get minutes
        let seconds = sec - (hours * 3600) - (minutes * 60); //  get seconds
        hours = (hours > 0) ? (hours < 2) ? `${hours}h ` : `${hours}h ` : '';
        minutes = (minutes > 0) ? `${minutes}m ` : '';
        return hours + minutes + seconds + 's';
    }

    useEffect(() => {

        window.addEventListener('load', () => {
            fetchNFTData();
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

    }, [sklimaBalance, percentageComplete, fetchNFTData, nftOwnerAddress]);

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
            <Box mb={3} ml={6} color="gray.600" textAlign="left" width={"100%"}>
                <SimpleGrid columns={2} position={"absolute"} top={3} width={"98%"}>
                    <Box>
                        <IconButton onClick={() => {window.location="/"}} icon={(<ChevronLeftIcon/>)} size={"2xl"}/>
                    </Box>
                    <HStack pr={6} textAlign={"right"}>
                        {/*<Link w="100%"*/}
                        {/*      textAlign="right"*/}
                        {/*      href={`${Constants.OPENSEA_URL}/${Constants.KLIMAGARDEN_CONTRACT_ADDRESS}/${tokenId}`}*/}
                        {/*      fontSize="lg"*/}
                        {/*      target={"_blank"}*/}
                        {/*>*/}
                        {/*    OpenSea <ExternalLinkIcon ml={1}/>*/}
                        {/*</Link>*/}
                    </HStack>
                </SimpleGrid>
            </Box>
            <Box borderColor="gray.50" borderWidth="14px">
                <object
                    id="nft"
                    type="image/svg+xml"
                    data={blueridge}
                    width={imgWidth}
                    style={{"objectFit": "contain"}}
                    aria-label={nftMetadata?.name}
                    onLoad={epochUpdate}
                />
                <HStack fontSize="sm" backgroundColor="gray.50" paddingTop="14px" color={"green.700"}>
                    <Box w="70%">
                        <SimpleGrid columns={2}>
                            <Box alignItems={"bottom"}><Progress mt={1} mr={4} isIndeterminate={false} size="md" min={0} max={100} value={percentageComplete} backgroundColor={"gray.200"}/></Box>
                            <Box align="left">
                                <code>rebase in {convertHMS(secUntilRebase)}</code>
                            </Box>
                        </SimpleGrid>
                    </Box>
                    <Box w="30%" align="right">
                        epoch {epochNumber}
                    </Box>
                </HStack>

                <HStack fontSize="sm" backgroundColor="gray.50" paddingTop="7px" color={"green.700"}>
                    <Box w="70%" align={"left"}>Balance: {sklimaBalance} sKLIMA</Box>
                    <Box w="30%" align="right">
                        Minted with {getNftAttribute('Minted with sKLIMA')} sKLIMA
                    </Box>
                </HStack>

                <HStack fontSize="sm" backgroundColor="gray.50" paddingTop="7px">
                    <Box w="70%" textAlign="left">
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
                    <Box w="30%" textAlign="right">
                        <Link color="green.700" href={imgUrl} target="_blank" cursor="pointer" alignSelf={"end"}>
                                {nftMetadata?.name} ({getNftAttribute("rarity")})
                                <Icon as={FaFileImage} marginLeft={2}/>
                        </Link>
                    </Box>
                </HStack>
            </Box>
        </>
    );
}

