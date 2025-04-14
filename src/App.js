import CurrentPiece from './CurrentPiece.js';
import Piece from './Piece.js';
import './App.css';
//import leaderboard from './leaderboard.json';

import React from 'react';

const boardWidth = 10; //total number of grids in the x axis
const boardHeight = 18; //total nmumber of grids in the y axis
//This variable stores the amount of blocks added to each column when a piece is placed
/*const blockAddedPerXandRotation = [[[0,0], [0,0], [0,0], [0,0]], //Square
                                  [[0],[0,0,0,0],[0],[0,0,0,0]], //Line
[0deg,90deg,180deg,270deg]        [[1,0,1],[0,1],[0,0,0],[1,0]], //T
                                  [[0,2],[0,0,0],[0,0],[1,1,0]], //L
                                  [[0,0,1],[1,0],[0,0,1],[1,0]], //Z
                                  [[1,0,0],[0,1],[1,0,0],[0,1]]] //S*/

const heightAddedPerXandRotation = [[[2,2], [2,2], [2,2], [2,2]], //Square
                                   [[4],[1,1,1,1],[4],[1,1,1,1]], //Line
/*[0deg,90deg,180deg,270deg]*/     [[2,2,2],[3,2],[1,2,1],[2,3]], //T
                                   [[3,3],[2,1,1],[1,3],[2,2,2]], //L
                                   [[1,2,2],[3,2],[1,2,2],[3,2]], //Z
                                   [[2,2,1],[2,3],[2,2,1],[2,3]]] //S

