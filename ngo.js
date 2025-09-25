const API_BASE = "";

document.getElementById("ngoForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target));
  const res = await fetch("/api/ngos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (res.ok) {
    showToast("NGO registered successfully");
    e.target.reset();
    loadNGOs();
  }
});

document.getElementById("helpForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target));
  data.lat = parseFloat(data.lat);
  data.lng = parseFloat(data.lng);
  const res = await fetch("/api/help-requests", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (res.ok) {
    showToast("Help request submitted");
    e.target.reset();
    loadHelpRequests();
  }
});

document.getElementById("supplyForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target));
  data.quantity = parseInt(data.quantity);
  const res = await fetch("/api/supplies", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (res.ok) {
    showToast("Supply added");
    e.target.reset();
    loadSupplies();
  }
});

async function loadNGOs() {
  const res = await fetch("/api/ngos");
  const ngos = await res.json();
  document.getElementById("ngoList").innerHTML = ngos.length ? ngos
    .map((n) => `
      <div class="list-card">
        <div class="title">${n.name}</div>
        <div class="small text-muted">${n.state}</div>
        <div class="small">${n.contact_person || ""} ${n.phone ? " · "+n.phone : ""}</div>
      </div>`)
    .join("") : `<div class="empty-state">No NGOs registered yet.</div>`;
}

async function loadHelpRequests() {
  const res = await fetch("/api/help-requests");
  const reqs = await res.json();
  document.getElementById("helpList").innerHTML = reqs.length ? reqs
    .map((r) => `
      <div class="list-card">
        <div class="d-flex justify-content-between align-items-center">
          <div class="title">${r.need}</div>
          <span class="badge-priority ${badgeClass(r.priority)}">${r.priority}</span>
        </div>
        <div class="small text-muted">${r.location}</div>
      </div>`)
    .join("") : `<div class="empty-state">No open help requests.</div>`;
  updateMap(reqs);
}

async function loadSupplies() {
  const res = await fetch("/api/supplies");
  const sups = await res.json();
  document.getElementById("supplyList").innerHTML = sups.length ? sups
    .map((s) => `
      <div class="list-card">
        <div class="d-flex justify-content-between align-items-center">
          <div class="title">${s.item}</div>
          <div class="small ${s.status === 'available' ? 'status-available' : 'status-pending'}">${s.status}</div>
        </div>
        <div class="small text-muted">Quantity: ${s.quantity}</div>
      </div>`)
    .join("") : `<div class="empty-state">No supplies added yet.</div>`;
}

const map = L.map("map").setView([20, 80], 5);
// Light theme tile layer
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors",
  maxZoom: 19
}).addTo(map);
let markers = [];
let ngoMarkers = [];

function updateMap(reqs) {
  markers.forEach((m) => map.removeLayer(m));
  markers = reqs.map((r) => {
    const color = r.priority === 'urgent' ? '#ef4444' : (r.priority === 'low' ? '#22c55e' : '#3b82f6');
    const icon = L.divIcon({
      className: 'custom-marker',
      html: `<div style="background:${color};width:12px;height:12px;border-radius:50%;box-shadow:0 0 0 4px rgba(255,255,255,.15)"></div>`,
      iconSize: [12, 12]
    });
    return L.marker([r.lat, r.lng], { icon }).addTo(map).bindPopup(`${r.need} (${r.priority})`);
  });
}

async function plotNGOsOnMap() {
  ngoMarkers.forEach((m) => map.removeLayer(m));
  const res = await fetch('/api/ngos');
  const ngos = await res.json();
  ngoMarkers = ngos
    .filter(n => n.latitude && n.longitude)
    .map(n => {
      const icon = L.divIcon({
        className: 'ngo-marker',
        html: `<div style="background:#10b981;width:10px;height:10px;border-radius:50%;border:2px solid #064e3b"></div>`,
        iconSize: [14, 14]
      });
      const marker = L.marker([n.latitude, n.longitude], { icon }).addTo(map);
      marker.bindPopup(`<strong>${n.name}</strong><br><span class="small text-muted">${n.state || ''}</span>`);
      return marker;
    });
}

const socket = io();
socket.on("ngos:updated", loadNGOs);
socket.on("help:updated", loadHelpRequests);
socket.on("supplies:updated", loadSupplies);
socket.on("ngos:updated", plotNGOsOnMap);

loadNGOs();
loadHelpRequests();
loadSupplies();
plotNGOsOnMap();

function badgeClass(priority) {
  if (!priority) return "badge-normal";
  const p = String(priority).toLowerCase();
  if (p === "urgent") return "badge-urgent";
  if (p === "low") return "badge-low";
  return "badge-normal";
}

function showToast(message) {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const el = document.createElement('div');
  el.className = 'toast-item';
  el.textContent = message;
  container.appendChild(el);
  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transition = 'opacity .4s ease';
    setTimeout(() => el.remove(), 400);
  }, 2200);
}


