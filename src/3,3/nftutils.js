import {ethers} from "ethers";
import * as Constants from "../constants";
import KlimaGardenNFT from "../utils/KlimaGardenNFT.json";


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
    const url = `https://klima.garden/api?module=block&action=getblockcountdown&blockno=${block}&apikey=${process.env.REACT_APP_POLYGONSCAN_API_KEY}`;
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

export const polygonMainnetProvider = () => {
    const provider = new ethers.providers.JsonRpcProvider(process.env.REACT_APP_ALCHEMY_PROVIDER_URL);
    return  provider;
}

export const polygonMumbaiProvider = () => {
    return new ethers.providers.JsonRpcProvider(process.env.REACT_APP_MUMBAI_PROVIDER_URL);
}

export const getSklimaContract = () => {
    const provider = polygonMainnetProvider();
    return new ethers.Contract(Constants.SKLIMA_CONTRACT_ADDRESS, Constants.SKLIMA_ABI, provider);
}

export const getWSklimaContract = () => {
    const provider = polygonMainnetProvider();
    return new ethers.Contract(Constants.WSKLIMA_CONTRACT_ADDRESS, Constants.WSKLIMA_ABI, provider);
}

export const getKlimaStakingContract = () => {
    const provider = polygonMainnetProvider();
    return new ethers.Contract(Constants.KLIMA_STAKING_CONTRACT_ADDRESS, Constants.KLIMA_STAKING_ABI, provider);
}

export const getKlimaGardenContract =() => {
    const provider = polygonMumbaiProvider();
    return new ethers.Contract(Constants.KLIMAGARDEN_CONTRACT_ADDRESS, KlimaGardenNFT.abi, provider);
}

export const getSvg = () => {
    return document.getElementById('nft')?.contentDocument;
}

export const convertHMS = (value) => {
    const sec = parseInt(value, 10);
    let hours   = Math.floor(sec / 3600);
    let minutes = Math.floor((sec - (hours * 3600)) / 60);
    let seconds = sec - (hours * 3600) - (minutes * 60);
    hours = (hours > 0) ? (hours < 2) ? `${hours}h ` : `${hours}h ` : '';
    minutes = (minutes > 0) ? `${minutes}m ` : '';
    return hours + minutes + seconds + 's';
}

export const sklimaBalancesForOwner = async (owner) => {
    return new Promise((resolve, reject) => {
        const sklimaContract = getSklimaContract();
        let formattedBalance = 0;
        sklimaContract.balanceOf(owner).then(async (sklima) => {
            let totalSklima = sklima;

            const wsklimaContract = getWSklimaContract();
            const wsklima = await wsklimaContract.balanceOf(owner);
            console.log("got wsklima balance", wsklima.toString());

            if(wsklima.gt(0)) {
                try {
                    const wsklimaAsKlima = await wsklimaContract.wKLIMATosKLIMA(wsklima);
                    console.log("which is this much sklima", wsklimaAsKlima.toString());
                    if(wsklimaAsKlima.gt(0)) {
                        totalSklima = totalSklima.add(wsklimaAsKlima);
                    }
                }
                catch(err) {
                    toastError("Failed to convert wsKLIMA to sKLIMA value: " + err.toString());
                }
            }

            formattedBalance = ethers.utils.formatUnits(totalSklima, 9);
            resolve(formattedBalance);

        }).catch((err) => {
            reject(err);
        });
    });
}


