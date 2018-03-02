"use strict";
var Game = {
  create: function(values) {
    var instance = Object.create(this);
    Object.keys(values).forEach(function(key) {
      instance[key] = values[key];
    });
    return instance;
  },
  MakeTimer: function() {
    var t = {
      tf: function(func, howLong) {
        this.func = func;
        this.howLong = howLong;
        this.timer = setTimeout(function() {
          func();
        }, howLong);
      }
    };
    return {
      timers: t.tf
    };
  }
};

var board = Game.create({
  init: function() {
    this.cacheDom();
    this.cacheCanvas();
    this.bindEvents();
    this.drawBoard();
    this.inGameTimer = new Game.MakeTimer();
    this.boardState();
  },
  cacheDom: function() {
    this.message = document.getElementById("message");
    this.winToken = document.getElementById("xo");
    this.buttonAI = document.getElementById("AI");
    this.buttonPlayer = document.getElementById("player");
    this.switchAI = document.getElementById("easy");
    this.switchPlayer = document.getElementById("ox");
    this.buttonReset = document.getElementById("resetButton");
  },
  cacheCanvas: function() {
    this.canvas = document.getElementById("tictactoe");
    this.ctx = this.canvas.getContext("2d");
    this.xImg = new Image();
    this.oImg = new Image();
    this.xImg.src = this.vars.xImage;
    this.oImg.src = this.vars.oImage;
  },
  bindEvents: function() {
    this.canvas.addEventListener("mouseup", function(evt) {
      var mousePos = board.getMousePos(board.canvas, evt);
      if (board.state.turn() === human.token()) {
        human.playerMove(mousePos);
      }
    });
    board.buttonAI.addEventListener("click", function() {
      // toggle AI
      board.switchAI.innerHTML = board.buttonAI.checked ? "AI" : "EASY";
      clearTimeout(board.inGameTimer.timer)
      board.reset();
    });
    board.buttonPlayer.addEventListener("click", function() {
      //toggle player
      board.switchPlayer.innerHTML = board.buttonPlayer.checked ? "O" : "X";
      clearTimeout(board.inGameTimer.timer)
      board.reset();
    });
    board.buttonReset.addEventListener("click", function() {
      // reset game
      clearTimeout(board.inGameTimer.timer)
      board.reset();
    });
  },
  drawBoard: function() {
    this.ctx.fillStyle = "#ff5555";
    this.ctx.fillRect(120, 0, 10, 360);
    this.ctx.fillRect(0, 120, 360, 10);
    this.ctx.fillRect(240, 0, 10, 360);
    this.ctx.fillRect(0, 240, 360, 10);
  },
  getMousePos: function(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
  },
  render: function(move) {
    let token = move.token;
    let x = move.x;
    let y = move.y;
    let w = this.vars.tokenW;
    let h = this.vars.tokenH;
    this.ctx.drawImage(token, x, y, h, w);
  },
  vars: {
    //board.vars
    setBoard: function(position, token) {
      this.board[position] = token;
    },
    getBoard: function() {
      return this.board;
    },
    board: [" ", " ", " ", " ", " ", " ", " ", " ", " "],
    WINS: [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6]
    ],
    tokenH: 115,
    tokenW: 115,
    xyCanvas: {
      // canvas token positions
      0: [5, 15],
      1: [130, 15],
      2: [250, 15],
      3: [5, 135],
      4: [130, 135],
      5: [250, 135],
      6: [5, 260],
      7: [130, 255],
      8: [250, 255]
    },
    xyObjMap: [[0, 3, 6], [1, 4, 7], [2, 5, 8]], // human board position from mouse x,y
    mouseClick: 0,
    xImage: "images/x.gif",
    oImage: "images/o.gif",
    catsImg: "images/simonscat.gif",
    dumbAI: function() {
      return Math.floor(Math.random(10) * 8);
    }
  },
  state: {
    turn: function() {
      // returns token (X or O) of current player if play is still available
      if (!board.state.cat() && !board.state.won()) {
        return board.vars.board.filter(pos => pos !== " ").length % 2 === 0
          ? "X"
          : "O";
      }
      // else return a game over state
      return "game over";
    },
    cat: function() {
      // returns true if board is full and there is no winner
      return board.state.boardFull() && !board.state.won() ? true : false;
    },
    boardFull: function() {
      // returns true if every position not empty
      return board.vars.board.every(e => e !== " ");
    },
    currentMove: function() {
      // returns a value 0 to 8
      return 9 - board.vars.board.filter(e => e === " ").length;
    },
    won: function() {
      var t = [];
      for (var w = 0; w < board.vars.WINS.length; ++w) {
        board.vars.WINS[w].map(a => t.push(board.vars.board[a]));
        if (t.every(a => a === "X") || t.every(a => a === "O")) {
          return t[0];
        }
        t = [];
      }
      return false;
    },
    winner: function() {
      // kind of redundant, gets winner token from won()
      return board.state.won();
    },
    validMove: function(position) {
      // returns true for a valid move
      return board.vars.board[position] === "X" ||
        board.vars.board[position] === "O"
        ? false
        : true;
    }
  },
  boardState: function() {
    // function called after render to check board state
    let currentPlayer = board.state.turn();
    board.winToken.src = currentPlayer === "X"
      ? board.vars.xImage
      : board.vars.oImage;
    if (board.state.won() || board.state.boardFull()) {
      board.gameOver();
    }
    if (currentPlayer === AI.token()) {
      this.inGameTimer.timers(AI.aiMove.bind(AI),1000);
    }
    return;
  },
  reset: function() {
      board.ctx.clearRect(0, 0, board.canvas.width, board.canvas.height);
      board.winToken.src = board.vars.xImage;
      board.message.innerHTML = "Let's Play!";
      board.vars.board = [" ", " ", " ", " ", " ", " ", " ", " ", " "];
      board.vars.mouseClick = 0;
      board.drawBoard();
      board.boardState();
  },
  gameOver: function() {
    let delay = 2000;
    if (board.state.winner()) {
      board.winToken.src = board.state.winner() === "X"
        ? board.vars.xImage
        : board.vars.oImage;
      board.message.innerHTML = "Won!";
    } else {
      board.winToken.src = board.vars.catsImg;
      board.message.innerHTML = "CAT!";
      delay = 9500;
    }
    this.inGameTimer.timers(this.reset,delay);
  }
});

