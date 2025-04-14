//import React, { useRef, useEffect, useState } from 'react';

export default function Block({ x, y, color, score, blockSize, text, row="none", column="none", isStatic=false }) {
    //const blockRef = useRef(null);
    //const [extracted, setExtracted] = useState({ xValue: null, yValue: null });
    
    /*useEffect(() => {
        if (blockRef.current) {
            // Get the className directly from the element, not from getBoundingClientRect()
            const className = blockRef.current.className;
            const regex = /c-([^\s]+)\s+r-([^\s]+)/;
            const match = className.match(regex);
            if (match) {
              setExtracted({ xValue: match[1], yValue: match[2] });
            }
          }
    },[]);*/
    
    return (
        <div className={`absolute text-center text-white border-black border-2 border-solid ${isStatic ? `c-${row} r-${column} blk` : ""}`} style={{"top": `${y}px`, "left": `${x}px`, "width": `${blockSize}px`, "height": `${blockSize}px`, "backgroundColor": color}}>
            {/*isStatic ? (
                <div>
                    <p className="text-[11px]">{extracted.yValue}</p>
                    <p className="text-[11px]">{extracted.xValue}</p>
                </div>
            ) : ""*/}
        </div> 
    )
}