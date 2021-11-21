import React, {useEffect} from "react";
import {ethers} from "ethers";
import {
    Button,
    Link,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    useToast
} from "@chakra-ui/react";
import * as Constants from "../constants";
import KlimaGardenNFT from "../utils/KlimaGardenNFT.json";

export default function ConnectButton(props) {
    const toast = useToast();

    const setupEventListener = async () => {

        try {
            const { ethereum } = window;

            if (ethereum) {
                const provider = new ethers.providers.Web3Provider(ethereum);
                const signer = provider.getSigner();
                const connectedContract = new ethers.Contract(Constants.KLIMAGARDEN_CONTRACT_ADDRESS, KlimaGardenNFT.abi, signer);
                connectedContract.removeAllListeners()
                    .on("NewKlimaGardenMinted", (from, tokenId) => confirmMint(from, tokenId));

            } else {
                console.log("Ethereum object doesn't exist!");
            }
        } catch (err) {
            toastError(err);
        }
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

    const checkIfWalletIsConnect = async () => {
        const { ethereum } = window;
        if (!ethereum) {
            console.log("NO METAMASK");
            return;
        }

        const accounts = await ethereum.request({ method: 'eth_accounts' });
        if (accounts.length !== 0) {
            const account = accounts[0];
            props.setAccount(account);
            setupEventListener().catch((err) => {
                toastError(err);
            });
        } else {
            console.log("No authorized account found")
        }
    }

    const connectWallet = async () => {
        try {
            const { ethereum } = window;

            if (!ethereum) {
                alert("MetaMask not found!");
                return;
            }

            const accounts = await ethereum.request({ method: "eth_requestAccounts" });
            console.log("Connected", accounts[0]);
            props.setAccount(accounts[0]);
            setupEventListener().catch((err) => {
                toastError(err);
            });

        } catch (err) {
            toastError(err);
        }
    }


    const confirmMint = (from, tokenId) => {
        console.log(from, tokenId.toNumber());

        window.fathom.trackGoal('K6IQJL9J', 0.33);

        if(props.setIsMinting !== undefined) {
            props.setIsMinting(false);
        }

        const url = Constants.OPENSEA_URL + `/${Constants.KLIMAGARDEN_CONTRACT_ADDRESS}/${tokenId.toNumber()}`
        if(!toast.isActive(tokenId.toNumber())) {
            toast({
                id: tokenId.toNumber(),
                duration: null,
                render: (props) => {
                    return (
                        <Modal isOpen={true} onClose={props.onClose}>
                            <ModalOverlay />
                            <ModalContent>
                                <ModalHeader backgroundColor={"green.400"} textColor={"white"}>Success!</ModalHeader>
                                <ModalBody backgroundColor={"blue.100"} textColor={"black"}>
                                    Your Klima Garden plot was minted! View it on <Link color="purple.400" href={url}>OpenSea</Link>.
                                    View the <Link color="purple.400" href={"/3,3/"+tokenId.toNumber()}>interactive version on Klima Garden</Link>.
                                </ModalBody>
                                <ModalFooter backgroundColor={"blue.100"}>
                                    <Button colorScheme="blue" mr={3} onClick={props.onClose}>
                                        Ok
                                    </Button>
                                </ModalFooter>
                            </ModalContent>
                        </Modal>
                    )
                }
            });
        }
    }

    useEffect(() => {
        checkIfWalletIsConnect()
            .catch((err) => {
                toastError(err);
            });
    });

    return (
        <>
            {props.account === "" && (
                <>
                    <Button
                        mt={"8"}
                        fontFamily='"Press Start 2P", monospace'
                        color={"cyan.100"}
                        borderColor={"cyan.100"}
                        borderWidth={4}
                        backgroundColor={"purple.400"}
                        _hover={{backgroundColor: "purple.500"}}
                        onClick={connectWallet}
                    >
                    Connect Wallet
                    </Button>
                </>
            )}
        </>
    )
}

