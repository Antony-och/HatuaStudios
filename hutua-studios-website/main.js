(function () {
  // ---- SETTINGS --------------------------------------------------------------
  // Fill this in ONCE: it updates the footer, contact page, map and enquiry email.
  var CONTACT = { email: "", phone: "", whatsapp: "", address: "", hours: "" };
  //   e.g. email: "hello@yourdomain.com", phone: "+254 700 000 000", whatsapp: "+254 700 000 000",
  //        address: "Studio name, Street, City", hours: "Mon to Fri, 9am to 5pm"
  var TO = CONTACT.email || "hello@example.com";
  var MAP_QUERY = "";             // Your studio address, e.g. "Studio name, Street, City". Empty = placeholder map.
  var FORM_ENDPOINT = "";         // Optional: a form service URL (e.g. Formspree). Empty = open the visitor's email app.
  // ---------------------------------------------------------------------------
  var $ = function (id) { return document.getElementById(id); };
  var P = window.PROJECTS || [];
  var bySlug = function (s) { return P.filter(function (p) { return p.slug === s; })[0]; };
  var param = function (n) { return window.HUTUA_PARAMS ? (window.HUTUA_PARAMS[n] || null) : new URLSearchParams(location.search).get(n); };
  var link = function (page, qs) { return window.HUTUA_LINK ? window.HUTUA_LINK(page, qs) : page + '.html' + (qs ? '?' + qs : ''); };

  function media(el, p, fallback) {
    el.textContent = ''; el.classList.remove('has-media');
    if (p.video) {
      var v = document.createElement('video'); v.src = p.video; v.controls = true; v.playsInline = true; if (p.image) v.poster = p.image;
      el.appendChild(v); el.classList.add('has-media');
    } else if (p.image) {
      var i = document.createElement('img'); i.src = p.image; i.alt = p.title; i.loading = 'lazy';
      el.appendChild(i); el.classList.add('has-media');
    } else el.textContent = fallback;
  }

  // Show your contact details wherever the page has data-contact / data-contact-link / data-copy
  function bindContact(scope) {
    var digits = function (s) { return String(s).replace(/[^\d+]/g, ''); };
    scope.querySelectorAll('[data-contact]').forEach(function (el) { var v = CONTACT[el.getAttribute('data-contact')]; if (v) el.textContent = v; });
    scope.querySelectorAll('[data-contact-link]').forEach(function (a) {
      var k = a.getAttribute('data-contact-link'), v = CONTACT[k]; if (!v) return;
      a.href = k === 'email' ? 'mailto:' + v : k === 'phone' ? 'tel:' + digits(v) : k === 'whatsapp' ? 'https://wa.me/' + digits(v).replace(/^\+/, '') : 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(v);
      if (k === 'whatsapp' || k === 'address') { a.target = '_blank'; a.rel = 'noopener'; }
    });
    scope.querySelectorAll('[data-copy]').forEach(function (b) { b.hidden = !CONTACT[b.getAttribute('data-copy')]; });
  }

  // ---- things that live in the shared header, footer and popup (set up once)
  function initOnce() {
    bindContact(document);
    document.addEventListener('click', function (e) {
      var b = e.target.closest('.copy'); if (!b) return;
      var v = CONTACT[b.getAttribute('data-copy')]; if (!v) return;
      var done = function () { var t = b.textContent; b.textContent = 'Copied'; setTimeout(function () { b.textContent = t; }, 1600); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(v).then(done);
      else { var ta = document.createElement('textarea'); ta.value = v; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); done(); } catch (x) {} ta.remove(); }
    });
    var root = document.documentElement;
    var btn = document.querySelector('.menu'), nav = $('nav'), hdr = document.querySelector('header');
    var subs = Array.prototype.slice.call(document.querySelectorAll('.has-sub'));
    var closeSubs = function () { subs.forEach(function (li) { li.classList.remove('open'); li.querySelector('.sub-btn').setAttribute('aria-expanded', 'false'); }); };
    var closeNav = function () { if (nav) nav.classList.remove('open'); root.classList.remove('menu-open'); if (btn) btn.setAttribute('aria-expanded', 'false'); };
    if (btn && nav) btn.addEventListener('click', function () {
      var o = nav.classList.toggle('open'); root.classList.toggle('menu-open', o); btn.setAttribute('aria-expanded', o); if (o && hdr) hdr.classList.remove('hide');
    });
    if (nav) nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) { closeNav(); closeSubs(); if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); }
    });
    subs.forEach(function (li) {
      li.querySelector('.sub-btn').addEventListener('click', function (e) {
        e.stopPropagation(); var o = !li.classList.contains('open'); closeSubs(); li.classList.toggle('open', o); this.setAttribute('aria-expanded', o);
      });
    });
    document.addEventListener('click', function (e) { if (!e.target.closest('.has-sub')) closeSubs(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeNav(); closeSubs(); } });
    matchMedia('(min-width: 861px)').addEventListener('change', closeNav);

    // Header: hides on scroll down, returns on scroll up, shows reading progress
    if (hdr) {
      var prog = hdr.querySelector('.progress'), last = 0, tick = false, reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
      var onScroll = function () {
        var y = window.pageYOffset || 0, max = root.scrollHeight - window.innerHeight;
        if (prog) prog.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, y / max) : 0) + ')';
        var busy = root.classList.contains('menu-open') || document.querySelector('.has-sub.open') || hdr.contains(document.activeElement);
        if (!reduce && !busy) { if (y > last + 6 && y > 160) hdr.classList.add('hide'); else if (y < last - 6 || y < 160) hdr.classList.remove('hide'); }
        last = y; tick = false;
      };
      window.addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(onScroll); } }, { passive: true });
      hdr.addEventListener('focusin', function () { hdr.classList.remove('hide'); });
      onScroll();
    }
    var tt = $('totop');
    if (tt) tt.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); });
    if ($('yr')) $('yr').textContent = new Date().getFullYear();

    // Dark / light mode
    var tb = document.querySelector('.theme');
    var paint = function () {
      var t = root.getAttribute('data-theme') || 'dark';
      var m = document.querySelector('meta[name=theme-color]'); if (m) m.setAttribute('content', t === 'light' ? '#ffffff' : '#000000');
      if (tb) tb.setAttribute('aria-label', 'Switch to ' + (t === 'light' ? 'dark' : 'light') + ' mode');
    };
    if (tb) tb.addEventListener('click', function () {
      var t = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      root.setAttribute('data-theme', t); try { localStorage.setItem('hutua-theme', t); } catch (e) {} paint();
    });
    if (matchMedia) matchMedia('(prefers-color-scheme: light)').addEventListener('change', function (e) {
      var saved = null; try { saved = localStorage.getItem('hutua-theme'); } catch (x) {}
      if (!saved) { root.setAttribute('data-theme', e.matches ? 'light' : 'dark'); paint(); }
    });
    paint();

    // Project popup
    var dlg = $('pd');
    if (dlg && dlg.showModal) {
      var cur = null;
      var visible = function () { return Array.prototype.slice.call(document.querySelectorAll('.wcard')).filter(function (c) { return !c.hidden; }); };
      var fill = function (card) {
        cur = card; var p = bySlug(card.getAttribute('data-slug')); if (!p) return;
        $('pd-cat').textContent = p.cat; $('pd-title').textContent = p.title; $('pd-desc').textContent = p.summary;
        $('pd-client').textContent = p.client; $('pd-year').textContent = p.year; $('pd-svc').textContent = p.services;
        $('pd-case').href = link('project', 'p=' + encodeURIComponent(p.slug));
        media($('pd-media'), p, '[Project image or video]'); dlg.scrollTop = 0;
      };
      var step = function (d) { var v = visible(); if (v.length) fill(v[(v.indexOf(cur) + d + v.length) % v.length]); };
      document.addEventListener('click', function (e) {
        var card = e.target.closest('.wcard'); if (card) { fill(card); dlg.showModal(); document.body.style.overflow = 'hidden'; }
      });
      $('pd-prev').addEventListener('click', function () { step(-1); });
      $('pd-next').addEventListener('click', function () { step(1); });
      dlg.querySelector('.pd-x').addEventListener('click', function () { dlg.close(); });
      dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
      dlg.addEventListener('keydown', function (e) { if (e.key === 'ArrowLeft') step(-1); if (e.key === 'ArrowRight') step(1); });
      dlg.addEventListener('close', function () { document.body.style.overflow = ''; var v = $('pd-media').querySelector('video'); if (v) v.pause(); if (cur && cur.focus) cur.focus(); });
    }
  }

  // ---- things inside <main> (re-run whenever the page content changes)
  // Run each part of a page on its own, so one failure can never break the rest.
  function safe(f) { try { f(); } catch (e) { if (window.console) console.error(e); } }

  // Fade-in on scroll. Content is only hidden once this has started, so it can never stay invisible.
  function reveal() {
    var els = document.querySelectorAll('main .rv');
    if (!els.length) return;
    if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
      }, { threshold: 0, rootMargin: '0px 0px -8% 0px' });
      document.documentElement.classList.add('rv-on');
      els.forEach(function (el) { io.observe(el); });
      setTimeout(function () {
        document.querySelectorAll('main .rv:not(.in)').forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('in'); });
      }, 1500);
    } else els.forEach(function (el) { el.classList.add('in'); });
  }

  function initPage() {
    safe(function () { bindContact($('main') || document); });
    safe(function () {
      document.querySelectorAll('[data-projects]').forEach(function (list) {
        var n = parseInt(list.getAttribute('data-limit'), 10) || P.length;
        P.slice(0, n).forEach(function (p) {
          var b = document.createElement('button'); b.type = 'button'; b.className = 'wcard rv';
          b.setAttribute('data-slug', p.slug); b.setAttribute('data-cat', p.cat); b.setAttribute('aria-haspopup', 'dialog');
          var ph = document.createElement('span'); ph.className = 'ph';
          if (p.image) { var im = document.createElement('img'); im.src = p.image; im.alt = ''; im.loading = 'lazy'; ph.appendChild(im); ph.classList.add('has-media'); } else ph.textContent = '[Project image]';
          var m = document.createElement('span'); m.className = 'meta';
          var t = document.createElement('span'); t.textContent = p.title; var c = document.createElement('span'); c.textContent = p.cat;
          m.appendChild(t); m.appendChild(c);
          var vw = document.createElement('span'); vw.className = 'view'; vw.textContent = 'View project';
          b.appendChild(ph); b.appendChild(m); b.appendChild(vw); list.appendChild(b);
        });
      });
    });
    safe(function () {
    var sn = document.querySelector('.subnav');
    if (sn && 'IntersectionObserver' in window) {
      var links = sn.querySelectorAll('a'), byId = {}, box = sn.querySelector('.subnav-in');
      links.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
      var so = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (!e.isIntersecting) return;
          var a = byId[e.target.id]; if (!a) return;
          links.forEach(function (x) { x.removeAttribute('aria-current'); }); a.setAttribute('aria-current', 'true');
          box.scrollTo({ left: a.offsetLeft - box.clientWidth / 2 + a.clientWidth / 2, behavior: 'smooth' });
        });
      }, { rootMargin: '-40% 0px -55% 0px' });
      document.querySelectorAll('[data-sec]').forEach(function (s) { so.observe(s); });
    }
    });
    safe(function () {
    var tabs = document.querySelectorAll('.ptab');
    if (tabs.length) {
      var panels = document.querySelectorAll('.tabpanel'), reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
      var update = function () {
        var list = document.querySelector('.tabpanel:not([hidden]) .timeline'); if (!list) return;
        var mid = window.innerHeight * 0.5, r = list.getBoundingClientRect(), idx = -1;
        list.style.setProperty('--p', Math.max(0, Math.min(1, (mid - r.top) / r.height)) * 100 + '%');
        list.querySelectorAll('.tl').forEach(function (li, k) {
          var t = li.getBoundingClientRect(), on = t.top < mid && t.bottom > mid;
          li.classList.toggle('done', t.top < mid); li.classList.toggle('active', on); if (on) idx = k;
        });
        document.querySelectorAll('.jn').forEach(function (b, k) { b.setAttribute('aria-current', k === idx); });
      };
      var journey = function () {
        var j = $('journey'); if (!j) return; j.textContent = '';
        document.querySelectorAll('.tabpanel:not([hidden]) .tl').forEach(function (li, k) {
          var b = document.createElement('button'); b.type = 'button'; b.className = 'jn';
          var n = document.createElement('span'); n.textContent = '0' + (k + 1);
          var t = document.createElement('b'); t.textContent = li.querySelector('h3').textContent;
          b.appendChild(n); b.appendChild(t);
          b.addEventListener('click', function () { li.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }); });
          j.appendChild(b);
        });
      };
      if (window.__tlScroll) window.removeEventListener('scroll', window.__tlScroll);
      var tick = false;
      window.__tlScroll = function () { if (!tick) { tick = true; requestAnimationFrame(function () { tick = false; update(); }); } };
      window.addEventListener('scroll', window.__tlScroll, { passive: true });
      var pick = function (i, focus) {
        tabs.forEach(function (t, k) { t.setAttribute('aria-selected', k === i); t.tabIndex = k === i ? 0 : -1; });
        panels.forEach(function (p, k) { p.hidden = k !== i; });
        document.querySelectorAll('.timeline').forEach(function (l) { l.classList.add('tl-live'); });
        if (focus) tabs[i].focus();
        journey(); update();
      };
      tabs.forEach(function (t, k) {
        t.addEventListener('click', function () { pick(k); });
        t.addEventListener('keydown', function (e) {
          var n = e.key === 'ArrowRight' ? (k + 1) % tabs.length : e.key === 'ArrowLeft' ? (k + tabs.length - 1) % tabs.length : -1;
          if (n > -1) { e.preventDefault(); pick(n, true); }
        });
      });
      pick(0);
    }
    });
    safe(function () {
      var chips = document.querySelectorAll('.chip');
      chips.forEach(function (c) {
        c.addEventListener('click', function () {
          chips.forEach(function (x) { x.setAttribute('aria-pressed', x === c); });
          var f = c.getAttribute('data-f');
          document.querySelectorAll('.wcard').forEach(function (card) { card.hidden = !(f === 'all' || card.getAttribute('data-cat') === f); });
        });
      });
    });
    safe(function () {
    if ($('case')) {
      var p = bySlug(param('p'));
      if (!p) { $('case-title').textContent = 'Project not found'; $('case-main').hidden = true; }
      else {
        document.title = p.title + ' | hutua studios';
        $('case-cat').textContent = p.cat; $('case-title').textContent = p.title; $('case-summary').textContent = p.summary;
        media($('case-media'), p, '[Project image or video]');
        $('case-client').textContent = p.client; $('case-year').textContent = p.year; $('case-svc').textContent = p.services;
        $('case-challenge').textContent = p.challenge; $('case-solution').textContent = p.solution; $('case-result').textContent = p.result;
        var n = P[(P.indexOf(p) + 1) % P.length];
        $('case-next').href = link('project', 'p=' + encodeURIComponent(n.slug)); $('case-next-t').textContent = n.title;
      }
    }
    });
    safe(function () {
    var map = $('map');
    var MQ = MAP_QUERY || CONTACT.address;
    if (map && MQ) {
      var q = encodeURIComponent(MQ), fr = document.createElement('iframe');
      fr.src = 'https://www.google.com/maps?q=' + q + '&output=embed'; fr.title = 'Map showing the hutua studios location'; fr.loading = 'lazy'; fr.referrerPolicy = 'no-referrer-when-downgrade';
      map.textContent = ''; map.appendChild(fr);
      var dir = $('map-dir'); if (dir) { dir.href = 'https://www.google.com/maps/dir/?api=1&destination=' + q; dir.target = '_blank'; dir.rel = 'noopener'; dir.hidden = false; }
    }
    });
    safe(function () {
    var form = $('form');
    if (form) {
      var st = $('status'), send = $('send'), want = param('service');
      var ARW = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>';
      var steps = Array.prototype.slice.call(form.querySelectorAll('.fstep')), lis = Array.prototype.slice.call($('fnav').children), cur = 0, last = steps.length - 1;
      if (want) Array.prototype.forEach.call(form.querySelectorAll('input[name=service]'), function (i) { if (i.value === want) i.checked = true; });
      var err = function (id, msg) {
        var f = $(id), e = $(id + '-err'); if (e) e.textContent = msg || '';
        if (f) { if (msg) f.setAttribute('aria-invalid', 'true'); else f.removeAttribute('aria-invalid'); }
        return !msg;
      };
      var okMsg = function () { return err('msg', $('msg').value.trim().length > 9 ? '' : 'Please tell us a little about your project.'); };
      var okMe = function () {
        var a = err('name', $('name').value.trim() ? '' : 'Please enter your name.');
        var b = err('email', /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test($('email').value.trim()) ? '' : 'Please enter a valid email address.');
        return a && b;
      };
      var stepOk = function (i) { return i === 1 ? okMsg() : i === 2 ? okMe() : true; };
      var show = function (i, focus) {
        cur = i;
        steps.forEach(function (s, k) { s.hidden = k !== i; });
        lis.forEach(function (li, k) { li.classList.toggle('done', k < i); if (k === i) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current'); });
        $('fprog').style.transform = 'scaleX(' + ((i + 1) / steps.length) + ')';
        $('back').hidden = i === 0; send.innerHTML = (i === last ? 'Send enquiry ' : 'Next ') + ARW; st.textContent = '';
        if (focus) steps[i].querySelector('legend').focus();
      };
      form.addEventListener('input', function (e) {
        if (e.target.id === 'msg') $('count').textContent = e.target.value.length + ' / 1500';
        if (e.target.id && $(e.target.id + '-err')) err(e.target.id, '');
      });
      var showSent = function (email) { form.hidden = true; $('fhead').hidden = true; $('sent-to').textContent = email; var s = $('sent'); s.hidden = false; s.focus(); };
      var mailto = function (d) {
        var svc = d.getAll('service').join(', ') || 'General enquiry';
        var body = 'Name: ' + d.get('name') + '\nEmail: ' + d.get('email') + '\nPhone: ' + (d.get('phone') || '-') + '\nCompany: ' + (d.get('company') || '-') +
          '\nBest way to reach me: ' + d.get('prefer') + '\nNeed: ' + svc + '\nTimeline: ' + d.get('timeline') + '\nLink: ' + (d.get('link') || '-') + '\n\n' + d.get('msg');
        location.href = 'mailto:' + TO + '?subject=' + encodeURIComponent('New project: ' + svc) + '&body=' + encodeURIComponent(body);
        st.textContent = 'Opening your email app. If nothing opens, write to ' + TO + '.';
      };
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        if ($('website').value) return; // spam trap
        if (!stepOk(cur)) { st.textContent = 'Please fix the highlighted field.'; var bad = steps[cur].querySelector('[aria-invalid=true]'); if (bad) bad.focus(); return; }
        st.textContent = '';
        if (cur < last) { show(cur + 1, true); return; }
        if (!okMsg()) { show(1, true); $('msg').focus(); return; }
        var d = new FormData(form);
        if (!FORM_ENDPOINT) return mailto(d);
        var em = d.get('email'); send.disabled = true; st.textContent = 'Sending...';
        fetch(FORM_ENDPOINT, { method: 'POST', body: d, headers: { Accept: 'application/json' } })
          .then(function (r) { if (!r.ok) throw 0; form.reset(); st.textContent = ''; showSent(em); })
          .catch(function () { st.textContent = 'Could not send. Opening your email app instead.'; mailto(d); })
          .then(function () { send.disabled = false; });
      });
      $('back').addEventListener('click', function () { show(cur - 1, true); });
      $('again').addEventListener('click', function () { form.reset(); $('count').textContent = '0 / 1500'; $('sent').hidden = true; $('fhead').hidden = false; form.hidden = false; show(0, true); });
      show(0, false);
    }
    });
    reveal();
  }

  initOnce(); initPage();
  window.HutuaInitPage = initPage;
})();
