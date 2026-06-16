const Language = {
  current: localStorage.getItem("lang") || "bs",
  _lastDict: null,

  init() {
    this.apply(this.current);

    const switcher = document.getElementById("language-switcher");
    if (switcher) {
      switcher.value = this.current;

      switcher.addEventListener("change", (e) => {
        this.set(e.target.value);
      });
    }
  },

  set(lang) {
    this.current = lang;
    localStorage.setItem("lang", lang);
    this.apply(lang);
  },

  async apply(lang) {
    try {
      const res = await fetch(`lang/${lang}.json`);
      this._lastDict = await res.json();
      const dict = this._lastDict;

      // TEXT TRANSLATION
      document.querySelectorAll("[data-i18n]").forEach((el) => {
        const keys = el.getAttribute("data-i18n").split(".");
        let value = dict;

        keys.forEach((k) => {
          value = value?.[k];
        });

        if (value) {
          el.textContent = value;
        } else {
          el.textContent = el.getAttribute("data-i18n-fallback") || "";
        }
      });

      // PLACEHOLDER TRANSLATION
      document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
        const keys = el.getAttribute("data-i18n-placeholder").split(".");
        let value = dict;

        keys.forEach((k) => {
          value = value?.[k];
        });

        if (value) {
          el.placeholder = value;
        }
      });

      // keep switcher in sync
      const switcher = document.getElementById("language-switcher");
      if (switcher) switcher.value = lang;
    } catch (err) {
      console.error("Language load error:", err);
    }
  },

  // ✅ RESERVATION STATUS (loading / success / error)
  setReservationStatus(type) {
    const el = document.getElementById("reservation-status-text");
    if (!el || !this._lastDict) return;

    const value = this._lastDict?.reservation?.[type];

    if (value) {
      el.textContent = value;
    }
  }
};

document.addEventListener("DOMContentLoaded", () => Language.init());