import Piece from './Piece.js';

export default function CurrentPiece({ currentPiece, x = 0, y = 0, blockSize=32, width, height, highestBlock, boardHeight, calculateGhostHeight, rotate }) {

    /*const calculateGhostHeight = () => {
        //HOW THIS WORKS: Creates an array of length boardWidth, and maps over highestBlock array. The function searches for the highest block
        //under the piece, and returns the difference between the boardHeight and the highest block under the piece.
        var checkIndex = 0;
        const highestUnderThePiece = highestBlock.map((blockHeight, index) => {
                if (index === x) {
                    checkIndex += 1;
                    console.log(checkIndex);
                    return blockHeight;
                }
                if (checkIndex > 0 && checkIndex < width) {
                    checkIndex += 1;
                    return blockHeight;
                }
                return 0;
            }
        )

        return boardHeight - y - Math.max(...highestUnderThePiece);
    }*/

    const ghostHeight = calculateGhostHeight(0);


    return (
        <div className={`absolute m-0`} style={{"top": `${y * blockSize}px`, "left": `${x * blockSize}px`, "width": `${width * blockSize}px`, "height": `${height * blockSize}px`}}>
            <div className="relative m-0">
                <Piece type={1} currentPiece={currentPiece} blockSize={blockSize} ghostHeight={ghostHeight} width={width} height={height} rotate={rotate} />
                <Piece currentPiece={currentPiece} blockSize={blockSize} width={width} height={height} rotate={rotate} />
            </div>
        </div>
    )
}