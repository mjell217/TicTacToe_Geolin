const connection = new signalR.HubConnectionBuilder()
    .withUrl("/gamehub")
    .configureLogging(signalR.LogLevel.Information) // Add logging
    .build();

connection.start().then(() => {
    console.log("Connected to SignalR Hub");
}).catch(err => {
    console.error("Error connecting to SignalR Hub:", err.toString());
});

connection.on("AssignRole", (role) => {
    currentPlayer = role;
    updateTurnIndicator();
});

connection.on("ReceiveMove", (row, col, player) => {
    document.getElementById("board").rows[row].cells[col].innerHTML = player;
    board[row][col] = player;
    checkWinOrDraw();
    updateTurnIndicator();
});

connection.on("ResetBoard", () => {
    resetBoard();
});

connection.on("UpdateTurnIndicator", (player) => {
    currentPlayer = player;
    updateTurnIndicator();
});

function makeMove(row, col) {
    let cell = document.getElementById("board").rows[row].cells[col];
    if (cell.innerHTML === "" && board[row][col] === "" && currentPlayer) {
        cell.innerHTML = currentPlayer;
        board[row][col] = currentPlayer;
        connection.invoke("SendMove", row, col, currentPlayer);
        checkWinOrDraw();
    }
}

let board = [
    ["", "", ""],
    ["", "", ""],
    ["", "", ""]
];

function checkWinOrDraw() {
    const winPatterns = [
        [[0, 0], [0, 1], [0, 2]],
        [[1, 0], [1, 1], [1, 2]],
        [[2, 0], [2, 1], [2, 2]],
        [[0, 0], [1, 0], [2, 0]],
        [[0, 1], [1, 1], [2, 1]],
        [[0, 2], [1, 2], [2, 2]],
        [[0, 0], [1, 1], [2, 2]],
        [[0, 2], [1, 1], [2, 0]]
    ];

    for (const pattern of winPatterns) {
        const [a, b, c] = pattern;
        if (board[a[0]][a[1]] && board[a[0]][a[1]] === board[b[0]][b[1]] && board[a[0]][a[1]] === board[c[0]][c[1]]) {
            alert(`${board[a[0]][a[1]]} wins!`);
            updateScoreboard(board[a[0]][a[1]]);
            connection.invoke("RestartGame");
            return;
        }
    }

    if (board.flat().every(cell => cell)) {
        alert("It's a draw!");
        connection.invoke("RestartGame");
    }
}

function updateScoreboard(winner) {
    if (winner === "X") {
        const player1Wins = document.getElementById("player1Wins");
        player1Wins.textContent = `${parseInt(player1Wins.textContent) + 1} wins`;
    } else if (winner === "O") {
        const player2Wins = document.getElementById("player2Wins");
        player2Wins.textContent = `${parseInt(player2Wins.textContent) + 1} wins`;
    }
}

function resetBoard() {
    board = board.map(row => row.map(() => ""));
    document.querySelectorAll("#board td").forEach(cell => cell.innerHTML = "");
}

function updateTurnIndicator() {
    document.getElementById("turnIndicator").textContent = `${currentPlayer === "X" ? "Player 1" : "Player 2"}'s turn`;
}

function restartGame() {
    connection.invoke("RestartGame");
}

