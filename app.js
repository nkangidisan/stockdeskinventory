(function () {
  "use strict";

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function fmt(n) {
    return n.toLocaleString("en-US");
  }

  function countUp(el, target, prefix, dur) {
    prefix = prefix || "";
    dur = dur || 1500;
    if (prefersReduced) {
      el.textContent = prefix + fmt(target);
      return;
    }
    // start from the first frame's timestamp: performance.now() can run ahead of
    // rAF time, which made the first frames negative (e.g. "UGX -11,560")
    var start = null;
    function frame(now) {
      if (start === null) start = now;
      var p = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + fmt(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  /* ---------- nav: scrolled state + mobile menu ---------- */
  var nav = document.getElementById("nav");
  var toggle = document.getElementById("navToggle");
  var menu = document.getElementById("navMenu");

  function onScroll() {
    nav.classList.toggle("is-scrolled", window.scrollY > 8);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  function setMenu(open) {
    menu.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Menu");
  }

  toggle.addEventListener("click", function () {
    setMenu(!menu.classList.contains("is-open"));
  });

  menu.addEventListener("click", function (e) {
    if (e.target.tagName === "A") setMenu(false);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && menu.classList.contains("is-open")) {
      setMenu(false);
      toggle.focus();
    }
  });

  window.addEventListener("resize", function () {
    if (window.innerWidth > 820 && menu.classList.contains("is-open")) setMenu(false);
  });

  /* ---------- hero demo desk: counters, chart bars, rotating sales ---------- */
  var salesTotal = document.getElementById("salesTotal");
  var itemsSold = document.getElementById("itemsSold");
  var salesList = document.getElementById("recentSales");
  var syncAgeEl = document.getElementById("syncAge");

  if (salesTotal && itemsSold && salesList && syncAgeEl) {
    var salesPrefix = salesTotal.dataset.prefix || "";
    var currentTotal = Number(salesTotal.dataset.countTo);
    var currentItems = Number(itemsSold.dataset.countTo);
    var secondsSinceSync = 0;

    window.addEventListener("load", function () {
      window.setTimeout(function () {
        countUp(salesTotal, currentTotal, salesPrefix);
        countUp(itemsSold, currentItems);
      }, 450);

      var bars = document.querySelectorAll(".desk-bar-track i");
      if (!prefersReduced) {
        bars.forEach(function (b) { b.style.height = "0"; });
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            bars.forEach(function (b) { b.style.height = ""; });
          });
        });
      }
    });

    var pool = [
      { item: "Rice 5kg", amt: 32000 },
      { item: "Cooking Oil 1L", amt: 12000 },
      { item: "Sugar 2kg", amt: 14000 },
      { item: "Omo Detergent", amt: 9500 },
      { item: "Toilet Tissue 4pk", amt: 8000 },
      { item: "Azam Soda 500ml", amt: 2500 }
    ];
    var poolIndex = 0;

    function nowTime() {
      return new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    }

    function renderSyncAge() {
      if (secondsSinceSync < 60) {
        syncAgeEl.textContent = secondsSinceSync + "s";
      } else {
        var m = Math.floor(secondsSinceSync / 60);
        var s = secondsSinceSync % 60;
        syncAgeEl.textContent = m + "m " + s + "s";
      }
    }

    function cell(cls, text) {
      var span = document.createElement("span");
      span.className = cls;
      span.textContent = text;
      return span;
    }

    function insertSale() {
      var sale = pool[poolIndex];
      poolIndex = (poolIndex + 1) % pool.length;

      var li = document.createElement("li");
      li.appendChild(cell("mono desk-sale-item", sale.item));
      li.appendChild(cell("desk-sale-amt mono", fmt(sale.amt)));
      li.appendChild(cell("desk-sale-time mono", nowTime()));

      salesList.insertBefore(li, salesList.firstChild);
      if (salesList.children.length > 5) salesList.removeChild(salesList.lastChild);

      currentTotal += sale.amt;
      currentItems += 1;
      salesTotal.textContent = salesPrefix + fmt(currentTotal);
      itemsSold.textContent = fmt(currentItems);
      salesTotal.classList.remove("flash-up");
      void salesTotal.offsetWidth;
      salesTotal.classList.add("flash-up");

      secondsSinceSync = 0;
      renderSyncAge();
    }

    if (!prefersReduced) {
      // skip work while the tab is in the background
      window.setInterval(function () {
        if (document.hidden) return;
        secondsSinceSync += 1;
        renderSyncAge();
      }, 1000);
      window.setInterval(function () {
        if (!document.hidden) insertSale();
      }, 9000);
    } else {
      renderSyncAge();
    }
  }

  /* ---------- scroll reveal ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if (prefersReduced || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ---------- CTA click tracking ----------
     Links marked data-track="Signup" / "WhatsApp" (with data-loc) are sent to
     Plausible or GA4 if either is installed on the page; otherwise no-op. */
  document.addEventListener("click", function (e) {
    var el = e.target.closest ? e.target.closest("[data-track]") : null;
    if (!el) return;
    var name = el.getAttribute("data-track");
    var loc = el.getAttribute("data-loc") || "";
    if (typeof window.plausible === "function") {
      window.plausible(name, { props: { location: loc } });
    } else if (typeof window.gtag === "function") {
      window.gtag("event", name, { location: loc });
    }
  });

  /* ---------- footer year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
