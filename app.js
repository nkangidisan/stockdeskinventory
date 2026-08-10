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
    var start = performance.now();
    function frame(now) {
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
    if (e.key === "Escape" && menu.classList.contains("is-open")) setMenu(false);
  });

  /* ---------- hero: live counters + chart bars ---------- */
  var salesTotal = document.getElementById("salesTotal");
  var itemsSold = document.getElementById("itemsSold");
  var currentTotal = 1284500;
  var currentItems = 47;

  window.addEventListener("load", function () {
    window.setTimeout(function () {
      if (salesTotal && itemsSold) {
        countUp(salesTotal, currentTotal, "UGX ");
        countUp(itemsSold, currentItems);
      }
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

  /* ---------- hero: rotating live sales + sync ticker ---------- */
  var salesList = document.getElementById("recentSales");
  var syncAgeEl = document.getElementById("syncAge");

  if (salesList && syncAgeEl) {
    var secondsSinceSync = 0;

    var pool = [
      { item: "Plain gsm 20y", cat: "textiles", amt: 96000 },
      { item: "Phone battery", cat: "repair", amt: 32000 },
      { item: "Screen protector", cat: "repair", amt: 15000 },
      { item: "Kikoy 4pcs", cat: "textiles", amt: 64000 },
      { item: "Flex cable", cat: "repair", amt: 21000 },
      { item: "Kitenge 6y", cat: "textiles", amt: 78000 }
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

    function insertSale() {
      var sale = pool[poolIndex];
      poolIndex = (poolIndex + 1) % pool.length;

      var li = document.createElement("li");
      var item = document.createElement("span");
      item.className = "mono desk-sale-item";
      item.textContent = sale.item;
      var cat = document.createElement("span");
      cat.className = "desk-sale-cat mono";
      cat.textContent = sale.cat;
      var amt = document.createElement("span");
      amt.className = "desk-sale-amt mono";
      amt.textContent = "UGX " + fmt(sale.amt);
      var time = document.createElement("span");
      time.className = "desk-sale-time mono";
      time.textContent = nowTime();
      li.appendChild(item);
      li.appendChild(cat);
      li.appendChild(amt);
      li.appendChild(time);

      salesList.insertBefore(li, salesList.firstChild);
      if (salesList.children.length > 5) salesList.removeChild(salesList.lastChild);

      currentTotal += sale.amt;
      currentItems += 1;
      salesTotal.textContent = "UGX " + fmt(currentTotal);
      itemsSold.textContent = fmt(currentItems);
      salesTotal.classList.remove("flash-up");
      void salesTotal.offsetWidth;
      salesTotal.classList.add("flash-up");

      secondsSinceSync = 0;
      renderSyncAge();
    }

    if (!prefersReduced) {
      window.setInterval(function () {
        secondsSinceSync += 1;
        renderSyncAge();
      }, 1000);
      window.setInterval(insertSale, 9000);
    } else {
      renderSyncAge();
    }
  }

  /* ---------- scroll reveal ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if (prefersReduced) {
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

  /* ---------- deep-dive stat count-ups ---------- */
  var stats = document.querySelectorAll(".stat-value");
  if (prefersReduced) {
    stats.forEach(function (el) {
      el.textContent = (el.dataset.prefix || "") + fmt(Number(el.dataset.countTo));
    });
  } else {
    var statObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          countUp(el, Number(el.dataset.countTo), el.dataset.prefix || "");
          statObserver.unobserve(el);
        }
      });
    }, { threshold: 0.4 });
    stats.forEach(function (el) { statObserver.observe(el); });
  }

  /* ---------- testimonials slider ---------- */
  var quotes = document.querySelectorAll(".quote");
  var quotesWrap = document.getElementById("quotes");
  var dotsWrap = document.getElementById("quotesDots");

  if (quotes.length && dotsWrap) {
    var current = 0;
    var dots = [];
    var autoTimer = null;

    quotes.forEach(function (q, i) {
      var dot = document.createElement("button");
      dot.type = "button";
      dot.className = "quotes-dot";
      dot.setAttribute("aria-label", "Show testimonial " + (i + 1));
      dot.addEventListener("click", function () {
        goTo(i);
        restart();
      });
      dotsWrap.appendChild(dot);
      dots.push(dot);
    });

    function goTo(i) {
      current = (i + quotes.length) % quotes.length;
      quotes.forEach(function (q, j) {
        var active = j === current;
        q.classList.toggle("is-active", active);
        q.setAttribute("aria-hidden", String(!active));
      });
      dots.forEach(function (d, j) {
        d.classList.toggle("is-active", j === current);
      });
    }

    function start() {
      if (prefersReduced) return;
      if (autoTimer) window.clearInterval(autoTimer);
      autoTimer = window.setInterval(function () {
        goTo(current + 1);
      }, 6500);
    }
    function stop() {
      if (autoTimer) {
        window.clearInterval(autoTimer);
        autoTimer = null;
      }
    }
    function restart() {
      stop();
      start();
    }

    if (quotesWrap) {
      quotesWrap.addEventListener("mouseenter", stop);
      quotesWrap.addEventListener("mouseleave", start);
    }

    dotsWrap.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") {
        goTo(current + 1);
        restart();
      } else if (e.key === "ArrowLeft") {
        goTo(current - 1);
        restart();
      }
    });

    goTo(0);
    start();
  }

  /* ---------- footer year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
