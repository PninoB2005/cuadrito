/*
Fecha de entrega: 12 mayo 2025, 11:59 pm
Desarrollar un agente que juegue cuadrito. Tiene límite de tiempo:
 1. Aquí encuentran el código del ambiente
 2. Su agente debe heredar de la clase Agent y debe sobreescribir el método compute
 3. El método de iniciar el agente recibe tres argumentos: 
    - El color con que está jugando
    - El tablero inicial del cual puede obtener el tamaño (siempre cuadrado)
    - El tiempo total de juego en milisegundos
 4. El método compute recibe dos argumentos:
    - El tablero como va 
    - El tiempo que le queda a su agente en milisegundos
 5. El método compute debe retornar una lista con tres argumentos [fila, columna, lado]. El valor del lado
 es un número 0: arriba, 1: derecha, 2.abajo, 3:izquierda 
*/

/**
 * Abstract agent class
 */
class Agent {
    /**
     * Creates an agent
     */
    constructor() { }

    /**
     * Initializes the agent
     * @param color Color of the agent pieces ('R':red or 'Y':yellow)
     * @param board Initial state of the board (empty, useful for obtaaining the size (nxn))
     * @param time Total amount of time the agent has for playing all the game (milliseconds)
     */
    init(color, board, time = 20000) {
        this.color = color
        this.time = time
        this.size = board.length
    }

    /**
     * Determines the next play of the agent
     * @param board Current square configuration
     * @param time Remaining time the agent has for playing all the game (milliseconds)
     * @return A list with three values [row, column, side]. Parameter size can take one of the following values: 
               0 is up, 1 is right, 2 is bottom, 3 is left  
     */
    compute(board, time) { return [0, 0, 0]; }
}

/*
 * A class for board operations (it is not the board but a set of operations over it)
 */
class Board {
    constructor() { }

    // Initializes a board of the given size. A board is a matrix of size*size of integers 0, .., 15, -1, or -2
    init(size) {
        var m = size - 1
        var board = []
        board[0] = []
        board[0][0] = 9
        for (var j = 1; j < m; j++) {
            board[0][j] = 1
        }
        board[0][m] = 3

        for (var i = 1; i < m; i++) {
            board[i] = []
            board[i][0] = 8
            for (var j = 1; j < m; j++) {
                board[i][j] = 0
            }
            board[i][m] = 2
        }

        board[m] = []
        board[m][0] = 12
        for (var j = 1; j < m; j++) {
            board[m][j] = 4
        }
        board[m][m] = 6

        return board
    }

    // Deep clone of a board the reduce risk of damaging the real board
    clone(board) {
        var size = board.length
        var b = []
        for (var i = 0; i < size; i++) {
            b[i] = []
            for (var j = 0; j < size; j++)
                b[i][j] = board[i][j]
        }
        return b
    }

    // Determines if a line can be drawn at row r, column c, side s 
    check(board, r, c, s) {
        if (board[r][c] < 0) return false
        s = 1 << s
        return ((board[r][c] & s) != s)
    }

    // Computes all the valid moves for the given 'color'
    valid_moves(board) {
        var moves = []
        var size = board.length
        for (var i = 0; i < size; i++)
            for (var j = 0; j < size; j++)
                for (var s = 0; s < 4; s++)
                    if (this.check(board, i, j, s)) moves.push([i, j, s])
        return moves
    }

    fill(board, i, j, color) {
        if (i < 0 || i == board.length || j < 0 || j == board.length) return board

        if (board[i][j] == 15 || board[i][j] == 14) {
            board[i][j] = color
            if (i > 0 && board[i - 1][j] >= 0) {
                board[i - 1][j] += 4
                this.fill(board, i - 1, j, color)
            }
        }

        if (board[i][j] == 15 || board[i][j] == 13) {
            board[i][j] = color
            if (j < board.length - 1 && board[i][j + 1] >= 0) {
                board[i][j + 1] += 8
                this.fill(board, i, j + 1, color)
            }
        }

        if (board[i][j] == 15 || board[i][j] == 11) {
            board[i][j] = color
            if (i < board.length - 1 && board[i + 1][j] >= 0) {
                board[i + 1][j] += 1
                this.fill(board, i + 1, j, color)
            }
        }

        if (board[i][j] == 15 || board[i][j] == 7) {
            board[i][j] = color
            if (j > 0 && board[i][j - 1] >= 0) {
                board[i][j - 1] += 2
                this.fill(board, i, j - 1, color)
            }
        }
        return board
    }

