import {
    Badge,
    Box,
    Button,
    Image,
    Link,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
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
    useDisclosure,
    useToast,
    VStack
} from "@chakra-ui/react";
import React, {useEffect, useState} from "react";
import {ethers} from "ethers";
import KlimaGardenNFT from '../utils/KlimaGardenNFT.json';
import ConnectButton from "./ConnectButton";
import SwitchNetworkDialog from "./SwitchNetworkDialog";
import * as Constants from "../constants";


export const Welcome = () => {
    const [currentAccount, setCurrentAccount] = useState("");
    const [isMinting, setIsMinting] = useState(false);
    const [mintStatus, setMintStatus] = useState("");
    const [sklimaBalance, setSklimaBalance] = useState(0);
    const toast = useToast();
    // const { balanceWarningIsOpen, balanceWarningOnOpen, balanceWarningOnClose } = useDisclosure();

    const ethersProvider = () => {
        return new ethers.providers.AlchemyProvider(process.env.REACT_APP_ALCHEMY_PROVIDER_NETWORK, process.env.REACT_APP_ALCHEMY_PROVIDER_API_KEY);
    }

    const getSklimaContract = () => {
        const provider = ethersProvider();
        return new ethers.Contract(Constants.SKLIMA_CONTRACT_ADDRESS, Constants.SKLIMA_ABI, provider);
    }

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

                const provider = new ethers.providers.Web3Provider(ethereum);
                const signer = provider.getSigner();
                const connectedContract = new ethers.Contract(Constants.KLIMAGARDEN_CONTRACT_ADDRESS, KlimaGardenNFT.abi, signer);

                try {
                    console.log("Going to pop wallet now to pay gas...")
                    setMintStatus("please wait...");
                    let nftTxn = await connectedContract.makeNFT(sklimaBalance);
                    console.log("Mining...please wait.")
                    setMintStatus("confirming...");
                    await nftTxn.wait();

                    const explorerUrl = Constants.networks[Constants.CHAIN_ID].blockExplorerUrls[0];
                    console.log(`Mined, see transaction: ${explorerUrl}/tx/${nftTxn.hash}`);
                    setMintStatus("Success!");
                }
                catch(err) {
                    toastError(err);
                }

                setIsMinting(false);

            } else {
                console.log("Ethereum object doesn't exist!");
            }
        } catch (err) {
            setMintStatus("error: " + err);
            setIsMinting(false);
            toastError(err);
        }
    }

    useEffect (() => {
        console.log("CURRENT ACCOUNT", currentAccount);
        if(currentAccount !== "") {
            const sklimaContract = getSklimaContract();
            sklimaContract.balanceOf(currentAccount).then(async (res) => {
                const formattedBalance = res.toNumber() / 1000000000;
                console.log("sklima balance", formattedBalance);
                setSklimaBalance(formattedBalance);
            }).catch((err) => {
                toastError(err);
            });
        }
    })

    return(
        <>
            <SwitchNetworkDialog/>
            {/*<Modal className="sklimaBalanceWarning" isOpen={balanceWarningIsOpen} onOpen={balanceWarningOnOpen} onClose={balanceWarningOnClose}>*/}
            {/*    <ModalOverlay />*/}
            {/*    <ModalContent>*/}
            {/*        <ModalHeader>Hold up</ModalHeader>*/}
            {/*        <ModalCloseButton />*/}
            {/*        <ModalBody>*/}
            {/*            <Box>You need to hold staked KLIMA tokens (sKlima) in order to mint a Klima Garden NFT plot.*/}
            {/*                Visit <Link href={"https://www.klimadao.finance/"}>klimadao.finance</Link> to get started.*/}
            {/*            </Box>*/}
            {/*        </ModalBody>*/}

            {/*        <ModalFooter>*/}
            {/*            <Button colorScheme="blue" mr={3} onClick={balanceWarningOnClose}>*/}
            {/*                Close*/}
            {/*            </Button>*/}
            {/*        </ModalFooter>*/}
            {/*    </ModalContent>*/}
            {/*</Modal>*/}
            <Box minH={"100vh"} minW={"100vw"} bg={"blue.200"} textAlign={"center"}>
                <Image src={"/klima-garden.gif"} margin={"auto"} mt={"20"}/>
                <Box textShadow={"1px 1px #381200"}
                      color={"#83c305"}
                      fontSize={"3xl"}
                      lineHeight={"1.9"}
                      mt={3}
                      className='App-eightbit'
                >
                    Get a <Text d="inline" color="yellow.300">KLIMA <br/>
                    Garden</Text> plot
                </Box>
                {currentAccount === "" ? (
                    <ConnectButton account={currentAccount} setAccount={setCurrentAccount}/>
                ) : (
                    <>
                        {isMinting ? (
                            <VStack mt={8} mb={8}>
                                <Spinner mb={4} color="gray.100"/>
                                <Text fontSize="md" textShadow={"1px 1px #333"} fontFamily={'"Press Start 2P", monospace'} color="gray.100">{mintStatus}</Text>
                            </VStack>
                        ) : (
                            <>
                                <Button  mt={8}
                                         mb={8}
                                         fontFamily='"Press Start 2P", monospace'
                                         color={"cyan.100"}
                                         borderColor={"cyan.100"}
                                         borderWidth={4}
                                         backgroundColor={"purple.400"}
                                         _hover={{backgroundColor: "purple.500"}}
                                         onClick={askContractToMintNft}
                                         borderRadius={"xl"}
                                         className="cta-button connect-wallet-button">
                                    Mint
                                </Button>
                            </>
                        )}

                        <Box fontFamily={"Roboto Mono"}>
                            sKLIMA holders may mint for 0.033 ETH.<br/>
                            Plot assignments are random.
                        </Box>
                        <Box>
                            <Popover>
                                <PopoverTrigger>
                                    <Badge
                                        backgroundColor={"blue.500"}
                                        color={"gray.200"}
                                        cursor={"pointer"}
                                        fontFamily={"Sans-Serif"}
                                        _hover={{backgroundColor: "blue.600"}}
                                    >Details</Badge>
                                </PopoverTrigger>
                                <PopoverContent>
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
                                                    <Td>one-of-a-kind</Td>
                                                    <Td>1</Td>
                                                </Tr>
                                                <Tr>
                                                    <Td>ultra rare</Td>
                                                    <Td>33</Td>
                                                </Tr>
                                                <Tr>
                                                    <Td>rare</Td>
                                                    <Td>323</Td>
                                                </Tr>
                                                <Tr>
                                                    <Td>common</Td>
                                                    <Td>1,000</Td>
                                                </Tr>
                                            </Tbody>
                                        </Table>
                                    </PopoverBody>
                                </PopoverContent>
                            </Popover>
                        </Box>
                    </>
                )}
            </Box>
        </>
    )
}



