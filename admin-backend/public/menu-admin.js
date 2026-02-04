const adminMenuContainer = document.getElementById("menu-items-container");

if (!adminMenuContainer) {
  console.error("menu-admin.js: container not found");
}

// ===============================
// FETCH MENU ITEMS
// ===============================
async function fetchMenuItems() {
  try {
    const res = await fetch("/api/menu");
    const json = await res.json();

    // Normalize response
    return Array.isArray(json.data) ? json.data : [];
  } catch (err) {
    console.error("Failed to fetch menu items:", err);
    return [];
  }
}

// ===============================
// RENDER MENU ITEMS
// ===============================
function renderMenuItems(items) {
  adminMenuContainer.innerHTML = "";

  items.forEach((item) => {
    const div = document.createElement("div");
    div.className =
      "bg-gray-800 rounded-lg p-4 shadow-lg relative transition-transform duration-500 ease-in-out";

    div.innerHTML = `
      <div class="transition-all duration-500 ${
        !item.isAvailable ? "opacity-50 scale-95 grayscale" : ""
      }">
        <img src="${item.image}" class="w-full h-40 object-cover rounded mb-2" />
        <h3 class="text-xl text-royal-gold font-semibold mb-1">${item.name}</h3>
        <p class="text-gray-300 text-sm mb-2">${item.description}</p>
        <p class="text-white font-bold mb-3">$${item.price}</p>
      </div>

      <div class="flex justify-between items-center mt-2">
        <button class="edit-btn text-blue-400 text-xl" data-id="${item._id}">✏️</button>
        <button class="toggle-btn text-2xl ${
          item.isAvailable ? "text-green-500" : "text-red-500"
        }" data-id="${item._id}">
          ${item.isAvailable ? "🟢" : "🔴"}
        </button>
        <button class="delete-btn text-red-500 text-xl" data-id="${item._id}">🗑️</button>
      </div>
    `;

    adminMenuContainer.appendChild(div);
  });

  attachAdminActions(items);
}

// ===============================
// ADMIN ACTIONS
// ===============================
function attachAdminActions(items) {
  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.onclick = async () => {
      const id = btn.dataset.id;
      await fetch(`/api/menu/${id}`, { method: "DELETE" });
      loadAdminMenu();
    };
  });

  document.querySelectorAll(".toggle-btn").forEach((btn) => {
    btn.onclick = async () => {
      const id = btn.dataset.id;
      const item = items.find((i) => i._id === id);
      if (!item) return;

      await fetch(`/api/menu/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable: !item.isAvailable }),
      });

      loadAdminMenu();
    };
  });

  document.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.onclick = () => {
      const id = btn.dataset.id;
      console.log("Edit item:", id);
      // modal logic intentionally untouched
    };
  });
}

// ===============================
// INIT
// ===============================
async function loadAdminMenu() {
  const items = await fetchMenuItems();
  renderMenuItems(items);
}

loadAdminMenu();
