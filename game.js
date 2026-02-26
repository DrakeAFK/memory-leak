const buttonColors = ["red", "blue", "green", "yellow"];
const keyMap = { 'h': 'green', 'j': 'red', 'k': 'yellow', 'l': 'blue' };

let gamePattern = [];
let userClickedPattern = [];
let started = false;
let level = 0;
let startTime = 0;
let lastClickTime = 0;

function log(msg, type = "SESSION") {
    console.log(`%c[${new Date().toLocaleTimeString()}] [${type}] %c${msg}`, "color: #555", "color: #f8f8f8");
}

$('.start').on('click', function () {
    if (!started) {
        initSession();
    }
});

$(document).on('keydown', function (e) {
    if (e.key === 'Enter' && !started) {
        initSession();
        return;
    }
    const key = e.key.toLowerCase();
    if (keyMap[key]) {
        handleUserInput(keyMap[key]);
    }
});

function initSession() {
    started = true;
    level = 0;
    gamePattern = [];
    startTime = performance.now();
    $(".start").fadeOut(200);
    $("#sub-title").text("SESSION_ACTIVE");
    $("#game-status").text("RUNNING");
    log("Memory sequence initialized. Monitoring throughput.");
    nextSequence();
}

$(".btn").mousedown(function () {
    handleUserInput($(this).attr("id"));
});

function handleUserInput(color) {
    if (!started) return;

    const now = performance.now();
    if (lastClickTime > 0) {
        const delta = Math.round(now - lastClickTime);
        $("#latency").text(delta);
    }
    lastClickTime = now;

    userClickedPattern.push(color);
    animatePress(color);
    playSound(color);
    checkAnswer(userClickedPattern.length - 1);
}

function checkAnswer(currentLevel) {
    if (gamePattern[currentLevel] === userClickedPattern[currentLevel]) {
        if (userClickedPattern.length === gamePattern.length) {
            setTimeout(nextSequence, 800);
        }
    } else {
        terminateSession();
    }
}

function nextSequence() {
    userClickedPattern = [];
    level++;
    $("#hud-level").text(level);

    const elapsed = (performance.now() - startTime) / 1000;
    const bps = elapsed > 0 ? (level / elapsed).toFixed(2) : 0.00;
    $("#bps").text(bps);

    const randomColor = buttonColors[Math.floor(Math.random() * 4)];
    gamePattern.push(randomColor);

    setTimeout(() => {
        $("#" + randomColor).addClass("pressed");
        playSound(randomColor);
        setTimeout(() => $("#" + randomColor).removeClass("pressed"), 150);
    }, 100);
}

function animatePress(color) {
    $("#" + color).addClass("pressed");
    setTimeout(() => $("#" + color).removeClass("pressed"), 100);
}

function playSound(name) {
    // Keeping existing sound logic
    const audio = new Audio("sounds/" + name + ".mp3");
    audio.play().catch(() => { }); // Prevent errors if interaction hasn't happened
}

function terminateSession() {
    log("Memory segment fault. Terminating session.", "FATAL");
    $("#game-status").text("FAULT");
    $("#sub-title").text("SEGMENT_FAULT_0x00FF").css("color", "var(--red)");
    $("body").addClass("game-over");
    playSound("wrong");

    setTimeout(() => {
        $("body").removeClass("game-over");
        started = false;
        $(".start").text("RE_INITIALIZE_SESSION").fadeIn(400);
    }, 1000);
}