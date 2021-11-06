import React, {useCallback, useEffect, useRef, useState} from "react";
import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
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
import {ethers} from "ethers";
import * as Constants from "../constants";

const SwitchNetworkDialog = () => {

    const [isMetamask, setIsMetamask] = useState();
    const [isOpen, setIsOpen] = useState(false)
    const cancelRef = useRef();
    const toast = useToast();
    const { ethereum } = window;
    if (!ethereum) {
        console.error("MetaMask not installed");
    }

    const toastError = useCallback((err) => {
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
    }, [toast]);

    const checkNetwork = useCallback(async () => {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const network = await provider.getNetwork();
        console.log("Chain ID", network.chainId);
        console.log("Required Chain ID", Constants.CHAIN_ID);

        if (network.chainId !== undefined && network.chainId !== Constants.CHAIN_ID) {
            setIsOpen(true);
        }
        else {
            setIsOpen(false);
        }
    },[ethereum]);

    const switchNetworks = async () => {
        try {
            await ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{chainId: Constants.networks[Constants.CHAIN_ID].chainId}],
            });
        } catch (switchError) {
            // This error code indicates that the chain has not been added to MetaMask.
            if (switchError.code === 4902 || switchError.code === -32603) {
                try {
                    await ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [Constants.networks[Constants.CHAIN_ID]],
                    });
                } catch (err) {
                    toastError(err);
                }
            }
            else {
                toastError(switchError);
            }
        }
    }

    useEffect(() => {
        if (!ethereum) {
            setIsMetamask(false);
        }
        else {
            setIsMetamask(true);

            ethereum.on('connect', (chainId) => {
                checkNetwork().catch((err) => toastError(err))
            });
            ethereum.on('chainChanged', (chainId) => window.location.reload());
            ethereum.on('accountsChanged', (accounts) => window.location.reload());
            ethereum.on('disconnect', (err) => window.location.reload());
            ethereum.on('close', (err) => window.location.reload());

            checkNetwork().catch((err) => {
                toastError(err);
            });
        }
    }, [setIsMetamask, isMetamask, ethereum, checkNetwork, toastError]);

    return (
        <>
            <Modal onClose={() => {}} isOpen={!isMetamask}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Install MetaMask</ModalHeader>
                    <ModalBody>
                        This app needs to connect to the Polygon network.
                        Install the MetaMask browser extension to get started!
                    </ModalBody>

                    <ModalFooter>
                        <Link target={"_blank"} href={"https://metamask.io/"}>
                            <Button variant="outline">Get MetaMask</Button>
                        </Link>

                    </ModalFooter>
                </ModalContent>
            </Modal>
            <AlertDialog
                isOpen={isOpen}
                leastDestructiveRef={cancelRef}
                onClose={() => {}}
            >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                            Wrong Network
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            You need to connect to the Polygon network to use Klima Garden.
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button colorScheme="green" onClick={switchNetworks}>
                                Switch Networks
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </>
    )
}

export default SwitchNetworkDialog;