var human = Game.create({
  token: function() {
    return !board.buttonPlayer.checked ? "X" : "O";
  },
  tokenImg: function() {
    return !board.buttonPlayer.checked ? board.xImg : board.oImg;
  },
  playerMove: function(mousePos) {
    let x = Math.floor(mousePos.x / 120);
    let y = Math.floor(mousePos.y / 120);
    let tokenX = board.vars.xyCanvas[board.vars.xyObjMap[x][y]][0];
    let tokenY = board.vars.xyCanvas[board.vars.xyObjMap[x][y]][1];
    let boardPos = board.vars.xyObjMap[x][y];
    let move = {
      x: tokenX,
      y: tokenY,
      token: this.tokenImg()
    };
    if (!board.state.validMove(boardPos)) {
      return;
    }
    board.vars.setBoard(boardPos, this.token());
    board.render(move);
    board.boardState();
  }
});

var AI = Game.create({
  token: function() {
    return !board.buttonPlayer.checked ? "O" : "X";
  },
  tokenImg: function() {
    return !board.buttonPlayer.checked ? board.oImg : board.xImg;
  },
  easy: function() {
    let move = 0;
    do {
      if (board.state.validMove(4)) {
        move = 4;
      } else if (board.state.validMove(2)) {
        move = [0, 2, 6, 8][Math.floor(Math.random() * 4)];
      } else {
        move = board.vars.dumbAI();
      }
    } while (!board.state.validMove(move));
    return move;
  },
  aiMove: function() {
    let boardPos = null;
    let tokenX = null;
    let tokenY = null;
    this.WINS = board.vars.WINS;
    let positionArray = this.checkWin(this.WINS);
    if (!positionArray) {
      positionArray = this.checkDoubles(this.WINS);
      if (!positionArray) {
        positionArray = this.checkSingles(this.WINS);
      }
    }
    boardPos = typeof positionArray === "object"
      ? this.getMove(positionArray)
      : positionArray;
    if (!board.buttonAI.checked) {
      boardPos = this.easy();
    }
    board.vars.setBoard(boardPos, this.token());
    tokenX = board.vars.xyCanvas[boardPos][0];
    tokenY = board.vars.xyCanvas[boardPos][1];
    let move = {
      x: tokenX,
      y: tokenY,
      token: this.tokenImg()
    };
    board.render(move);
    board.boardState();
  },
  checkWin: function(WINS) {
    // check board for possible wins
    for (let index = 0; index < WINS.length; ++index) {
      if (this.chkArr(WINS[index], this.token()) === 2) {
        return WINS[index];
      }
    } // continue looping through WIN array
    // can't win this round
    return false;
  },
  checkDoubles: function(WINS) {
    // check for human.token doubles and calculate block position
    for (var index = 0; index < WINS.length; ++index) {
      if (this.chkArr(WINS[index], human.token()) === 2) {
        return WINS[index];
      }
    }
    return false;
  },
  checkSingles: function(WINS) {
    this.currentMove = board.state.currentMove;
    this.validMove = board.state.validMove;
    this.board = board.vars.getBoard();
    this.humanToken = human.token();
    // check for human.token singles and calculate AI.token position
    for (let index = 0; index < WINS.length; ++index) {
      if (
        this.chkArr(WINS[index], this.humanToken) === 1 ||
        this.currentMove() === 0
      ) {
        if (this.validMove(4)) {
          return 4;
        } else if (this.currentMove() === 1) {
          return [0, 2, 6, 8][Math.floor(Math.random() * 4)];
        } else if (this.currentMove() === 2 && !this.validMove(8)) {
          return 2;
        } else if( this.currentMove() ===3 || this.currentMove() ===4){
          let spot = this.chkPairs();
          if(spot !== false){
            return spot;
          }
        } else {
          return this.board.findIndex(this.findCallback);
        }
      }
    }
  },
  findCallback: function(element) {
    return element === " ";
  },
  chkPairs: function() {
    let pairs = [[1,7],[3,5],[2,3],[1,3],[1,5],[3,7],[5,7],[2,7],[0,7],[1,8],[0,8],[2,6],[3,8],[0,5],[5,6]];
    let moves =[6,2,0,2,0,2,6,8,6,6,5,3,1,2,8];
    let move = false;
    pairs.forEach(function(e,i){
      if(e.every(s => board.vars.board[s] === human.token())){
        move = moves[i];
      }
    });
    return move;
  },
  chkArr: function(arr, token) {
    this.board = board.vars.getBoard();
    if (arr.filter(e => this.board[e] !== " ").length <= 2) {
      return arr.filter(e => this.board[e] === token).length;
    }
    return;
  },
  getMove: function(arr) {
    this.board = board.vars.getBoard();
    let moveAI = arr.map(e => this.board[e]);
    return arr[moveAI.indexOf(" ")];
  }
});

// start the game..
board.init();
