// Builds the Thanksgiving page from menu.js: menu, game plan board, shopping list, and
// who's-bringing-what. Done tickets and checked groceries are remembered in localStorage.
(function () {
  var COOKS = window.COOKS, MENU = window.MENU, DAYS = window.DAYS, AISLES = window.AISLES;
  var EXTRA_TASKS = window.EXTRA_TASKS || [];

  // ---------- helpers ----------
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function slug(s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }
  // maybe = not decided yet: same colors, dotted outline.
  function tagFor(key, suffix, maybe) {
    var t;
    if (!key) t = el("span", "tag open", "Unclaimed");
    else if (COOKS[key].catered) t = el("span", "tag catered", COOKS[key].name);
    else t = el("span", "tag " + COOKS[key].tone + (maybe ? " maybe" : ""), COOKS[key].name);
    if (suffix) t.textContent += suffix;
    return t;
  }
  function load(key) {
    try { return JSON.parse(localStorage.getItem(key)) || {}; } catch (e) { return {}; }
  }
  function save(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* private mode etc. */ }
  }

  var allDishes = [];
  MENU.forEach(function (sec) { sec.dishes.forEach(function (d) { allDishes.push(d); }); });

  // ---------- summary + tally ----------
  // "Maybe" dishes are counted separately so they don't inflate the totals.
  var counts = {}, maybes = {}, unclaimed = 0, maybeTotal = 0;
  allDishes.forEach(function (d) {
    if (d.maybe) { maybeTotal++; if (d.who) maybes[d.who] = (maybes[d.who] || 0) + 1; return; }
    if (!d.who) { unclaimed++; return; }
    counts[d.who] = (counts[d.who] || 0) + 1;
  });
  var homeCooks = 0, catered = 0;
  Object.keys(counts).forEach(function (k) {
    if (COOKS[k].catered) catered += counts[k]; else homeCooks++;
  });
  var bits = [(allDishes.length - maybeTotal) + " dishes", homeCooks + " home cooks"];
  if (catered) bits.push(catered + " catered");
  if (unclaimed) bits.push(unclaimed + " still up for grabs");
  if (maybeTotal) bits.push(maybeTotal + " maybe");
  document.getElementById("summary").textContent = bits.join(" · ");

  var order = Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a]; });
  var tally = document.getElementById("tally");
  function addMaybeTag(k) {
    var mli = el("li"); mli.appendChild(tagFor(k, " · " + maybes[k] + " maybe", true)); tally.appendChild(mli);
  }
  order.forEach(function (k) {
    var li = el("li"); li.appendChild(tagFor(k, " · " + counts[k])); tally.appendChild(li);
    if (maybes[k]) addMaybeTag(k); // sits right next to that cook's tag
  });
  Object.keys(maybes).forEach(function (k) { if (!counts[k]) addMaybeTag(k); });
  if (unclaimed) {
    var uli = el("li"); uli.appendChild(tagFor(null, " · " + unclaimed)); tally.appendChild(uli);
  }

  // ---------- menu ----------
  // Each card's name is a button (stretched over the whole card) that opens the recipe panel.
  // Catered dishes only open one if a recipe or ingredients have been added for them.
  function opensRecipe(d) {
    var catered = d.who && COOKS[d.who].catered;
    return !catered || !!((d.recipe && d.recipe.length) || (d.ingredients && d.ingredients.length));
  }
  function nameEl(d, course, prefix) {
    var label = (prefix || "") + d.name;
    if (!opensRecipe(d)) return el("span", "dish-name", label);
    var b = el("button", "dish-name dish-open", label);
    b.type = "button";
    b.setAttribute("aria-haspopup", "dialog");
    b.addEventListener("click", function () { openRecipe(d, course, b); });
    return b;
  }

  var courses = document.getElementById("courses");
  MENU.forEach(function (sec) {
    var section = el("div", "course");
    section.appendChild(el("h3", null, sec.course));
    var list = el("ul", "dishes");
    var addons = [];
    sec.dishes.forEach(function (d) {
      if (d.addon) { addons.push(d); return; }
      var tappable = opensRecipe(d);
      var li = el("li", "dish" + (d.feature ? " feature" : "") + (tappable ? " is-tappable" : ""));
      li.appendChild(nameEl(d, sec.course));
      if (d.note) li.appendChild(el("span", "dish-note", d.note));
      if (d.request) li.appendChild(el("span", "request", "★ " + d.request + "'s request"));
      var main = tagFor(d.who, d.maybe ? " · maybe" : (d.bringing && d.who ? " is bringing" : ""), d.maybe);
      if (d.prep) {
        var tags = el("div", "tag-row");
        tags.appendChild(main);
        tags.appendChild(tagFor(d.prep, " · preps"));
        li.appendChild(tags);
      } else li.appendChild(main);
      list.appendChild(li);
    });
    section.appendChild(list);
    addons.forEach(function (d) {
      var row = el("div", "addon is-tappable");
      var left = el("span");
      left.appendChild(nameEl(d, sec.course, "+ "));
      if (d.note) { left.appendChild(document.createTextNode(" ")); left.appendChild(el("span", "dish-note", d.note)); }
      row.appendChild(left);
      row.appendChild(tagFor(d.who));
      section.appendChild(row);
    });
    courses.appendChild(section);
  });

  // ---------- recipe panel (right rail on desktop, bottom sheet on phones) ----------
  var panel = document.getElementById("recipe");
  var scrim = document.getElementById("scrim");
  var lastTrigger = null;

  function incoming() { return el("p", "incoming", "Incoming"); }

  function openRecipe(d, course, trigger) {
    lastTrigger = trigger;
    document.getElementById("recipe-course").textContent = course;
    document.getElementById("recipe-title").textContent = d.name;
    var who = document.getElementById("recipe-who");
    who.textContent = "";
    who.className = "tag-row";
    who.appendChild(tagFor(d.who, d.maybe ? " · maybe" : "", d.maybe));
    if (d.prep) who.appendChild(tagFor(d.prep, " · preps"));

    var ing = document.getElementById("recipe-ingredients");
    ing.textContent = "";
    if (d.ingredients && d.ingredients.length) {
      var ul = el("ul", "ing-list");
      d.ingredients.forEach(function (i) {
        var li = el("li");
        li.appendChild(el("span", "ing-amt", i.amount || ""));
        li.appendChild(el("span", "ing-item", i.item));
        ul.appendChild(li);
      });
      ing.appendChild(ul);
    } else ing.appendChild(incoming());

    var steps = document.getElementById("recipe-steps");
    steps.textContent = "";
    if (d.recipe && d.recipe.length) {
      var ol = el("ol", "step-list");
      d.recipe.forEach(function (s) { ol.appendChild(el("li", null, s)); });
      steps.appendChild(ol);
    } else steps.appendChild(incoming());

    var meta = document.getElementById("recipe-meta");
    meta.textContent = d.meta || "";
    meta.hidden = !d.meta;
    var src = document.getElementById("recipe-source");
    if (d.source && d.source.url) {
      src.href = d.source.url;
      src.textContent = "Original recipe: " + (d.source.label || d.source.url) + " ↗";
      src.hidden = false;
    } else src.hidden = true;

    panel.hidden = false; scrim.hidden = false;
    panel.scrollTop = 0;
    document.body.classList.add("recipe-open");
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { panel.classList.add("is-open"); scrim.classList.add("is-open"); });
    });
    document.getElementById("recipe-close").focus({ preventScroll: true });
  }

  function closeRecipe() {
    if (panel.hidden) return;
    panel.classList.remove("is-open"); scrim.classList.remove("is-open");
    document.body.classList.remove("recipe-open");
    setTimeout(function () { panel.hidden = true; scrim.hidden = true; }, 220);
    if (lastTrigger) lastTrigger.focus({ preventScroll: true });
  }

  document.getElementById("recipe-close").addEventListener("click", closeRecipe);
  scrim.addEventListener("click", closeRecipe);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeRecipe();
    // Keep Tab inside the panel while it's open.
    if (e.key === "Tab" && !panel.hidden) {
      var f = panel.querySelectorAll("button, a[href]");
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      else if (!panel.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
    }
  });

  // ---------- game plan ----------
  var tickets = [];
  EXTRA_TASKS.forEach(function (t) {
    tickets.push({ day: t.day, title: t.title, text: t.text, who: t.who === undefined ? null : t.who });
  });
  allDishes.forEach(function (d) {
    (d.tasks || []).forEach(function (t) {
      tickets.push({
        day: t.day, title: t.title || d.name, text: t.text,
        who: t.who !== undefined ? t.who : d.who,
        maybe: !!d.maybe,
      });
    });
  });
  var dayIndex = {};
  DAYS.forEach(function (d, i) { dayIndex[d.key] = i; });
  tickets.sort(function (a, b) { return dayIndex[a.day] - dayIndex[b.day]; });
  tickets.forEach(function (t, i) {
    t.id = t.day + ":" + slug(t.title) + ":" + slug(t.text);
    t.num = String(i + 1).padStart(2, "0");
  });

  var DONE_KEY = "tg26-done";
  var MOVES_KEY = "tg26-moves"; // ticket id -> day key it was dragged to
  var done = load(DONE_KEY);
  var moves = load(MOVES_KEY);
  var dayLabel = {};
  DAYS.forEach(function (d) { dayLabel[d.key] = d.label; });
  function dayOf(t) { return moves[t.id] && dayIndex[moves[t.id]] !== undefined ? moves[t.id] : t.day; }
  var todayISO = (function () {
    var n = new Date();
    return n.getFullYear() + "-" + String(n.getMonth() + 1).padStart(2, "0") + "-" + String(n.getDate()).padStart(2, "0");
  })();

  // Put a ticket in a column: a day key, or "done".
  function placeTicket(t, target) {
    if (target === "done") {
      done[t.id] = true;
    } else {
      delete done[t.id];
      if (target === t.day) delete moves[t.id]; else moves[t.id] = target;
    }
    save(DONE_KEY, done);
    save(MOVES_KEY, moves);
  }
  function columnOrder() { return DAYS.map(function (d) { return d.key; }).concat("done"); }

  var rail = document.getElementById("rail");
  var ticketById = {};
  tickets.forEach(function (t) { ticketById[t.id] = t; });

  function ticketEl(t) {
    var b = el("button", "ticket" + (done[t.id] ? " is-done" : "") + (t.maybe ? " is-maybe" : ""));
    b.type = "button";
    b.dataset.id = t.id;
    b.setAttribute("aria-pressed", done[t.id] ? "true" : "false");
    b.setAttribute("aria-keyshortcuts", "Shift+ArrowLeft Shift+ArrowRight");
    var cook = t.who && COOKS[t.who];
    b.dataset.tone = cook ? (cook.tone || "ink") : "open";
    b.appendChild(el("span", "ticket-title", "#" + t.num + " " + t.title));
    b.appendChild(el("span", "ticket-text", t.text));
    b.appendChild(el("span", "ticket-who", "→ " + (cook ? cook.name : "???") + (t.maybe ? " (maybe)" : "")));
    if (!done[t.id] && moves[t.id] && moves[t.id] !== t.day) b.appendChild(el("span", "ticket-moved", "↷ planned for " + dayLabel[t.day]));
    b.addEventListener("click", function () {
      if (done[t.id]) delete done[t.id]; else done[t.id] = true;
      save(DONE_KEY, done);
      renderRail();
    });
    // Keyboard: Shift + ←/→ moves the ticket one column over.
    b.addEventListener("keydown", function (e) {
      if (!e.shiftKey || (e.key !== "ArrowLeft" && e.key !== "ArrowRight")) return;
      e.preventDefault();
      var order = columnOrder();
      var i = order.indexOf(done[t.id] ? "done" : dayOf(t)) + (e.key === "ArrowLeft" ? -1 : 1);
      if (i < 0 || i >= order.length) return;
      placeTicket(t, order[i]);
      renderRail();
      var again = rail.querySelector('[data-id="' + CSS.escape(t.id) + '"]');
      if (again) { again.focus(); again.scrollIntoView({ block: "nearest", inline: "nearest" }); }
    });
    return b;
  }
  function column(label, sub, isToday, key) {
    var col = el("div", "col" + (isToday ? " is-today" : ""));
    col.dataset.col = key;
    var h = el("h3", "col-head");
    h.appendChild(document.createTextNode(label));
    if (sub) h.appendChild(el("span", null, " · " + sub));
    if (isToday) h.appendChild(el("span", "today-pill", "today"));
    col.appendChild(h);
    return col;
  }
  function renderRail() {
    rail.textContent = "";
    DAYS.forEach(function (d) {
      var col = column(d.label, d.sub, d.date === todayISO, d.key);
      var open = tickets.filter(function (t) { return dayOf(t) === d.key && !done[t.id]; });
      open.forEach(function (t) { col.appendChild(ticketEl(t)); });
      if (!open.length) col.appendChild(el("p", "col-empty", "All clear"));
      rail.appendChild(col);
    });
    var doneCol = column("Done ✓", "", false, "done");
    doneCol.classList.add("col-done");
    var finished = tickets.filter(function (t) { return done[t.id]; });
    finished.forEach(function (t) { doneCol.appendChild(ticketEl(t)); });
    if (!finished.length) doneCol.appendChild(el("p", "col-empty", "Nothing yet"));
    rail.appendChild(doneCol);
  }
  renderRail();

  // ---------- drag tickets between columns ----------
  // Mouse: press and move. Touch: press and hold, then drag (a quick swipe still scrolls).
  var drag = null;
  var swallowClick = false;
  function colAt(x, y) {
    var hit = document.elementFromPoint(x, y);
    return hit && hit.closest ? hit.closest("#rail .col") : null;
  }
  function startDrag() {
    var src = drag.src, r = src.getBoundingClientRect();
    var ghost = src.cloneNode(true);
    ghost.classList.add("ticket-ghost");
    ghost.removeAttribute("data-id");
    ghost.style.width = r.width + "px";
    document.body.appendChild(ghost);
    drag.ghost = ghost;
    drag.dx = drag.x0 - r.left; drag.dy = drag.y0 - r.top;
    drag.active = true;
    src.classList.add("is-dragging");
    rail.classList.add("is-drag-active");
    try { src.setPointerCapture(drag.pointerId); } catch (e) {}
    if (navigator.vibrate) navigator.vibrate(12);
    moveDrag(drag.x, drag.y);
    autoScroll();
  }
  function moveDrag(x, y) {
    drag.x = x; drag.y = y;
    drag.ghost.style.transform = "translate(" + (x - drag.dx) + "px," + (y - drag.dy) + "px) rotate(-2deg)";
    var col = colAt(x, y);
    if (col !== drag.over) {
      if (drag.over) drag.over.classList.remove("is-drop-target");
      if (col) col.classList.add("is-drop-target");
      drag.over = col;
    }
  }
  // Nudge the rail sideways when dragging near its edges (phone / tablet layout).
  function autoScroll() {
    if (!drag || !drag.active) return;
    var r = rail.getBoundingClientRect(), edge = 48, v = 0;
    if (drag.x < r.left + edge) v = -7; else if (drag.x > r.right - edge) v = 7;
    if (v && rail.scrollWidth > rail.clientWidth) { rail.scrollLeft += v; moveDrag(drag.x, drag.y); }
    drag.raf = requestAnimationFrame(autoScroll);
  }
  function endDrag(drop) {
    if (!drag) return;
    clearTimeout(drag.timer);
    if (drag.active) {
      cancelAnimationFrame(drag.raf);
      drag.ghost.remove();
      rail.classList.remove("is-drag-active");
      if (drag.over) drag.over.classList.remove("is-drop-target");
      var t = ticketById[drag.src.dataset.id];
      var target = drop && drag.over && drag.over.dataset.col;
      swallowClick = true;
      setTimeout(function () { swallowClick = false; }, 400);
      drag.src.classList.remove("is-dragging");
      if (t && target && target !== (done[t.id] ? "done" : dayOf(t))) {
        placeTicket(t, target);
        renderRail();
      }
    }
    drag = null;
  }
  rail.addEventListener("pointerdown", function (e) {
    var src = e.target.closest(".ticket");
    if (!src || (e.pointerType === "mouse" && e.button !== 0)) return;
    drag = { src: src, pointerId: e.pointerId, type: e.pointerType, x0: e.clientX, y0: e.clientY, x: e.clientX, y: e.clientY, active: false };
    if (e.pointerType !== "mouse") {
      drag.timer = setTimeout(function () { if (drag && !drag.active) startDrag(); }, 350);
    }
  });
  document.addEventListener("pointermove", function (e) {
    if (!drag || e.pointerId !== drag.pointerId) return;
    if (drag.active) { moveDrag(e.clientX, e.clientY); return; }
    var dist = Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0);
    drag.x = e.clientX; drag.y = e.clientY;
    if (drag.type === "mouse") { if (dist > 6) startDrag(); }
    else if (dist > 10) endDrag(false); // moved before the hold finished: it's a scroll
  });
  document.addEventListener("pointerup", function (e) { if (drag && e.pointerId === drag.pointerId) endDrag(true); });
  document.addEventListener("pointercancel", function (e) { if (drag && e.pointerId === drag.pointerId) endDrag(false); });
  // While a touch drag is live, stop the page from scrolling under the finger.
  document.addEventListener("touchmove", function (e) { if (drag && drag.active) e.preventDefault(); }, { passive: false });
  rail.addEventListener("contextmenu", function (e) { if (drag) e.preventDefault(); });
  document.addEventListener("click", function (e) {
    if (swallowClick) { e.stopPropagation(); e.preventDefault(); swallowClick = false; }
  }, true);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && drag) endDrag(false); });

  // ---------- Thursday oven schedule ----------
  var OVEN = window.OVEN;
  if (OVEN && document.getElementById("oven")) (function () {
    var DINNER_KEY = "tg26-meal";
    var list = document.getElementById("oven");
    var input = document.getElementById("dinner-time");
    var thuDay = DAYS.filter(function (d) { return d.key === "thu"; })[0];
    var dishByName = {}, courseByName = {};
    MENU.forEach(function (sec) { sec.dishes.forEach(function (d) { dishByName[d.name] = d; courseByName[d.name] = sec.course; }); });

    var saved = null;
    try { saved = localStorage.getItem(DINNER_KEY); } catch (e) {}
    input.value = saved || OVEN.dinner;

    function toMin(hhmm) { var p = hhmm.split(":"); return (+p[0]) * 60 + (+p[1]); }
    function fmt(m) {
      m = ((m % 1440) + 1440) % 1440;
      var h = Math.floor(m / 60), mm = String(m % 60).padStart(2, "0");
      return ((h % 12) || 12) + ":" + mm + (h < 12 ? "am" : "pm");
    }
    function heat(t) { return t === 0 ? "off" : t >= 425 ? "hot" : t >= 375 ? "mid" : "low"; }

    function render() {
      var dinner = toMin(input.value || OVEN.dinner);
      var now = new Date(), nowMin = null;
      if (thuDay && todayISO === thuDay.date) nowMin = now.getHours() * 60 + now.getMinutes();
      list.textContent = "";
      OVEN.steps.forEach(function (s) {
        var start = dinner + s.at, end = s.until != null ? dinner + s.until : null;
        var li = el("li", "oven-row" + (s.temp != null ? " is-temp" : "") + (s.optional ? " is-optional" : ""));
        if (nowMin != null && nowMin >= start && nowMin < (end != null ? end : start + 5)) li.classList.add("is-now");
        var label = fmt(start);
        if (end != null) {
          var a = fmt(start), z = fmt(end);
          label = (a.slice(-2) === z.slice(-2) ? a.slice(0, -2) : a) + "–" + z; // 12:30–1:15pm
        }
        li.appendChild(el("span", "oven-time", label));
        if (s.temp != null) {
          li.appendChild(el("span", "oven-temp heat-" + heat(s.temp), s.temp ? s.temp + "°" : "off"));
          li.appendChild(el("span", "oven-text", s.text));
        } else {
          var body = el("div", "oven-body");
          var head = el("div", "oven-head");
          var d = s.dish && dishByName[s.dish];
          if (d) {
            var b = nameEl(d, courseByName[s.dish]);
            b.classList.add("oven-dish");
            if (s.title) b.textContent = s.title;
            head.appendChild(b);
            head.appendChild(tagFor(d.who, "", d.maybe));
          } else {
            head.appendChild(el("span", "dish-name oven-dish", s.title || s.dish || ""));
          }
          if (s.optional) head.appendChild(el("span", "oven-opt", "optional"));
          body.appendChild(head);
          body.appendChild(el("p", "oven-text", s.text));
          li.appendChild(body);
        }
        list.appendChild(li);
      });
    }
    input.addEventListener("change", function () {
      if (!input.value) input.value = OVEN.dinner;
      try { localStorage.setItem(DINNER_KEY, input.value); } catch (e) {}
      render();
    });
    render();
    if (thuDay && todayISO === thuDay.date) setInterval(render, 60000);
  })();

  // ---------- shopping list ----------
  var lines = {}; // aisle -> item -> { amounts, dishes }
  allDishes.forEach(function (d) {
    if (d.shop === false) return;
    var label = d.name + (d.maybe ? " (maybe)" : "");
    (d.ingredients || []).forEach(function (ing) {
      var a = lines[ing.aisle] = lines[ing.aisle] || {};
      var row = a[ing.item] = a[ing.item] || { amounts: [], dishes: [] };
      if (ing.amount) row.amounts.push(ing.amount);
      if (row.dishes.indexOf(label) < 0) row.dishes.push(label);
    });
  });

  var SHOP_KEY = "tg26-shop";
  var got = load(SHOP_KEY);
  var aisles = document.getElementById("aisles");
  AISLES.forEach(function (aisle) {
    var items = lines[aisle.key];
    if (!items) return;
    var box = el("div", "aisle");
    box.appendChild(el("h3", null, aisle.label));
    var ul = el("ul");
    Object.keys(items).forEach(function (name) {
      var row = items[name];
      var id = aisle.key + ":" + slug(name);
      var li = el("li");
      var label = el("label", "check");
      var cb = el("input");
      cb.type = "checkbox";
      cb.checked = !!got[id];
      cb.addEventListener("change", function () {
        if (cb.checked) got[id] = true; else delete got[id];
        save(SHOP_KEY, got);
      });
      var text = el("span", "check-text");
      text.appendChild(el("span", "item", name));
      if (row.amounts.length) text.appendChild(el("span", "amt", " · " + row.amounts.join(" + ")));
      text.appendChild(el("span", "for", row.dishes.join(", ")));
      label.appendChild(cb);
      label.appendChild(text);
      li.appendChild(label);
      ul.appendChild(li);
    });
    box.appendChild(ul);
    aisles.appendChild(box);
  });

  // ---------- who's bringing what ----------
  var people = document.getElementById("people");
  var byCook = {};
  allDishes.forEach(function (d) {
    var k = d.who || "_open";
    (byCook[k] = byCook[k] || []).push(d.name + (d.maybe ? " (maybe)" : ""));
    if (d.prep) (byCook[d.prep] = byCook[d.prep] || []).push(d.name + " (prep)");
  });
  // Someone whose only dishes are maybes still gets a card.
  Object.keys(maybes).forEach(function (k) { if (order.indexOf(k) < 0) order.push(k); });
  order.concat(unclaimed ? ["_open"] : []).forEach(function (k) {
    var card = el("div", "person");
    card.appendChild(tagFor(k === "_open" ? null : k));
    var ul = el("ul");
    byCook[k].forEach(function (n) { ul.appendChild(el("li", null, n)); });
    card.appendChild(ul);
    people.appendChild(card);
  });

  // ---------- countdown ----------
  var dinner = new Date(2026, 10, 26);
  var today = new Date(); today.setHours(0, 0, 0, 0);
  var days = Math.round((dinner - today) / 86400000);
  var cd = document.getElementById("countdown");
  if (days > 1) cd.textContent = days + " days to go";
  else if (days === 1) cd.textContent = "Tomorrow!";
  else if (days === 0) cd.textContent = "Today!";
  if (days >= 0) cd.hidden = false;

  // ---------- nav: highlight the section in view ----------
  var links = document.querySelectorAll(".tabs a");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (a) {
          a.classList.toggle("is-active", a.getAttribute("href") === "#" + e.target.id);
        });
      });
    }, { rootMargin: "-30% 0px -60% 0px" });
    document.querySelectorAll("section.block").forEach(function (s) { io.observe(s); });
  }
})();
