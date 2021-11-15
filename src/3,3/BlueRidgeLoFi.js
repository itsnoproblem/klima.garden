import blueridge from "./blueridge.svg";

export const BlueRidgeLoFi = (props) => {
    const width = props.width ?? 1024;
    const name = props.name ?? "";
    const onLoad = (typeof props.onLoad === "function" ) ? props.onLoad : () => {};

    return (
        <object
            id="nft"
            type="image/svg+xml"
            data={blueridge}
            width={width}
            style={{"objectFit": "contain"}}
            aria-label={name}
            onLoad={onLoad}
        />
    )
}