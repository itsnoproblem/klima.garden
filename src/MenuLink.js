import {Box, Link, Text} from "@chakra-ui/react";

export const MenuLink = (props) => {
    return (
        <Box alignItems={"center"} d={"inline-flex"}>
            <Link
                href={props.Href}
                color={props.color ?? (props.isSelected ? "blue.200" : "gray.100")}
                _hover={{textDecoration: "none", color: props.hoverColor ?? "blue.200"}}
            >
                <Text fontSize={["xs", "sm"]}
                      fontFamily={'"Press Start 2P", monospace'}
                >{props.value}</Text>
            </Link>
        </Box>
    )
}