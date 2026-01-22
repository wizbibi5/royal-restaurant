const adminMenuContainer = document.getElementById("menu-items-container");

// Sample fetch function to get items from backend
async function fetchMenuItems() {
  const res = await fetch("/menu"); // Make sure your backend route returns menu items
  const data = await res.json();
  return data;
}

// Render Menu Items for Admin
function renderMenuItems(items) {
  adminMenuContainer.innerHTML = "";

  items.forEach((item) => {
    const div = document.createElement("div");
    div.className =
      "bg-gray-800 rounded-lg p-4 shadow-lg relative transition-transform duration-500 ease-in-out";

    div.innerHTML = `
      <!-- Filtered Content (shrink + gray effect) -->
      <div class="transition-all duration-500 ${!item.isAvailable ? "opacity-50 scale-95" : ""}"
           style="${!item.isAvailable ? "filter: grayscale(70%) sepia(20%) hue-rotate(80deg);" : ""}">
        <img src="${item.image}" class="w-full h-40 object-cover rounded mb-2 transition-all duration-500" />
        <h3 class="text-xl text-royal-gold font-semibold mb-1">${item.name}</h3>
        <p class="text-gray-300 text-sm mb-2">${item.description}</p>
        <p class="text-white font-bold mb-3">$${item.price}</p>
      </div>

      <!-- Admin Buttons (not affected by gray effect) -->
      <div class="flex justify-between items-center transition-transform duration-300 ${!item.isAvailable ? "scale-95" : "scale-100"}">
        <button class="edit-btn text-blue-400 text-xl hover:scale-110 transition" data-id="${item._id}">✏️</button>
        <button class="toggle-btn text-2xl ${item.isAvailable ? "text-green-500" : "text-red-500"} hover:scale-110 transition" data-id="${item._id}">
          ${item.isAvailable ? "🟢" : "🔴"}
        </button>
        <button class="delete-btn text-red-500 text-xl hover:scale-110 transition" data-id="${item._id}">🗑️</button>
      </div>
    `;

    adminMenuContainer.appendChild(div);
  });

  attachAdminActions(items);
}

// Actions for Admin Buttons
function attachAdminActions(items) {
  const editButtons = document.querySelectorAll(".edit-btn");
  const deleteButtons = document.querySelectorAll(".delete-btn");
  const toggleButtons = document.querySelectorAll(".toggle-btn");

  // EDIT
  editButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = e.target.dataset.id;
      // logic to open modal with item data
      console.log("Edit item:", id);
    });
  });

  // DELETE
  deleteButtons.forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const id = e.target.dataset.id;
      await fetch(`/menu/${id}`, { method: "DELETE" });
      loadAdminMenu();
    });
  });

  // TOGGLE AVAILABILITY
  toggleButtons.forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const id = e.target.dataset.id;
      const item = items.find((i) => i._id === id);
      const updatedAvailability = !item.isAvailable;

      await fetch(`/menu/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable: updatedAvailability }),
      });

      loadAdminMenu(); // reload after change
    });
  });
}

// Load menu initially
async function loadAdminMenu() {
  const items = await fetchMenuItems();
  renderMenuItems(items);
}

loadAdminMenu();