export default class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      blocks: [],
      blockSize: 32,
      currentPiece: 0,
      currentPieceX: 4,
      currentPieceY: -1,
      startingY: -1,
      currentPieceWidth: 1, //for Box
      currentPieceHeight: 4, //for Box
      currentPieceRotation: 0,
      storedPiece: -1,
      nextPiece: -1,
      ghostHeight: 0,
      score: 0,
      debug: [],
      debug2: "",
      speed: 1,
      isMobile: false,
      board: Array.from({ length: boardHeight }, () => Array(boardWidth).fill(0)),
      highestBlock: Array(boardWidth).fill(0)
    };
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.fallingPiece = this.fallingPiece.bind(this);
    this.calculateGhostHeight = this.calculateGhostHeight.bind(this);
    this.placePiece = this.placePiece.bind(this);
    this.changePiece = this.changePiece.bind(this);
    this.pieceGetDimensions = this.pieceGetDimensions.bind(this);
    this.removeRow = this.removeRow.bind(this);
    this.updateHighestBlock = this.updateHighestBlock.bind(this);
    this.restartGame = this.restartGame.bind(this);
    this.handleResize = this.handleResize.bind(this);
    this.handleLeftRightDown = this.handleLeftRightDown.bind(this);
    this.handleUp = this.handleUp.bind(this);
    this.handleQ = this.handleQ.bind(this);
    //FLAGS
    this.keyPressInterval = null; // To store the interval ID
    this.activeKeys = new Set();
    this.isDownKeyPressed = false;
    this.placingPiece = false;
    this.gameOver = false;
    this.mainMenu = true;
  }

  componentDidMount() {
    document.addEventListener('keydown', this.handleKeyDown);
    document.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('resize', this.handleResize);

    this.handleResize();

    this.setState({
      currentPiece: Math.floor(Math.random() * 6),
      nextPiece: Math.floor(Math.random() * 6),
    }, () => this.setState({
      currentPieceWidth: this.pieceGetDimensions(this.state.currentPiece, this.state.currentPieceRotation, 0),
      currentPieceHeight: this.pieceGetDimensions(this.state.currentPiece, this.state.currentPieceRotation, 1),
    }))
    
    this.fallingInterval = setInterval(() => this.fallingPiece(), 800);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('resize', this.handleResize);
    if (this.fallingInterval) {
      clearInterval(this.fallingInterval);
    }
    if (this.keyPressInterval) {
      clearInterval(this.keyPressInterval);
    }
  }

  handleResize() {
    const isMobile = window.innerWidth <= 480 ? 2 : (window.innerWidth <= 768 ? 1 : 0);
    this.setState({ isMobile });
  }

  fallingPiece() {
    this.setState((prevState) => {
      const placedHeight = this.state.currentPieceY + this.calculateGhostHeight(0) - this.state.currentPieceHeight;
      this.setState({ debug2: placedHeight });
      const newY = Math.min(placedHeight, prevState.currentPieceY + 1);
      if (newY === prevState.currentPieceY) {
        if (!this.placingPiece) {
          this.placingPiece = true;
          clearInterval(this.fallingInterval);
          setTimeout(() => {
            this.placePiece();
            // Restart fallingPiece after placing the piece
            this.fallingInterval = setInterval(() => this.fallingPiece(), 800 / this.state.speed);
            this.placingPiece = false;
          }, 800 / this.state.speed);
        }
      }
      return { currentPieceY: newY };
    });
  };

  handleQ(event) {
    event.preventDefault();
    this.changePiece(true);
  }

  handleLeftRightDown(event) {
    if (this.activeKeys.has(event.key)) return; // Prevent duplicate intervals for the same key
    this.activeKeys.add(event.key);

    this.keyPressInterval = setInterval(() => {
      this.setState((previousState) => {
        let newX = previousState.currentPieceX;

        if (this.activeKeys.has('ArrowLeft')) {
          newX = Math.max(0, newX - 1);
        }
        if (this.activeKeys.has('ArrowRight')) {
          newX = Math.min(boardWidth - this.state.currentPieceWidth, newX + 1);
        }
        if (this.activeKeys.has('ArrowDown')) {
          if (!this.isDownKeyPressed) {
            this.setState({ speed: 4 }, () => {
              this.isDownKeyPressed = true;
              clearInterval(this.fallingInterval);
              this.fallingInterval = setInterval(() => this.fallingPiece(), 800 / this.state.speed);
            })
          }
        } else if (this.isDownKeyPressed) {
          // Reset speed and falling interval when ArrowDown is released
          this.setState({ speed: 1 }, () => {
            this.isDownKeyPressed = false;
            clearInterval(this.fallingInterval);
            this.fallingInterval = setInterval(() => this.fallingPiece(), 800 / this.state.speed);
          });
        }

        return { currentPieceX: newX };
      });
    }, 50); // Adjust the interval time for smoother movement
  }

  handleUp(event) {
    event.preventDefault();
    this.setState(prevState => {
      const newRotation = (prevState.currentPieceRotation + 90) % 360;
      const newWidth = this.pieceGetDimensions(prevState.currentPiece, newRotation, 0);
      const newHeight = this.pieceGetDimensions(prevState.currentPiece, newRotation, 1);
      const newX = (newWidth > boardWidth - prevState.currentPieceX)
        ? boardWidth - newWidth
        : prevState.currentPieceX;
        
      return {
        currentPieceRotation: newRotation,
        currentPieceWidth: newWidth,
        currentPieceHeight: newHeight,
        currentPieceX: newX
      };
    });
  }

  handleSpace(event) {
    this.placePiece(true);
  }

  handleKeyDown = (event) => {
    // Prevent event if it has already been handled.
    if (event.defaultPrevented) return;
  
    const key = event.key;
    if (["ArrowLeft", "ArrowRight", "ArrowDown"].includes(key)) {
      // For left, right, and down, delegate to the continuous movement handler.
      this.handleLeftRightDown(event);
    } else if (key === "ArrowUp") {
      event.preventDefault();
      this.handleUp(event);
    } else if (key.toLowerCase() === "q") {
      event.preventDefault();
      this.handleQ(event);
    } else if (key === " ") {
      event.preventDefault();
      this.handleSpace(event);
    }
  };

  handleKeyUp = (event) => {
      if (this.activeKeys.has(event.key)) {
        this.activeKeys.delete(event.key);
      }
    
      if (this.activeKeys.size === 0 && this.keyPressInterval) {
        clearInterval(this.keyPressInterval);
        this.keyPressInterval = null;
      }

      if (event.key === 'ArrowDown') {
        this.isDownKeyPressed = false;
    
        this.setState({ speed: 1 }, () => {
          clearInterval(this.fallingInterval);
          this.fallingInterval = setInterval(() => this.fallingPiece(), 800);
        });
      }
  };

  calculateGhostHeight(returnValue) {
      //HOW THIS WORKS: Creates an array of length boardWidth, and maps over highestBlock array. The function searches for the highest block
      //under the piece, and returns the difference between the boardHeight and the highest block under the piece.
      

      var checkIndex = 0;
      const highestUnderThePiece = this.state.highestBlock.map((blockHeight, index) => {
              if (index === this.state.currentPieceX) {
                  checkIndex += 1;
                  console.log(checkIndex);
                  return blockHeight;
              }
              if (checkIndex > 0 && checkIndex < this.state.currentPieceWidth) {
                  checkIndex += 1;
                  return blockHeight;
              }
              return -1;
          }
      )

      checkIndex = 0;
      if (returnValue) {
        return highestUnderThePiece;
      } else {
        return Math.min(...heightAddedPerXandRotation[this.state.currentPiece][this.state.currentPieceRotation/90].map(height => {
          checkIndex ++;
          return boardHeight - this.state.currentPieceY + this.state.currentPieceHeight - (highestUnderThePiece[this.state.currentPieceX + checkIndex - 1] + height);
        }))
      }
  }

  placePiece() {
      const constant = this.state.currentPieceHeight - 2; //I HAVE NO IDEA WTF IS HAPPENING HERE. I JUST TRIAL AND ERRORED THIS VARIABLE SINCE THE TETRIMINOS AREN'T PLACING CORRECTLY UNLESS I SUBTRACT THIS FOR SOME REASON
      const placedHeight = this.state.currentPieceY + this.calculateGhostHeight(0) - constant;
      const placedHeightFixed = placedHeight - 1; //more consistent version to use for the rest of the operations

      this.setState((prevState) => ({
        blocks: [...prevState.blocks, <div className="absolute m-0" style={{"top": `${placedHeight * this.state.blockSize}px`, "left": `${this.state.currentPieceX * this.state.blockSize}px`}}>
          <Piece type={0} score={this.state.score} isStatic={true} currentPiece={this.state.currentPiece} rotate={this.state.currentPieceRotation} blockSize={this.state.blockSize} row={this.state.currentPieceX + 1} column={placedHeightFixed} />
        </div>]
      }), () => {
        //Separating this makes sure that highestBlock doesn't use the resetted version of currentPieceX
        this.changePiece(0);
        this.removeRow();
        //THIS PART UPDATES THE HIGHEST BLOCKS STATE
        this.updateHighestBlock();
      })
  } 

  changePiece(swap) {
    if (swap) {
      // If pressing Q (swap held piece)
      this.setState((prevState) => {
        // If no piece stored, store the current piece and set the current piece to nextPiece.
        if (prevState.storedPiece === -1) {
          return {
            storedPiece: prevState.currentPiece,
            currentPiece: prevState.nextPiece,
            currentPieceX: 4,
            currentPieceY: -1,
            // Generate a new nextPiece since we've taken the next one.
            nextPiece: prevState.nextPiece
          };
        } else {
          // Swap storedPiece with currentPiece.
          return {
            currentPiece: prevState.storedPiece,
            storedPiece: prevState.currentPiece,
            currentPieceX: 4,
            currentPieceY: -1
            // nextPiece remains unchanged.
          };
        }
      }, () => {
        this.setState((prevState) => ({
          currentPieceWidth: this.pieceGetDimensions(prevState.currentPiece, 0, 0),
          currentPieceHeight: this.pieceGetDimensions(prevState.currentPiece, 0, 1),
          currentPieceRotation: 0,
          ghostHeight: this.calculateGhostHeight()
        }));
      });
    } else {
      // Regular piece change (no swapping)
      this.setState((prevState) => ({
        currentPiece: prevState.nextPiece,
        currentPieceX: 4,
        currentPieceY: -1,
        nextPiece: Math.floor(Math.random() * 6)
      }), () => {
        this.setState((prevState) => ({
          currentPieceWidth: this.pieceGetDimensions(prevState.currentPiece, 0, 0),
          currentPieceHeight: this.pieceGetDimensions(prevState.currentPiece, 0, 1),
          currentPieceRotation: 0,
          ghostHeight: this.calculateGhostHeight()
        }));
      });
    }
  }

  pieceGetDimensions(pieceType, rotation, returnValue) {
    //pieceType (0=square, 1=line, 2=T, 3=L, 4=Z, 5=S)
    //returnValue (0=width, 1=height)
    switch (pieceType) {
      case 0: case "square":
        return (returnValue === 0 || returnValue === "width") ? 2 : 2;
      case 1: case "line":
        return (rotation===0 || rotation===180) ? 
                  ((returnValue===0 || returnValue==="width") ? 1 : 4 ) : 
                  ((returnValue===0 || returnValue==="width") ? 4 : 1);
      case 2: case "T": case 4: case "Z": case 5: case "S":
        return (rotation===0 || rotation===180) ? 
                  ((returnValue===0 || returnValue==="width") ? 3 : 2 ) : 
                  ((returnValue===0 || returnValue==="width") ? 2 : 3);
      case 3: case "L":
        return (rotation===0 || rotation===180) ? 
                ((returnValue===0 || returnValue==="width") ? 2 : 3 ) : 
                ((returnValue===0 || returnValue==="width") ? 3 : 2);
      default:
        break;
    } 
  }

  async removeRow() {
    const rowsToBeRemoved = [];

    function sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    //Checks for rows that are full and adds them to the rowsToBeRemoved array
    for (let i = boardHeight; i > 0; i--) {
      const rows = document.getElementsByClassName(`r-${i}`);
      
      if (rows.length === boardWidth) {
        rowsToBeRemoved.push(i);
      }
    }

    if (rowsToBeRemoved.length > 0) {
      //THIS PART REMOVES THE FULL ROWS THEN MOVES DOWN THE BLOCKS ABOVE THEM
      for (const i of rowsToBeRemoved) {
        const rows = document.getElementsByClassName(`r-${i}`);

        //Remove the full rows
        while (rows.length > 0) {
          rows[0].remove();
        }

        for (let j = i - 1; j > 0; j--) {
          const blocksAbove = Array.from(document.getElementsByClassName(`r-${j}`));

          //Move down the Blocks above the removed row 
          for (let k = 0; k < blocksAbove.length; k++) {
            const block = blocksAbove[k];

            let currentTop = parseInt(block.style.top, 10) || block.offsetTop;
            block.style.top = (currentTop + this.state.blockSize) + 'px';
          }
          await sleep(200 / boardHeight);
        }

        this.setState ((prevState) => ({ score: prevState.score + 100 }))
      }

      //THIS PART UPDATES THE CLASS NAMES OF THE BLOCKS ABOVE THE REMOVED ROWS
      rowsToBeRemoved.reverse().forEach((row,index) => {
        const rowLowerLimit = rowsToBeRemoved[index - 1] || 0;
        const rowsAdded = rowsToBeRemoved.length - index;

        for (let j = row - 1; j > rowLowerLimit; j--) {
          const rows = Array.from(document.getElementsByClassName(`r-${j}`));
          const rowLength = rows.length;

          for (let k = 0; k < rowLength; k++) {
            const block = rows[k];

            block.className = block.className.replace(`r-${j}`, `r-${j + rowsAdded}`);
          }
        }
      });
    }

    this.updateHighestBlock();
  }

  updateHighestBlock() {
    var rowArray = Array.from({ length: boardWidth }, () => []);

    const newHighestBlock = this.state.highestBlock.map((blockHeight, index) => {
      const rows = document.getElementsByClassName(`c-${index + 1}`);
      
      if (rows.length > 0) {
        for (let i = 0; i < rows.length; i++) {
          const block = rows[i];
          const rowClass = [...block.classList].find(cls => cls.startsWith("r-"));
          const row = parseInt(rowClass.substring(2), 10);
          rowArray[index].push(row);
        }
        return boardHeight + 1 - Math.min(...rowArray[index]);
      }
      return 0;
    });

    if (Math.max(...newHighestBlock) > boardHeight) {
      this.gameOver = true;
    }

    this.setState ({ highestBlock: newHighestBlock });
  }

  restartGame() {
    this.gameOver = false;
    this.mainMenu = false;

    this.setState({
      blocks: [],
      blockSize: 32,
      currentPiece: Math.floor(Math.random() * 6),
      currentPieceX: 4,
      currentPieceY: -1,
      startingY: -1,
      currentPieceWidth: 1, //for Box
      currentPieceHeight: 4, //for Box
      currentPieceRotation: 0,
      score: 0,
      speed: 1,
      ghostHeight: 0,
      highestBlock: Array(boardWidth).fill(0)
    })
  }

  render() {
    var isLine = [this.state.nextPiece===1, this.state.storedPiece===1];

    return (
      <div className={`w-[100vw] h-[100vh] ${(this.state.isMobile===2) ? `` : `grid grid-cols-[33%_33%_33%]`} m-0 overflow-hidden`}>
        {/**/}
        {!this.state.isMobile ? (<div className="flex flex-col justify-start w-full h-full text-center px-[40px] pt-[80px] bg-black text-white">
          <p className="text-[35px]">Leaderboard</p>
          {/*<p className="text-[20px]">
            {leaderboard.map((leader, index) => {
              return <p className="flex justify-between" key={index}>
                        <div>
                          <span>{index + 1}.) </span> 
                          <span>{leader.name}</span>
                        </div>
                        <span>{leader.score}</span>
                    </p>
            })}
          </p>*/}
          <p>Coming Soon!</p>
        </div>) : null}

        <div className={`relative flex flex-col justify-start w-full h-full ${(this.state.isMobile===2) ? "bg-white" : "bg-black"} m-0 p-3 gap-0`}>
          {(this.gameOver===false && this.mainMenu===false) ? (<div className="absolute flex flex-row w-[65%] justify-between top-[6%] left-[16%] text-red-500 z-30" style={{"width": `${this.state.blockSize * boardWidth}`, "height": "30px"}}>
            <p className="text-black text-[28px]">{`Score: ${this.state.score}`}</p>
            <div className="flex flex-col gap-[50px] text-black pointer-events-none">
              <div>
                <p>Next</p>
                <Piece currentPiece={this.state.nextPiece} blockSize={12} rotate={isLine[0] ? 90 : 0} />
              </div>
              <div>
                <p className="text-center">Qeueu</p>
                {this.state.storedPiece===-1 ? 
                  (<div className="w-[40px] h-[40px]"></div>) : 
                  (<div className="flex justify-center w-[40px] h-[40px] pl-[10px]">
                    <Piece currentPiece={this.state.storedPiece} blockSize={12} rotate={isLine[1] ? 90 : 0} />
                  </div>)}
              </div>

            </div>
          </div>) : null}
          <div className="flex h-full justify-center border-[1px] border-white border-solid p-[10px] m-auto rounded-[35px] z-20">
            {(this.state.isMobile===2) ? (<div className="fixed flex flex-col w-full h-full top-0 m-0 p-0 border-solid border-2 border-red-500 z-50">
              <div className="flex flex-row h-[80%] z-40">
                <button className="w-[33%] h-[100%]" onMouseDown={() => this.handleLeftRightDown({ key: "ArrowLeft" })} onMouseUp={() => this.handleKeyUp({ key: "ArrowLeft" })} onTouchStart={() => this.handleLeftRightDown({ key: "ArrowLeft" })} onTouchEnd={() => this.handleKeyUp({ key: "ArrowLeft" })}></button>
                <button className="w-[33%] h-[100%]" onClick={this.handleUp}></button>
                <div className="flex flex-col w-[33%] h-[100%]">
                  <button className="w-[100%] h-[40%]" onClick={this.handleQ}></button>
                  <button className="w-[100%] h-[60%]" onMouseDown={() => this.handleLeftRightDown({ key: "ArrowRight" })} onMouseUp={() => this.handleKeyUp({ key: "ArrowRight" })} onTouchStart={() => this.handleLeftRightDown({ key: "ArrowRight" })} onTouchEnd={() => this.handleKeyUp({ key: "ArrowRight" })}></button>
                </div>
              </div>

              <div className="flex h-[20%]">
                <button className="w-[50%] h-[100%]" onMouseDown={() => this.handleLeftRightDown({ key: "ArrowDown" })} onMouseUp={() => this.handleKeyUp({ key: "ArrowDown" })} onTouchStart={() => this.handleLeftRightDown({ key: "ArrowDown" })} onTouchEnd={() => this.handleKeyUp({ key: "ArrowDown" })}></button>
                <button className="w-[50%] h-[100%]" onClick={() => this.handleSpace()}></button>
              </div>
              
            </div>) : null}

            <div className={`relative bg-white m-auto overflow-hidden p-0 rounded=[10px] ${((this.state.isMobile===2) && this.mainMenu===false && this.gameOver===false) ? "outline outline-2 outline-black rounded-lg" : null}`} style={{"width": `${boardWidth * this.state.blockSize - 5}px`, "height": `${boardHeight * this.state.blockSize}px`}}>
              {this.gameOver===true ? (
                <div className="flex flex-col gap-[20px] mt-[40px] p-3">
                  <p className="text-[50px] text-center mt-[20px] font-bold">Game Over!</p>
                  <p className="text-[20px] text-center">Your score is</p>
                  <p className="text-[40px] text-center">{`${this.state.score}`}</p>
                  <p className="text-[17px] text-center">Enter your name to record your score.</p>
                  <input type="text" className="text-center border-black border-solid border-[1px]"></input>
                  <button className="w-[200px] h-[50px] border-solid border-2 border-black bg-red-500 text-white m-auto rounded-md" onClick={this.restartGame}>Play Again?</button>
                </div>
              ) : 
              ((this.mainMenu===false) ? 
                (<div className="relative">
                <div className="m-0 z-10">
                  <CurrentPiece currentPiece={this.state.currentPiece} x={this.state.currentPieceX} y={this.state.currentPieceY} blockSize={this.state.blockSize} width={this.state.currentPieceWidth} height={this.state.currentPieceHeight} highestBlock={this.state.highestBlock} boardHeight={boardHeight} calculateGhostHeight={this.calculateGhostHeight} rotate={this.state.currentPieceRotation} />
                </div>

                <div className="absolute m-0" style={{"top": `-${this.state.blockSize * 2}px`}}>
                  {this.state.blocks.map((element,index) => {
                    return <div className="m-0" key={index}>{element}</div>;
                  }) || ""}
                </div></div>) : 
                
                (<div className="relative flex flex-col justify-between mt-[50%] z-30">
                  <p className="text-[85px] font-bold text-center animate-bounce">
                    <span className="text-purple-600">T</span>
                    <span className="text-green-600">E</span>
                    <span className="text-blue-600">T</span>
                    <span className="text-yellow-600">R</span>
                    <span className="text-red-600">I</span>
                    <span className="text-orange-600">S</span>
                  </p>
                  <button className="w-[200px] h-[50px] border-solid border-2 border-black bg-green-400 rounded-lg mx-auto mt-[50%] z-30" onClick={this.restartGame}>Play</button>
                </div>)
                )}
            </div>
          </div>
          
        </div>
        

        {!this.state.isMobile ? (<div className="flex flex-col justify-center w-full text-center pl-[40px] m-0 bg-black text-white">
          <div>
            <p className="text-[35px]">Controls</p>
            <p className="text-[20px]">Arrow <span className="text-blue-500">Left</span> and <span className="text-green-500">Right</span> to move</p>
            <p className="text-[20px]">Arrow <span className="text-red-500">Up</span> to rotate</p>
            <p className="text-[20px]">Arrow <span className="text-purple-500">Down</span> to Soft Drop</p>
            <p className="text-[20px]"><span className="text-yellow-500">Space</span> to Hard Drop</p>
            <p className="text-[20px]"><span className="text-orange-500">Q</span> to Qeueu</p>
          </div>
        </div>) : null}
    </div>
    );

  }
}