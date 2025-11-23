
    // Enhanced API integration with mock data for demonstration
    const API_BASE = "";
    
    // Mock data for demonstration (in a real app, this would come from the API)
    let mockNGOs = [
      { id: 1, name: "Relief Aid International", state: "Maharashtra", contact_person: "Rajesh Kumar", phone: "+91 9876543210", email: "contact@reliefaid.org", registration_number: "MH/12345/2020", latitude: 19.0760, longitude: 72.8777 },
      { id: 2, name: "Hope Foundation", state: "Karnataka", contact_person: "Priya Sharma", phone: "+91 8765432109", email: "info@hopefoundation.org", registration_number: "KA/54321/2019", latitude: 12.9716, longitude: 77.5946 }
    ];
    
    let mockHelpRequests = [
      { id: 1, location: "Mumbai Suburbs", lat: 19.0760, lng: 72.8777, need: "Food and Water", priority: "urgent" },
      { id: 2, location: "Bangalore Rural", lat: 12.9716, lng: 77.5946, need: "Medical Supplies", priority: "normal" },
      { id: 3, location: "Chennai Coastal Area", lat: 13.0827, lng: 80.2707, need: "Emergency Shelter", priority: "low" }
    ];
    
    let mockSupplies = [
      { id: 1, item: "Food Packets", quantity: 500, status: "available" },
      { id: 2, item: "Water Bottles", quantity: 1000, status: "available" },
      { id: 3, item: "Medical Kits", quantity: 200, status: "pending" }
    ];

    // Initialize the application
    document.addEventListener('DOMContentLoaded', function() {
      // Initialize all components
      initializeForms();
      initializeMap();
      loadAllData();
      setupEventListeners();
      
      // Update last updated time
      updateLastUpdated();
      
      // Set up auto-refresh every 30 seconds
      setInterval(loadAllData, 30000);
    });

    // Initialize form submissions
    function initializeForms() {
      document.getElementById("ngoForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(e.target));
        
        // In a real app, this would be an API call
        const newNGO = {
          id: mockNGOs.length + 1,
          ...data,
          latitude: data.latitude ? parseFloat(data.latitude) : null,
          longitude: data.longitude ? parseFloat(data.longitude) : null
        };
        mockNGOs.push(newNGO);
        
        showToast("NGO registered successfully", "success");
        e.target.reset();
        loadNGOs();
        plotNGOsOnMap();
        updateStats();
      });

      document.getElementById("helpForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(e.target));
        data.lat = parseFloat(data.lat);
        data.lng = parseFloat(data.lng);
        
        // In a real app, this would be an API call
        const newRequest = {
          id: mockHelpRequests.length + 1,
          ...data
        };
        mockHelpRequests.push(newRequest);
        
        showToast("Help request submitted successfully", "success");
        e.target.reset();
        loadHelpRequests();
        updateStats();
      });

      document.getElementById("supplyForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(e.target));
        data.quantity = parseInt(data.quantity);
        
        // In a real app, this would be an API call
        const newSupply = {
          id: mockSupplies.length + 1,
          ...data
        };
        mockSupplies.push(newSupply);
        
        showToast("Supply added successfully", "success");
        e.target.reset();
        loadSupplies();
        updateStats();
      });
    }

    // Initialize the map
    function initializeMap() {
      // Create map centered on India
      const map = L.map("map").setView([20, 78], 5);
      
      // Add tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19
      }).addTo(map);
      
      // Store map and markers in global scope for access by other functions
      window.appMap = map;
      window.requestMarkers = [];
      window.ngoMarkers = [];
      
      // Plot initial data
      plotHelpRequestsOnMap();
      plotNGOsOnMap();
    }

    // Load all data
    function loadAllData() {
      loadNGOs();
      loadHelpRequests();
      loadSupplies();
      updateStats();
      updateLastUpdated();
    }

    // Load NGOs
    function loadNGOs() {
      // In a real app, this would fetch from API
      const ngos = mockNGOs;
      
      document.getElementById("ngoList").innerHTML = ngos.length ? ngos
        .map((n, index) => `
          <div class="list-card stagger-item" style="animation-delay: ${index * 0.1}s">
            <div class="title">${n.name}</div>
            <div class="small text-muted">${n.state} • ${n.registration_number || 'Unregistered'}</div>
            <div class="small">${n.contact_person || 'No contact'} ${n.phone ? ' • ' + n.phone : ''}</div>
            <div class="meta">
              <span class="small text-muted">${n.email || ''}</span>
              ${n.latitude && n.longitude ? '<span class="badge bg-secondary small">Mapped</span>' : ''}
            </div>
          </div>`)
        .join("") : `
          <div class="empty-state">
            <i class="fas fa-building"></i>
            <h4>No NGOs Registered</h4>
            <p>Register your first NGO to get started</p>
          </div>`;
      
      document.getElementById("ngoCount").textContent = `${ngos.length} NGOs`;
    }

    // Load help requests
    function loadHelpRequests() {
      // In a real app, this would fetch from API
      const reqs = mockHelpRequests;
      
      document.getElementById("helpList").innerHTML = reqs.length ? reqs
        .map((r, index) => `
          <div class="list-card stagger-item" style="animation-delay: ${index * 0.1}s">
            <div class="d-flex justify-content-between align-items-center">
              <div class="title">${r.need}</div>
              <span class="badge-priority ${badgeClass(r.priority)}">${r.priority}</span>
            </div>
            <div class="small text-muted">${r.location}</div>
            <div class="meta">
              <span class="small text-muted">Lat: ${r.lat.toFixed(4)}, Lng: ${r.lng.toFixed(4)}</span>
              <button class="btn btn-sm btn-outline-secondary" onclick="focusOnMap(${r.lat}, ${r.lng})">
                <i class="fas fa-map-marker-alt"></i>
              </button>
            </div>
          </div>`)
        .join("") : `
          <div class="empty-state">
            <i class="fas fa-hands-helping"></i>
            <h4>No Help Requests</h4>
            <p>All requests have been addressed</p>
          </div>`;
      
      document.getElementById("requestCount").textContent = `${reqs.length} Requests`;
      
      // Update map if we're on the map tab
      if (document.getElementById('requests-tab').classList.contains('active')) {
        plotHelpRequestsOnMap();
      }
    }

    // Load supplies
    function loadSupplies() {
      // In a real app, this would fetch from API
      const sups = mockSupplies;
      
      document.getElementById("supplyList").innerHTML = sups.length ? sups
        .map((s, index) => `
          <div class="list-card stagger-item" style="animation-delay: ${index * 0.1}s">
            <div class="d-flex justify-content-between align-items-center">
              <div class="title">${s.item}</div>
              <div class="small ${s.status === 'available' ? 'status-available' : 'status-pending'}">${s.status}</div>
            </div>
            <div class="small text-muted">Quantity: ${s.quantity}</div>
            <div class="meta">
              <span class="small text-muted">Last updated: Just now</span>
              <button class="btn btn-sm btn-outline-secondary">
                <i class="fas fa-edit"></i>
              </button>
            </div>
          </div>`)
        .join("") : `
          <div class="empty-state">
            <i class="fas fa-box-open"></i>
            <h4>No Supplies Added</h4>
            <p>Add supplies to track inventory</p>
          </div>`;
      
      document.getElementById("supplyCount").textContent = `${sups.length} Items`;
    }

    // Plot NGOs on map
    function plotNGOsOnMap() {
      if (!window.appMap) return;
      
      // Clear existing NGO markers
      window.ngoMarkers.forEach((m) => window.appMap.removeLayer(m));
      window.ngoMarkers = [];
      
      // In a real app, this would fetch from API
      const ngos = mockNGOs.filter(n => n.latitude && n.longitude);
      
      // Add NGO markers to map
      window.ngoMarkers = ngos.map(n => {
        const icon = L.divIcon({
          className: 'ngo-marker',
          html: `<div style="background:#10b981;width:12px;height:12px;border-radius:50%;border:2px solid white;box-shadow:0 0 0 2px #10b981"></div>`,
          iconSize: [16, 16]
        });
        
        const marker = L.marker([n.latitude, n.longitude], { icon }).addTo(window.appMap);
        marker.bindPopup(`
          <div style="min-width: 200px">
            <strong>${n.name}</strong><br>
            <span class="small text-muted">${n.state || ''}</span><br>
            <hr style="margin: 8px 0">
            <div class="small">
              <strong>Contact:</strong> ${n.contact_person || 'N/A'}<br>
              <strong>Phone:</strong> ${n.phone || 'N/A'}<br>
              <strong>Email:</strong> ${n.email || 'N/A'}
            </div>
          </div>
        `);
        return marker;
      });
    }

    // Plot help requests on map
    function plotHelpRequestsOnMap() {
      if (!window.appMap) return;
      
      // Clear existing request markers
      window.requestMarkers.forEach((m) => window.appMap.removeLayer(m));
      window.requestMarkers = [];
      
      // In a real app, this would fetch from API
      const reqs = mockHelpRequests;
      
      // Add request markers to map
      window.requestMarkers = reqs.map(r => {
        const color = r.priority === 'urgent' ? '#f85149' : (r.priority === 'low' ? '#3fb950' : '#58a6ff');
        const icon = L.divIcon({
          className: 'custom-marker',
          html: `<div style="background:${color};width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 0 0 2px ${color}"></div>`,
          iconSize: [18, 18]
        });
        
        const marker = L.marker([r.lat, r.lng], { icon }).addTo(window.appMap);
        marker.bindPopup(`
          <div style="min-width: 200px">
            <strong>${r.need}</strong><br>
            <span class="badge-priority ${badgeClass(r.priority)}">${r.priority}</span><br>
            <hr style="margin: 8px 0">
            <div class="small">
              <strong>Location:</strong> ${r.location}<br>
              <strong>Coordinates:</strong> ${r.lat.toFixed(4)}, ${r.lng.toFixed(4)}
            </div>
          </div>
        `);
        return marker;
      });
    }

    // Update statistics
    function updateStats() {
      // In a real app, these would come from API
      document.getElementById("totalNGOs").textContent = mockNGOs.length;
      document.getElementById("totalRequests").textContent = mockHelpRequests.length;
      document.getElementById("urgentRequests").textContent = mockHelpRequests.filter(r => r.priority === 'urgent').length;
      document.getElementById("totalSupplies").textContent = mockSupplies.reduce((sum, s) => sum + s.quantity, 0);
    }

    // Update last updated time
    function updateLastUpdated() {
      const now = new Date();
      document.getElementById("lastUpdated").textContent = now.toLocaleTimeString();
    }

    // Setup event listeners
    function setupEventListeners() {
      // Refresh button
      document.getElementById("refreshBtn").addEventListener("click", function() {
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';
        loadAllData();
        setTimeout(() => {
          this.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh';
          showToast("Data refreshed successfully", "success");
        }, 1000);
      });
      
      // Export button
      document.getElementById("exportBtn").addEventListener("click", function() {
        showToast("Exporting data...", "warning");
        // In a real app, this would trigger a download
        setTimeout(() => {
          showToast("Data exported successfully", "success");
        }, 1500);
      });
      
      // Map toggle buttons
      document.getElementById("toggleNGOs").addEventListener("click", function() {
        const isActive = this.classList.contains("btn-primary");
        if (isActive) {
          this.classList.remove("btn-primary");
          this.classList.add("btn-outline-secondary");
          window.ngoMarkers.forEach(m => window.appMap.removeLayer(m));
        } else {
          this.classList.add("btn-primary");
          this.classList.remove("btn-outline-secondary");
          plotNGOsOnMap();
        }
      });
      
      document.getElementById("toggleRequests").addEventListener("click", function() {
        const isActive = this.classList.contains("btn-primary");
        if (isActive) {
          this.classList.remove("btn-primary");
          this.classList.add("btn-outline-secondary");
          window.requestMarkers.forEach(m => window.appMap.removeLayer(m));
        } else {
          this.classList.add("btn-primary");
          this.classList.remove("btn-outline-secondary");
          plotHelpRequestsOnMap();
        }
      });
      
      // Tab change events
      const tabEl = document.querySelector('button[data-bs-target="#map-section"]');
      tabEl.addEventListener('shown.bs.tab', function() {
        // Trigger a resize event to ensure map renders correctly
        setTimeout(() => {
          if (window.appMap) window.appMap.invalidateSize();
        }, 300);
      });

      // Geolocation controls
      const useBtn = document.getElementById('useMyLocation');
      const trackCb = document.getElementById('trackLocation');
      if (useBtn) useBtn.addEventListener('click', getCurrentLocationForNGO);
      if (trackCb) trackCb.addEventListener('change', function() {
        if (this.checked) startLocationTracking(); else stopLocationTracking();
      });

      // Search and filter functionality
      setupSearchAndFilter();
      
      // Map controls
      document.getElementById('zoomIn').addEventListener('click', () => {
        if (window.appMap) window.appMap.zoomIn();
      });
      
      document.getElementById('zoomOut').addEventListener('click', () => {
        if (window.appMap) window.appMap.zoomOut();
      });
      
      document.getElementById('resetView').addEventListener('click', () => {
        if (window.appMap) window.appMap.setView([20, 78], 5);
      });
    }

    // Setup search and filter functionality
    function setupSearchAndFilter() {
      // NGO search and filter
      const ngoSearch = document.getElementById('ngoSearch');
      const ngoFilterItems = document.querySelectorAll('#ngos .dropdown-item');
      
      ngoSearch.addEventListener('input', filterNGOs);
      ngoFilterItems.forEach(item => {
        item.addEventListener('click', function(e) {
          e.preventDefault();
          const filter = this.getAttribute('data-filter');
          filterNGOsByType(filter);
        });
      });
      
      // Request search and filter
      const requestSearch = document.getElementById('requestSearch');
      const requestFilterItems = document.querySelectorAll('#requests .dropdown-item');
      
      requestSearch.addEventListener('input', filterRequests);
      requestFilterItems.forEach(item => {
        item.addEventListener('click', function(e) {
          e.preventDefault();
          const filter = this.getAttribute('data-filter');
          filterRequestsByPriority(filter);
        });
      });
      
      // Supply search and filter
      const supplySearch = document.getElementById('supplySearch');
      const supplyFilterItems = document.querySelectorAll('#supplies .dropdown-item');
      
      supplySearch.addEventListener('input', filterSupplies);
      supplyFilterItems.forEach(item => {
        item.addEventListener('click', function(e) {
          e.preventDefault();
          const filter = this.getAttribute('data-filter');
          filterSuppliesByStatus(filter);
        });
      });
    }

    // Filter NGOs
    function filterNGOs() {
      const searchTerm = this.value.toLowerCase();
      const ngoCards = document.querySelectorAll('#ngoList .list-card');
      
      ngoCards.forEach(card => {
        const title = card.querySelector('.title').textContent.toLowerCase();
        const state = card.querySelector('.text-muted').textContent.toLowerCase();
        
        if (title.includes(searchTerm) || state.includes(searchTerm)) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    }
    
    function filterNGOsByType(filter) {
      const ngoCards = document.querySelectorAll('#ngoList .list-card');
      
      ngoCards.forEach(card => {
        const hasLocation = card.querySelector('.badge.bg-secondary');
        
        if (filter === 'all') {
          card.style.display = 'block';
        } else if (filter === 'mapped') {
          card.style.display = hasLocation ? 'block' : 'none';
        } else if (filter === 'unmapped') {
          card.style.display = hasLocation ? 'none' : 'block';
        }
      });
    }

    // Filter requests
    function filterRequests() {
      const searchTerm = this.value.toLowerCase();
      const requestCards = document.querySelectorAll('#helpList .list-card');
      
      requestCards.forEach(card => {
        const title = card.querySelector('.title').textContent.toLowerCase();
        const location = card.querySelector('.text-muted').textContent.toLowerCase();
        
        if (title.includes(searchTerm) || location.includes(searchTerm)) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    }
    
    function filterRequestsByPriority(filter) {
      const requestCards = document.querySelectorAll('#helpList .list-card');
      
      requestCards.forEach(card => {
        const priority = card.querySelector('.badge-priority').textContent.toLowerCase();
        
        if (filter === 'all') {
          card.style.display = 'block';
        } else {
          card.style.display = priority === filter ? 'block' : 'none';
        }
      });
    }

    // Filter supplies
    function filterSupplies() {
      const searchTerm = this.value.toLowerCase();
      const supplyCards = document.querySelectorAll('#supplyList .list-card');
      
      supplyCards.forEach(card => {
        const title = card.querySelector('.title').textContent.toLowerCase();
        
        if (title.includes(searchTerm)) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    }
    
    function filterSuppliesByStatus(filter) {
      const supplyCards = document.querySelectorAll('#supplyList .list-card');
      
      supplyCards.forEach(card => {
        const status = card.querySelector('.small').textContent.toLowerCase();
        
        if (filter === 'all') {
          card.style.display = 'block';
        } else {
          card.style.display = status === filter ? 'block' : 'none';
        }
      });
    }

    // Utility function to focus on map coordinates
    function focusOnMap(lat, lng) {
      if (window.appMap) {
        window.appMap.setView([lat, lng], 12);
        // Switch to map tab
        const mapTab = new bootstrap.Tab(document.getElementById('map-tab'));
        mapTab.show();
      }
    }

    // Geolocation helpers
    let userWatchId = null;
    let userMarker = null;
    let userAccuracyCircle = null;
    let lastKnownPosition = null;

    function getCurrentLocationForNGO() {
      const statusEl = document.getElementById('locationStatusNGO');
      if (!navigator.geolocation) {
        statusEl.textContent = 'Geolocation not supported';
        return;
      }
      statusEl.textContent = 'Detecting location...';
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude, accuracy } = pos.coords;
          lastKnownPosition = { latitude, longitude, accuracy };
          document.getElementById('ngoLat').value = latitude.toFixed(6);
          document.getElementById('ngoLng').value = longitude.toFixed(6);
          statusEl.textContent = `Lat ${latitude.toFixed(4)}, Lng ${longitude.toFixed(4)} (±${Math.round(accuracy)}m)`;
          // Plot on map and center
          showUserLocationOnMap(latitude, longitude, accuracy);
          focusOnMap(latitude, longitude);
        },
        (err) => {
          statusEl.textContent = 'Location error: ' + err.message;
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }

    function startLocationTracking() {
      const statusEl = document.getElementById('locationStatusNGO');
      if (!navigator.geolocation) {
        statusEl.textContent = 'Geolocation not supported';
        return;
      }
      statusEl.textContent = 'Tracking location...';
      userWatchId = navigator.geolocation.watchPosition((pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        lastKnownPosition = { latitude, longitude, accuracy };
        showUserLocationOnMap(latitude, longitude, accuracy);
      }, (err) => {
        statusEl.textContent = 'Tracking error: ' + err.message;
      }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 });
    }

    function stopLocationTracking() {
      const statusEl = document.getElementById('locationStatusNGO');
      if (userWatchId != null) {
        navigator.geolocation.clearWatch(userWatchId);
        userWatchId = null;
      }
      statusEl.textContent = 'Location tracking stopped';
    }

    function showUserLocationOnMap(lat, lng, accuracy) {
      if (!window.appMap) return;
      if (userMarker) window.appMap.removeLayer(userMarker);
      if (userAccuracyCircle) window.appMap.removeLayer(userAccuracyCircle);
      const icon = L.divIcon({
        className: 'user-marker',
        html: '<div style="background:#2563eb;width:12px;height:12px;border-radius:50%;border:2px solid white;box-shadow:0 0 0 2px #2563eb"></div>',
        iconSize: [16, 16]
      });
      userMarker = L.marker([lat, lng], { icon }).addTo(window.appMap).bindPopup('Your location');
      if (accuracy) {
        userAccuracyCircle = L.circle([lat, lng], {
          radius: accuracy,
          color: '#2563eb',
          fillColor: '#2563eb',
          fillOpacity: 0.08,
          weight: 1
        }).addTo(window.appMap);
      }
    }

    // Priority badge class helper
    function badgeClass(priority) {
      if (!priority) return "badge-normal";
      const p = String(priority).toLowerCase();
      if (p === "urgent") return "badge-urgent";
      if (p === "low") return "badge-low";
      return "badge-normal";
    }

    // Enhanced toast notification
    function showToast(message, type = "success") {
      const container = document.getElementById('toastContainer');
      if (!container) return;
      
      const el = document.createElement('div');
      el.className = `toast-item ${type}`;
      el.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : 'exclamation-circle'}"></i>
        <div>${message}</div>
      `;
      
      container.appendChild(el);
      
      setTimeout(() => {
        el.style.opacity = '0';
        el.style.transition = 'opacity .4s ease';
        setTimeout(() => el.remove(), 400);
      }, 3000);
    }

    // Socket.io integration for real-time updates
    const socket = io();
    socket.on("ngos:updated", loadNGOs);
    socket.on("help:updated", loadHelpRequests);
    socket.on("supplies:updated", loadSupplies);
    socket.on("ngos:updated", plotNGOsOnMap);
  