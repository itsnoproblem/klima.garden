import {
    Badge,
    Box,
    Button,
    HStack,
    Image,
    Link,
    Popover,
    PopoverArrow,
    PopoverBody,
    PopoverCloseButton,
    PopoverContent,
    PopoverTrigger,
    Spinner,
    Table,
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tr,
    useToast,
    VStack
} from "@chakra-ui/react";
import React, {useState} from "react";
import {BigNumber, ethers} from "ethers";
import KlimaGardenNFT from '../utils/KlimaGardenNFT.json';
import ConnectButton from "./ConnectButton";
import SwitchNetworkDialog from "./SwitchNetworkDialog";
import * as Constants from "../constants";
import WelcomeMenu from "./WelcomeMenu";

export const Welcome = () => {
    const [currentAccount, setCurrentAccount] = useState("");
    const [isMinting, setIsMinting] = useState(false);
    const [mintStatus, setMintStatus] = useState("");
    const [sklimaBalance, ] = useState(0);
    const [sklimaBalanceRaw, ] = useState(BigNumber.from(0));
    const toast = useToast();

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

    const askContractToMintNft = async () => {
        try {
            const { ethereum } = window;

            if (ethereum) {
                setIsMinting(true);
                setMintStatus("awaiting user confirmation...")
                console.log("About to mint with BALANCE", sklimaBalance);
                console.log("BN Balance", sklimaBalanceRaw);

                const provider = new ethers.providers.Web3Provider(ethereum);
                const signer = provider.getSigner();
                const connectedContract = new ethers.Contract(Constants.KLIMAGARDEN_CONTRACT_ADDRESS, KlimaGardenNFT.abi, signer);

                window.fathom.trackGoal('OMD4FKVL', 0);

                try {
                    setMintStatus("please wait...");
                    let nftTxn = await connectedContract.makeNFT(sklimaBalanceRaw);
                    setMintStatus("confirming...");
                    window.fathom.trackGoal('SX2IES2N', 0);
                    await nftTxn.wait();

                    const explorerUrl = Constants.networks[Constants.CHAIN_ID].blockExplorerUrls[0];
                    const msg = (<Box>Transaction was mined, your NFT is being prepared.  See transaction <Link href={`${explorerUrl}/tx/${nftTxn.hash}`}>here</Link></Box>);

                    toast({
                        title: "Success",
                        description: msg,
                        status: "success",
                        duration: 9000,
                        isClosable: true,
                    });

                    setMintStatus("Success! Your plot is being prepared...");
                }

                catch(err) {
                    window.fathom.trackGoal('7DCJM3MX', 0);
                    toastError(err);
                    setIsMinting(false);
                }

            } else {
                console.log("Ethereum object doesn't exist!");
                setIsMinting(false);
            }

        } catch (err) {
            setMintStatus("error: " + err);
            setIsMinting(false);
            toastError(err);
        }
    }

    // useEffect (() => {
    //
    // })

    return(
        <>
            <SwitchNetworkDialog/>
            <WelcomeMenu/>
            <Box minH={"100vh"} minW={"100vw"} bg={"blue.200"} textAlign={"center"}>
                <Image src={"/klima-garden.gif"} margin={"auto"} mt={["10", "20"]}/>
                <Box textShadow={"1px 1px #381200"}
                      color={"#83c305"}
                      fontSize={["xl", "3xl"]}
                      lineHeight={"1.9"}
                      mt={3}
                      className='App-eightbit'
                >
                    Get a <Text d="inline" color="yellow.300">KLIMA <br/>
                    Garden</Text> plot
                </Box>
                {currentAccount === "" ? (
                    <ConnectButton account={currentAccount} setAccount={setCurrentAccount} setIsMinting={setIsMinting}/>
                ) : (
                    <>
                        {isMinting ? (
                            <VStack mt={8} mb={8}>
                                <Spinner mb={4} color="gray.100"/>
                                <Text fontSize="md" textShadow={"1px 1px #333"} fontFamily={'"Press Start 2P", monospace'} color="gray.100">{mintStatus}</Text>
                            </VStack>
                        ) : (
                            <HStack mb={8} ml={"auto"} mr={"auto"} d={"inline-flex"}>
                                <Button  mt={6}
                                         mb={6}
                                         fontFamily='"Press Start 2P", monospace'
                                         color={"cyan.100"}
                                         borderColor={"cyan.100"}
                                         borderWidth={4}
                                         backgroundColor={"purple.600"}
                                         _hover={{backgroundColor: "purple.500"}}
                                         onClick={askContractToMintNft}
                                         borderRadius={"xl"}
                                         className="cta-button connect-wallet-button">
                                    Mint
                                </Button>
                                <Box>
                                    <Popover colorScheme={"blue"}>
                                        <PopoverTrigger>
                                            <Badge
                                                backgroundColor={"blue.500"}
                                                color={"gray.200"}
                                                cursor={"pointer"}
                                                fontFamily={"Sans-Serif"}
                                                _hover={{backgroundColor: "blue.600"}}
                                            >Details</Badge>
                                        </PopoverTrigger>
                                        <PopoverContent backgroundColor={"gray.50"}>
                                            <PopoverArrow />
                                            <PopoverCloseButton color={"gray.600"}/>
                                            <PopoverBody>
                                                <Table color="gray.600" variant={"simple"} size={"sm"}>
                                                    <Thead>
                                                        <Tr>
                                                            <Th>type</Th>
                                                            <Th>quantity</Th>
                                                        </Tr>
                                                    </Thead>
                                                    <Tbody>
                                                        <Tr>
                                                            <Td><Link href={"/3,3/gallery/4"}>one-of-a-kind</Link></Td>
                                                            <Td>1</Td>
                                                        </Tr>
                                                        <Tr>
                                                            <Td><Link href={"/3,3/gallery/3"}>ultra rare</Link></Td>
                                                            <Td>33</Td>
                                                        </Tr>
                                                        <Tr>
                                                            <Td><Link href={"/3,3/gallery/2"}>rare</Link></Td>
                                                            <Td>323</Td>
                                                        </Tr>
                                                        <Tr>
                                                            <Td><Link href={"/3,3/gallery/1"}>common</Link></Td>
                                                            <Td>1,000</Td>
                                                        </Tr>
                                                    </Tbody>
                                                </Table>
                                            </PopoverBody>
                                        </PopoverContent>
                                    </Popover>
                                </Box>
                            </HStack>
                        )}

                    </>
                )}
            </Box>
        </>
    )
}