    // Computes the new board when a piece of 'color' is set at row i, column j, side s. 
    // If it is an invalid movement stops the game and declares the other 'color' as winner
    move(board, i, j, s, color) {
        if (this.check(board, i, j, s)) {
            var ocolor = (color == -2) ? -1 : -2
            board[i][j] |= 1 << s
            board = this.fill(board, i, j, ocolor)
            if (i > 0 && s == 0) {
                board[i - 1][j] |= 4
                board = this.fill(board, i - 1, j, ocolor)
            }
            if (i < board.length - 1 && s == 2) {
                board[i + 1][j] |= 1
                board = this.fill(board, i + 1, j, ocolor)
            }
            if (j > 0 && s == 3) {
                board[i][j - 1] |= 2
                board = this.fill(board, i, j - 1, ocolor)
            }

            if (j < board.length - 1 && s == 1) {
                board[i][j + 1] |= 8
                board = this.fill(board, i, j + 1, ocolor)
            }
            return true
        }
        return false
    }

    // Determines the winner of the game if available 'R': red, 'Y': yellow, ' ': none
    winner(board) {
        var cr = 0
        var cy = 0
        for (var i = 0; i < board.length; i++)
            for (var j = 0; j < board.length; j++)
                if (board[i][j] < 0) {
                    if (board[i][j] == -1) { cr++ } else { cy++ }
                }
        if (cr + cy < board.length * board.length) return ' '
        if (cr > cy) return 'R'
        if (cy > cr) return 'Y'
        return ' '
    }

    // Draw the board on the canvas
    print(board) {
        var size = board.length
        // Commands to be run (left as string to show them into the editor)
        var grid = []
        for (var i = 0; i < size; i++) {
            for (var j = 0; j < size; j++) {
                var commands = [{ "command": "-" }]
                if (board[i][j] < 0) {
                    if (board[i][j] == -1) commands.push({ "command": "R" })
                    else commands.push({ "command": "Y" })
                    commands.push({ "command": "u" })
                    commands.push({ "command": "r" })
                    commands.push({ "command": "d" })
                    commands.push({ "command": "l" })
                } else {
                    if ((board[i][j] & 1) == 1) commands.push({ "command": "u" })
                    if ((board[i][j] & 2) == 2) commands.push({ "command": "r" })
                    if ((board[i][j] & 4) == 4) commands.push({ "command": "d" })
                    if ((board[i][j] & 8) == 8) commands.push({ "command": "l" })
                }
                grid.push({ "command": "translate", "y": i, "x": j, "commands": commands })
            }
        }

        var cmds = { "r": true, "x": 1.0 / size, "y": 1.0 / size, "command": "fit", "commands": grid }
        Konekti.client['canvas'].setText(cmds)
    }
}

/*
 * Player's Code (Must inherit from Agent: It is mandatory the inheritance process) 
 * This is an example of a rangom player agent
 *
 */
class RandomPlayer extends Agent {
    constructor() {
        super()
        this.board = new Board()
    }

    compute(board, time) {
        // Always cheks the current board status since opponent move can change several squares in the board
        var moves = this.board.valid_moves(board)
        // Randomly picks one available move
        var index = Math.floor(moves.length * Math.random())
        for (var i = 0; i < 50000000; i++) { } // Making it very slow to test time restriction
        for (var i = 0; i < 50000000; i++) { } // Making it very slow to test time restriction
        return moves[index]
    }
}

/*
 * ============================================================
 * SmartAgent — Agente inteligente para el juego Squares
 *
 * MECÁNICA CLAVE (invertida respecto a Dots & Boxes clásico):
 *   Board.move asigna el cuadro al OPONENTE (ocolor) cuando se cierra.
 *   → Quien pone el 4to lado le REGALA el cuadro al rival.
 *   → La meta es FORZAR al rival a cerrar cuadros.
 *
 * ESTRATEGIA (sin minimax en tableros grandes — demasiados movimientos):
 *
 *   FASE 1 — Greedy por clasificación de movimientos:
 *     Cada movimiento se clasifica en:
 *       • safe    → no deja ninguna celda con 3 lados (seguro)
 *       • risky   → deja alguna celda con 3 lados (el rival la cerrará)
 *       • closing → pone el 4to lado de una celda (regala cuadro al rival)
 *     Prioridad: safe > risky > closing.
 *     Dentro de cada clase, se elige el movimiento con mejor score greedy.
 *
 *   FASE 2 — Cuando los movimientos válidos son pocos (<= umbral),
 *     se activa minimax con poda alfa-beta e iterative deepening.
 *
 *   GESTIÓN DE TIEMPO:
 *     Cada turno usa como máximo: min(800ms, time/movimientos_restantes).
 *     Nunca se bloquea: si no hay tiempo para minimax, greedy responde
 *     en microsegundos.
 * ============================================================
 */
