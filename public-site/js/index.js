// =========================
// GALLERY
// =========================

const galleryItems = document.querySelectorAll(".gallery-item");

const galleryLightbox =
  document.getElementById("gallery-lightbox");

const galleryImage =
  document.getElementById("gallery-lightbox-image");

const galleryCaption =
  document.getElementById("gallery-lightbox-caption");

const galleryPrev =
  document.getElementById("gallery-prev");

const galleryNext =
  document.getElementById("gallery-next");

const galleryClose =
  document.getElementById("gallery-close");

let currentGalleryIndex = 0;

const galleryData = [...galleryItems].map(item => ({
  src: item.querySelector("img").src,
  caption: item.dataset.caption
}));

function openGallery(index) {

  currentGalleryIndex = index;

  updateGallery();

  galleryLightbox.classList.remove("hidden");
  galleryLightbox.classList.add("flex");

  document.body.style.overflow = "hidden";
}

function updateGallery() {

  galleryImage.src =
    galleryData[currentGalleryIndex].src;

  galleryCaption.textContent =
    galleryData[currentGalleryIndex].caption;
}

function closeGallery() {

  galleryLightbox.classList.add("hidden");
  galleryLightbox.classList.remove("flex");

  document.body.style.overflow = "";
}

galleryItems.forEach((item, index) => {

  item.addEventListener("click", () => {
    openGallery(index);
  });

});

galleryNext.addEventListener("click", () => {

  currentGalleryIndex++;

  if (currentGalleryIndex >= galleryData.length) {
    currentGalleryIndex = 0;
  }

  updateGallery();
});

galleryPrev.addEventListener("click", () => {

  currentGalleryIndex--;

  if (currentGalleryIndex < 0) {
    currentGalleryIndex =
      galleryData.length - 1;
  }

  updateGallery();
});

galleryClose.addEventListener("click", closeGallery);

document.addEventListener("keydown", (e) => {

  if (galleryLightbox.classList.contains("hidden"))
    return;

  if (e.key === "ArrowRight") {
    galleryNext.click();
  }

  if (e.key === "ArrowLeft") {
    galleryPrev.click();
  }

  if (e.key === "Escape") {
    closeGallery();
  }
});

galleryLightbox.addEventListener("click", (e) => {

  if (e.target === galleryLightbox) {
    closeGallery();
  }

});


// ===============================
// SMOOTH SCROLL + ACTIVE LINK
// ===============================

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();

    const targetId = this.getAttribute("href");
    const targetElement = document.querySelector(targetId);

    // safe scroll (prevents Gallery breaking)
    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: "smooth",
      });
    }

    // active class update (desktop + mobile)
    document.querySelectorAll(".nav-link").forEach((link) => {
      link.classList.remove("active");
    });

    this.classList.add("active");

    // close mobile menu
    const mobileMenu = document.getElementById("mobile-menu");
    if (mobileMenu && !mobileMenu.classList.contains("hidden")) {
      mobileMenu.classList.add("hidden");
    }
  });
});


// ===============================
// MOBILE MENU TOGGLE
// ===============================

const mobileMenuButton = document.getElementById("mobile-menu-button");
const mobileMenu = document.getElementById("mobile-menu");

if (mobileMenuButton && mobileMenu) {
  mobileMenuButton.addEventListener("click", () => {
    mobileMenu.classList.toggle("hidden");
  });
}


// ===============================
// LANGUAGE TOGGLE (EN ↔ BS)
// ===============================

const desktopLangBtn = document.getElementById("language-switcher");
const mobileLangBtn = document.getElementById("language-switcher-mobile");

function updateLanguageButtons() {
  const text = Language.current.toUpperCase();

  if (desktopLangBtn) desktopLangBtn.textContent = text;
  if (mobileLangBtn) mobileLangBtn.textContent = text;
}

function toggleLanguage() {
  const newLang = Language.current === "en" ? "bs" : "en";

  localStorage.setItem("lang", newLang);

  Language.current = newLang;
  Language.apply(newLang);

  updateLanguageButtons();
}

if (desktopLangBtn) {
  desktopLangBtn.addEventListener("click", toggleLanguage);
}

if (mobileLangBtn) {
  mobileLangBtn.addEventListener("click", toggleLanguage);
}

// init button text
updateLanguageButtons();

// ===============================
// MENU FRONTEND
// ===============================

const menuContainer = document.getElementById("menu-items-container");
const categoryBtns = document.querySelectorAll(".menu-category-btn");

let currentMenuItems = [];
let activeCategory = "all";

// ===============================
// FETCH MENU FROM BACKEND
// ===============================
async function fetchMenu() {
  try {
    const res = await fetch("/api/menu");
    const data = await res.json();

    console.log(data);

    if (data.success) {
      currentMenuItems = data.data;
      renderMenuItems();
    }
  } catch (err) {
    console.error("Error fetching menu:", err);

    menuContainer.innerHTML =
      "<p class='text-red-500'>Failed to load menu.</p>";
  }
}

