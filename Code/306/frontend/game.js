
//Hindernisse und Kollisionssystem

// Hindernisse definieren
const spikes = [
  {x: 500, y: 280, w: 40, h: 30},
  {x: 700, y: 320, w: 40, h: 30}
];

// Kollisionsystem entwickeln
function rectsOverlap(a, b) {
  return a.x < b.x + b.w &&    // Linke Kante von A ist weiter links als rechte Kante von B
         a.x + a.w > b.x &&    // Rechte Kante von A ist weiter rechts als linke Kante von B
         a.y < b.y + b.h &&    // Obere Kante von A ist höher als untere Kante von B
         a.y + a.h > b.y;      // Untere Kante von A ist tiefer als obere Kante von B
}

// Game Over Funktion
function gameOver(text) {
  gameRunning = false;                                    // Stoppt die Spiel-Logik
  clearInterval(timerInterval);                           // Stoppt den Zeit-Zähler
  document.getElementById("gameMsg").textContent = text;  // Zeigt den Game-Over Text
  
  setTimeout(() => showPage("menuPage"), 1500);
}


// erkennung im Spiel-Loop der Spieler mit den Hindernissen kollidiert

function updateHazards() {
  // Stacheln prüfen
  spikes.forEach(s => {
    if (rectsOverlap(player, s)) {
      gameOver("Game Over: Stacheln berührt!"); // Löst Game Over aus
    }
  });

  // Löcher prüfen
  if (player.y > canvas.height) {
    gameOver("Game Over: Du bist in ein Loch gefallen!"); // Löst Game Over aus
  }
}



// Hindernisse zeichnen
function drawHazards() {
  ctx.fillStyle = "#d33"; 
  
  spikes.forEach(s => {
    ctx.beginPath();
    ctx.moveTo(s.x, s.y + s.h);       // Gehe zur unteren linken Ecke
    ctx.lineTo(s.x + s.w / 2, s.y);   // Ziehe Linie zur oberen Mitte 
    ctx.lineTo(s.x + s.w, s.y + s.h); // Ziehe Linie zur unteren rechten Ecke
    ctx.closePath();                  // Verbinde zurück zur unteren linken Ecke
    ctx.fill();                       // Fülle das Dreieck mit Farbe
  });
}

const player = {
  x: 40,
  y: 300,
  w: 34,
  h: 34,
  vx: 0,
  vy: 0,
  speed: 4,
  jump: -13,
  grounded: false
};

function update() {

  player.vx = 0;

  if (keys["ArrowLeft"]) {
    player.vx = -player.speed;
  }

  if (keys["ArrowRight"]) {
    player.vx = player.speed;
  }

  if (keys["ArrowUp"] && player.grounded) {
    player.vy = player.jump;
    player.grounded = false;
  }

  // Gravitation
  player.vy += 0.65;

  player.x += player.vx;
  player.y += player.vy;

}