class Agent_NiVasCor extends Agent {
    constructor() {
        super()
        this.b = new Board()
    }

    init(color, board, time = 20000) {
        super.init(color, board, time)
        this.myPly = (color === 'R') ? -1 : -2
        this.oppPly = (color === 'R') ? -2 : -1
    }

    // ── Utilidades ────────────────────────────────────────────

    /** Cuántos lados tiene marcados la celda. Retorna 4 si ya está cerrada. */
    sidesCount(board, i, j) {
        if (board[i][j] < 0) return 4
        var v = board[i][j], c = 0
        if (v & 1) c++; if (v & 2) c++; if (v & 4) c++; if (v & 8) c++
        return c
    }

    /**
     * Retorna las celdas afectadas al marcar el lado s en (i,j).
     * Solo incluye vecinos existentes que comparten ese lado.
     */
    affectedCells(board, i, j, s) {
        var cells = [[i, j]]
        var n = board.length
        if (s === 0 && i > 0) cells.push([i - 1, j])
        if (s === 2 && i < n - 1) cells.push([i + 1, j])
        if (s === 3 && j > 0) cells.push([i, j - 1])
        if (s === 1 && j < n - 1) cells.push([i, j + 1])
        return cells
    }

    /**
     * Simula marcar el lado s en (i,j) SOLO en términos de conteo de lados
     * (sin clonar el tablero completo — mucho más rápido).
     * Retorna cuántas celdas quedarán con exactamente 3 lados marcados
     * (peligrosas para quien tenga que cerrarlas).
     */
    scoreMove(board, i, j, s) {
        // Detectar si es closing (4to lado)
        if (this.sidesCount(board, i, j) === 3) return -1000  // cierra → regala cuadro

        var cells = this.affectedCells(board, i, j, s)
        var creates3 = 0
        for (var k = 0; k < cells.length; k++) {
            var ci = cells[k][0], cj = cells[k][1]
            if (board[ci][cj] < 0) continue   // ya cerrada
            var cnt = this.sidesCount(board, ci, cj)
            if (cnt === 2) creates3++          // quedará con 3 → peligrosa
            // cnt===3 no ocurre aquí porque ya filtramos closing arriba
        }
        // Penalizar por cada celda peligrosa creada
        return -creates3 * 10
    }

    /**
     * Clasifica y puntúa todos los movimientos en O(moves) sin clonar tablero.
     * Retorna { safe, risky, closing } donde cada array está ordenado
     * de mejor a peor score dentro de su clase.
     */
    classifyAndScore(board, moves) {
        var safe = [], risky = [], closing = []
        for (var k = 0; k < moves.length; k++) {
            var m = moves[k]
            var sc = this.scoreMove(board, m[0], m[1], m[2])
            var entry = [sc, m]
            if (sc <= -1000) closing.push(entry)
            else if (sc < 0) risky.push(entry)
            else safe.push(entry)
        }
        // Orden descendente por score dentro de cada clase
        var cmp = function (a, b) { return b[0] - a[0] }
        safe.sort(cmp); risky.sort(cmp); closing.sort(cmp)
        return { safe, risky, closing }
    }

    /** Mejor movimiento puramente greedy — O(moves), sin búsqueda. */
    greedyBest(board, moves) {
        var cls = this.classifyAndScore(board, moves)
        var pool
        if (cls.safe.length > 0) pool = cls.safe
        else if (cls.risky.length > 0) pool = cls.risky
        else pool = cls.closing

        // Entre los safe/risky con igual score, preferir el que deja
        // menos celdas con 2 lados (no crear futuras trampas)
        return pool[0][1]
    }

    // ── Heurística para minimax ───────────────────────────────

    heuristic(board) {
        var myScore = 0, oppScore = 0, danger = 0
        var n = board.length
        for (var i = 0; i < n; i++) {
            for (var j = 0; j < n; j++) {
                var v = board[i][j]
                if (v === this.myPly) { myScore++; continue }
                if (v === this.oppPly) { oppScore++; continue }
                var cnt = this.sidesCount(board, i, j)
                if (cnt === 3) danger++   // celda peligrosa: quien la toque la regala
            }
        }
        return (myScore - oppScore) * 100 - danger * 5
    }

    // ── Minimax con poda Alfa-Beta ────────────────────────────