// ===============================
// RENDER MENU ITEMS
// ===============================

function renderMenuItems() {
  menuContainer.innerHTML = "";

  const filtered =
    activeCategory === "all"
      ? currentMenuItems
      : currentMenuItems.filter(
          (item) => item.category === activeCategory
        );

  filtered.forEach((item) => {
    const div = document.createElement("div");

    // CARD (hover ONLY if available)
    div.className = `
      bg-gray-800 rounded-lg p-4 shadow-lg flex flex-col h-full
      transition-all duration-300 ease-out
      ${
        item.isAvailable
          ? "hover:-translate-y-1 hover:shadow-2xl"
          : ""
      }
    `;

    div.innerHTML = `
      <div class="flex flex-col flex-1">

        <!-- PRODUCT CONTENT -->
        <div class="${
          !item.isAvailable ? "opacity-50 grayscale scale-95" : ""
        } flex flex-col flex-1 transition-all duration-300">

          <!-- IMAGE (only hover if available) -->
          <img 
            src="${item.image}" 
            class="w-full h-40 object-cover rounded mb-3 transition-transform duration-300 ${
              item.isAvailable ? "hover:scale-[1.02]" : ""
            }" 
          />

          <!-- NAME -->
          <h3 class="text-xl text-royal-gold font-semibold mb-2 break-words leading-tight ${
            item.isAvailable ? "hover:text-yellow-300" : ""
          }">
            ${item.name}
          </h3>

          <!-- DESCRIPTION -->
          <p class="text-gray-300 text-sm mb-4 break-words">
            ${item.description || ""}
          </p>

          <!-- PRICE -->
          <p class="text-white font-bold text-lg whitespace-nowrap">
            $${item.price}
          </p>

        </div>

        <!-- STATUS (never affected by grayscale or hover) -->
        <div class="flex justify-end mt-auto pt-3">
          <span
            class="text-sm font-semibold whitespace-nowrap"
            style="color:${item.isAvailable ? "green" : "red"};"
          >
            ${item.isAvailable ? "Available" : "Unavailable"}
          </span>
        </div>

      </div>
    `;

    menuContainer.appendChild(div);
  });
}


// ===============================
// INITIAL LOAD
// ===============================
fetchMenu();

categoryBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    activeCategory = btn.dataset.category;

    categoryBtns.forEach((b) => {
      b.classList.remove("bg-royal-gold", "text-black");
    });

    btn.classList.add("bg-royal-gold", "text-black");

    renderMenuItems();
  });
});

// ===============================
// CATEGORY BUTTONS
// ===============================
const openBtn = document.getElementById("open-add-modal-btn");
const closeBtn = document.getElementById("close-add-modal-btn");

document.querySelectorAll('.menu-category-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.menu-category-btn').forEach(b => {
        b.classList.remove('!bg-amber-400', '!text-black', '!border-amber-400');
        b.classList.add('bg-transparent', 'text-amber-400', 'border-amber-400');
      });
      btn.classList.remove('bg-transparent', 'text-amber-400', 'border-amber-400');
      btn.classList.add('!bg-amber-400', '!text-black', '!border-amber-400');
    });
  });
renderMenuItems();

if (openBtn) {
  openBtn.addEventListener("click", () => {
    modal.classList.remove("hidden");
    form.reset();
    editingId = null;
    saveText.textContent = "Save Item";
  });
}

if (closeBtn) {
  closeBtn.addEventListener("click", () => modal.classList.add("hidden"));
}


async function fetchMenu() {
  try {
    const res = await fetch("/api/menu");

    if (!res.ok) {
      throw new Error("Failed to fetch menu");
    }

    const data = await res.json();

    console.log(data);

    currentMenuItems = Array.isArray(data.data)
      ? data.data
      : [];

    renderMenuItems();

  } catch (err) {
    console.error("Menu fetch error:", err);

    menuContainer.innerHTML =
      "<p class='text-red-500'>Failed to load menu items.</p>";
  }
}

categoryBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    activeCategory = btn.dataset.category;
    categoryBtns.forEach(b => b.classList.remove("bg-royal-gold", "text-black"));
    btn.classList.add("bg-royal-gold", "text-black");
    filterItems();
  });
});


      // ===============================
      // Reservation Form Submission
      // ===============================

      const form = document.getElementById("reservation-form");
