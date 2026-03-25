// ============================================
// Arivalan — Interactive Scripts
// ============================================
(function () {
  'use strict';

  // ---- Role Rotator ----
  var roles = ['Boredom Writer', 'Blunder-Prone Chess Player', 'Occasional Overthinker', 'Makeshift Poet', 'Compliant Carrom Player', 'Curios Questioner'];
  var roleEl = document.getElementById('roleRotator');
  var roleIndex = 0;

  setInterval(function () {
    roleEl.style.opacity = '0';
    setTimeout(function () {
      roleIndex = (roleIndex + 1) % roles.length;
      roleEl.textContent = roles[roleIndex];
      roleEl.style.opacity = '1';
    }, 300);
  }, 2000);

  // ---- Theme Toggle ----
  var themeBtn = document.getElementById('themeToggle');
  var themeIcon = themeBtn.querySelector('.theme-icon');

  themeBtn.addEventListener('click', function () {
    var html = document.documentElement;
    var current = html.getAttribute('data-theme');
    if (current === 'dark') {
      html.setAttribute('data-theme', 'light');
      themeIcon.textContent = '☀️';
    } else {
      html.setAttribute('data-theme', 'dark');
      themeIcon.textContent = '🌙';
    }
  });

  // ---- Surprise Me ----
  var sections = ['interests', 'stats', 'poem', 'chess', 'novel', 'personal', 'contact'];
  document.getElementById('surpriseBtn').addEventListener('click', function () {
    var randomId = sections[Math.floor(Math.random() * sections.length)];
    var target = document.getElementById(randomId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
      // Flash effect on target section
      target.style.transition = 'background 0.3s ease';
      var orig = target.style.background;
      target.style.background = 'rgba(108, 92, 231, 0.05)';
      setTimeout(function () {
        target.style.background = orig;
      }, 800);
    }
  });

  // ---- Flip Interest Cards ----
  var interestCards = document.querySelectorAll('.interest-card');
  interestCards.forEach(function (card) {
    card.addEventListener('click', function (e) {
      // Don't flip if clicking a link
      if (e.target.tagName === 'A') return;
      card.classList.toggle('flipped');
    });
  });

  // ---- Animated Counters ----
  var counters = document.querySelectorAll('.stat-number[data-target]');
  var counterDone = new Set();

  function animateCounter(el) {
    var target = parseInt(el.getAttribute('data-target'), 10);
    var duration = 1500;
    var start = 0;
    var startTime = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3); // ease out cubic
      el.textContent = Math.floor(eased * target);
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target;
      }
    }
    requestAnimationFrame(step);
  }

  var counterObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting && !counterDone.has(entry.target)) {
        counterDone.add(entry.target);
        animateCounter(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(function (c) { counterObserver.observe(c); });

  // ---- Load Poems from poems.json ----
  var allPoems = [];
  var tamilPoems = [];
  var seasonPoems = {};
  var activeSeason = null;

  var SEASON_NAMES = [
    'காதல் தினம் தினம்',
    'மீண்டும் ஓர் காதல் மழை',
    'கற்பனையோ காதல் வசம்'
  ];

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function pickRandom(arr, count) {
    var shuffled = arr.slice().sort(function () { return 0.5 - Math.random(); });
    return shuffled.slice(0, count);
  }

  function showRandomPoems(pool) {
    if (!pool) pool = tamilPoems.length ? tamilPoems : allPoems;
    if (!pool.length) return;
    var picks = pickRandom(pool, 3);
    for (var i = 0; i < 3; i++) {
      var card = document.getElementById('poemCard' + i);
      if (!card) continue;
      var poem = picks[i] || picks[0];
      card.style.opacity = '0';
      (function (c, p) {
        setTimeout(function () {
          c.querySelector('.poem-text').innerHTML = escapeHtml(p.text).replace(/\n/g, '<br>');
          var capEl = c.querySelector('.poem-caption');
          if (capEl) capEl.textContent = p.caption || '';
          var dateEl = c.querySelector('.poem-date');
          if (dateEl && p.date) {
            var d = new Date(p.date);
            dateEl.textContent = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
          } else if (dateEl) {
            dateEl.textContent = '';
          }
          c.style.opacity = '1';
        }, 200 + i * 100);
      })(card, poem);
    }
  }

  fetch('poems.json')
    .then(function (res) { return res.json(); })
    .then(function (data) {
      allPoems = data;
      tamilPoems = data.filter(function (p) { return p.tamil; });
      // Build season index
      SEASON_NAMES.forEach(function (name) {
        seasonPoems[name] = data.filter(function (p) {
          return p.caption && p.caption.indexOf(name) === 0;
        });
      });
      showRandomPoems();
    })
    .catch(function () {});

  // ---- Season Card Click ----
  var seasonCards = document.querySelectorAll('.season-card[data-season]');
  seasonCards.forEach(function (card) {
    card.addEventListener('click', function () {
      var season = card.getAttribute('data-season');
      // Toggle active state
      seasonCards.forEach(function (c) { c.classList.remove('active'); });
      card.classList.add('active');
      activeSeason = season;
      var pool = seasonPoems[season] || tamilPoems;
      showRandomPoems(pool);
    });
  });

  var shuffleBtn = document.getElementById('shufflePoem');
  if (shuffleBtn) {
    shuffleBtn.addEventListener('click', function () {
      activeSeason = null;
      seasonCards.forEach(function (c) { c.classList.remove('active'); });
      showRandomPoems();
      shuffleBtn.style.transform = 'translateY(-2px) scale(1.05)';
      setTimeout(function () { shuffleBtn.style.transform = ''; }, 200);
    });
  }

  // ---- Scroll Reveal ----
  var revealTargets = document.querySelectorAll('.section, .stat-card, .interest-card, .novel-card, .personal-card');
  revealTargets.forEach(function (el) {
    el.classList.add('reveal-scroll');
  });

  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, {
    threshold: 0.08,
    rootMargin: '0px 0px -40px 0px'
  });

  revealTargets.forEach(function (el) {
    revealObserver.observe(el);
  });

  // ---- Fetch Chess.com Stats ----
  function fetchChessStats() {
    fetch('https://api.chess.com/pub/player/mrphp/stats')
      .then(function (res) { return res.json(); })
      .then(function (data) {
        // Extract rapid rating only
        var rapid = data.chess_rapid;

        var rapidRating = rapid && rapid.last ? rapid.last.rating : null;

        // Update chess section — rapid only
        if (rapidRating) {
          document.getElementById('rapidRating').textContent = rapidRating;
          document.getElementById('cardRapidRating').textContent = rapidRating;
          var statEl = document.getElementById('statChessRating');
          if (statEl) statEl.setAttribute('data-target', rapidRating);
        }

        // Build W/L/D record from rapid
        var mode = rapid;
        if (mode && mode.record) {
          var rec = mode.record;
          var recordEl = document.getElementById('chessRecord');
          recordEl.innerHTML =
            '<span class="record-item wins">W ' + rec.win + '</span>' +
            '<span class="record-item losses">L ' + rec.loss + '</span>' +
            '<span class="record-item draws">D ' + rec.draw + '</span>';
        }
      })
      .catch(function () {
        // Silently fallback — keep placeholder dashes
      });

    // Fetch profile for last online
    fetch('https://api.chess.com/pub/player/mrphp')
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (data.last_online) {
          var d = new Date(data.last_online * 1000);
          var formatted = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
          var el = document.getElementById('chessLastOnline');
          if (el) el.textContent = 'Last online: ' + formatted;
        }
      })
      .catch(function () {});
  }

  fetchChessStats();

  // ---- Fetch YourQuote Profile Stats ----
  function fetchYourQuoteStats() {
    fetch('https://www.yourquote.in/yourquote-web/web/basic?userId=wbcf')
      .then(function (res) { return res.json(); })
      .then(function (data) {
        var user = data.user;
        if (user && user.posts_count) {
          var count = user.posts_count;
          // Update poem subtitle
          var yqEl = document.getElementById('yqPostCount');
          if (yqEl) yqEl.textContent = count.toLocaleString();
          // Update stat card counter target
          var statEl = document.getElementById('statPoemCount');
          if (statEl) statEl.setAttribute('data-target', count);
        }
      })
      .catch(function () {});
  }

  fetchYourQuoteStats();

  // ---- Smooth scroll for hero CTA ----
  document.querySelector('.hero-cta').addEventListener('click', function (e) {
    e.preventDefault();
    var target = document.querySelector(this.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  });

})();
