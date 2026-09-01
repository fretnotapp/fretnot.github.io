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
   Fret Not Pro demo — "manual → Pro" animation, using Jolene as the example.
   Based on PaywallDemoCard (fretnotapp/GuitarSongbook/Views/PaywallView.swift);
   the landing page uses a Jolene-specific set of frames to make the value
   concrete: entered by hand you get the hard barre chords (C#m · E · B), while
   Pro picks chords for your skill level — easy open shapes at capo 4 for a
   beginner, up to the full barre chords for an advanced player.
   The three levels are the same song transposed: capo 4 (Am·C·G) = capo 2
   (Bm·D·A) = no capo (C#m·E·B). Self-initializes every .fretnot-demo; safe if none.
   ============================================================================ */
(function () {
  // Jolene, three ways: typed by hand (hard barre chords), then picked for your level.
  var FRAMES = [
    { manual: true,  text: "C#m",         capo: null,   hold: 0.45 },
    { manual: true,  text: "C#m · E",     capo: null,   hold: 0.45 },
    { manual: true,  text: "C#m · E · B", capo: null,   hold: 0.85 },
    { manual: true,  text: "C#m · E · B", capo: "None", hold: 1.7 },
    { manual: false, difficulty: "Beginner",     capoInt: 4, chords: ["Am", "C", "G"],  hold: 1.7 },
    { manual: false, difficulty: "Intermediate", capoInt: 2, chords: ["Bm", "D", "A"],  hold: 1.4 },
    { manual: false, difficulty: "Advanced",     capoInt: 0, chords: ["C#m", "E", "B"], hold: 1.4 }
  ];
  var CAPO_OPTIONS = ["None", "1", "2", "3"];
  var DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"];

  // Chord shapes, low->high string [E A D G B e]; -1 = muted, 0 = open, n = fret.
  var SHAPES = {
    "Am":  [-1,0,2,2,1,0],
    "C":   [-1,3,2,0,1,0],
    "G":   [3,2,0,0,0,3],
    "Bm":  [-1,2,4,4,3,2],
    "D":   [-1,-1,0,2,3,2],
    "A":   [-1,0,2,2,2,0],
    "C#m": [-1,4,6,6,5,4],
    "E":   [0,2,2,1,0,0],
    "B":   [-1,2,4,4,4,2]
  };

  // Render one chord diagram as an SVG fretboard (matches reel.html).
  function chordSVG(name) {
    var frets = SHAPES[name];
    var fretted = frets.filter(function (f) { return f > 0; });
    var maxF = fretted.length ? Math.max.apply(null, fretted) : 0;
    var minF = fretted.length ? Math.min.apply(null, fretted) : 0;
    var rows = 5, start, nut;
    if (maxF <= 5) { start = 1; nut = true; } else { start = minF; nut = false; }

    var padL = nut ? 13 : 22, padR = 11, padTop = 18, padBot = 8;
    var sGap = 11, fGap = 14;
    var W = padL + sGap * 5 + padR, H = padTop + fGap * rows + padBot;
    var xs = [], i;
    for (i = 0; i < 6; i++) xs.push(padL + i * sGap);
    var top = padTop, left = xs[0], right = xs[5];

    var s = '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" fill="none">';

    // fret lines (top line is the nut for open shapes)
    for (i = 0; i <= rows; i++) {
      var y = top + i * fGap;
      var isNut = (nut && i === 0);
      s += '<line x1="' + left + '" y1="' + y + '" x2="' + right + '" y2="' + y +
           '" stroke="' + (isNut ? '#1C1917' : '#B7ADA2') + '" stroke-width="' + (isNut ? 2.6 : 1) + '"/>';
    }
    // strings
    for (i = 0; i < 6; i++) {
      s += '<line x1="' + xs[i] + '" y1="' + top + '" x2="' + xs[i] + '" y2="' + (top + fGap * rows) +
           '" stroke="#B7ADA2" stroke-width="1"/>';
    }
    // position label ("5fr") for barre shapes up the neck
    if (!nut) {
      s += '<text x="' + (left - 8) + '" y="' + (top + fGap * 0.85) + '" text-anchor="end" ' +
           'font-family="-apple-system, Helvetica, Arial, sans-serif" font-size="9" font-weight="600" ' +
           'fill="#8C857D">' + start + 'fr</text>';
    }
    // open / muted markers above the nut + fretted dots
    for (i = 0; i < 6; i++) {
      var f = frets[i], mx = xs[i], my = top - 7;
      if (f === 0) {
        s += '<circle cx="' + mx + '" cy="' + my + '" r="2.6" stroke="#8C857D" stroke-width="1.1" fill="none"/>';
      } else if (f < 0) {
        s += '<path d="M' + (mx - 2.6) + ' ' + (my - 2.6) + ' L' + (mx + 2.6) + ' ' + (my + 2.6) +
             ' M' + (mx + 2.6) + ' ' + (my - 2.6) + ' L' + (mx - 2.6) + ' ' + (my + 2.6) +
             '" stroke="#8C857D" stroke-width="1.1" stroke-linecap="round"/>';
      }
      if (f > 0) {
        var row = f - start + 1;
        if (row >= 1 && row <= rows) {
          var cy = top + (row - 0.5) * fGap;
          s += '<circle cx="' + mx + '" cy="' + cy + '" r="4" fill="#1C1917"/>';
        }
      }
    }
    s += '</svg>';
    return s;
  }

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
        '<div class="fnd-hint">Working out the chord shapes and capo yourself.</div>' +
      '</div>';
  }

  function premiumHTML(f) {
    var seg = DIFFICULTIES.map(function (d) {
      var sel = d === f.difficulty ? " is-selected" : "";
      return '<span class="fnd-seg-opt' + sel + '">' + esc(d) + '</span>';
    }).join("");
    var capoLabel = f.capoInt === 0 ? "No Capo" : "Capo " + f.capoInt;
    var diagrams = f.chords.map(function (c) {
      return '<div class="fnd-dia"><div class="fnd-dia-name">' + esc(c) + '</div>' + chordSVG(c) + '</div>';
    }).join("");
    return '' +
      '<div class="fnd-premium">' +
        '<div class="fnd-segment">' + seg + '</div>' +
        '<span class="fnd-pill is-selected fnd-capo-pill">' + esc(capoLabel) + '</span>' +
        '<div class="fnd-diagrams">' + diagrams + '</div>' +
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
      capText.textContent = f.manual ? "Jolene, entered by hand" : "Jolene, picked for your level";
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

