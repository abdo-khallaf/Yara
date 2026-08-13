/* ==========================================================
   OUR ENGAGEMENT INVITATION — CONFIGURATION
   Edit the values below to personalize your invitation.
   ========================================================== */
const invitation = {
    name1: "Ahmed",                                  // Your name
    name2: "Yara",                                  // Her name
    date: "2026--39",                               // Engagement date — format: YYYY-MM-DD
    time: "18:00",                                    // Engagement time — 24h format, e.g. "18:00"
    venue: "The Ivy Garden, Rosewood Hotel",           // Venue name
    locationUrl: "https://maps.google.com/",           // Google Maps link for "View Location" button
    photo: "assets/couple.jpg",                        // Path to your couple photo
    music: "assets/music.mp3"                          // Path to your background music
};

/* ==========================================================
   Everything below wires the config into the page.
   You shouldn't need to edit anything past this line.
   ========================================================== */
(function () {
  "use strict";

  /* ---------- helpers ---------- */
  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- apply config to DOM ---------- */
  function applyConfig() {
    $$("#nameOne").forEach(el => (el.textContent = invitation.name1));
    $$("#nameTwo").forEach(el => (el.textContent = invitation.name2));

    const finalNames = $("#finalNames");
    if (finalNames) finalNames.innerHTML = `${invitation.name1} &amp; ${invitation.name2}`;

    const dateObj = parseInvitationDateTime();
    const formattedDate = dateObj
      ? dateObj.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
      : invitation.date;
    const formattedTime = dateObj
      ? dateObj.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
      : invitation.time;

    const heroDate = $("#heroDate");
    if (heroDate) heroDate.textContent = formattedDate;

    const detailDate = $("#detailDate");
    if (detailDate) detailDate.textContent = formattedDate;

    const detailTime = $("#detailTime");
    if (detailTime) detailTime.textContent = formattedTime;

    const detailVenue = $("#detailVenue");
    if (detailVenue) detailVenue.textContent = invitation.venue;

    const locationBtn = $("#locationBtn");
    if (locationBtn && invitation.locationUrl) locationBtn.setAttribute("href", invitation.locationUrl);

    // photo — swapped in for every <img> tagged with the couple photo id
    ["couplePhotoHero", "couplePhotoSection"].forEach(id => {
      const img = document.getElementById(id);
      if (img && invitation.photo) img.setAttribute("src", invitation.photo);
    });
    const finalBg = $(".final-bg-photo");
    if (finalBg && invitation.photo) finalBg.setAttribute("src", invitation.photo);

    // music source
    const audio = $("#bgMusic");
    if (audio && invitation.music) {
      const source = audio.querySelector("source");
      if (source) source.setAttribute("src", invitation.music);
      audio.load();
    }

    document.title = `${invitation.name1} & ${invitation.name2} — We're Engaged`;
  }

  function parseInvitationDateTime() {
    if (!invitation.date) return null;
    const time = invitation.time && /^\d{2}:\d{2}$/.test(invitation.time) ? invitation.time : "00:00";
    const iso = `${invitation.date}T${time}:00`;
    const d = new Date(iso);
    return isNaN(d.getTime()) ? null : d;
  }

  /* ---------- opening screen (wax-seal envelope) ---------- */
  function initOpeningScreen() {
    const sealScreen = $("#sealScreen");
    const openBtn = $("#openInvitation");
    const invitationEl = $("#invitation");
    const musicBtn = $("#musicBtn");

    if (!sealScreen || !openBtn || !invitationEl) return;

    document.body.classList.add("locked");

    openBtn.addEventListener("click", () => {
      openBtn.disabled = true;
      sealScreen.classList.add("is-opening");

      const revealMain = () => {
        sealScreen.classList.add("is-hidden");
        invitationEl.classList.add("is-visible");
        invitationEl.removeAttribute("aria-hidden");
        document.body.classList.remove("locked");
        window.scrollTo(0, 0);
        triggerReveal();
        attemptAutoplayMusic();
      };

      window.setTimeout(revealMain, prefersReducedMotion ? 50 : 950);
    });
  }

  function attemptAutoplayMusic() {
    const audio = $("#bgMusic");
    const musicBtn = $("#musicBtn");
    if (!audio || !musicBtn) return;
    audio.volume = 0.55;
    const playPromise = audio.play();
    if (playPromise && typeof playPromise.then === "function") {
      playPromise
        .then(() => musicBtn.classList.add("is-playing"))
        .catch(() => {
          // Autoplay blocked by the browser — that's expected.
          // The visitor can start music with the button instead.
          musicBtn.classList.remove("is-playing");
        });
    }
    musicBtn.setAttribute("aria-pressed", String(!audio.paused));
  }

  /* ---------- music control ---------- */
  function initMusicButton() {
    const musicBtn = $("#musicBtn");
    const audio = $("#bgMusic");
    if (!musicBtn || !audio) return;

    musicBtn.addEventListener("click", () => {
      if (audio.paused) {
        audio.play().catch(() => {
          /* file may not be ready yet — ignore */
        });
      } else {
        audio.pause();
      }
    });

    audio.addEventListener("play", () => {
      musicBtn.classList.add("is-playing");
      musicBtn.setAttribute("aria-pressed", "true");
      musicBtn.setAttribute("aria-label", "Pause background music");
    });
    audio.addEventListener("pause", () => {
      musicBtn.classList.remove("is-playing");
      musicBtn.setAttribute("aria-pressed", "false");
      musicBtn.setAttribute("aria-label", "Play background music");
    });
  }

  /* ---------- live countdown ---------- */
  function initCountdown() {
    const target = parseInvitationDateTime();
    const daysEl = $("#cdDays"), hoursEl = $("#cdHours"), minsEl = $("#cdMinutes"), secsEl = $("#cdSeconds");
    const gridEl = $("#countdownGrid");
    const todayEl = $("#countdownToday");
    if (!target || !daysEl) return;

    const pad = n => String(n).padStart(2, "0");

    function tick() {
      const now = new Date();
      const diff = target.getTime() - now.getTime();

      if (diff <= 0) {
        daysEl.textContent = "00";
        hoursEl.textContent = "00";
        minsEl.textContent = "00";
        secsEl.textContent = "00";
        if (gridEl) gridEl.hidden = true;
        if (todayEl) todayEl.hidden = false;
        clearInterval(timer);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      daysEl.textContent = pad(days);
      hoursEl.textContent = pad(hours);
      minsEl.textContent = pad(minutes);
      secsEl.textContent = pad(seconds);
    }

    tick();
    const timer = setInterval(tick, 1000);
  }

  /* ---------- scroll reveal ---------- */
  function initScrollReveal() {
    const items = $$("[data-reveal]");
    if (!items.length) return;

    if (!("IntersectionObserver" in window)) {
      items.forEach(el => el.classList.add("in-view"));
      return;
    }

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            window.setTimeout(() => el.classList.add("in-view"), i * 60);
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );

    items.forEach(el => observer.observe(el));
  }

  // triggers reveal for hero items immediately after the seal opens
  function triggerReveal() {
    const hero = $("#hero");
    if (!hero) return;
    $$("[data-reveal]", hero).forEach((el, i) => {
      window.setTimeout(() => el.classList.add("in-view"), 150 + i * 110);
    });
  }

  /* ---------- scroll progress rail ---------- */
  function initProgressRail() {
    const fill = $("#progressFill");
    if (!fill) return;
    const update = () => {
      const doc = document.documentElement;
      const scrollTop = doc.scrollTop || document.body.scrollTop;
      const scrollHeight = (doc.scrollHeight || document.body.scrollHeight) - doc.clientHeight;
      const pct = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
      fill.style.width = pct + "%";
    };
    window.addEventListener("scroll", update, { passive: true });
    update();
  }

  /* ---------- floating particles (hearts + soft dots) ---------- */
  function initParticles() {
    const field = $("#particleField");
    if (!field || prefersReducedMotion) return;

    const symbols = ["❤", "❤", "dot", "dot", "❦"];
    const count = window.innerWidth < 640 ? 10 : 18;

    for (let i = 0; i < count; i++) {
      const el = document.createElement("span");
      const symbol = symbols[Math.floor(Math.random() * symbols.length)];
      const isDot = symbol === "dot";
      el.className = "particle" + (isDot ? " dot" : "");
      if (!isDot) el.textContent = symbol;

      const left = Math.random() * 100;
      const duration = 14 + Math.random() * 14;
      const delay = Math.random() * 18;
      const size = isDot ? 5 + Math.random() * 4 : 10 + Math.random() * 10;
      const drift = (Math.random() * 80 - 40) + "px";

      el.style.left = left + "vw";
      el.style.fontSize = size + "px";
      el.style.width = isDot ? size + "px" : "";
      el.style.height = isDot ? size + "px" : "";
      el.style.animationDuration = duration + "s";
      el.style.animationDelay = delay + "s";
      el.style.setProperty("--drift", drift);

      field.appendChild(el);
    }
  }

  /* ---------- init ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    applyConfig();
    initOpeningScreen();
    initMusicButton();
    initCountdown();
    initScrollReveal();
    initProgressRail();
    initParticles();
  });
})();
