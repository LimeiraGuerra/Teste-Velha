var jogo = [[0, 0, 0], 
            [0, 0, 0],
            [0, 0, 0]];

var lastPlay = "", turn = 0;

var iconX = `<path d="M23.954 22.03l-10.184-10.095 10.092-10.174-1.832-1.807-10.09 10.179-10.176-10.088-1.81 1.81 10.186 10.105-10.095 10.184 1.81 1.81 10.112-10.192 10.18 10.1z"/>`;
var iconO = `<path d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12z"/>`;

function resetGame(){
    jogo = [[0, 0, 0], 
            [0, 0, 0],
            [0, 0, 0]];
    turn = 0;
    document.querySelectorAll("button").forEach(function(btn){
        btn.querySelector('svg').innerHTML = "";
        btn.style.backgroundColor = "rgb(140, 149, 165)";
        btn.disabled = false;
    });        
}

function resultMessage(gameResult){
    if (gameResult === 'O') document.querySelector('.results h1').innerHTML = "⭕ <span>VENCEU!</span>";
    else if (gameResult === 'X') document.querySelector('.results h1').innerHTML = "❌ <span>VENCEU!</span>";
    else document.querySelector('.results h1').innerHTML = "<span>EMPATE!</span>";

    let message = document.querySelector('.results');
    let opVal = [0, true];
    let fade = setInterval(function(){
        if(opVal[0] < 1.3 && opVal[1]){
            message.style.display = "block";
            opVal[0] += 0.1;
            message.style.opacity = opVal[0];
        }
        else if (opVal[1]) {
            resetGame();
            opVal[1] = false;
        }
        else if(opVal[0] > -0.1){
            opVal[0] -= 0.1;
            message.style.opacity = opVal[0];
        }
        else {
            clearInterval(fade);
            message.style.display = "none";
        }
    }, 50);
}

function winMarker(winner, left, middle, right){
    let winColor = winner === 'X' ? "green" : "red";
    
    document.querySelectorAll("button").forEach(function(btn){
        let xy = btn.getAttribute("data-idx");
        if (xy === left.join('') || xy === middle.join('') || xy === right.join('')){
            btn.style.backgroundColor = winColor;
        }
        btn.disabled = true;
    });
    resultMessage(winner);  
}

function placePlay(xy){
    document.querySelector(`button[data-idx="${xy.join('').substr(0, 2)}"] svg`).innerHTML = iconO;
    jogo[xy[0]][xy[1]] = 5;
    checkGame(false);
}

function nextPlay(possibles){
    let bestPlay = false;
    for (let i = 0; i < possibles.length; i++) {
        if (possibles[i][2] === 'O'){
            bestPlay = possibles[i];
            break;
        }
        else if (possibles[i][2] === 'X'){
            bestPlay = possibles[i];
        }
    }
    if(bestPlay) placePlay(bestPlay);
    else{
        let defaultOrderMoves = [[0, 0], [0, 2], [2, 2], [2, 0], [0, 1], [1, 2], [2, 1], [1, 0]];
        let direction = 1;
        if (turn === 1) {
            if (jogo[1][1] === 0) {
                placePlay([1, 1]);
                return;
            }
            else if (jogo[1][1] === 5) {
                direction = -1;
            }
        }
        else if (turn === 2) {
            if (lastPlay.toString() === "0,1" || lastPlay.toString() === "2,1") {
                let xy = [lastPlay[0], lastPlay[1]-1];
                if (jogo[xy[0]][xy[1]] === 0){
                    placePlay(xy);
                    return;
                }
                else {
                    xy = [lastPlay[0], lastPlay[1]+2];
                    placePlay(xy);
                    return;
                }
            }
            else if (lastPlay.toString() === "1,0" || lastPlay.toString() === "1,2"){
                let xy = [lastPlay[0]-1, lastPlay[1]];
                if (jogo[xy[0]][xy[1]] === 0){
                    placePlay(xy);
                    return;
                }
                else {
                    xy = [lastPlay[0]+2, lastPlay[1]];
                    placePlay(xy);
                    return;
                }
            }
        }
        
        let i = direction > 0 ? 0 : defaultOrderMoves.length - 1
        let stop = direction > 0 ? defaultOrderMoves.length : -1
        for (; i != stop; i += direction) {
            let xy = defaultOrderMoves[i];
            if (jogo[xy[0]][xy[1]] === 0) {
                placePlay(xy);
                return;
            }
        }
        resultMessage("tie");
    }
}

function findBest(left, middle, right, winning){
    if (jogo[left[0]][left[1]] === 0) {
        left.push(winning);
        return left;
    }
    if (jogo[middle[0]][middle[1]] === 0) {
        middle.push(winning);
        return middle;
    }
    if (jogo[right[0]][right[1]] === 0) {
        right.push(winning);
        return right;
    }
}

function checkLine(left, middle, right){
    let lineSum = jogo[left[0]][left[1]] + jogo[middle[0]][middle[1]] + jogo[right[0]][right[1]];
    
    switch (lineSum) {
        case 6: //  Win X
            winMarker('X', left, middle, right);
            return null;
        
        case 15: //  Win O
            winMarker('O', left, middle, right);
            return null;

        case 4: //  Almost X
            return findBest(left, middle, right, 'X');

        case 10: //  Almost O
            return findBest(left, middle, right, 'O');

        default:
            return false;
    }
}

function checkGame(playerTurn){
    let possibles = []
    let testLines = [
        [[0, 0], [1, 0], [2, 0]],
        [[0, 1], [1, 1], [2, 1]],
        [[0, 2], [1, 2], [2, 2]],
        [[0, 0], [0, 1], [0, 2]],
        [[1, 0], [1, 1], [1, 2]],
        [[2, 0], [2, 1], [2, 2]],
        [[0, 0], [1, 1], [2, 2]],
        [[2, 0], [1, 1], [0, 2]]
    ];
    testLines.forEach(l => {
        let result = checkLine(l[0], l[1], l[2]);
        if (result) possibles.push(result);
        else if (result == null) playerTurn = false;
    });
    if (playerTurn) nextPlay(possibles);
}

document.querySelector("table").addEventListener("click", function(e){
    let btnTag = e.target.closest("button");
    if(btnTag != null && btnTag.querySelector("svg").innerHTML === "" && !btnTag.disabled){
        btnTag.querySelector("svg").innerHTML = iconX;
        let xy = btnTag.getAttribute("data-idx");
        lastPlay = [xy.charAt(0), xy.charAt(1)];
        turn++;
        jogo[lastPlay[0]][lastPlay[1]] = 2;
        checkGame(true);
    }
});