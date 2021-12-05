// SPDX-License-Identifier: MIT

pragma solidity 0.8.0;

import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "hardhat/console.sol";
import { Base64 } from "./libraries/Base64.sol";


contract KlimaGarden is ERC721URIStorage, VRFConsumerBase {
    uint8 private constant LOTTERY_STATE_IDLE       = 0;
    uint8 private constant LOTTERY_STATE_REQUESTED  = 1;

    uint8 private constant PLOT_TYPE_COMMON         = 0;
    uint8 private constant PLOT_TYPE_RARE           = 1;
    uint8 private constant PLOT_TYPE_ULTRA_RARE     = 2;
    uint8 private constant PLOT_TYPE_ONE_OF_A_KIND  = 3;

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    // address => lottery state
    mapping(address => uint16) private _lotteryStateByAddress;

    // req id => address
    mapping(bytes32 => address) private _mintersByReq;

    // req id => sklima bal
    mapping (bytes32 => uint256) private _balancesByReq;

    // plot type  => num created
    mapping(uint8 => uint16) private _numCreatedByPlotType;


    bytes32 internal keyHash;
    uint256 internal fee;
    uint nonce = 0;

    struct PlotType {
        uint8  plotType;
        string name;
        string ipfsHash;
        uint16 supply;
        string rarity;
        string link;
        string description;
    }

    event NewKlimaGardenMinted(address sender, uint256 tokenId);

    /**
     * Constructor inherits VRFConsumerBase
     *
     * Network: Polygon Mainnet
     * Chainlink VRF Coordinator address: 0x3d2341ADb2D31f1c5530cDC622016af293177AE0
     * LINK token address:                0xb0897686c545045aFc77CF20eC7A532E3120E0F1
     * Key Hash: 0xf86195cf7690c55907b2b611ebb7343a6f649bff128701cc542f0569e2c549da
     *
     * Network: Polygon Mumbai
     * Chainlink VRF Coordinator address: 0x8C7382F9D8f56b33781fE506E897a4F1e2d17255
     * LINK token address:                0x326C977E6efc84E512bB9C30f76E30c160eD06FB
     * Key Hash: 0x6e75b569a01ef56d18cab6a8e71e6600d6ce853834d4a5748b720d06f878b3a4
     */
    constructor()
    ERC721 ("klima.garden", "KGRDN")
    VRFConsumerBase(
        0x8C7382F9D8f56b33781fE506E897a4F1e2d17255, // VRF Coordinator
        0x326C977E6efc84E512bB9C30f76E30c160eD06FB  // LINK Token
    )
    {
        keyHash = 0x6e75b569a01ef56d18cab6a8e71e6600d6ce853834d4a5748b720d06f878b3a4;
        fee = 0.0001 * 10 ** 18; // 0.1 * 10 ** 18; // 0.1 LINK
    }

    // A function users will hit to get their NFT.
    function makeNFT(uint256 sklimaBalance) public {
        require(_lotteryStateByAddress[msg.sender] == LOTTERY_STATE_IDLE, "A request is already in progress for this address");
        bytes32 requestId = getRandomNumber();
        _balancesByReq[requestId] = sklimaBalance;
        _lotteryStateByAddress[msg.sender] = LOTTERY_STATE_REQUESTED;
        _mintersByReq[requestId] = msg.sender;
    }

    function getRandomNumber() internal returns (bytes32 requestId) {
        require(LINK.balanceOf(address(this)) >= fee, "Not enough LINK");
        return requestRandomness(keyHash, fee);
    }

    /**
     * Callback function used by VRF Coordinator
     */
    function fulfillRandomness(bytes32 requestId, uint256 randomness) internal override {
        _lotteryStateByAddress[_mintersByReq[requestId]] = LOTTERY_STATE_IDLE;

        uint256 newItemId = _tokenIds.current();
        uint16 rnd = uint16((randomness % 1357) + 1);

        PlotType memory assignedPlot = getAssignedPlot(rnd);
        string memory skBal = uint2str(_balancesByReq[requestId]);

        // Get all the JSON metadata in place and base64 encode it.
        string memory json = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        '{"name": "', assignedPlot.name, '",',
                        ' "description": "', assignedPlot.description,'",',
                        ' "image": "', 'ipfs://', assignedPlot.ipfsHash, '",',
                        ' "external_link": "', assignedPlot.link, uint2str(newItemId), '",',
                        ' "attributes": [{"trait_type": "rarity", "value": "', assignedPlot.rarity,'"},{"trait_type": "Minted with sKLIMA", "display_type": "number", "value": "', skBal, '"}]}'
                    )
                )
            )
        );

        string memory finalTokenUri = string(
            abi.encodePacked("data:application/json;base64,", json)
        );

        console.log("\n--------------------");
        console.log(finalTokenUri);
        console.log("--------------------\n");

        // Actually mint the NFT to the sender using msg.sender.
        _safeMint(_mintersByReq[requestId], newItemId);

        // update the contract's inventory tracking
        _numCreatedByPlotType[assignedPlot.plotType]++;

        // Set the NFTs data.
        _setTokenURI(newItemId, finalTokenUri);
        console.log("An NFT w/ ID %s has been minted to %s", newItemId, _mintersByReq[requestId], assignedPlot.name);

        // Increment the counter for when the next NFT is minted.
        _tokenIds.increment();

        emit NewKlimaGardenMinted(_mintersByReq[requestId], newItemId);
    }

    function getAssignedPlot(uint16 rnd) internal view returns (PlotType memory assignedPlot) {
        PlotType[] memory _plotTypes = new PlotType[](4);
        _plotTypes[PLOT_TYPE_COMMON] = PlotType({
        plotType: PLOT_TYPE_COMMON,
        name: "Blue Ridge Lo-Fi",
        ipfsHash: "QmVEsS6qQvatbArCSNYiJUJAKUi28orDH1dD2LoGUb6vZG",
        supply: 1000,
        rarity: "common",
        link: "https://klima.garden/3,3/",
        description: "A tribute to the earth's natural beauty made visible by human ingenuity."
        });

        _plotTypes[PLOT_TYPE_RARE] = PlotType({
        plotType: PLOT_TYPE_RARE,
        name: 'Comfy (tree, tree)',
        ipfsHash: "QmSmb8rvwNpPAbqa7Wipr3oeBHYjTsqS236pAyWw4rhup9",
        supply: 323,
        rarity: "rare",
        link: "https://klima.garden/3,3/",
        description: "Comfy Klimates (3,3)"
        });

        _plotTypes[PLOT_TYPE_ULTRA_RARE] = PlotType({
        plotType: PLOT_TYPE_ULTRA_RARE,
        name: 'Sequester',
        ipfsHash: "QmU3jXcdu8jGbfdRLuU2hPDLMK93hiH8aPx1MPobaSosfF",
        supply: 33,
        rarity: "ultra rare",
        link: "https://klima.garden/3,3/",
        description: "Sequester to renew"
        });

        _plotTypes[PLOT_TYPE_ONE_OF_A_KIND] = PlotType({
        plotType: PLOT_TYPE_ULTRA_RARE,
        name: '?????????',
        ipfsHash: "QmU3jXcdu8jGbfdRLuU2hPDLMK93hiH8aPx1MPobaSosfF",
        supply: 1,
        rarity: "one of a kind",
        link: "https://klima.garden/3,3/",
        description: "Sequester to renew"
        });

        uint8 retry = 0;

        do {
            if(rnd <= 1) {
                assignedPlot = _plotTypes[PLOT_TYPE_ONE_OF_A_KIND];
                if(assignedPlot.supply <= _numCreatedByPlotType[PLOT_TYPE_ONE_OF_A_KIND]) {
                    rnd = rnd + 1;
                }
            }

            if(rnd > 1 && rnd <= 34) {
                assignedPlot = _plotTypes[PLOT_TYPE_ULTRA_RARE];
                if(assignedPlot.supply <= _numCreatedByPlotType[PLOT_TYPE_ULTRA_RARE]) {
                    rnd = rnd + 34;
                }
            }

            if(rnd > 34 && rnd <= 357) {
                assignedPlot = _plotTypes[PLOT_TYPE_RARE];
                if(assignedPlot.supply <= _numCreatedByPlotType[PLOT_TYPE_ULTRA_RARE]) {
                    rnd = rnd + 357;
                }
            }

            if(rnd > 357) {
                assignedPlot = _plotTypes[PLOT_TYPE_COMMON];
                if(assignedPlot.supply <= _numCreatedByPlotType[PLOT_TYPE_COMMON]) {
                    rnd = 1;
                    retry++;
                }
            }

        } while(retry == 1);

        require(assignedPlot.supply > 0, "This collection has sold out");
        return assignedPlot;
    }

    function uint2str(uint256 _i) internal pure returns (string memory _uintAsString) {
        if (_i == 0) {
            return "0";
        }
        uint256 j = _i;
        uint256 len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint k = len;
        while (_i != 0) {
            k = k-1;
            uint8 temp = (48 + uint8(_i - _i / 10 * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }
}