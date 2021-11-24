import {Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, Box} from "@chakra-ui/react"
import WelcomeMenu from "../welcome/WelcomeMenu";

const FaqPage = () => {

    const qAndA = [
        {
            question: "What is this?",
            answer: "..."
        },
        {
            question: "What is KLIMA / sKLIMA?",
            answer: "..."
        },
        {
            question: "What is this?",
            answer: "..."
        },
    ];
    return(
        <>
            <WelcomeMenu/>

            <Box minH={"100vh"} minW={"100vw"} bg={"blue.200"} textAlign={"center"}>
                <Box maxW={["100%", "80%"]} ml={"auto"} mr={"auto"} mt={24}>
                    <Accordion textColor={"blue.700"} textAlign={"left"}>
                        {qAndA.map((item, i) => {
                            return (
                                <AccordionItem>
                                    <h2>
                                        <AccordionButton fontFamily={'"Press Start 2P", monospace'}>
                                            <Box flex="1" textAlign="left">
                                                {item.question}
                                            </Box>
                                            <AccordionIcon />
                                        </AccordionButton>
                                    </h2>
                                    <AccordionPanel pb={4}>
                                        {item.answer}
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