const submitBtn = document.getElementById("reservation-submit-btn");
const statusBox = document.getElementById("reservation-message-status");
const spinner = document.getElementById("reservation-spinner");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // show UI loading state
    statusBox.classList.remove("hidden");
    spinner.classList.remove("hidden");

    submitBtn.disabled = true;

    // ✅ LANGUAGE: loading state
    Language.setReservationStatus("loading");

    try {
      // simulate request (replace with real backend later)
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // success UI
      spinner.classList.add("hidden");

      // ✅ LANGUAGE: success state
      Language.setReservationStatus("success");

      form.reset();

    } catch (err) {
      console.error(err);

      spinner.classList.add("hidden");

      // ❌ LANGUAGE: error state
      Language.setReservationStatus("error");

    } finally {
      submitBtn.disabled = false;
    }
  });
}







      const reservationForm = document.getElementById("reservation-form");
      const reservationMessageStatus = document.getElementById(
        "reservation-message-status",
      );
      const reservationStatusText = document.getElementById(
        "reservation-status-text",
      );
      const reservationSpinner = document.getElementById("reservation-spinner");
      const reservationSubmitBtn = document.getElementById(
        "reservation-submit-btn",
      );

      if (reservationForm) {
        reservationForm.addEventListener("submit", async function (e) {
          e.preventDefault();

          const formData = new FormData(reservationForm);
          const data = Object.fromEntries(formData.entries());

          // ===============================
          // Show spinner + disable button
          // ===============================
          reservationMessageStatus.classList.remove("hidden");
          reservationSpinner.classList.remove("hidden");
          reservationStatusText.textContent = "Sending reservation...";
          reservationSubmitBtn.disabled = true;
          reservationSubmitBtn.classList.add(
            "opacity-70",
            "cursor-not-allowed",
          );

          try {
            const res = await fetch("http://localhost:5000/api/reservations", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(data),
            });

            const resData = await res.json();

            reservationSpinner.classList.add("hidden");

            if (resData.success) {
              reservationStatusText.textContent =
                resData.message || "Reservation sent successfully!";
              reservationMessageStatus.classList.remove("text-red-500");
              reservationMessageStatus.classList.add("text-green-500");

              reservationForm.reset();

              setTimeout(() => {
                reservationMessageStatus.classList.add("hidden");
              }, 5000);
            } else {
              reservationStatusText.textContent =
                resData.error || "Something went wrong.";
              reservationMessageStatus.classList.remove("text-green-500");
              reservationMessageStatus.classList.add("text-red-500");
            }
          } catch (err) {
            reservationSpinner.classList.add("hidden");
            reservationStatusText.textContent =
              "Cannot send reservation. Please try again later.";
            reservationMessageStatus.classList.remove("text-green-500");
            reservationMessageStatus.classList.add("text-red-500");

            console.error("Reservation error:", err);
          } finally {
            // ===============================
            // Enable button again
            // ===============================
            reservationSubmitBtn.disabled = false;
            reservationSubmitBtn.classList.remove(
              "opacity-70",
              "cursor-not-allowed",
            );
          }
        });
      }

      // ===============================
      // Contact Form JS
      // ===============================

      const contactForm = document.getElementById("contact-form");
      const contactMessageStatus = document.getElementById(
        "contact-message-status",
      );
      const contactStatusText = document.getElementById("contact-status-text");
      const contactSpinner = document.getElementById("contact-spinner");
      const contactSubmitBtn = document.getElementById("contact-submit-btn");

      if (contactForm) {
        contactForm.addEventListener("submit", async function (e) {
          e.preventDefault();

          const formData = new FormData(contactForm);
          const data = Object.fromEntries(formData.entries());

          // ===============================
          // SHOW spinner + disable button
          // ===============================
          contactMessageStatus.classList.remove("hidden");
          contactSpinner.classList.remove("hidden");
          contactStatusText.textContent = "Sending message...";
          contactSubmitBtn.disabled = true;
          contactSubmitBtn.classList.add("opacity-70", "cursor-not-allowed");

          try {
            // ✅ Fixed: explicitly use backend server URL
            const res = await fetch("http://localhost:5000/api/contact", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(data),
            });

            const resData = await res.json();

            contactSpinner.classList.add("hidden");

            if (res.ok && resData.success) {
              contactStatusText.textContent =
                resData.message || "Message sent successfully!";
              contactMessageStatus.classList.remove("text-red-500");
              contactMessageStatus.classList.add("text-green-500");
              contactForm.reset();

              // Hide message after 5 seconds
              setTimeout(() => {
                contactMessageStatus.classList.add("hidden");
              }, 5000);
            } else {
              contactStatusText.textContent =
                resData.error || "Failed to send message. Please try again.";
              contactMessageStatus.classList.remove("text-green-500");
              contactMessageStatus.classList.add("text-red-500");

              // Hide error message after 5 seconds
              setTimeout(() => {
                contactMessageStatus.classList.add("hidden");
              }, 5000);
            }
          } catch (err) {
            contactSpinner.classList.add("hidden");
            contactStatusText.textContent =
              "Cannot send message. Please try again later.";
            contactMessageStatus.classList.remove("text-green-500");
            contactMessageStatus.classList.add("text-red-500");

            // Hide error message after 5 seconds
            setTimeout(() => {
              contactMessageStatus.classList.add("hidden");
            }, 5000);

            console.error("Contact form error:", err);
          } finally {
            // ===============================
            // ENABLE button again
            // ===============================
            contactSubmitBtn.disabled = false;
            contactSubmitBtn.classList.remove(
              "opacity-70",
              "cursor-not-allowed",
            );
          }
        });
      }