var canvas = document.createElement("canvas")
var context = canvas.getContext("2d")
document.getElementsByClassName("canvas")[0].appendChild(canvas)

var dpr = window.devicePixelRatio || 1 // falling back to 1
canvas.style.width = window.innerWidth + "px"
canvas.style.height = window.innerHeight + "px"
canvas.setAttribute("width", Math.floor(window.innerWidth * dpr))
canvas.setAttribute("height", Math.floor(window.innerHeight * dpr))

context.scale(dpr, dpr)
context.lineWidth = 1
context.lineJoin = context.lineCap = "round"


var up = 0, down = 1,
    state = { "x": -1, "y": -1, "pen": up, "line": [] }

var lines = []


function push(point) {
    state.x = point.x
    state.y = point.y
    state.line.push({ "x": point.x, "y": point.y })
}


function start(event) {
    state.pen = down
    push(event)
}

function draw_line(point1, point2) {
    if (point1.x != point2.x || point1.y != point2.y) {
        context.beginPath();
        context.moveTo(point1.x, point1.y);
        context.lineTo(point2.x, point2.y);
        context.stroke();
    }
}

function move(event) {
    if (state.pen == down) {
        draw_line(state, event)
        push(event)
    }
}

function end(event) {
    if (state.pen == down) {
        if (event.x != 0 || event.y != 0) {
            draw_line(state, event)
            push(event)
        }
        state.pen = up
        lines.push({ "lineWidth": 1, "color": "black", "points": simplify(state.line, 1.3, true) })
        state.line = []
        redraw()
        save()
    }
}

function redraw() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.beginPath();

    for (let i = 0; i < lines.length; i++) {
        const l = lines[i].points;

        context.moveTo(l[0].x, l[0].y);
        for (let j = 1; j < l.length; j++) {
            const point = l[j];
            context.lineTo(point.x, point.y);
        }
    }
    context.stroke();
}


function save() {
    window.localStorage[canvas.width + "x" + canvas.height] = JSON.stringify(lines)
}

function restore() {
    let saved = window.localStorage[canvas.width + "x" + canvas.height]
    if (saved) {
        lines = JSON.parse(saved)
    }
    redraw()
}


restore()

canvas.addEventListener("pointerdown", start)

canvas.addEventListener("pointermove", move)

canvas.addEventListener("pointerup", end)
canvas.addEventListener("pointerenter", end)
canvas.addEventListener("pointercancel", end)
canvas.addEventListener("pointerout", end)
canvas.addEventListener("pointerleave", end)