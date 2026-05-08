class Agent_NiVasCor2 extends Agent {
    constructor() {
        super();
    }

    init(color, board, time = 20000) {
        super.init(color, board, time);
        this.size = board.length;
    }

    // Cuenta cuántos lados tiene dibujados una celda (de 0 a 4)
    sidesCount(board, i, j) {
        // Si sale de los límites o ya fue capturada, consideramos que tiene 4 lados
        if (i < 0 || i >= this.size || j < 0 || j >= this.size || board[i][j] < 0) return 4;
        let v = board[i][j], c = 0;
        if (v & 1) c++; // Arriba
        if (v & 2) c++; // Derecha
        if (v & 4) c++; // Abajo
        if (v & 8) c++; // Izquierda
        return c;
    }

    // Obtiene las coordenadas del vecino con el que se comparte la línea 's'
    getNeighbor(i, j, s) {
        if (s === 0 && i > 0) return [i - 1, j];
        if (s === 1 && j < this.size - 1) return [i, j + 1];
        if (s === 2 && i < this.size - 1) return [i + 1, j];
        if (s === 3 && j > 0) return [i, j - 1];
        return null;
    }

    // Búsqueda ultrarrápida (DFS) para contar el tamaño de una cadena de cuadros.
    // Esto evita usar el costoso clone().
    chainLength(board, startR, startC) {
        let visited = new Set();
        let q = [[startR, startC]];
        let count = 0;

        while (q.length > 0) {
            let [r, c] = q.pop();
            let key = r + "," + c;
            if (visited.has(key)) continue;
            visited.add(key);

            // Si es una celda que está a punto de ser capturada (tiene 2 o más lados)
            if (this.sidesCount(board, r, c) >= 2) {
                count++;
                let v = board[r][c];
                if (v < 0) continue; // Ya está cerrada, ignorar
                
                // Revisamos conexiones hacia donde NO hay pared
                if (!(v & 1) && r > 0) q.push([r - 1, c]);
                if (!(v & 2) && c < this.size - 1) q.push([r, c + 1]);
                if (!(v & 4) && r < this.size - 1) q.push([r + 1, c]);
                if (!(v & 8) && c > 0) q.push([r, c - 1]);
            }
        }
        return count;
    }

    compute(board, time) {
        let moves = [];
        // 1. Encontrar todos los movimientos válidos (más rápido que llamar b.valid_moves)
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (board[i][j] >= 0) {
                    for (let s = 0; s < 4; s++) {
                        if ((board[i][j] & (1 << s)) === 0) {
                            moves.push([i, j, s]);
                        }
                    }
                }
            }
        }

        if (moves.length === 0) return [0, 0, 0];

        let safe0 = []; // Excelente: No crea celdas de 2 lados (evita armar trampas)
        let safe1 = []; // Aceptable: Crea celdas de 2 lados, pero no regala nada aún
        let risky = []; // Peligroso: Vuelve una celda de 2 en 3 (le regala el cuadro al rival)

        // 2. Clasificar cada movimiento lógicamente evaluando sus paredes locales
        for (let i = 0; i < moves.length; i++) {
            let m = moves[i];
            let r = m[0], c = m[1], s = m[2];
            let neighbor = this.getNeighbor(r, c, s);

            let sides1 = this.sidesCount(board, r, c);
            let sides2 = neighbor ? this.sidesCount(board, neighbor[0], neighbor[1]) : 0;

            // Si al poner la línea, la celda actual (que ya tiene 2 lados) pasa a 3, es un regalo inminente
            if (sides1 === 2 || sides2 === 2) {
                risky.push(m);
            } 
            // Si la celda pasa de 1 a 2 lados (se vuelve riesgosa a futuro)
            else if (sides1 === 1 || sides2 === 1) {
                safe1.push(m);
            } 
            // Movimiento completamente inofensivo
            else {
                safe0.push(m);
            }
        }

        // 3. Tomar decisión con prioridades estrictas

        // Prioridad 1: Movimientos perfectos (Evitan iniciar cadenas)
        if (safe0.length > 0) {
            return safe0[Math.floor(Math.random() * safe0.length)];
        }

        // Prioridad 2: Movimientos seguros (No regalan cuadros todavía)
        if (safe1.length > 0) {
            return safe1[Math.floor(Math.random() * safe1.length)];
        }

        // Prioridad 3: Sacrificio inevitable (Fase final del juego)
        // Ya no hay movimientos seguros. Toca regalar, pero regalaremos la cadena más pequeña.
        let bestRisky = risky[0];
        let minChain = Infinity;

        for (let i = 0; i < risky.length; i++) {
            let m = risky[i];
            let chainSize = 0;
            
            // Medimos la cadena desde la celda actual
            if (this.sidesCount(board, m[0], m[1]) === 2) {
                chainSize = Math.max(chainSize, this.chainLength(board, m[0], m[1]));
            }
            
            // Medimos desde el vecino
            let n = this.getNeighbor(m[0], m[1], m[2]);
            if (n && this.sidesCount(board, n[0], n[1]) === 2) {
                chainSize = Math.max(chainSize, this.chainLength(board, n[0], n[1]));
            }
            
            if (chainSize < minChain) {
                minChain = chainSize;
                bestRisky = m;
            }
            
            // Optimización: Si la cadena es de tamaño 1 (solo regalamos 1 cuadro), no se puede mejorar.
            if (minChain <= 1) break; 
        }

        return bestRisky;
    }
}