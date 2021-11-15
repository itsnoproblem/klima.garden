import {Link, Text} from "@chakra-ui/react";

export const MenuLink = (props) => {
    return (
        <Link
            href={props.Href}
            color={props.color ?? (props.isSelected ? "blue.100" : "gray.100")}
            _hover={{textDecoration: "none", color: props.hoverColor ?? "blue.200"}}
        ><Text fontSize={["xs", "lg"]}>{props.value}</Text></Link>
    )
}