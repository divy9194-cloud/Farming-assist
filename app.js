const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
let st = localStorage.getItem("ks_state") || "Bihar";
let se = localStorage.getItem("ks_season") || guessSeason();
let fields = JSON.parse(localStorage.getItem("ks_fields") || "[]");

function guessSeason() {
  const m = new Date().getMonth() + 1;
  return m >= 6 && m <= 10 ? "K" : m >= 4 && m <= 5 ? "Z" : "R";
}
const zone = () => ZONES[STATES[st]];
const fmt = d => d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
const today = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
const num = v => parseFloat(v) || 0;
const save = () => localStorage.setItem("ks_fields", JSON.stringify(fields));

// Crop details adjusted for a state and season
function cropInfo(id) {
  const c = CROPS[id], z = zone();
  return { ...c, id, v: (z.vr && z.vr[id]) || c.v };
}
function mmFor(id) { return CROPS[id].mm * SEASONS[se].f * zone().sf; }
function gapFor(id) { return Math.max(2, Math.round(CROPS[id].i * SEASONS[se].gap * zone().sg)); }

// ---------- Splash and nav ----------
setTimeout(() => $("#splash").classList.add("hide"), 1800);
$$("#nav button").forEach(b => b.onclick = () => go(b.dataset.t));
function go(t) {
  $$(".tab").forEach(s => s.classList.toggle("on", s.id === t));
  $$("#nav button").forEach(b => b.classList.toggle("on", b.dataset.t === t));
  if (t === "farm") renderFarm();
  window.scrollTo(0, 0);
}

// ---------- Home ----------
function initHome() {
  const h = new Date().getHours();
  $("#hello").textContent = "Hello, Good " + (h < 12 ? "Morning" : h < 17 ? "Afternoon" : "Evening");
  $("#date").textContent = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short", year: "numeric" });
  $("#state").innerHTML = Object.keys(STATES).map(s => `<option ${s === st ? "selected" : ""}>${s}</option>`).join("");
  $("#season").innerHTML = Object.entries(SEASONS).map(([k, v]) => `<option value="${k}" ${k === se ? "selected" : ""}>${v.n} (${v.m})</option>`).join("");
  $("#state").onchange = e => { st = e.target.value; localStorage.setItem("ks_state", st); renderHome(); };
  $("#season").onchange = e => { se = e.target.value; localStorage.setItem("ks_season", se); renderHome(); };
  renderHome();
}
function renderHome() {
  const S = SEASONS[se], z = zone();
  $("#climate").innerHTML = `
    <div class="cl-top"><div><b>${st}</b><span>${S.n} season · ${S.m}</span></div><div class="big">${S.icon}</div></div>
    <p>${S.txt}</p>
    <div class="stats"><div><b>${z.soil}</b><span>Soil</span></div><div><b>${Math.round(S.f * 100)}%</b><span>Water need</span></div></div>
    <p class="small">${z.note}</p>`;
  $("#crops").innerHTML = z.s[se].map((id, i) => {
    const c = cropInfo(id);
    return `<button class="crop" data-id="${id}"><span class="rank">#${i + 1}</span><span class="em">${c.e}</span><b>${c.n}</b><small>${c.v}</small><small>${c.y}/acre · ${c.d} days</small></button>`;
  }).join("");
  $$(".crop").forEach(b => b.onclick = () => openCrop(b.dataset.id));
  fillCrops();
}

// ---------- Crop detail sheet ----------
function openCrop(id) {
  const c = cropInfo(id), sh = $("#sheet");
  sh.hidden = false;
  sh.innerHTML = `<div class="panel">
    <button class="x" id="close">✕</button>
    <div class="em xl">${c.e}</div><h2>${c.n}</h2>
    <p class="muted">${st} · ${SEASONS[se].n}</p>
    <div class="facts">
      <div><b>${c.v}</b><span>Best seed variety</span></div>
      <div><b>${c.y}</b><span>Yield per acre</span></div>
      <div><b>${c.d} days</b><span>To maturity</span></div>
      <div><b>Every ${gapFor(id)} days</b><span>Irrigation gap</span></div>
    </div>
    <h4>Local tips</h4><p>${c.t}</p><p>${zone().note}</p>
    <button class="btn" id="toWater">Calculate water for this crop</button>
  </div>`;
  $("#close").onclick = () => sh.hidden = true;
  sh.onclick = e => { if (e.target === sh) sh.hidden = true; };
  $("#toWater").onclick = () => { sh.hidden = true; $("#wcrop").value = id; calc(); go("water"); };
}

