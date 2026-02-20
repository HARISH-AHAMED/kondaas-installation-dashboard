import React, { useEffect, useRef } from 'react';
import lottie from 'lottie-web';
import { defineElement } from '@lordicon/element';

// Register the element once
// We wrap in a check or try-catch because in HMR it might re-run
if (!customElements.get('lord-icon')) {
    defineElement(lottie.loadAnimation);
}

const AnimatedIcon = ({
    src,
    trigger = 'hover',
    size, // string like "32px" or number
    colors, // object { primary: '#color', secondary: '#color' }
    delay,
    state,
    stroke = "regular", // regular, bold, light
    style = {},
    className = "",
    target, // target for hover trigger
    ...props
}) => {
    const iconRef = useRef(null);

    // Format colors string for Lordicon
    // Example: "primary:#121331,secondary:#08a88a"
    const colorString = colors
        ? Object.entries(colors)
            .map(([key, value]) => `${key}:${value}`)
            .join(',')
        : undefined;

    const iconStyle = {
        width: size || '32px',
        height: size || '32px',
        ...style
    };

    return (
        <lord-icon
            ref={iconRef}
            src={src}
            trigger={trigger}
            colors={colorString}
            stroke={stroke}
            delay={delay}
            state={state}
            target={target}
            style={iconStyle}
            class={className} // lord-icon uses class, not className potentially, but React handles className
            {...props}
        />
    );
};

export default AnimatedIcon;
