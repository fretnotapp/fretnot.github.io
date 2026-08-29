// Smooth scroll animations using Intersection Observer
document.addEventListener('DOMContentLoaded', function() {
    // Set up intersection observer for fade-in-up animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all elements with fade-in-up class
    const animatedElements = document.querySelectorAll('.fade-in-up');
    animatedElements.forEach(el => {
        observer.observe(el);
    });

    // Navbar scroll effect (guarded — some pages use an inline-styled <nav> without .navbar)
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        let lastScroll = 0;

        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;

            if (currentScroll > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }

            lastScroll = currentScroll;
        });
    }

    // Smooth scroll for in-page anchor links (handles both "#features" and "/index.html#features")
    const normalizePath = p => (p === '/' || p === '') ? '/index.html' : p;
    document.querySelectorAll('a[href*="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const url = new URL(this.href, location.href);
            if (normalizePath(url.pathname) !== normalizePath(location.pathname)) return;
            if (!url.hash || url.hash === '#') return;
            const target = document.querySelector(url.hash);
            if (!target) return;
            e.preventDefault();
            window.scrollTo({
                top: target.offsetTop - 80,
                behavior: 'smooth'
            });
        });
    });

    // Removed parallax effect to prevent section overlap
});

/* ============================================================================
   Fret Not Pro demo — "manual → Pro" paywall animation
   Ported from PaywallDemoCard (fretnotapp/GuitarSongbook/Views/PaywallView.swift).
   Self-initializes every .fretnot-demo on the page; safe if none exist.
   Frame content, order, timings and identity logic match the app exactly.
   ============================================================================ */
(function () {
  // Frames mirror PaywallDemoCard.frames exactly (order, text, capo, chords, hold).
  var FRAMES = [
    { manual: true,  text: "Am",             capo: null, hold: 0.4 },
    { manual: true,  text: "Am · C",         capo: null, hold: 0.4 },
    { manual: true,  text: "Am · C · G",     capo: null, hold: 0.4 },
    { manual: true,  text: "Am · C · G · D", capo: null, hold: 0.7 },
    { manual: true,  text: "Am · C · G · D", capo: "3",  hold: 0.5 },
    { manual: true,  text: "Am · C · G · D", capo: "2",  hold: 1.1 },
    { manual: false, difficulty: "Beginner",     capoInt: 0, chords: ["Am", "C", "G", "D"],           hold: 1.4 },
    { manual: false, difficulty: "Intermediate", capoInt: 2, chords: ["Am", "Cadd9", "G", "Em7"],      hold: 1.4 },
    { manual: false, difficulty: "Advanced",     capoInt: 4, chords: ["Am7", "Cmaj7", "G6", "Dsus2"], hold: 1.4 }
  ];
  var CAPO_OPTIONS = ["None", "1", "2", "3"];
  var DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"];

  var ICON_PENCIL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>';
  var ICON_SPARKLES = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l1.6 4.6L18 8.2l-4.4 1.6L12 14l-1.6-4.2L6 8.2l4.4-1.6L12 2z"/><path d="M19 13l.9 2.5L22 16.5l-2.1.9L19 20l-.9-2.6L16 16.5l2.1-1L19 13z"/></svg>';

  function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]; }); }

  function manualHTML(f) {
    var caretVisible = f.capo === null; // caret only blinks while typing chords
    var pills = CAPO_OPTIONS.map(function (opt) {
      var sel = f.capo === opt ? " is-selected" : "";
      return '<span class="fnd-pill' + sel + '">' + esc(opt) + '</span>';
    }).join("");
    return '' +
      '<div class="fnd-manual">' +
        '<div class="fnd-input">' +
          '<span class="fnd-input-text">' + esc(f.text) + '</span>' +
          '<span class="fnd-caret' + (caretVisible ? " fnd-caret--live" : "") + '"></span>' +
        '</div>' +
        '<div class="fnd-capo-row">' +
          '<span class="fnd-capo-label">Capo</span>' + pills +
        '</div>' +
        '<div class="fnd-hint">Guessing the shapes and capo yourself.</div>' +
      '</div>';
  }

  function premiumHTML(f) {
    var seg = DIFFICULTIES.map(function (d) {
      var sel = d === f.difficulty ? " is-selected" : "";
      return '<span class="fnd-seg-opt' + sel + '">' + esc(d) + '</span>';
    }).join("");
    var capoLabel = f.capoInt === 0 ? "No Capo" : "Capo " + f.capoInt;
    var chords = f.chords.map(function (c) { return '<span class="fnd-chord">' + esc(c) + '</span>'; }).join("");
    return '' +
      '<div class="fnd-premium">' +
        '<div class="fnd-segment">' + seg + '</div>' +
        '<span class="fnd-pill is-selected fnd-capo-pill">' + esc(capoLabel) + '</span>' +
        '<div class="fnd-chords">' + chords + '</div>' +
      '</div>';
  }

  // "Identity" decides crossfade vs. in-place update (matches the .id() logic in
  // SwiftUI): all manual frames share one identity, each premium variant is its own.
  function identity(step, f) { return f.manual ? "manual" : "premium-" + step; }

  function init(root) {
    if (root.__fretnotInit) return;
    root.__fretnotInit = true;

    var capIcon = root.querySelector(".fnd-cap-icon");
    var capText = root.querySelector(".fnd-cap-text");
    var caption = root.querySelector(".fnd-caption");
    var badge   = root.querySelector(".fnd-badge");
    var layers  = root.querySelectorAll(".fnd-layer");
    var layerA  = layers[0], layerB = layers[1];

    var step = -1;
    var elapsed = 0;
    var activeLayer = layerA;
    var currentIdentity = null;

    function render(f) {
      capIcon.innerHTML = f.manual ? ICON_PENCIL : ICON_SPARKLES;
      capText.textContent = f.manual ? "Typing chords in by hand" : "Real chords, picked for you";
      caption.classList.toggle("is-pro", !f.manual);
      badge.textContent = f.manual ? "FREE" : "PRO";
      badge.classList.toggle("is-pro", !f.manual);

      var html = f.manual ? manualHTML(f) : premiumHTML(f);
      var id = identity(step, f);

      if (id === currentIdentity) {
        // Same identity (manual → manual): update in place, no crossfade.
        activeLayer.innerHTML = html;
      } else {
        // Crossfade into the other layer.
        var incoming = activeLayer === layerA ? layerB : layerA;
        incoming.innerHTML = html;
        // force reflow so the opacity transition actually runs
        void incoming.offsetWidth;
        incoming.classList.add("is-active");
        activeLayer.classList.remove("is-active");
        activeLayer = incoming;
        currentIdentity = id;
      }
    }

    function advance() {
      step = (step + 1) % FRAMES.length;
      render(FRAMES[step]);
    }

    // Main clock: 0.1s tick, advance when the frame's hold elapses (app parity).
    advance();
    setInterval(function () {
      elapsed += 0.1;
      if (elapsed + 0.001 >= FRAMES[step].hold) {
        elapsed = 0;
        advance();
      }
    }, 100);

    // Caret blink: 0.5s, only while a live caret is on screen.
    var caretOn = false;
    setInterval(function () {
      var caret = activeLayer.querySelector(".fnd-caret--live");
      caretOn = caret ? !caretOn : false;
      var all = root.querySelectorAll(".fnd-caret");
      for (var i = 0; i < all.length; i++) all[i].classList.remove("on");
      if (caret && caretOn) caret.classList.add("on");
    }, 500);
  }

  function boot() {
    var nodes = document.querySelectorAll(".fretnot-demo");
    for (var i = 0; i < nodes.length; i++) init(nodes[i]);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();

