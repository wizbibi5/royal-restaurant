// ===============================
// SCROLL REVEAL ANIMATION ENGINE
// ===============================

document.addEventListener("DOMContentLoaded", () => {
  const revealElements = document.querySelectorAll(
    ".reveal, .reveal-left, .reveal-right, .reveal-scale"
  );

  const observerOptions = {
    root: null, // viewport
    threshold: 0.15, // trigger when 15% visible
    rootMargin: "0px 0px -50px 0px" // triggers a bit earlier
  };

  const revealOnScroll = (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active");

        // Optional: stop observing once animated (better performance)
        observer.unobserve(entry.target);
      }
    });
  };

  const observer = new IntersectionObserver(revealOnScroll, observerOptions);

  revealElements.forEach((el) => {
    observer.observe(el);
  });
});


// ===============================
// OPTIONAL: HERO ANIMATION TRIGGER
// (if you use .hero-load elements)
// ===============================

window.addEventListener("load", () => {
  const heroElements = document.querySelectorAll(".hero-load");

  heroElements.forEach((el, index) => {
    setTimeout(() => {
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    }, index * 200);
  });
});