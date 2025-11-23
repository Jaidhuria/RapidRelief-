
    // Supply data
    const supplies = [
      {
        name: "Water",
        description: "Bottled water (3L per person per day)",
        quantity: 1,
        packed: false
      },
      {
        name: "Food",
        description: "Non-perishable food (3 days supply)",
        quantity: 1,
        packed: false
      },
      {
        name: "First Aid Kit",
        description: "Basic medical supplies and medications",
        quantity: 1,
        packed: false
      },
      {
        name: "Flashlight",
        description: "With extra batteries",
        quantity: 1,
        packed: false
      },
      {
        name: "Portable Charger",
        description: "Power bank for mobile devices",
        quantity: 1,
        packed: false
      },
      {
        name: "Radio",
        description: "Battery-powered or hand-crank radio",
        quantity: 1,
        packed: false
      },
      {
        name: "Maps",
        description: "Local area maps (paper copies)",
        quantity: 1,
        packed: false
      },
      {
        name: "Whistle",
        description: "Signaling device for help",
        quantity: 1,
        packed: false
      },
      {
        name: "Clothing",
        description: "Warm clothing and blankets",
        quantity: 1,
        packed: false
      },
      {
        name: "Documents",
        description: "Important documents (copies)",
        quantity: 1,
        packed: false
      }
    ];

    // DOM Elements
    const locationElement = document.getElementById("locationText");
    const hiddenLocation = document.getElementById("hiddenLocation");
    const refreshBtn = document.getElementById("refreshLocation");
    const manualBtn = document.getElementById("manualLocation");
    const alertBox = document.getElementById("alertBox");
    const supplyList = document.getElementById("supplyList");
    const supplyProgress = document.getElementById("supplyProgress");
    const progressBar = document.getElementById("supplyProgressBar");
    const supplyForm = document.getElementById("supplyForm");
    const supplyData = document.getElementById("supplyData");
    const submitBtn = document.getElementById("submitBtn");
    
    // State variables
    let userLocation = null;
    
    // Initialize the app
    function initApp() {
      renderSupplyList();
      fetchLocation();
      attachEventListeners();
    }
    
    // Render supply list
    function renderSupplyList() {
      supplyList.innerHTML = '';
      
      supplies.forEach((supply, index) => {
        const supplyItem = document.createElement('div');
        supplyItem.className = 'supply-item';
        supplyItem.innerHTML = `
          <div class="supply-header">
            <div class="supply-name">${supply.name}</div>
          </div>
          <div class="supply-description">${supply.description}</div>
          <div class="supply-controls">
            <label class="checkbox-container">
              <input type="checkbox" id="supply-${index}" ${supply.packed ? 'checked' : ''}>
              <span>Packed</span>
            </label>
            <div class="quantity-controls">
              <button type="button" class="quantity-btn" data-action="decrease" data-index="${index}">-</button>
              <input type="number" class="quantity-input" value="${supply.quantity}" min="1" data-index="${index}">
              <button type="button" class="quantity-btn" data-action="increase" data-index="${index}">+</button>
            </div>
          </div>
        `;
        
        supplyList.appendChild(supplyItem);
      });
      
      updateProgress();
    }
    
    // Get Location
    function fetchLocation() {
      showAlert("Getting your location...", "info");
      
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          locationSuccess,
          locationError,
          { timeout: 10000, enableHighAccuracy: true }
        );
      } else {
        showAlert("Geolocation is not supported by your browser.", "error");
        locationElement.innerText = "Geolocation not supported";
      }
    }
    
    function locationSuccess(position) {
      const lat = position.coords.latitude.toFixed(4);
      const lon = position.coords.longitude.toFixed(4);
      userLocation = { lat, lon };
      
      locationElement.innerHTML = `<strong>Latitude:</strong> ${lat}, <strong>Longitude:</strong> ${lon}`;
      hiddenLocation.value = `Lat: ${lat}, Lon: ${lon}`;
      
      showAlert("Location detected successfully!", "success");
    }
    
    function locationError(error) {
      let message = "Unable to retrieve your location.";
      
      switch(error.code) {
        case error.PERMISSION_DENIED:
          message = "Location access denied. Please enable location services.";
          break;
        case error.POSITION_UNAVAILABLE:
          message = "Location information is unavailable.";
          break;
        case error.TIMEOUT:
          message = "Location request timed out.";
          break;
      }
      
      locationElement.innerText = message;
      showAlert(message, "error");
    }
    
    function enterManualLocation() {
      const manualLocation = prompt("Please enter your location manually (e.g., City, Address, Coordinates):");
      if (manualLocation) {
        userLocation = manualLocation;
        locationElement.innerHTML = `<strong>Manual Entry:</strong> ${manualLocation}`;
        hiddenLocation.value = manualLocation;
        showAlert("Manual location saved.", "success");
      }
    }
    
    // Alert system
    function showAlert(message, type) {
      alertBox.textContent = message;
      alertBox.className = "alert";
      
      switch(type) {
        case "success":
          alertBox.classList.add("alert-success");
          break;
        case "error":
          alertBox.classList.add("alert-error");
          break;
        case "info":
          alertBox.classList.add("alert-info");
          break;
      }
      
      alertBox.classList.remove("hidden");
      
      // Auto hide after 5 seconds
      setTimeout(() => {
        alertBox.classList.add("hidden");
      }, 5000);
    }
    
    // Update progress
    function updateProgress() {
      const total = supplies.length;
      const completed = supplies.filter(supply => supply.packed).length;
      const percentage = (completed / total) * 100;
      
      supplyProgress.textContent = `${completed}/${total} items`;
      progressBar.style.width = `${percentage}%`;
    }
    
    // Handle quantity changes
    function handleQuantityChange(e) {
      if (!e.target.classList.contains('quantity-btn')) return;
      
      const action = e.target.getAttribute("data-action");
      const index = parseInt(e.target.getAttribute("data-index"));
      const input = document.querySelector(`.quantity-input[data-index="${index}"]`);
      
      let value = parseInt(input.value);
      
      if (action === "increase") {
        value++;
      } else if (action === "decrease" && value > 1) {
        value--;
      }
      
      input.value = value;
      supplies[index].quantity = value;
    }
    
    // Handle checkbox changes
    function handleCheckboxChange(e) {
      if (e.target.type !== 'checkbox') return;
      
      const idParts = e.target.id.split('-');
      if (idParts[0] !== 'supply') return;
      
      const index = parseInt(idParts[1]);
      supplies[index].packed = e.target.checked;
      updateProgress();
    }
    
    // Prepare form data
    function prepareFormData() {
      const supplyList = [];
      
      supplies.forEach(supply => {
        if (supply.packed) {
          supplyList.push(`${supply.name} (Quantity: ${supply.quantity})`);
        }
      });
      
      supplyData.value = supplyList.join(", ");
      return true;
    }
    
    // Form submission handler
    function handleFormSubmit(e) {
      e.preventDefault();
      
      if (!userLocation) {
        showAlert("Please set your location before submitting.", "error");
        return false;
      }
      
      const completed = supplies.filter(supply => supply.packed).length;
      if (completed === 0) {
        showAlert("Please select at least one supply item.", "error");
        return false;
      }
      
      // Prepare the data
      if (prepareFormData()) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
        
        // Create a temporary form for Formspree submission
        const formData = new FormData(supplyForm);
        
        // Send to Formspree
        fetch(supplyForm.action, {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json'
          }
        })
        .then(response => {
          if (response.ok) {
            showAlert("Checklist submitted successfully! Stay safe.", "success");
            supplyForm.reset();
            // Reset checkboxes but keep quantities
            supplies.forEach(supply => supply.packed = false);
            renderSupplyList();
            updateProgress();
          } else {
            throw new Error('Form submission failed');
          }
        })
        .catch(error => {
          showAlert("There was an error submitting your form. Please try again.", "error");
          console.error('Error:', error);
        })
        .finally(() => {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<i class="fas fa-check-circle"></i> Submit Checklist';
        });
      }
    }
    
    // Attach event listeners
    function attachEventListeners() {
      refreshBtn.addEventListener("click", fetchLocation);
      manualBtn.addEventListener("click", enterManualLocation);
      supplyList.addEventListener("click", handleQuantityChange);
      supplyList.addEventListener("change", handleCheckboxChange);
      supplyForm.addEventListener("submit", handleFormSubmit);
    }
    
    // Initialize the app
    document.addEventListener("DOMContentLoaded", initApp);
