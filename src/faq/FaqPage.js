import {
    Accordion,
    AccordionButton,
    AccordionIcon,
    AccordionItem,
    AccordionPanel,
    Box, Flex,
    Link,
} from "@chakra-ui/react"
import WelcomeMenu from "../welcome/WelcomeMenu";
import {ExternalLinkIcon, LinkIcon} from "@chakra-ui/icons";

const FaqPage = () => {

    const qAndA = [
        {
            question: "What is the KLIMA Garden?",
            answer: "Klima Garden is a collection of virtual garden plot NFTs where sKLIMA holders can \"sow\" their staked " +
                "KLIMA tokens and watch them grow.",
            links: [
                { url: "/3,3/gallery/1", name: "Preview Collection", isInternal: true },
            ]
        },
        {
            question: "What is KLIMA / sKLIMA?",
            answer: "Klima DAO incentivises new supply of Base Carbon Tonnes (BCT) on the blockchain through the KLIMA token. " +
                "The Klima community provides liquidity by staking their KLIMA tokens. In return for staking, holders receive " +
                "sKLIMA (or optionally wsKLIMA) which represents their stake- and voting power- in the protocol.",
            links: [
                { url: "https://www.klimadao.finance/", name: "App" },
                { url: "https://docs.klimadao.finance/", name: "Docs" }
            ]
        },
        {
            question: "Will my sKLIMA be affected by using this App?",
            answer: "No, the Klima Garden app only needs to read your sKLIMA / wsKLIMA balances.  It can't spend or transfer any of your " +
                "assets, except for the minting fee during minting.",
            links: []
        },
        {
            question: "Is there a cost to mint a garden plot?",
            answer: "The fee to mint a Klima Garden plot is 0.033 wETH.",
            links: []
        },
        {
            question: "How do I get a Klima Garden plot?",
            answer: "When you click the \"mint\" button, you will be prompted by your web3 wallet to confirm the transaction.  " +
                "After you confirm, the transaction is submitted to the blockchain and your plot is selected at random. " +
                "Randomness is ensured by leveraging Chainlink's Verifiable Random Function",
            links: [
                { name: "Mint", url: "/", isInternal: true},
                { name: "Chainlink VRF", url: "https://chain.link/chainlink-vrf"}
            ]
        },
    ];

    return(
        <>
            <WelcomeMenu/>

            <Box minH={"100vh"} minW={"100vw"} bg={"blue.200"} textAlign={"center"}>
                <Box maxW={["100%", "50%"]} ml={"auto"} mr={"auto"} mt={24}>
                    <Accordion textColor={"blue.700"} textAlign={"left"} defaultIndex={0}>
                        {qAndA.map((item, i) => {
                            return (
                                <AccordionItem>
                                    <h2>
                                        <AccordionButton
                                            fontFamily={'"Press Start 2P", monospace'}
                                            onClick={() => window.fathom.trackGoal('JUQ6H1NG', 0)}
                                        >
                                            <Box flex="1" textAlign="left">
                                                {item.question}
                                            </Box>
                                            <AccordionIcon />
                                        </AccordionButton>
                                    </h2>
                                    <AccordionPanel pb={4}>
                                        <Box fontSize={"lg"}
                                             fontFamily={"Roboto Mono"}
                                             lineHeight={"1.6em"}
                                             padding={4}
                                        >
                                            {item.answer}
                                        </Box>
                                        <Flex>
                                        {item.links.map((link, j) => {
                                            return (
                                                <Box mr={5}>
                                                    <Link href={link.url}
                                                          fontSize={"md"}
                                                          target={link.isInternal ? "_self" : "_blank"}Ø
                                                          _hover={{
                                                              textDecoration: "none",
                                                              color: "yellow.600"
                                                          }}
                                                    >
                                                        {link.name} &nbsp;
                                                        { link.isInternal && (<LinkIcon/>) }
                                                        { link.isInternal ?? (<ExternalLinkIcon/>) }
                                                    </Link>
                                                </Box>
                                            )
                                        })}</Flex>
                                    </AccordionPanel>
                                </AccordionItem>
                            )
                        })}
                    </Accordion>
                </Box>
            </Box>
        </>
    )
}

export default FaqPage;