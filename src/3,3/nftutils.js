import {ethers} from "ethers";
import * as Constants from "../constants";

export const toastError = (toast, err) => {
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

export const secondsUntilBlock = async (block)  => {
    const url = `https://api.polygonscan.com/api?module=block&action=getblockcountdown&blockno=${block}&apikey=${process.env.REACT_APP_POLYGONSCAN_API_KEY}`;
    const result = await fetch(url);
    const response = await result.json();
    console.log("scan response", response);
    return response['result']['EstimateTimeInSec'];
}

export const removeAllChildNodes = (parent) => {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}

let alchemyProvider;
export const ethersProvider = () => {
    if(alchemyProvider === undefined) {
        alchemyProvider = new ethers.providers.AlchemyProvider(process.env.REACT_APP_ALCHEMY_PROVIDER_NETWORK, process.env.REACT_APP_ALCHEMY_PROVIDER_API_KEY);
    }
    return  alchemyProvider;
}


export const getKlimaStakingContract = () => {
    const provider = ethersProvider();
    return new ethers.Contract(Constants.KLIMA_STAKING_CONTRACT_ADDRESS, Constants.KLIMA_STAKING_ABI, provider);
}

export const getSvg = () => {
    return document.getElementById('nft')?.contentDocument;
}

export const convertHMS = (value) => {
    const sec = parseInt(value, 10); // convert value to number if it's string
    let hours   = Math.floor(sec / 3600); // get hours
    let minutes = Math.floor((sec - (hours * 3600)) / 60); // get minutes
    let seconds = sec - (hours * 3600) - (minutes * 60); //  get seconds
    hours = (hours > 0) ? (hours < 2) ? `${hours}h ` : `${hours}h ` : '';
    minutes = (minutes > 0) ? `${minutes}m ` : '';
    return hours + minutes + seconds + 's';
}

export const preloadNFTMedia = () => {
    let img1 = document.createElement("img");
    let vid1 = document.createElement("video")
    let vid2 = document.createElement("video")
    img1.src = "https://gateway.pinata.cloudQmVEsS6qQvatbArCSNYiJUJAKUi28orDH1dD2LoGUb6vZG"
    vid1.src = "https://gateway.pinata.cloudQmVEsS6qQvatbArCSNYiJUJAKUi28orDH1dD2LoGUb6vZG"
    vid2.src = "https://gateway.pinata.cloudQmVEsS6qQvatbArCSNYiJUJAKUi28orDH1dD2LoGUb6vZG";
}

