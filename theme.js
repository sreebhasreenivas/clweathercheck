// Light/dark theme toggle.
(function () {
  // Defined by the inline <head> script in index.html.
  var STORAGE_KEY = window.WC_THEME_KEY;
  // Remembers an explicit choice even when localStorage is blocked.
  var userChose = false;
  var root = document.documentElement;
  var toggle = document.getElementById('theme-toggle');
  var media = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

  function getSaved() {
    try {
      var v = localStorage.getItem(STORAGE_KEY);
      return v === 'light' || v === 'dark' ? v : null;
    } catch (e) { return null; }
  }

  function save(theme) {
    try { localStorage.setItem(STORAGE_KEY, theme); } catch (e) {}
  }

  function apply(theme) {
    root.setAttribute('data-theme', theme);
    if (toggle) toggle.setAttribute('aria-checked', String(theme === 'dark'));
  }

  // Sync the switch with the theme set by the inline <head> script.
  apply(root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');

  // Enable colour transitions only after first paint, so page load doesn't animate.
  requestAnimationFrame(function () {
    requestAnimationFrame(function () { root.classList.add('theme-ready'); });
  });

  if (toggle) {
    toggle.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      userChose = true;
      apply(next);
      save(next);
    });
  }

  // Follow OS changes until the user makes an explicit choice.
  if (media) {
    var onChange = function (e) {
      if (!userChose && !getSaved()) apply(e.matches ? 'dark' : 'light');
    };
    if (media.addEventListener) media.addEventListener('change', onChange);
    else if (media.addListener) media.addListener(onChange);
  }
})();