    minimax(board, depth, alpha, beta, isMax, deadline) {
        if (Date.now() >= deadline) return { score: this.heuristic(board), move: null }

        var moves = this.b.valid_moves(board)
        if (moves.length === 0 || depth === 0) {
            return { score: this.heuristic(board), move: null }
        }

        // Ordena: safe primero para mejorar la poda
        var cls = this.classifyAndScore(board, moves)
        var ordered = []
        var pool = cls.safe.concat(cls.risky).concat(cls.closing)
        for (var k = 0; k < pool.length; k++) ordered.push(pool[k][1])

        var bestMove = ordered[0]
        var bestScore = isMax ? -Infinity : Infinity
        var ply = isMax ? this.myPly : this.oppPly

        for (var k = 0; k < ordered.length; k++) {
            if (Date.now() >= deadline) break
            var m = ordered[k]
            var b2 = this.b.clone(board)
            this.b.move(b2, m[0], m[1], m[2], ply)
            var res = this.minimax(b2, depth - 1, alpha, beta, !isMax, deadline)
            if (isMax) {
                if (res.score > bestScore) { bestScore = res.score; bestMove = m }
                if (bestScore > alpha) alpha = bestScore
            } else {
                if (res.score < bestScore) { bestScore = res.score; bestMove = m }
                if (bestScore < beta) beta = bestScore
            }
            if (beta <= alpha) break
        }
        return { score: bestScore, move: bestMove }
    }

    // ── Punto de entrada ──────────────────────────────────────

    compute(board, time) {
        var moves = this.b.valid_moves(board)
        if (moves.length === 0) return [0, 0, 0]
        if (moves.length === 1) return moves[0]

        // ── Gestión de tiempo ──────────────────────────────────
        // Estimamos movimientos restantes en el juego: cada movimiento
        // consume un turno; hay moves.length disponibles ahora, pero
        // el juego tiene el doble de turnos total (alternados).
        // Usamos una fracción conservadora del tiempo restante.
        var movesLeft = Math.max(moves.length, 1)
        // Budget por turno: no más de 800ms, y no más de time/movesLeft*2
        var budget = Math.min(800, Math.floor(time / movesLeft * 2))
        budget = Math.max(budget, 50)   // mínimo 50ms siempre
        var deadline = Date.now() + budget

        // ── Greedy inmediato (respuesta de emergencia) ─────────
        var best = this.greedyBest(board, moves)

        // ── Minimax solo si hay pocos movimientos (<= 60) ──────
        // Con más movimientos, el árbol es intratable incluso a prof. 2.
        // Con <= 60 movimientos, podemos explorar prof. 2-4 cómodamente.
        var MINIMAX_THRESHOLD = 60
        if (moves.length <= MINIMAX_THRESHOLD && Date.now() < deadline - 20) {
            for (var depth = 1; depth <= 6; depth++) {
                if (Date.now() >= deadline - 10) break
                var res = this.minimax(board, depth, -Infinity, Infinity, true, deadline)
                if (res.move !== null) best = res.move
            }
        }

        return best
    }
}

/*
 * Environment (Cannot be modified or any of its attributes accesed directly)
 */
class Environment extends MainClient {
    constructor() {
        super()
        this.board = new Board()
    }

    setPlayers(players) { this.players = players }

    // Initializes the game 
    init() {
        var white = Konekti.vc('R').value // Name of competitor with red pieces
        console.log(white)
        var black = Konekti.vc('Y').value // Name of competitor with yellow pieces
        var time = 1000 * parseInt(Konekti.vc('time').value) // Maximum playing time assigned to a competitor (milliseconds)
        var size = parseInt(Konekti.vc('size').value) // Size of the reversi board

        this.size = size
        this.rb = this.board.init(size)
        this.board.print(this.rb)
        var b1 = this.board.clone(this.rb)
        var b2 = this.board.clone(this.rb)

        this.white = white
        this.black = black
        this.ptime = { 'R': time, 'Y': time }
        Konekti.vc('R_time').innerHTML = '' + time
        Konekti.vc('Y_time').innerHTML = '' + time
        this.player = 'R'
        this.winner = ''

        this.players[white].init('R', b1, time)
        this.players[black].init('Y', b2, time)
    }

