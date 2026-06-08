
const API = "";
let token = localStorage.getItem("token");
let username = localStorage.getItem("username");

function showPage(id) {
  ["loginPage", "registerPage", "menuPage", "gamePage", "scoresPage"].forEach(page => {
    document.getElementById(page).classList.add("hidden");
  });
  document.getElementById(id).classList.remove("hidden");
}

function init() {
  if (token) {
    document.getElementById("userDisplay").textContent = username;
    showPage("menuPage");
  } else {
    showPage("loginPage");
  }
}

async function register() {
  const username = document.getElementById("regUsername").value.trim();
  const password = document.getElementById("regPassword").value;
  const msg = document.getElementById("regMsg");

  const res = await fetch(API + "/api/register", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ username, password })
  });
  const data = await res.json();
  msg.textContent = data.message;

  if (res.ok) {
    setTimeout(() => showPage("loginPage"), 800);
  }
}

async function login() {
  const usernameValue = document.getElementById("loginUsername").value.trim();
  const password = document.getElementById("loginPassword").value;
  const msg = document.getElementById("loginMsg");

  const res = await fetch(API + "/api/login", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ username: usernameValue, password })
  });
  const data = await res.json();
  msg.textContent = data.message;

  if (res.ok) {
    token = data.token;
    username = data.username;
    localStorage.setItem("token", token);
    localStorage.setItem("username", username);
    document.getElementById("userDisplay").textContent = username;
    showPage("menuPage");
  }
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("username");
  token = null;
  username = null;
  showPage("loginPage");
}

async function saveScore(timeMs) {
  await fetch(API + "/api/scores", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify({ timeMs })
  });
}

async function loadScores() {
  const res = await fetch(API + "/api/scores/top3", {
    headers: { "Authorization": "Bearer " + token }
  });
  const scores = await res.json();
  const list = document.getElementById("scoreList");
  list.innerHTML = "";

  if (scores.length === 0) {
    list.innerHTML = "<li>Noch keine Zeiten gespeichert</li>";
  } else {
    scores.forEach(score => {
      const li = document.createElement("li");
      li.textContent = (score.timeMs / 1000).toFixed(2) + " Sekunden";
      list.appendChild(li);
    });
  }
  showPage("scoresPage");
}

init();
