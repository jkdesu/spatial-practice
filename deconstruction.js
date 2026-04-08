(function () {
  const STORAGE_KEY = "metatool_deconstruction_draft";

  const RULESET_BLANK = `DECONSTRUCTED MEAL SEQUENCE — RULESET (blank)
Attentional practice through eating sandwiches sequentially.

SETUP
Separate each ingredient on a plate: bread, protein, dressing, cheese, vegetables — discrete, not assembled.

INSTRUCTION SEQUENCE

1. OBSERVATION
Before eating, observe all components without touching them. Notice color, texture, and spatial arrangement.

2. PROTEIN
Begin with a chosen protein. Consume it alone, without accompaniment. Focus on texture, density, and aftertaste.

3. DRESSING
Add or taste the dressing separately. Attend to intensity, acidity, or sweetness.

4. CHEESE
Consume cheese in isolation. Notice how fat content alters perception and duration of taste.

5. VEGETABLES (FIBER)
Eat vegetables last (before optional bread). Focus on freshness, crunch, and contrast.

6. BREAD (OPTIONAL)
Eat the bread alone, or reconstruct the sandwich and take one final bite.

7. REFLECTION
Pause. Compare isolated experiences with the combined bite. Notice shifts in attention, desire, and satisfaction.

OUTCOME
Attention moves from the composite to the component; eating becomes a series of perceptual events.

---
Use the MetaTool Deconstruction page to type feelings after each step, then download your session log.
`;

  const EMOTION_HINTS = [
    { keys: ["guilt", "shame", "regret", "anxious", "anxiety", "stress", "worried", "fear", "bad"], h: 286, s: 58, l: 42 },
    { keys: ["fat", "heavy", "dense", "full", "stuffed"], h: 12, s: 62, l: 44 },
    { keys: ["comfort", "soft", "warm", "calm", "safe", "home", "familiar"], h: 38, s: 78, l: 68 },
    { keys: ["sweet", "happy", "good", "enjoy", "pleasure", "yum", "love"], h: 328, s: 70, l: 62 },
    { keys: ["fresh", "green", "clean", "crisp", "water", "light", "empty", "neutral"], h: 158, s: 45, l: 48 },
    { keys: ["crunch", "crispy", "sharp", "spicy", "hot", "alert", "zing"], h: 24, s: 88, l: 52 },
    { keys: ["sour", "acid", "tangy", "bitter"], h: 88, s: 55, l: 46 },
    { keys: ["salt", "salty", "savory", "umami"], h: 210, s: 35, l: 52 },
  ];

  const PLATE_STEPS = [
    { key: "observation", label: "1. Observation", ring: true },
    { key: "protein", label: "2. Protein", ring: true },
    { key: "dressing", label: "3. Dressing", ring: true },
    { key: "cheese", label: "4. Cheese", ring: true },
    { key: "vegetables", label: "5. Vegetables", ring: true },
    { key: "bread", label: "6. Bread", ring: true },
    { key: "reflection", label: "7. Reflection", ring: false },
  ];

  const fields = {
    sessionTitle: "decon-session-title",
    sessionDate: "decon-session-date",
    observation: "decon-observation",
    protein: "decon-protein",
    dressing: "decon-dressing",
    cheese: "decon-cheese",
    vegetables: "decon-vegetables",
    bread: "decon-bread",
    reflection: "decon-reflection",
  };

  const form = document.getElementById("decon-form");
  if (!form) return;

  const canvas = document.getElementById("emotional-plate");
  const legendEl = document.getElementById("plate-legend");
  const statusEl = document.getElementById("decon-status");

  function setStatus(msg) {
    if (statusEl) statusEl.textContent = msg || "";
  }

  function loadDraft() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      Object.entries(fields).forEach(([key, id]) => {
        const el = document.getElementById(id);
        if (el && data[key] != null) el.value = data[key];
      });
    } catch (_) {
      /* ignore */
    }
  }

  function saveDraft() {
    const data = {};
    Object.entries(fields).forEach(([key, id]) => {
      const el = document.getElementById(id);
      data[key] = el ? el.value : "";
    });
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (_) {
      /* ignore */
    }
  }

  function downloadText(filename, text) {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function downloadDataUrl(filename, dataUrl) {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = filename;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  function todayISODate() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  function getFieldText(key) {
    const id = fields[key];
    return (document.getElementById(id)?.value || "").trim();
  }

  function buildSessionText() {
    const title = getFieldText("sessionTitle") || "Sandwich session";
    const dateVal = document.getElementById(fields.sessionDate)?.value || todayISODate();
    return {
      text: [
        "META TOOL — DECONSTRUCTED SANDWICH SESSION LOG",
        `Title: ${title}`,
        `Date: ${dateVal}`,
        "",
        "=== 1. OBSERVATION (before eating, no touching) ===",
        getFieldText("observation") || "(empty)",
        "",
        "=== 2. PROTEIN (alone) — feelings / notes ===",
        getFieldText("protein") || "(empty)",
        "",
        "=== 3. DRESSING (separate) ===",
        getFieldText("dressing") || "(empty)",
        "",
        "=== 4. CHEESE (isolation) ===",
        getFieldText("cheese") || "(empty)",
        "",
        "=== 5. VEGETABLES / FIBER ===",
        getFieldText("vegetables") || "(empty)",
        "",
        "=== 6. BREAD (alone or reconstructed bite) ===",
        getFieldText("bread") || "(empty)",
        "",
        "=== 7. REFLECTION ===",
        getFieldText("reflection") || "(empty)",
        "",
        "---",
        "Exported from MetaTool (deconstruction.html)",
      ].join("\n"),
      dateVal,
    };
  }

  function hashHue(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return Math.abs(h) % 360;
  }

  function colorFromNote(text) {
    const lower = text.toLowerCase();
    for (let i = 0; i < EMOTION_HINTS.length; i++) {
      const row = EMOTION_HINTS[i];
      for (let j = 0; j < row.keys.length; j++) {
        if (lower.includes(row.keys[j])) {
          return { h: row.h, s: row.s, l: row.l, tag: row.keys[j] };
        }
      }
    }
    const hue = text.length ? hashHue(text) : 45;
    return { h: hue, s: 38, l: 72, tag: null };
  }

  function hsla(h, s, l, a) {
    return `hsla(${h},${s}%,${l}%,${a})`;
  }

  function hslSolid(h, s, l) {
    return `hsl(${h},${s}%,${l}%)`;
  }

  /** Concentric rings: outer → inner = observation … bread; hub = reflection. */
  const RING_KEYS_OUTER_IN = ["observation", "protein", "dressing", "cheese", "vegetables", "bread"];

  function stepHsl(key) {
    const t = getFieldText(key);
    const c = colorFromNote(t);
    const boost = Math.min(22, Math.sqrt(Math.max(t.length, 0)) * 1.8);
    return { h: c.h, s: Math.min(100, c.s + boost * 0.35), l: Math.max(18, Math.min(78, c.l + boost * 0.12)) };
  }

  function wedgeColor(base, ringIdx, segIdx, totalChars) {
    const w =
      Math.sin(segIdx * 0.42 + ringIdx * 1.1 + totalChars * 0.002) * 14 +
      Math.sin(segIdx * 0.19 - ringIdx * 0.7) * 10;
    const w2 = ((segIdx + ringIdx) & 1) === 0 ? 6 : -5;
    return {
      h: (base.h + w + 360) % 360,
      s: Math.min(100, Math.max(0, base.s + w2 * 0.4)),
      l: Math.max(12, Math.min(88, base.l + w * 0.35 + w2)),
    };
  }

  function drawAnnularSector(ctx, cx, cy, rInner, rOuter, a0, a1) {
    ctx.beginPath();
    ctx.arc(cx, cy, rOuter, a0, a1, false);
    ctx.arc(cx, cy, rInner, a1, a0, true);
    ctx.closePath();
    ctx.fill();
  }

  function drawPlate() {
    if (!canvas || !legendEl) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cssW = 680;
    const cssH = 400;
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    canvas.style.width = `${cssW}px`;
    canvas.style.height = `${cssH}px`;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, cssW, cssH);

    const cx = cssW / 2;
    const cy = cssH / 2;
    const margin = 14;
    const Rplate = Math.min(cssW, cssH) / 2 - margin;

    const refText = getFieldText("reflection");
    const refHsl = stepHsl("reflection");
    const ringHsl = RING_KEYS_OUTER_IN.map(function (k) {
      return stepHsl(k);
    });

    let totalChars = refText.length;
    for (let r = 0; r < RING_KEYS_OUTER_IN.length; r++) {
      totalChars += getFieldText(RING_KEYS_OUTER_IN[r]).length;
    }

    /* Rectangle field; circle sits inside (not a “dinner plate” fill — frame only). */
    ctx.fillStyle = "#07070c";
    ctx.fillRect(0, 0, cssW, cssH);

    const numSeg = 72;
    const twoPi = Math.PI * 2;
    const segAngle = twoPi / numSeg;
    const hubR = Rplate * 0.13;
    const annulus = Rplate - hubR;
    const bandH = annulus / RING_KEYS_OUTER_IN.length;

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, Rplate, 0, twoPi);
    ctx.clip();

    /* Center hub: reflection, same polar slices */
    for (let s = 0; s < numSeg; s++) {
      const a0 = -Math.PI / 2 + s * segAngle;
      const a1 = a0 + segAngle;
      const c = wedgeColor(refHsl, RING_KEYS_OUTER_IN.length, s, totalChars);
      ctx.fillStyle = hslSolid(c.h, c.s, c.l);
      drawAnnularSector(ctx, cx, cy, 0, hubR - 0.5, a0, a1);
    }

    /* Six annuli: outer = observation … inner = bread */
    for (let ring = 0; ring < RING_KEYS_OUTER_IN.length; ring++) {
      const rOuter = Rplate - ring * bandH;
      const rInner = Rplate - (ring + 1) * bandH;
      const base = ringHsl[ring];
      for (let s = 0; s < numSeg; s++) {
        const a0 = -Math.PI / 2 + s * segAngle;
        const a1 = a0 + segAngle;
        const c = wedgeColor(base, ring, s, totalChars);
        ctx.fillStyle = hslSolid(c.h, c.s, c.l);
        drawAnnularSector(ctx, cx, cy, rInner, rOuter - 0.25, a0, a1);
      }
    }

    ctx.restore();

    /* Crisp separators: radial lines + ring circles */
    ctx.strokeStyle = "rgba(0,0,0,0.45)";
    ctx.lineWidth = 0.6;
    for (let s = 0; s < numSeg; s++) {
      const a = -Math.PI / 2 + s * segAngle;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(a) * Rplate, cy + Math.sin(a) * Rplate);
      ctx.stroke();
    }
    for (let k = 1; k <= RING_KEYS_OUTER_IN.length; k++) {
      const rr = Rplate - k * bandH;
      ctx.beginPath();
      ctx.arc(cx, cy, rr, 0, twoPi);
      ctx.stroke();
    }

    /* Outer rim of the disc */
    ctx.strokeStyle = "#f2f2f2";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(cx, cy, Rplate, 0, twoPi);
    ctx.stroke();

    const legendParts = [];
    for (let i = 0; i < RING_KEYS_OUTER_IN.length; i++) {
      const ringNote =
        i === 0 ? " — outer ring" : i === RING_KEYS_OUTER_IN.length - 1 ? " — inner ring" : "";
      legendParts.push({
        label: PLATE_STEPS[i].label + ringNote,
        color: hslSolid(ringHsl[i].h, ringHsl[i].s, ringHsl[i].l),
      });
    }
    legendParts.push({
      label: "7. Reflection (center hub)",
      color: hslSolid(refHsl.h, refHsl.s, refHsl.l),
    });

    legendEl.innerHTML = legendParts
      .map(
        (item) =>
          `<li><span class="swatch" style="background:${item.color}"></span><span>${escapeHtml(item.label)}</span></li>`
      )
      .join("");
  }

  function escapeHtml(s) {
    return s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  let plateTimer = null;
  function schedulePlate() {
    if (plateTimer) window.clearTimeout(plateTimer);
    plateTimer = window.setTimeout(function () {
      plateTimer = null;
      drawPlate();
    }, 120);
  }

  document.querySelectorAll(".decon-btn-ruleset").forEach(function (btn) {
    btn.addEventListener("click", function () {
      downloadText("metatool-deconstruction-ruleset.txt", RULESET_BLANK);
      setStatus("Downloaded blank ruleset — check your Downloads folder.");
    });
  });

  document.querySelectorAll(".decon-btn-session").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const { text, dateVal } = buildSessionText();
      const safeDate = dateVal.replace(/[^\d-]/g, "") || todayISODate();
      downloadText(`metatool-session-${safeDate}.txt`, text);
      setStatus("Exported session — saved as .txt in Downloads (nothing uploaded).");
    });
  });

  document.querySelectorAll(".decon-btn-plate").forEach(function (btn) {
    btn.addEventListener("click", function () {
      drawPlate();
      const dateVal = document.getElementById(fields.sessionDate)?.value || todayISODate();
      const safeDate = dateVal.replace(/[^\d-]/g, "") || todayISODate();
      try {
        const url = canvas.toDataURL("image/png");
        downloadDataUrl(`metatool-emotional-plate-${safeDate}.png`, url);
        setStatus("Downloaded emotional plate as .png.");
      } catch (e) {
        setStatus("Could not export plate image in this browser.");
      }
    });
  });

  document.querySelectorAll(".decon-btn-clear").forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (!window.confirm("Clear all fields and saved draft in this browser?")) return;
      Object.values(fields).forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.value = "";
      });
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (_) {
        /* ignore */
      }
      const dateEl = document.getElementById(fields.sessionDate);
      if (dateEl) dateEl.value = todayISODate();
      drawPlate();
      setStatus("Cleared.");
    });
  });

  Object.values(fields).forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("input", function () {
      saveDraft();
      schedulePlate();
    });
  });

  if (!document.getElementById(fields.sessionDate)?.value) {
    const dateEl = document.getElementById(fields.sessionDate);
    if (dateEl) dateEl.value = todayISODate();
  }

  loadDraft();
  drawPlate();
  window.addEventListener("resize", schedulePlate);
})();