    // Listen to play button 
    play() {
        var TIME = 10
        var x = this
        var board = x.board
        x.player = 'R'
        Konekti.vc('log').innerHTML = 'The winner is...'

        x.init()
        var start = -1

        function clock() {
            if (x.winner != '') return
            if (start == -1) setTimeout(clock, TIME)
            else {
                var end = Date.now()
                var ellapsed = end - start
                var remaining = x.ptime[x.player] - ellapsed
                Konekti.vc(x.player + '_time').innerHTML = remaining
                Konekti.vc((x.player == 'R' ? 'Y' : 'R') + '_time').innerHTML = x.ptime[x.player == 'R' ? 'Y' : 'R']

                if (remaining <= 0) x.winner = (x.player == 'R' ? x.black : x.white) + ' since ' + (x.player == 'R' ? x.white : x.black) + 'got time out'
                else setTimeout(clock, TIME)
            }
        }

        function compute() {
            var w = x.player == 'R'
            var id = w ? x.white : x.black
            var nid = w ? x.black : x.white
            var b = board.clone(x.rb)
            start = Date.now()
            var action = x.players[id].compute(b, x.ptime[x.player])
            var end = Date.now()
            var ply = (x.player == 'R') ? -1 : -2
            var flag = board.move(x.rb, action[0], action[1], action[2], ply)
            if (!flag) {
                x.winner = nid + ' ...Invalid move taken by ' + id + ' on column ' + action
            } else {
                var winner = board.winner(x.rb)
                if (winner != ' ') x.winner = winner
                else {
                    var ellapsed = end - start
                    x.ptime[x.player] -= ellapsed
                    Konekti.vc(x.player + '_time').innerHTML = '' + x.ptime[x.player]
                    if (x.ptime[x.player] <= 0) {
                        x.winner = nid + ' since ' + id + ' got run of time'
                    } else {
                        x.player = w ? 'Y' : 'R'
                    }
                }
            }

            board.print(x.rb)
            start = -1
            if (x.winner == '') setTimeout(compute, TIME)
            else Konekti.vc('log').innerHTML = 'The winner is ' + x.winner
        }

        board.print(x.rb)
        setTimeout(clock, 1000)
        setTimeout(compute, 1000)
    }
}

// Drawing commands
function custom_commands() {
    return [
        {
            "command": " ", "commands": [
                {
                    "command": "fillStyle",
                    "color": { "red": 255, "green": 255, "blue": 255, "alpha": 255 }
                },
                {
                    "command": "polygon",
                    "x": [0.2, 0.2, 0.8, 0.8],
                    "y": [0.2, 0.8, 0.8, 0.2]
                }

            ]
        },
        {
            "command": "-",
            "commands": [
                {
                    "command": "strokeStyle",
                    "color": { "red": 128, "green": 128, "blue": 128, "alpha": 255 }
                },
                {
                    "command": "polyline",
                    "x": [0, 0, 1, 1, 0],
                    "y": [0, 1, 1, 0, 0]
                }
            ]
        },
        {
            "command": "u",
            "commands": [
                {
                    "command": "strokeStyle",
                    "color": { "red": 0, "green": 0, "blue": 255, "alpha": 255 }
                },
                {
                    "command": "polyline",
                    "x": [0, 1],
                    "y": [0, 0]
                }
            ]
        },
        {
            "command": "d",
            "commands": [
                {
                    "command": "strokeStyle",
                    "color": { "red": 0, "green": 0, "blue": 255, "alpha": 255 }
                },
                {
                    "command": "polyline",
                    "x": [0, 1],
                    "y": [1, 1]
                }
            ]
        },
        {
            "command": "r",
            "commands": [
                {
                    "command": "strokeStyle",
                    "color": { "red": 0, "green": 0, "blue": 255, "alpha": 255 }
                },
                {
                    "command": "polyline",
                    "x": [1, 1],
                    "y": [0, 1]
                }
            ]
        },
        {
            "command": "l",
            "commands": [
                {
                    "command": "strokeStyle",
                    "color": { "red": 0, "green": 0, "blue": 255, "alpha": 255 }
                },
                {
                    "command": "polyline",
                    "x": [0, 0],
                    "y": [0, 1]
                }
            ]
        },
        {
            "command": "R",
            "commands": [
                {
                    "command": "fillStyle",
                    "color": { "red": 255, "green": 0, "blue": 0, "alpha": 255 }
                },
                {
                    "command": "polygon",
                    "x": [0.2, 0.2, 0.8, 0.8],
                    "y": [0.2, 0.8, 0.8, 0.2]
                }
            ]
        },
        {
            "command": "Y",
            "commands": [
                {
                    "command": "fillStyle",
                    "color": { "red": 255, "green": 255, "blue": 0, "alpha": 255 }
                },
                {
                    "command": "polygon",
                    "x": [0.2, 0.2, 0.8, 0.8],
                    "y": [0.2, 0.8, 0.8, 0.2]
                },
            ]
        }
    ]
}