import blueridge from './blueridge.svg';
import {useEffect, useState} from "react";
import {useInterval} from "usehooks-ts";
import {Box, HStack, Link, useToast} from "@chakra-ui/react";
import {ethers} from "ethers";
import {ExternalLinkIcon, LinkIcon} from "@chakra-ui/icons";
import * as Constants from '../constants';


export const NFT = () => {

    // **** Test Accounts ****
    const nftOwnerAddresses = [
        "0x9B394B315Ada446A1fAe283b7C84Cc139B30bd16",
        "0x1560684bad4d785c9864361cb3a43916c7abd89d",
        "0xcb927731f27898b30ad85964f9c5b784772cb924",
        "0x993b0af94d3e816aaa5e32381ed0ab30ad216bc9",
        "0x9868175e9e83bb4fd8bd879480b1075371399098"
    ];

    // **** Data from NFT ****
    const imgName = 'Blue Ridge Lo-Fi';
    const imgHash = 'QmVEsS6qQvatbArCSNYiJUJAKUi28orDH1dD2LoGUb6vZG';
    const imgUrl = process.env.REACT_APP_IPFS_GATEWAY_URL + '/ipfs/' + imgHash;

    const [sklimaBalance, setSklimaBalance] = useState('--.---');
    const [rebaseBlock, setRebaseBlock] = useState(0);
    const [epochNumber, setEpochNumber] = useState(0);
    const [secUntilRebase, setSecUntilRebase] = useState(0);
    const [percentageComplete, setPercentComplete] = useState(0);
    const [nftOwnerAddress, ] = useState(nftOwnerAddresses[Math.floor(Math.random() * nftOwnerAddresses.length)]);

    const [isUpdating, setIsUpdating] = useState(false);
    const toast = useToast();

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
        return new ethers.providers.AlchemyProvider(process.env.REACT_APP_ALCHEMY_PROVIDER_NETWORK, process.env.REACT_APP_ALCHEMY_PROVIDER_API_KEY);
    }

    const getSklimaContract = () => {
        const provider = ethersProvider();
        return new ethers.Contract(Constants.SKLIMA_CONTRACT_ADDRESS, Constants.SKLIMA_ABI, provider);
    }

    const getKlimaStakingContract = () => {
        const provider = ethersProvider();
        return new ethers.Contract(Constants.KLIMA_STAKING_CONTRACT_ADDRESS, Constants.KLIMA_STAKING_ABI, provider);
    }

    const getSvg = () => {
        return document.getElementById('nft').contentDocument;
    }

    const epochUpdate = async () => {
        console.log("Epoch update", Date.now());
        setIsUpdating(true);

        const EPOCH_SECONDS = 8 * 60 * 60;
        const rebaseInfo = await getKlimaStakingContract().epoch();
        const epochNum = rebaseInfo[1].toNumber();
        const rebaseBlk = rebaseInfo[2].toNumber();
        const seconds = await secondsUntilBlock(rebaseBlk);
        const perc = ((EPOCH_SECONDS - seconds) / EPOCH_SECONDS) * 100;
        const pcomplete = Math.round(perc);
        setEpochNumber(epochNum);
        setRebaseBlock(rebaseBlock);
        setSecUntilRebase(seconds);
        setPercentComplete(pcomplete);

        const sklimaContract = getSklimaContract();
        sklimaContract.balanceOf(nftOwnerAddress).then(async (res) => {
            const formattedBalance = res.toNumber() / 1000000000;
            const sKlimaBalance = formattedBalance.toPrecision(5).toString();
            setSklimaBalance(sKlimaBalance);

        }).catch((err) => {
            toastError(err);
        });

        setIsUpdating(false);
    }

    const convertHMS = (value) => {
        const sec = parseInt(value, 10); // convert value to number if it's string
        let hours   = Math.floor(sec / 3600); // get hours
        let minutes = Math.floor((sec - (hours * 3600)) / 60); // get minutes
        let seconds = sec - (hours * 3600) - (minutes * 60); //  get seconds
        hours = (hours > 0) ? (hours < 2) ? `${hours} hour ` : `${hours} hours ` : '';
        minutes = (minutes > 0) ? `${minutes} min ` : '';
        return hours + minutes + seconds + ' sec';
    }

    useEffect(() => {

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

    }, [sklimaBalance, percentageComplete]);

    return (
        <Box borderColor="gray.50" borderWidth="14px">
            <object onLoad={epochUpdate} id="nft" data={blueridge} width={["1024px", "768px"]} aria-label={imgName} type="image/svg+xml"/>
            <HStack fontSize="sm" backgroundColor="gray.50" paddingTop="14px" color={"green.700"}>
                <Box w="50%" textAlign="left">
                    epoch {epochNumber}
                </Box>
                <Box w="50%" textAlign="right">
                    <code>
                        rebase in {convertHMS(secUntilRebase)}
                    </code>
                </Box>
            </HStack>
            <HStack fontSize="sm" backgroundColor="gray.50" paddingTop="7px">
                <Box w="50%" textAlign="left">
                    <code>
                        <Link color="green.700" href={process.env.POLYGONSCAN_URL + "/address/" + nftOwnerAddress}  target="_blank">
                            {nftOwnerAddress}
                            <ExternalLinkIcon marginLeft={2}/>
                        </Link>
                    </code>
                </Box>
                <Box w="50%" textAlign="right">
                    <Link color="green.700" href={imgUrl} target="_blank" cursor="pointer" alignSelf={"end"}>
                            {imgName}
                            <LinkIcon marginLeft={2}/>
                    </Link>
                </Box>
            </HStack>
        </Box>
    );
}

