import Block from './Block.js';

//type (0 = solid piece, 1 = ghost piece)
//piece (0 = square, 1 = line, 2 = T, 3 = L, 4 = Z, 5 = S)
export default function Piece({ type=0, score, currentPiece, blockSize=32, ghostHeight, width, height, rotate=0, row=0, column=0, isStatic=false }) {
    var coordinates = [[0,0], [1,0], [0,1], [1,1]];
    var color = "purple";
    const ghostColor = "white";

    const rotationCoordinates = (coordinates0, coordinates90, coordinates180, coordinates270) => {
        switch(rotate) {
            case 0:
                coordinates = coordinates0; 
                break;
            case 90:
                coordinates = coordinates90;
                break;
            case 180:
                coordinates = coordinates180;
                break;
            case 270:
                coordinates = coordinates270;
                break;
            default:
                break;
        }
    }

    switch (currentPiece) {
        case 0: //square
            const squareCoordinates = [[0,0], [1,0], [0,1], [1,1]];
            rotationCoordinates(squareCoordinates, squareCoordinates, squareCoordinates, squareCoordinates);
            color = "purple";
            break;

        case 1: //Line
            rotationCoordinates(
                [[0,0], [0,1], [0,2], [0,3]], //0
                [[0,0], [1,0], [2,0], [3,0]], //90
                [[0,0], [0,1], [0,2], [0,3]], //180
                [[0,0], [1,0], [2,0], [3,0]]);//270
            color = "blue";
            break;
        
        case 2: //T
            rotationCoordinates(
                [[1,0], [0,1], [1,1], [2,1]], //0
                [[0,0], [0,1], [0,2], [1,1]], //90
                [[0,0], [1,0], [2,0], [1,1]], //180
                [[0,1], [1,0], [1,1], [1,2]]);//270
            color = "orange";
            break;
        
        case 3: //L
            rotationCoordinates(
                [[0,0], [0,1], [0,2], [1,2]], //0
                [[0,0], [0,1], [1,0], [2,0]], //90
                [[0,0], [1,0], [1,1], [1,2]], //180
                [[0,1], [1,1], [2,0], [2,1]]);//270
            color = "red";
            break;
         
        case 4: //Z
            rotationCoordinates(
                [[0,0], [1,0], [1,1], [2,1]], //0
                [[1,0], [0,1], [1,1], [0,2]], //90
                [[0,0], [1,0], [1,1], [2,1]], //180
                [[1,0], [0,1], [1,1], [0,2]]);//270
            color = "yellow";
            break;    
        
        case 5: //S
            rotationCoordinates(
                [[1,0], [2,0], [0,1], [1,1]], //0
                [[0,0], [0,1], [1,1], [1,2]], //90
                [[1,0], [2,0], [0,1], [1,1]], //180
                [[0,0], [0,1], [1,1], [1,2]]);//270
            color = "green ";
            break;  

        default:
            break;
    }
    return (
        <div className="absolute m-0">
            <div className={`relative w-[64px] h-[64px] m-0`}>
                {type===0 ? (
                    <div className="z-20 transition-all duration-[300] ease-in-out">
                        <Block score={score} x={coordinates[0][0] * blockSize} y={coordinates[0][1] * blockSize} color={color} blockSize={blockSize} row={row + coordinates[0][0]} column={column + coordinates[0][1]} isStatic={isStatic} />
                        <Block score={score} x={coordinates[1][0] * blockSize} y={coordinates[1][1] * blockSize} color={color} blockSize={blockSize} row={row + coordinates[1][0]} column={column + coordinates[1][1]} isStatic={isStatic} />
                        <Block score={score} x={coordinates[2][0] * blockSize} y={coordinates[2][1] * blockSize} color={color} blockSize={blockSize} row={row + coordinates[2][0]} column={column + coordinates[2][1]} isStatic={isStatic} />
                        <Block score={score} x={coordinates[3][0] * blockSize} y={coordinates[3][1] * blockSize} color={color} blockSize={blockSize} row={row + coordinates[3][0]} column={column + coordinates[3][1]} isStatic={isStatic} />
                    </div>
                ) : (
                    <div className="z-0 m-0 transition-left duration-[300] ease-in-out">
                        <Block text={""} x={coordinates[0][0] * blockSize} y={(ghostHeight - height + coordinates[0][1]) * blockSize} color={ghostColor} blockSize={blockSize} />
                        <Block text={""} x={coordinates[1][0] * blockSize} y={(ghostHeight - height + coordinates[1][1]) * blockSize} color={ghostColor} blockSize={blockSize} />
                        <Block text={""} x={coordinates[2][0] * blockSize} y={(ghostHeight - height + coordinates[2][1]) * blockSize} color={ghostColor} blockSize={blockSize} />
                        <Block text={""} x={coordinates[3][0] * blockSize} y={(ghostHeight - height + coordinates[3][1]) * blockSize} color={ghostColor} blockSize={blockSize} />
                    </div>)}
            </div>
        </div>
    )
}