// ---------- Water calculator ----------
function fillCrops() {
  const keep = $("#wcrop").value;
  const ranked = zone().s[se];
  const rest = Object.keys(CROPS).filter(k => !ranked.includes(k));
  $("#wcrop").innerHTML =
    `<optgroup label="Recommended">${ranked.map(k => `<option value="${k}">${CROPS[k].n}</option>`).join("")}</optgroup>` +
    `<optgroup label="Other crops">${rest.map(k => `<option value="${k}">${CROPS[k].n}</option>`).join("")}</optgroup>`;
  if (keep && CROPS[keep]) $("#wcrop").value = keep;
  calc();
}
function areaM2() {
  const u = $("#unit").value;
  if (u === "m") return num($("#len").value) * num($("#wid").value);
  if (u === "ft") return num($("#len").value) * num($("#wid").value) * 0.092903;
  return num($("#area").value) * UNIT_M2[u];
}
function calc() {
  const a = areaM2(), id = $("#wcrop").value;
  if (!a || !id) { $("#result").textContent = "Enter your field size to see the water needed."; return; }
  const mm = mmFor(id), L = a * mm; // 1 mm over 1 m² = 1 litre
  $("#result").innerHTML = `
    <span class="muted">Water per irrigation</span>
    <div class="num">${Math.round(L).toLocaleString("en-IN")} <small>litres</small></div>
    <div class="num2">${(L / 1000).toFixed(1)} m³</div>
    <p class="small">Field: ${Math.round(a).toLocaleString("en-IN")} m² (${(a / 4046.86).toFixed(2)} acre) · Depth: ${mm.toFixed(0)} mm<br>
    Adjusted for ${zone().soil.toLowerCase()} soil and ${SEASONS[se].n} season in ${st}. Irrigate about every ${gapFor(id)} days.</p>`;
}
$("#unit").onchange = () => {
  const two = ["m", "ft"].includes($("#unit").value);
  $("#dims").hidden = !two; $("#areaBox").hidden = two; calc();
};
["#wcrop", "#len", "#wid", "#area"].forEach(s => $(s).oninput = calc);
$("#fdate").value = new Date().toISOString().slice(0, 10);

$("#save").onclick = () => {
  const a = areaM2(), name = $("#fname").value.trim();
  if (!a) return alert("Enter your field size first.");
  if (!name) return alert("Give your field a name.");
  fields.push({ id: Date.now(), name, crop: $("#wcrop").value, state: st, season: se, area: a, last: $("#fdate").value });
  save(); $("#fname").value = ""; go("farm");
};

// ---------- Scheduler and My Farm ----------
function nextDate(f) {
  const old = { st, se }; st = f.state; se = f.season;
  const gap = gapFor(f.crop), mm = mmFor(f.crop);
  st = old.st; se = old.se;
  const d = new Date(f.last + "T00:00"); d.setDate(d.getDate() + gap);
  return { d, gap, L: f.area * mm };
}
function renderFarm() {
  if (!fields.length) { $("#fields").innerHTML = `<div class="card empty">No fields yet. Use the Water tab to enter a field size and save it here.</div>`; return; }
  $("#fields").innerHTML = fields.map(f => {
    const n = nextDate(f), c = CROPS[f.crop], diff = Math.round((n.d - today()) / 864e5);
    const msg = diff > 0 ? `Next irrigation due in ${diff} day${diff > 1 ? "s" : ""} — ${fmt(n.d)}`
      : diff === 0 ? `Irrigation due today — ${fmt(n.d)}` : `Overdue by ${-diff} day${diff < -1 ? "s" : ""} — was ${fmt(n.d)}`;
    return `<div class="card field ${diff <= 0 ? "due" : ""}">
      <div class="row"><div><b>${c.e} ${f.name}</b><span class="muted">${c.n} · ${f.state}</span></div><button class="del" data-id="${f.id}" aria-label="Delete field">🗑️</button></div>
      <div class="when">${msg}</div>
      <p class="small">Water needed: ${Math.round(n.L).toLocaleString("en-IN")} litres · Last watered ${fmt(new Date(f.last + "T00:00"))} · Gap ${n.gap} days</p>
      <button class="btn" data-w="${f.id}">Mark as watered today</button>
    </div>`;
  }).join("");
  $$("[data-w]").forEach(b => b.onclick = () => {
    const f = fields.find(x => x.id == b.dataset.w); f.last = new Date().toISOString().slice(0, 10); save(); renderFarm();
  });
  $$(".del").forEach(b => b.onclick = () => {
    if (confirm("Delete this field?")) { fields = fields.filter(x => x.id != b.dataset.id); save(); renderFarm(); }
  });
}

initHome();
