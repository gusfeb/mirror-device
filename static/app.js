/**
 * DeskFlow - iPhone Controller Client (Large Thumb-Friendly, Landscape, & Frameless Mode)
 * Includes edge-to-edge frameless screen view, on-screen gaming-style controls,
 * zoom-and-pan desktop view, and zero-latency WebSocket engine.
 */

(function () {
  // --- DOM Elements ---
  const connectionPill = document.getElementById("connection-pill");
  const connectionText = document.getElementById("connection-text");
  const deviceInfo = document.getElementById("device-info");
  const btnFullscreenToggle = document.getElementById("btn-fullscreen-toggle");

  // Tabs
  const navTabs = document.querySelectorAll(".nav-tab");
  const viewPanels = document.querySelectorAll(".view-panel");

  // Trackpad Elements
  const trackpadArea = document.getElementById("trackpad-area");
  const trackpadRipple = document.getElementById("trackpad-ripple");
  const trackpadHint = document.getElementById("trackpad-hint");
  const scrollStrip = document.getElementById("scroll-strip");
  const btnLeftClick = document.getElementById("btn-left-click");
  const btnRightClick = document.getElementById("btn-right-click");
  const btnDragLock = document.getElementById("btn-drag-lock");
  const dragStatusText = document.getElementById("drag-status-text");
  const btnDoubleClick = document.getElementById("btn-double-click");
  const btnMiddleClick = document.getElementById("btn-middle-click");
  const sliderSensitivity = document.getElementById("slider-sensitivity");
  const valSensitivity = document.getElementById("val-sensitivity");

  // Screen Elements (Standard View)
  const screenImg = document.getElementById("screen-img");
  const screenLoading = document.getElementById("screen-loading");
  const screenZoomWrapper = document.getElementById("screen-zoom-wrapper");
  const btnToggleStream = document.getElementById("btn-toggle-stream");
  const streamIcon = document.getElementById("stream-icon");
  const streamLabel = document.getElementById("stream-label");
  const btnRefreshScreen = document.getElementById("btn-refresh-screen");
  const btnDirectTouch = document.getElementById("btn-direct-touch");
  const screenPointer = document.getElementById("screen-pointer");
  const zoomButtons = document.querySelectorAll(".btn-zoom");
  const btnScreenLeft = document.getElementById("btn-screen-left");
  const btnScreenDouble = document.getElementById("btn-screen-double");
  const btnScreenRight = document.getElementById("btn-screen-right");

  // Landscape Floating HUD Elements
  const landscapeHud = document.getElementById("landscape-hud");
  const hudToggleStream = document.getElementById("hud-toggle-stream");
  const hudLaunchFrameless = document.getElementById("hud-launch-frameless");
  const hudZoom = document.getElementById("hud-zoom");
  const hudKeyboard = document.getElementById("hud-keyboard");
  const hudTrackpad = document.getElementById("hud-trackpad");
  const hudFullscreen = document.getElementById("hud-fullscreen");
  const hudToggleVisibility = document.getElementById("hud-toggle-visibility");
  const btnReopenHud = document.getElementById("btn-reopen-hud");
  const btnThumbLeft = document.getElementById("btn-thumb-left");
  const btnThumbRight = document.getElementById("btn-thumb-right");

  // Frameless Mode Elements
  const btnLaunchFrameless = document.getElementById("btn-launch-frameless");
  const framelessOverlay = document.getElementById("frameless-overlay");
  const framelessImg = document.getElementById("frameless-img");
  const framelessPointer = document.getElementById("frameless-pointer");
  const framelessZoomWrapper = document.getElementById("frameless-zoom-wrapper");
  const framelessTopHud = document.getElementById("frameless-top-hud");
  const flBtnExit = document.getElementById("fl-btn-exit");
  const flBtnFit = document.getElementById("fl-btn-fit");
  const flBtnZoom = document.getElementById("fl-btn-zoom");
  const flBtnKeyboard = document.getElementById("fl-btn-keyboard");
  const flBtnGhost = document.getElementById("fl-btn-ghost");
  const flBtnHideHud = document.getElementById("fl-btn-hide-hud");
  const flBtnReopen = document.getElementById("fl-btn-reopen");
  const flThumbLeft = document.getElementById("fl-thumb-left");
  const flThumbRight = document.getElementById("fl-thumb-right");
  const flClickLeft = document.getElementById("fl-click-left");
  const flClickRight = document.getElementById("fl-click-right");
  const flClickDouble = document.getElementById("fl-click-double");
  const flClickMiddle = document.getElementById("fl-click-middle");
  const flDragLock = document.getElementById("fl-drag-lock");
  const flTouchToggle = document.getElementById("fl-touch-toggle");
  const flScrollStrip = document.getElementById("fl-scroll-strip");

  // Frameless Typing Drawer
  const framelessDrawer = document.getElementById("frameless-drawer");
  const flTypingInput = document.getElementById("fl-typing-input");
  const flBtnSendText = document.getElementById("fl-btn-send-text");
  const flBtnCloseDrawer = document.getElementById("fl-btn-close-drawer");

  // Windows Selector Elements
  const panelWindows = document.getElementById("panel-windows");
  const windowsSearchInput = document.getElementById("windows-search-input");
  const btnRefreshWindows = document.getElementById("btn-refresh-windows");
  const windowsCount = document.getElementById("windows-count");
  const windowsCardsGrid = document.getElementById("windows-cards-grid");

  // Frameless Windows Switcher Modal Elements
  const flBtnWindows = document.getElementById("fl-btn-windows");
  const flWindowsModal = document.getElementById("fl-windows-modal");
  const flWinBtnRefresh = document.getElementById("fl-win-btn-refresh");
  const flWinBtnClose = document.getElementById("fl-win-btn-close");
  const flWinSearchInput = document.getElementById("fl-win-search-input");
  const flWinCardsGrid = document.getElementById("fl-win-cards-grid");

  // Keyboard Elements
  const keyboardInput = document.getElementById("keyboard-input");
  const btnSendText = document.getElementById("btn-send-text");

  // Modal Elements
  const confirmModal = document.getElementById("confirm-modal");
  const modalTitle = document.getElementById("modal-title");
  const modalDesc = document.getElementById("modal-desc");
  const btnModalCancel = document.getElementById("btn-modal-cancel");
  const btnModalConfirm = document.getElementById("btn-modal-confirm");

  // --- State Variables ---
  let ws = null;
  let isConnected = false;
  let isDragging = false;
  let isStreaming = false;
  let isDirectTouchActive = true;
  let isFramelessActive = false;
  let isGhostModeActive = false;
  let isFillModeActive = false;
  let currentZoom = 1;
  let currentTab = "trackpad";
  let pendingSystemAction = null;
  let sensitivity = parseFloat(localStorage.getItem("deskflow_sensitivity") || "1.8");
  let cachedWindows = [];
  let windowsSearchQuery = "";
  let flWindowsSearchQuery = "";

  sliderSensitivity.value = sensitivity;
  valSensitivity.textContent = sensitivity.toFixed(1) + "x";

  // --- Orientation & Active Tab State Management ---
  function updateOrientationState() {
    const isLandscape = window.innerWidth > window.innerHeight;
    document.body.classList.toggle("is-landscape", isLandscape);
    document.body.classList.toggle("is-portrait", !isLandscape);

    ["trackpad", "screen", "phonescreen", "windows", "keyboard", "system"].forEach((t) => {
      document.body.classList.toggle(`tab-${t}`, t === currentTab);
    });
  }

  window.addEventListener("resize", updateOrientationState);
  window.addEventListener("orientationchange", updateOrientationState);

  function setActiveTab(targetTab) {
    currentTab = targetTab;
    navTabs.forEach((t) => {
      t.classList.toggle("active", t.getAttribute("data-tab") === targetTab);
    });
    viewPanels.forEach((p) => {
      p.classList.toggle("active", p.id === `panel-${targetTab}`);
    });
    updateOrientationState();

    if (targetTab === "screen" && !isStreaming) {
      startStream();
    } else if (targetTab === "windows") {
      fetchWindows();
    }
  }

  navTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      triggerHaptic(10);
      const target = tab.getAttribute("data-tab");
      setActiveTab(target);
    });
  });

  // --- WebSocket Connection ---
  function connectWebSocket() {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      isConnected = true;
      connectionPill.className = "status-pill connected";
      connectionText.textContent = "Online";
      fetchSystemInfo();
      fetchWindows();
    };

    ws.onmessage = (event) => {
      try {
        if (typeof event.data === "string") {
          const msg = JSON.parse(event.data);
          if (msg.type === "windows_list" && Array.isArray(msg.windows)) {
            cachedWindows = msg.windows;
            renderWindowsCards();
            renderFramelessWindows();
          }
        }
      } catch (e) {
        // Binary frame or non-json message
      }
    };

    ws.onclose = () => {
      isConnected = false;
      connectionPill.className = "status-pill disconnected";
      connectionText.textContent = "Offline";
      setTimeout(connectWebSocket, 1500);
    };

    ws.onerror = () => {
      if (ws) ws.close();
    };
  }

  function sendWS(data) {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    }
  }

  function triggerHaptic(duration = 10) {
    if (navigator.vibrate) {
      navigator.vibrate(duration);
    }
  }

  // --- Fetch System Info ---
  async function fetchSystemInfo() {
    try {
      const res = await fetch("/api/info");
      const data = await res.json();
      if (data.hostname) {
        deviceInfo.textContent = `${data.hostname} • ${data.screen_width}x${data.screen_height}`;
      }
    } catch (e) {
      deviceInfo.textContent = "Windows Desktop";
    }
  }

  // --- Fullscreen Toggle ---
  function toggleFullscreen() {
    triggerHaptic(12);
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else if (document.documentElement.webkitRequestFullscreen) {
        document.documentElement.webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    }
  }

  btnFullscreenToggle.addEventListener("click", toggleFullscreen);
  hudFullscreen.addEventListener("click", toggleFullscreen);

  // --- Trackpad Sensitivity ---
  sliderSensitivity.addEventListener("input", (e) => {
    sensitivity = parseFloat(e.target.value);
    valSensitivity.textContent = sensitivity.toFixed(1) + "x";
    localStorage.setItem("deskflow_sensitivity", sensitivity);
  });

  // --- Trackpad Gesture Engine ---
  let touchStartTime = 0;
  let startX = 0, startY = 0;
  let lastX = 0, lastY = 0;
  let touchCount = 0;
  let totalMoved = 0;
  let hintHidden = false;

  trackpadArea.addEventListener("touchstart", (e) => {
    if (e.target === scrollStrip || scrollStrip.contains(e.target)) return;

    e.preventDefault();
    touchCount = e.touches.length;
    touchStartTime = Date.now();
    totalMoved = 0;

    if (!hintHidden && trackpadHint) {
      trackpadHint.style.opacity = "0";
      hintHidden = true;
    }

    if (touchCount === 1) {
      const t = e.touches[0];
      startX = lastX = t.clientX;
      startY = lastY = t.clientY;

      const rect = trackpadArea.getBoundingClientRect();
      trackpadRipple.style.left = `${t.clientX - rect.left}px`;
      trackpadRipple.style.top = `${t.clientY - rect.top}px`;
      trackpadRipple.classList.add("active");
    } else if (touchCount === 2) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      startY = (t1.clientY + t2.clientY) / 2;
      lastY = startY;
      startX = (t1.clientX + t2.clientX) / 2;
      lastX = startX;
    }
  }, { passive: false });

  trackpadArea.addEventListener("touchmove", (e) => {
    if (e.target === scrollStrip || scrollStrip.contains(e.target)) return;

    e.preventDefault();
    const currentTouches = e.touches.length;

    if (currentTouches === 1) {
      const t = e.touches[0];
      const rawDx = t.clientX - lastX;
      const rawDy = t.clientY - lastY;
      lastX = t.clientX;
      lastY = t.clientY;

      const dist = Math.hypot(rawDx, rawDy);
      totalMoved += dist;

      if (dist < 1.0) return;

      const accel = Math.min(2.4, 1.0 + dist * 0.04);
      const dx = rawDx * sensitivity * accel;
      const dy = rawDy * sensitivity * accel;

      sendWS({ type: "mouse_move", dx, dy });

      const rect = trackpadArea.getBoundingClientRect();
      trackpadRipple.style.left = `${t.clientX - rect.left}px`;
      trackpadRipple.style.top = `${t.clientY - rect.top}px`;
    } else if (currentTouches === 2) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const midY = (t1.clientY + t2.clientY) / 2;
      const rawDy = midY - lastY;
      lastY = midY;

      const midX = (t1.clientX + t2.clientX) / 2;
      const rawDx = midX - lastX;
      lastX = midX;

      const scrollDeltaY = rawDy * 22;
      const scrollDeltaX = rawDx * -18;
      totalMoved += Math.hypot(rawDx, rawDy);

      sendWS({ type: "mouse_scroll", dy: scrollDeltaY, dx: scrollDeltaX });
    }
  }, { passive: false });

  trackpadArea.addEventListener("touchend", (e) => {
    if (e.target === scrollStrip || scrollStrip.contains(e.target)) return;

    e.preventDefault();
    trackpadRipple.classList.remove("active");
    const duration = Date.now() - touchStartTime;

    if (duration < 250 && totalMoved < 8) {
      if (touchCount === 1) {
        triggerHaptic(12);
        sendWS({ type: "mouse_click", button: "left" });
      } else if (touchCount === 2) {
        triggerHaptic(20);
        sendWS({ type: "mouse_click", button: "right" });
      }
    }
  }, { passive: false });

  // --- Right Edge Scroll Strip ---
  let stripLastY = 0;
  function handleScrollStrip(el) {
    el.addEventListener("touchstart", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.touches.length > 0) {
        stripLastY = e.touches[0].clientY;
        triggerHaptic(10);
      }
    }, { passive: false });

    el.addEventListener("touchmove", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.touches.length > 0) {
        const currentY = e.touches[0].clientY;
        const deltaY = currentY - stripLastY;
        stripLastY = currentY;

        const scrollVal = deltaY * 26;
        sendWS({ type: "mouse_scroll", dy: scrollVal, dx: 0 });
      }
    }, { passive: false });
  }

  handleScrollStrip(scrollStrip);
  handleScrollStrip(flScrollStrip);

  // --- Mouse Buttons Dispatch ---
  function setupMouseClick(button, action = "mouse_click", btnType = "left") {
    button.addEventListener("click", () => {
      triggerHaptic(15);
      sendWS({ type: action, button: btnType });
    });
  }

  setupMouseClick(btnLeftClick, "mouse_click", "left");
  setupMouseClick(flClickLeft, "mouse_click", "left");
  setupMouseClick(btnRightClick, "mouse_click", "right");
  setupMouseClick(flClickRight, "mouse_click", "right");
  setupMouseClick(btnDoubleClick, "mouse_double_click", "left");
  setupMouseClick(flClickDouble, "mouse_double_click", "left");
  setupMouseClick(btnMiddleClick, "mouse_click", "middle");
  setupMouseClick(flClickMiddle, "mouse_click", "middle");

  function toggleDragLock(statusElement, ...btnList) {
    isDragging = !isDragging;
    triggerHaptic(25);
    btnList.forEach((b) => b.classList.toggle("held", isDragging));
    if (statusElement) statusElement.textContent = isDragging ? "Tahan" : "Lepas";
    sendWS({ type: isDragging ? "mouse_down" : "mouse_up", button: "left" });
  }

  btnDragLock.addEventListener("click", () => toggleDragLock(dragStatusText, btnDragLock, flDragLock));
  flDragLock.addEventListener("click", () => toggleDragLock(dragStatusText, btnDragLock, flDragLock));

  // --- Screen Stream Start/Stop ---
  function startStream() {
    isStreaming = true;
    const streamUrl = `/stream?fps=20&quality=55&width=1152&t=${Date.now()}`;
    screenImg.style.display = "block";
    screenLoading.style.display = "none";
    screenImg.src = streamUrl;
    framelessImg.src = streamUrl;

    btnToggleStream.classList.add("active");
    streamIcon.textContent = "⏹";
    streamLabel.textContent = "Hentikan Layar";
    hudToggleStream.textContent = "⏹ Stop";
  }

  function stopStream() {
    isStreaming = false;
    screenImg.src = "";
    framelessImg.src = "";
    screenImg.style.display = "none";
    screenLoading.style.display = "flex";

    btnToggleStream.classList.remove("active");
    streamIcon.textContent = "▶";
    streamLabel.textContent = "Mulai Layar Live";
    hudToggleStream.textContent = "▶ Mulai";
  }

  btnToggleStream.addEventListener("click", () => {
    triggerHaptic(15);
    isStreaming ? stopStream() : startStream();
  });

  hudToggleStream.addEventListener("click", () => {
    triggerHaptic(15);
    isStreaming ? stopStream() : startStream();
  });

  btnRefreshScreen.addEventListener("click", () => {
    triggerHaptic(15);
    const snapUrl = `/api/screenshot?quality=80&width=1280&t=${Date.now()}`;
    screenImg.style.display = "block";
    screenLoading.style.display = "none";
    screenImg.src = snapUrl;
    framelessImg.src = snapUrl;
  });

  btnDirectTouch.addEventListener("click", () => {
    isDirectTouchActive = !isDirectTouchActive;
    btnDirectTouch.classList.toggle("active", isDirectTouchActive);
    flTouchToggle.classList.toggle("active", isDirectTouchActive);
    triggerHaptic(10);
  });

  flTouchToggle.addEventListener("click", () => {
    isDirectTouchActive = !isDirectTouchActive;
    btnDirectTouch.classList.toggle("active", isDirectTouchActive);
    flTouchToggle.classList.toggle("active", isDirectTouchActive);
    triggerHaptic(10);
  });

  // --- Zoom Engine ---
  function applyZoom(zoomFactor) {
    currentZoom = zoomFactor;
    zoomButtons.forEach((btn) => {
      const z = parseFloat(btn.getAttribute("data-zoom"));
      btn.classList.toggle("active", z === currentZoom);
    });

    hudZoom.textContent = `🔍 ${currentZoom}x`;
    flBtnZoom.textContent = `🔍 ${currentZoom}x`;

    const w = currentZoom === 1 ? "100%" : `${currentZoom * 100}%`;
    const h = currentZoom === 1 ? "100%" : `${currentZoom * 100}%`;
    screenZoomWrapper.style.width = w;
    screenZoomWrapper.style.height = h;
    framelessZoomWrapper.style.width = w;
    framelessZoomWrapper.style.height = h;
  }

  zoomButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      triggerHaptic(12);
      applyZoom(parseFloat(btn.getAttribute("data-zoom")));
    });
  });

  function cycleZoom() {
    triggerHaptic(12);
    const zoomCycle = [1, 1.5, 2, 3];
    const idx = zoomCycle.indexOf(currentZoom);
    applyZoom(zoomCycle[(idx + 1) % zoomCycle.length]);
  }

  hudZoom.addEventListener("click", cycleZoom);
  flBtnZoom.addEventListener("click", cycleZoom);

  // --- Direct Touch on Screen Image (Both Standard & Frameless) ---
  function attachDirectTouch(targetImg, pointerEl, wrapperEl) {
    targetImg.addEventListener("touchstart", (e) => {
      if (!isDirectTouchActive || e.touches.length !== 1) return;
      const t = e.touches[0];
      const rect = targetImg.getBoundingClientRect();

      if (
        t.clientX >= rect.left &&
        t.clientX <= rect.right &&
        t.clientY >= rect.top &&
        t.clientY <= rect.bottom
      ) {
        e.preventDefault();
        triggerHaptic(15);

        const normX = (t.clientX - rect.left) / rect.width;
        const normY = (t.clientY - rect.top) / rect.height;

        const wrapperRect = wrapperEl.getBoundingClientRect();
        pointerEl.style.left = `${t.clientX - wrapperRect.left}px`;
        pointerEl.style.top = `${t.clientY - wrapperRect.top}px`;
        pointerEl.classList.add("visible");
        setTimeout(() => pointerEl.classList.remove("visible"), 320);

        sendWS({
          type: "mouse_abs",
          x: normX,
          y: normY,
          click: "left",
        });
      }
    }, { passive: false });
  }

  attachDirectTouch(screenImg, screenPointer, screenZoomWrapper);
  attachDirectTouch(framelessImg, framelessPointer, framelessZoomWrapper);

  // Screen bottom click helpers
  setupMouseClick(btnScreenLeft, "mouse_click", "left");
  setupMouseClick(btnScreenDouble, "mouse_double_click", "left");
  setupMouseClick(btnScreenRight, "mouse_click", "right");

  // Landscape HUD helpers
  hudKeyboard.addEventListener("click", () => {
    triggerHaptic(12);
    setActiveTab("keyboard");
  });

  hudTrackpad.addEventListener("click", () => {
    triggerHaptic(12);
    setActiveTab("trackpad");
  });

  hudToggleVisibility.addEventListener("click", () => {
    triggerHaptic(10);
    landscapeHud.classList.add("hidden");
    btnReopenHud.classList.add("visible");
  });

  btnReopenHud.addEventListener("click", () => {
    triggerHaptic(10);
    landscapeHud.classList.remove("hidden");
    btnReopenHud.classList.remove("visible");
  });

  setupMouseClick(btnThumbLeft, "mouse_click", "left");
  setupMouseClick(btnThumbRight, "mouse_click", "right");

  // =================================================
  // 🌟 FRAMELESS MODE CONTROLLER 🌟
  // =================================================
  function enterFramelessMode() {
    isFramelessActive = true;
    framelessOverlay.classList.add("active");
    document.body.classList.add("in-frameless-mode");
    triggerHaptic(20);

    // Ensure stream is active
    if (!isStreaming) {
      startStream();
    } else {
      framelessImg.src = screenImg.src;
    }

    // Try full screen
    toggleFullscreen();
  }

  function exitFramelessMode() {
    isFramelessActive = false;
    framelessOverlay.classList.remove("active");
    document.body.classList.remove("in-frameless-mode");
    triggerHaptic(15);
  }

  btnLaunchFrameless.addEventListener("click", enterFramelessMode);
  hudLaunchFrameless.addEventListener("click", enterFramelessMode);
  flBtnExit.addEventListener("click", exitFramelessMode);

  // Fit vs Fill Mode
  flBtnFit.addEventListener("click", () => {
    triggerHaptic(12);
    isFillModeActive = !isFillModeActive;
    framelessImg.classList.toggle("fill-mode", isFillModeActive);
    flBtnFit.textContent = isFillModeActive ? "⛶ Penuh (Fill)" : "⛶ Pas (Fit)";
  });

  // Ghost Mode (Semi-transparent controls)
  flBtnGhost.addEventListener("click", () => {
    triggerHaptic(12);
    isGhostModeActive = !isGhostModeActive;
    framelessTopHud.classList.toggle("ghost-mode", isGhostModeActive);
    flThumbLeft.classList.toggle("ghost-mode", isGhostModeActive);
    flThumbRight.classList.toggle("ghost-mode", isGhostModeActive);
    flBtnGhost.textContent = isGhostModeActive ? "👻 Ghost ON" : "👻 Ghost";
  });

  // Hide All HUD & Controls in Frameless Mode
  flBtnHideHud.addEventListener("click", () => {
    triggerHaptic(10);
    framelessTopHud.classList.add("hidden");
    flThumbLeft.classList.add("hidden");
    flThumbRight.classList.add("hidden");
    flBtnReopen.classList.add("visible");
  });

  flBtnReopen.addEventListener("click", () => {
    triggerHaptic(10);
    framelessTopHud.classList.remove("hidden");
    flThumbLeft.classList.remove("hidden");
    flThumbRight.classList.remove("hidden");
    flBtnReopen.classList.remove("visible");
  });

  // Frameless Typing Drawer
  flBtnKeyboard.addEventListener("click", () => {
    triggerHaptic(12);
    framelessDrawer.classList.add("active");
    flTypingInput.focus();
  });

  flBtnCloseDrawer.addEventListener("click", () => {
    triggerHaptic(10);
    framelessDrawer.classList.remove("active");
  });

  function sendFramelessText() {
    const text = flTypingInput.value;
    if (text) {
      triggerHaptic(15);
      sendWS({ type: "type_text", text });
      flTypingInput.value = "";
    }
  }

  flBtnSendText.addEventListener("click", sendFramelessText);
  flTypingInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendFramelessText();
    }
  });

  // --- Keyboard & Shortcuts Dispatch ---
  function sendStandardTypedText() {
    const text = keyboardInput.value;
    if (text) {
      triggerHaptic(15);
      sendWS({ type: "type_text", text });
      keyboardInput.value = "";
    }
  }

  btnSendText.addEventListener("click", sendStandardTypedText);
  keyboardInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendStandardTypedText();
    }
  });

  document.querySelectorAll("[data-key]").forEach((btn) => {
    btn.addEventListener("click", () => {
      triggerHaptic(14);
      const key = btn.getAttribute("data-key");
      sendWS({ type: "key", key });
    });
  });

  // System & Power Actions
  document.querySelectorAll("[data-system]").forEach((btn) => {
    btn.addEventListener("click", () => {
      triggerHaptic(20);
      const action = btn.getAttribute("data-system");
      sendWS({ type: "system_action", action });
    });
  });

  document.querySelectorAll("[data-system-confirm]").forEach((btn) => {
    btn.addEventListener("click", () => {
      triggerHaptic(25);
      pendingSystemAction = btn.getAttribute("data-system-confirm");
      if (pendingSystemAction === "restart") {
        modalTitle.textContent = "Restart Komputer?";
        modalDesc.textContent = "PC Anda akan dimulai ulang dalam beberapa detik.";
      } else if (pendingSystemAction === "shutdown") {
        modalTitle.textContent = "Matikan Komputer?";
        modalDesc.textContent = "PC Anda akan dimatikan sepenuhnya.";
      }
      confirmModal.classList.add("active");
    });
  });

  btnModalCancel.addEventListener("click", () => {
    triggerHaptic(10);
    confirmModal.classList.remove("active");
    pendingSystemAction = null;
  });

  btnModalConfirm.addEventListener("click", () => {
    triggerHaptic(30);
    confirmModal.classList.remove("active");
    if (pendingSystemAction) {
      sendWS({ type: "system_action", action: pendingSystemAction });
      pendingSystemAction = null;
    }
  });

  // =================================================
  // WINDOWS SELECTOR / JENDELA SWITCHER
  // =================================================

  function getAppIconInfo(appName, title) {
    const app = (appName || "").toLowerCase();
    const t = (title || "").toLowerCase();
    if (app.includes("chrome") || t.includes("chrome")) return { icon: "🌐", name: "Google Chrome" };
    if (app.includes("msedge") || app.includes("edge")) return { icon: "🌊", name: "Microsoft Edge" };
    if (app.includes("code") || t.includes("visual studio code")) return { icon: "💻", name: "VS Code" };
    if (app.includes("explorer")) return { icon: "📁", name: "File Explorer" };
    if (app.includes("spotify")) return { icon: "🎵", name: "Spotify" };
    if (app.includes("discord")) return { icon: "💬", name: "Discord" };
    if (app.includes("notepad")) return { icon: "📝", name: "Notepad" };
    if (app.includes("terminal") || app.includes("cmd") || app.includes("powershell")) return { icon: "⚡", name: "Terminal" };
    if (app.includes("steam")) return { icon: "🎮", name: "Steam" };
    if (app.includes("taskmgr")) return { icon: "📊", name: "Task Manager" };
    if (app.includes("calculator")) return { icon: "🔢", name: "Calculator" };
    if (app.includes("word") || t.includes("word")) return { icon: "📄", name: "Microsoft Word" };
    if (app.includes("excel") || t.includes("excel")) return { icon: "📊", name: "Microsoft Excel" };
    if (app.includes("powerpnt") || t.includes("powerpoint")) return { icon: "📑", name: "PowerPoint" };
    if (app.includes("slack")) return { icon: "💬", name: "Slack" };
    if (app.includes("telegram")) return { icon: "✈️", name: "Telegram" };
    if (app.includes("whatsapp")) return { icon: "🟢", name: "WhatsApp" };
    const cleanApp = appName.replace(/\.exe$/i, "");
    return { icon: "🪟", name: cleanApp || "Aplikasi Windows" };
  }

  async function fetchWindows() {
    if (btnRefreshWindows) {
      btnRefreshWindows.textContent = "⏳ Memuat...";
    }
    if (flWinBtnRefresh) {
      flWinBtnRefresh.textContent = "⏳...";
    }
    try {
      const res = await fetch("/api/windows");
      const data = await res.json();
      if (data && Array.isArray(data.windows)) {
        cachedWindows = data.windows;
        renderWindowsCards();
        renderFramelessWindows();
      }
    } catch (e) {
      console.error("Gagal mengambil data jendela:", e);
      if (windowsCount) windowsCount.textContent = "Gagal memuat jendela";
    } finally {
      if (btnRefreshWindows) btnRefreshWindows.innerHTML = "<span>🔄</span> Segarkan";
      if (flWinBtnRefresh) flWinBtnRefresh.textContent = "🔄 Segarkan";
    }
  }

  async function executeWindowAction(hwnd, action, autoSwitchScreen = false) {
    triggerHaptic(15);
    try {
      if (ws && ws.readyState === WebSocket.OPEN) {
        sendWS({ type: "window_action", hwnd, action });
      } else {
        await fetch("/api/windows/action", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ hwnd, action }),
        });
      }

      if (action === "activate" && autoSwitchScreen) {
        setTimeout(() => {
          setActiveTab("screen");
        }, 150);
      }
      setTimeout(fetchWindows, 350);
    } catch (e) {
      console.error("Window action error:", e);
    }
  }

  function renderWindowsCards() {
    if (!windowsCardsGrid) return;

    const filtered = cachedWindows.filter((win) => {
      if (!windowsSearchQuery) return true;
      const q = windowsSearchQuery.toLowerCase();
      return (
        (win.title && win.title.toLowerCase().includes(q)) ||
        (win.app && win.app.toLowerCase().includes(q))
      );
    });

    if (windowsCount) {
      windowsCount.textContent = `${filtered.length} jendela aktif ditemukan`;
    }

    if (filtered.length === 0) {
      windowsCardsGrid.innerHTML = `
        <div class="windows-empty-state">
          <div class="empty-icon">🪟</div>
          <div class="empty-title">Tidak ada jendela ditemukan</div>
          <div class="empty-desc">Coba ubah kata kunci pencarian atau buka aplikasi baru di PC.</div>
        </div>
      `;
      return;
    }

    windowsCardsGrid.innerHTML = "";

    filtered.forEach((win) => {
      const appInfo = getAppIconInfo(win.app, win.title);
      const card = document.createElement("div");
      card.className = "window-card";

      const statusBadge = win.is_minimized
        ? `<span class="window-status-badge minimized-state">🗕 Diminimalkan</span>`
        : `<span class="window-status-badge active-state">⚡ Di Layar</span>`;

      card.innerHTML = `
        <div class="window-card-header">
          <div class="window-app-icon">${appInfo.icon}</div>
          <div class="window-title-group">
            <div class="window-title" title="${escapeHtml(win.title)}">${escapeHtml(win.title)}</div>
            <div class="window-sub-info">
              <span class="window-proc-badge">${escapeHtml(win.app || "Process")}</span>
              ${statusBadge}
            </div>
          </div>
        </div>
        <div class="window-actions-group">
          <button class="btn-win-activate" title="Aktifkan Jendela & Buka di Layar">
            <span>🚀</span>
            <span>Buka & Lihat</span>
          </button>
          <button class="btn-win-tool max-btn" title="Maksimumkan">⛶</button>
          <button class="btn-win-tool min-btn" title="Minimalkan">🗕</button>
          <button class="btn-win-tool close-tool close-btn" title="Tutup Jendela">✕</button>
        </div>
      `;

      // Event Listeners for actions
      card.querySelector(".btn-win-activate").addEventListener("click", () => {
        executeWindowAction(win.hwnd, "activate", true);
      });
      card.querySelector(".max-btn").addEventListener("click", () => {
        executeWindowAction(win.hwnd, "maximize", false);
      });
      card.querySelector(".min-btn").addEventListener("click", () => {
        executeWindowAction(win.hwnd, "minimize", false);
      });
      card.querySelector(".close-btn").addEventListener("click", () => {
        executeWindowAction(win.hwnd, "close", false);
      });

      windowsCardsGrid.appendChild(card);
    });
  }

  function renderFramelessWindows() {
    if (!flWinCardsGrid) return;

    const filtered = cachedWindows.filter((win) => {
      if (!flWindowsSearchQuery) return true;
      const q = flWindowsSearchQuery.toLowerCase();
      return (
        (win.title && win.title.toLowerCase().includes(q)) ||
        (win.app && win.app.toLowerCase().includes(q))
      );
    });

    if (filtered.length === 0) {
      flWinCardsGrid.innerHTML = `
        <div class="windows-empty-state" style="padding:24px 10px;">
          <div class="empty-icon">🪟</div>
          <div class="empty-title">Tidak ada jendela yang cocok</div>
        </div>
      `;
      return;
    }

    flWinCardsGrid.innerHTML = "";

    filtered.forEach((win) => {
      const appInfo = getAppIconInfo(win.app, win.title);
      const item = document.createElement("div");
      item.className = "fl-win-item";
      item.innerHTML = `
        <div class="fl-win-icon">${appInfo.icon}</div>
        <div class="fl-win-details">
          <div class="fl-win-name">${escapeHtml(win.title)}</div>
          <div class="fl-win-proc">${escapeHtml(win.app || "")} • PID ${win.pid}</div>
        </div>
        <div class="fl-win-tag">${win.is_minimized ? "🗕 Min" : "PILIH ▶"}</div>
      `;

      item.addEventListener("click", () => {
        triggerHaptic(15);
        executeWindowAction(win.hwnd, "activate", false);
        if (flWindowsModal) {
          flWindowsModal.classList.remove("active");
        }
      });

      flWinCardsGrid.appendChild(item);
    });
  }

  function escapeHtml(str) {
    if (!str) return "";
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Windows Search & Refresh Listeners
  if (windowsSearchInput) {
    windowsSearchInput.addEventListener("input", (e) => {
      windowsSearchQuery = e.target.value.trim();
      renderWindowsCards();
    });
  }

  if (btnRefreshWindows) {
    btnRefreshWindows.addEventListener("click", () => {
      triggerHaptic(12);
      fetchWindows();
    });
  }

  // Frameless Windows Switcher Modal Listeners
  if (flBtnWindows) {
    flBtnWindows.addEventListener("click", () => {
      triggerHaptic(14);
      if (flWindowsModal) {
        flWindowsModal.classList.add("active");
        fetchWindows();
        if (flWinSearchInput) flWinSearchInput.focus();
      }
    });
  }

  if (flWinBtnClose) {
    flWinBtnClose.addEventListener("click", () => {
      triggerHaptic(10);
      if (flWindowsModal) flWindowsModal.classList.remove("active");
    });
  }

  if (flWinBtnRefresh) {
    flWinBtnRefresh.addEventListener("click", () => {
      triggerHaptic(12);
      fetchWindows();
    });
  }

  if (flWinSearchInput) {
    flWinSearchInput.addEventListener("input", (e) => {
      flWindowsSearchQuery = e.target.value.trim();
      renderFramelessWindows();
    });
  }

  // =========================================================================
  // 📱 PHONE-TO-DESKTOP STREAMING ENGINE (Layar HP ke Monitor Desktop)
  // =========================================================================
  const btnStartPhoneStream = document.getElementById("btn-start-phone-stream");
  const btnStopPhoneStream = document.getElementById("btn-stop-phone-stream");
  const btnOpenPcViewer = document.getElementById("btn-open-pc-viewer");
  const btnReopenDesktopViewer = document.getElementById("btn-reopen-desktop-viewer");
  const btnFlipCamera = document.getElementById("btn-flip-camera");
  const phoneStreamSetupWrapper = document.getElementById("phone-stream-setup-wrapper");
  const phoneStreamActiveCard = document.getElementById("phone-stream-active-card");
  const phonePreviewVideo = document.getElementById("phone-preview-video");
  const phoneStreamPill = document.getElementById("phone-stream-pill");
  const phonePillText = document.getElementById("phone-pill-text");
  const phoneStreamMetricsTag = document.getElementById("phone-stream-metrics-tag");
  const phoneStreamStatusSub = document.getElementById("phone-stream-status-sub");
  const sourceCards = document.querySelectorAll(".source-card");
  const qualityPills = document.querySelectorAll(".btn-quality-pill");
  const chkStreamAudio = document.getElementById("chk-stream-audio");

  const btnShowIosGuide = document.getElementById("btn-show-ios-guide");
  const iosGuideModal = document.getElementById("ios-guide-modal");
  const btnCloseIosGuide = document.getElementById("btn-close-ios-guide");
  const btnSwitchToCamera = document.getElementById("btn-switch-to-camera");

  let phoneMediaStream = null;
  let phonePeerConn = null;
  let phoneStreamWs = null;
  let isPhoneStreaming = false;
  let selectedStreamSource = "screen"; // 'screen', 'camera_back', 'camera_front'
  let selectedStreamQuality = 720;
  let currentCameraFacing = "environment";
  let fallbackCanvasInterval = null;
  let fallbackCanvasEl = null;
  let fallbackCanvasCtx = null;

  // On iOS (iPhone/iPad), customize interface for native AirPlay support
  const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

  function initPhoneStreamSystem() {
    // Customize UI for iOS users (AirPlay native recommendation)
    if (isIOSDevice) {
      const launchMainText = document.querySelector(".launch-main-text");
      const launchSubText = document.querySelector(".launch-sub-text");
      if (launchMainText) launchMainText.textContent = "Layar iPhone ke PC (AirPlay)";
      if (launchSubText) launchSubText.textContent = "Ketuk untuk jalankan AirPlay & lihat panduan";
    }

    // 1. Source card selector
    sourceCards.forEach((card) => {
      card.addEventListener("click", () => {
        triggerHaptic(10);
        const sourceVal = card.getAttribute("data-source") || "screen";
        
        // If iPhone user taps "Seluruh Layar", inform them with the helpful AirPlay modal
        if (isIOSDevice && sourceVal === "screen") {
          fetch("/api/launch-airplay", { method: "POST" }).catch(() => {});
          if (iosGuideModal) iosGuideModal.classList.add("active");
          return;
        }

        sourceCards.forEach((c) => c.classList.remove("active"));
        card.classList.add("active");
        selectedStreamSource = sourceVal;
        const radio = card.querySelector('input[type="radio"]');
        if (radio) radio.checked = true;
      });
    });

    // 2. Quality pill selector
    qualityPills.forEach((pill) => {
      pill.addEventListener("click", () => {
        triggerHaptic(10);
        qualityPills.forEach((p) => p.classList.remove("active"));
        pill.classList.add("active");
        selectedStreamQuality = parseInt(pill.getAttribute("data-quality") || "720");
      });
    });

    // 3. Open PC Viewer button
    async function triggerOpenDesktopViewer() {
      triggerHaptic(15);
      try {
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: "open_desktop_viewer" }));
        }
        await fetch("/api/open-desktop-viewer", { method: "POST" });
      } catch (e) {}
    }

    if (btnOpenPcViewer) btnOpenPcViewer.addEventListener("click", triggerOpenDesktopViewer);
    if (btnReopenDesktopViewer) btnReopenDesktopViewer.addEventListener("click", triggerOpenDesktopViewer);

    // 4. Start streaming
    if (btnStartPhoneStream) {
      btnStartPhoneStream.addEventListener("click", async () => {
        triggerHaptic(20);
        if (isIOSDevice && selectedStreamSource === "screen") {
          try {
            fetch("/api/launch-airplay", { method: "POST" }).catch(() => {});
          } catch (e) {}
          if (iosGuideModal) {
            iosGuideModal.classList.add("active");
            return;
          }
        }
        await startPhoneStreaming();
      });
    }

    // 5. Stop streaming
    if (btnStopPhoneStream) {
      btnStopPhoneStream.addEventListener("click", () => {
        triggerHaptic(15);
        stopPhoneStreaming();
      });
    }

    // 6. Flip camera (when in camera mode)
    if (btnFlipCamera) {
      btnFlipCamera.addEventListener("click", async () => {
        triggerHaptic(15);
        currentCameraFacing = currentCameraFacing === "environment" ? "user" : "environment";
        await switchCameraTrack();
      });
    }

    // 7. iOS Guide Modal Listeners
    const btnLaunchAirplayPc = document.getElementById("btn-launch-airplay-pc");

    if (btnLaunchAirplayPc) {
      btnLaunchAirplayPc.addEventListener("click", async () => {
        triggerHaptic(20);
        try {
          btnLaunchAirplayPc.textContent = "⏳ Membuka AirPlay di PC...";
          await fetch("/api/launch-airplay", { method: "POST" });
          setTimeout(() => {
            btnLaunchAirplayPc.textContent = "✅ AirPlay Aktif di PC! Buka Pusat Kontrol di iPhone";
          }, 800);
        } catch (e) {
          btnLaunchAirplayPc.textContent = "⚡ Jalankan AirPlay di PC Sekarang";
        }
      });
    }

    if (btnShowIosGuide && iosGuideModal) {
      btnShowIosGuide.addEventListener("click", () => {
        triggerHaptic(12);
        fetch("/api/launch-airplay", { method: "POST" }).catch(() => {});
        iosGuideModal.classList.add("active");
      });
    }

    if (btnCloseIosGuide && iosGuideModal) {
      btnCloseIosGuide.addEventListener("click", () => {
        triggerHaptic(10);
        iosGuideModal.classList.remove("active");
      });
    }

    if (btnSwitchToCamera && iosGuideModal) {
      btnSwitchToCamera.addEventListener("click", async () => {
        triggerHaptic(15);
        iosGuideModal.classList.remove("active");
        selectedStreamSource = "camera_back";
        sourceCards.forEach((c) => {
          c.classList.toggle("active", c.getAttribute("data-source") === "camera_back");
        });
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          alert("Browser Safari memerlukan HTTPS untuk membuka kamera.\nSilakan gunakan opsi Pencerminan Layar (AirPlay) bawaan iPhone.");
          return;
        }
        await startPhoneStreaming();
      });
    }
  }

  async function startPhoneStreaming() {
    try {
      let constraints = {};
      const widthTarget = selectedStreamQuality === 1080 ? 1920 : (selectedStreamQuality === 720 ? 1280 : 854);
      const heightTarget = selectedStreamQuality === 1080 ? 1080 : (selectedStreamQuality === 720 ? 720 : 480);
      const wantAudio = chkStreamAudio ? chkStreamAudio.checked : true;

      // Safe check for browser mediaDevices support (requires Secure Context / HTTPS on iOS)
      if (!navigator.mediaDevices) {
        if (isIOSDevice) {
          fetch("/api/launch-airplay", { method: "POST" }).catch(() => {});
          if (iosGuideModal) iosGuideModal.classList.add("active");
          return;
        } else {
          alert("Browser Anda memerlukan koneksi HTTPS untuk mengizinkan akses kamera atau layar.");
          return;
        }
      }

      if (selectedStreamSource === "screen") {
        if (navigator.mediaDevices.getDisplayMedia) {
          constraints = {
            video: {
              width: { ideal: widthTarget },
              height: { ideal: heightTarget },
              frameRate: { ideal: 60, max: 60 }
            },
            audio: wantAudio
          };
          phoneMediaStream = await navigator.mediaDevices.getDisplayMedia(constraints);
        } else {
          // If browser restricts getDisplayMedia (e.g. iOS Safari)
          if (isIOSDevice) {
            fetch("/api/launch-airplay", { method: "POST" }).catch(() => {});
          }
          if (iosGuideModal) {
            iosGuideModal.classList.add("active");
          } else {
            alert("Apple Safari membatasi tangkapan layar browser di iOS demi privasi.\nSilakan gunakan Pusat Kontrol -> Pencerminan Layar (AirPlay).");
          }
          return;
        }
      } else {
        // Camera mode
        if (!navigator.mediaDevices.getUserMedia) {
          alert("Akses kamera tidak diizinkan oleh browser ini tanpa koneksi HTTPS.");
          return;
        }
        currentCameraFacing = selectedStreamSource === "camera_front" ? "user" : "environment";
        constraints = {
          video: {
            facingMode: { ideal: currentCameraFacing },
            width: { ideal: widthTarget },
            height: { ideal: heightTarget }
          },
          audio: wantAudio
        };
        phoneMediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      }

      // Attach stream to local preview
      if (phonePreviewVideo) {
        phonePreviewVideo.srcObject = phoneMediaStream;
        phonePreviewVideo.play().catch(() => {});
      }

      // Handle when user stops sharing via native system UI
      const videoTrack = phoneMediaStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.onended = () => {
          stopPhoneStreaming();
        };
      }

      // Show/Hide camera flip button
      if (btnFlipCamera) {
        btnFlipCamera.style.display = selectedStreamSource !== "screen" ? "flex" : "none";
      }

      // Open PC monitor viewer automatically
      try {
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: "open_desktop_viewer" }));
        }
        fetch("/api/open-desktop-viewer", { method: "POST" }).catch(() => {});
      } catch (e) {}

      // Setup WebRTC and Fallback Signaling
      setupPhoneStreamConnection();

      // Update UI state
      isPhoneStreaming = true;
      if (phoneStreamSetupWrapper) phoneStreamSetupWrapper.classList.add("hidden");
      if (phoneStreamActiveCard) phoneStreamActiveCard.classList.remove("hidden");
      if (phoneStreamPill) {
        phoneStreamPill.className = "stream-live-pill active";
        if (phonePillText) phonePillText.textContent = "LIVE";
      }
      if (phoneStreamStatusSub) {
        phoneStreamStatusSub.textContent = `Streaming ${selectedStreamSource === 'screen' ? 'Layar' : 'Kamera'} ke PC`;
      }
      if (phoneStreamMetricsTag) {
        phoneStreamMetricsTag.textContent = `${selectedStreamQuality}p • 60 FPS`;
      }

      triggerHaptic(30);

    } catch (err) {
      if (err.name !== "NotAllowedError") {
        alert("Gagal memulai streaming layar: " + (err.message || err.name));
      }
      stopPhoneStreaming();
    }
  }

  function setupPhoneStreamConnection() {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws/phone-stream`;

    if (phoneStreamWs) {
      try { phoneStreamWs.close(); } catch (e) {}
    }

    phoneStreamWs = new WebSocket(wsUrl);

    phoneStreamWs.onopen = async () => {
      // Register as phone sender
      phoneStreamWs.send(JSON.stringify({
        type: "register",
        role: "phone_sender"
      }));

      // Initiate WebRTC
      initPhoneWebRTC();

      // Start fallback frame streaming (Ensures 100% reliability over LAN)
      startFallbackCanvasStreaming();
    };

    phoneStreamWs.onmessage = async (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === "webrtc_answer" && phonePeerConn) {
          await phonePeerConn.setRemoteDescription(new RTCSessionDescription(msg.sdp));
        } else if (msg.type === "ice_candidate" && msg.candidate && phonePeerConn) {
          try {
            await phonePeerConn.addIceCandidate(new RTCIceCandidate(msg.candidate));
          } catch (e) {}
        }
      } catch (e) {}
    };

    phoneStreamWs.onclose = () => {
      if (isPhoneStreaming) {
        setTimeout(setupPhoneStreamConnection, 2000);
      }
    };
  }

  async function initPhoneWebRTC() {
    if (phonePeerConn) {
      try { phonePeerConn.close(); } catch (e) {}
    }

    const rtcConfig = {
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" }
      ]
    };

    phonePeerConn = new RTCPeerConnection(rtcConfig);

    if (phoneMediaStream) {
      phoneMediaStream.getTracks().forEach((track) => {
        phonePeerConn.addTrack(track, phoneMediaStream);
      });
    }

    phonePeerConn.onicecandidate = (event) => {
      if (event.candidate && phoneStreamWs && phoneStreamWs.readyState === WebSocket.OPEN) {
        phoneStreamWs.send(JSON.stringify({
          type: "ice_candidate",
          candidate: event.candidate
        }));
      }
    };

    try {
      const offer = await phonePeerConn.createOffer();
      await phonePeerConn.setLocalDescription(offer);

      if (phoneStreamWs && phoneStreamWs.readyState === WebSocket.OPEN) {
        phoneStreamWs.send(JSON.stringify({
          type: "webrtc_offer",
          sdp: offer
        }));

        phoneStreamWs.send(JSON.stringify({
          type: "stream_started",
          metadata: {
            source: selectedStreamSource,
            quality: selectedStreamQuality,
            mode: "WebRTC"
          }
        }));
      }
    } catch (e) {}
  }

  function startFallbackCanvasStreaming() {
    if (fallbackCanvasInterval) clearInterval(fallbackCanvasInterval);

    if (!fallbackCanvasEl) {
      fallbackCanvasEl = document.createElement("canvas");
      fallbackCanvasCtx = fallbackCanvasEl.getContext("2d");
    }

    // Capture frame every 45ms (~22 FPS) for seamless fallback
    fallbackCanvasInterval = setInterval(() => {
      if (!isPhoneStreaming || !phonePreviewVideo || phonePreviewVideo.readyState < 2) return;
      if (!phoneStreamWs || phoneStreamWs.readyState !== WebSocket.OPEN) return;

      const vw = phonePreviewVideo.videoWidth;
      const vh = phonePreviewVideo.videoHeight;
      if (!vw || !vh) return;

      // Scale to max width 960 to conserve Wi-Fi bandwidth
      const maxW = 960;
      const scale = Math.min(1, maxW / vw);
      const targetW = Math.round(vw * scale);
      const targetH = Math.round(vh * scale);

      if (fallbackCanvasEl.width !== targetW || fallbackCanvasEl.height !== targetH) {
        fallbackCanvasEl.width = targetW;
        fallbackCanvasEl.height = targetH;
      }

      fallbackCanvasCtx.drawImage(phonePreviewVideo, 0, 0, targetW, targetH);
      fallbackCanvasEl.toBlob((blob) => {
        if (blob && phoneStreamWs && phoneStreamWs.readyState === WebSocket.OPEN) {
          blob.arrayBuffer().then((buffer) => {
            phoneStreamWs.send(buffer);
          }).catch(() => {});
        }
      }, "image/jpeg", 0.65);
    }, 45);
  }

  async function switchCameraTrack() {
    if (!phoneMediaStream) return;
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: currentCameraFacing },
          width: { ideal: selectedStreamQuality === 1080 ? 1920 : 1280 },
          height: { ideal: selectedStreamQuality === 1080 ? 1080 : 720 }
        }
      });
      const newVideoTrack = newStream.getVideoTracks()[0];
      const oldVideoTrack = phoneMediaStream.getVideoTracks()[0];

      if (oldVideoTrack) {
        phoneMediaStream.removeTrack(oldVideoTrack);
        oldVideoTrack.stop();
      }
      phoneMediaStream.addTrack(newVideoTrack);

      if (phonePeerConn) {
        const senders = phonePeerConn.getSenders();
        const videoSender = senders.find(s => s.track && s.track.kind === "video");
        if (videoSender) {
          videoSender.replaceTrack(newVideoTrack);
        }
      }

      if (phonePreviewVideo) {
        phonePreviewVideo.srcObject = phoneMediaStream;
      }
    } catch (e) {}
  }

  function stopPhoneStreaming() {
    isPhoneStreaming = false;

    if (fallbackCanvasInterval) {
      clearInterval(fallbackCanvasInterval);
      fallbackCanvasInterval = null;
    }

    if (phoneMediaStream) {
      phoneMediaStream.getTracks().forEach((track) => track.stop());
      phoneMediaStream = null;
    }

    if (phonePreviewVideo) {
      phonePreviewVideo.srcObject = null;
    }

    if (phonePeerConn) {
      try { phonePeerConn.close(); } catch (e) {}
      phonePeerConn = null;
    }

    if (phoneStreamWs && phoneStreamWs.readyState === WebSocket.OPEN) {
      try {
        phoneStreamWs.send(JSON.stringify({ type: "stream_stopped" }));
        phoneStreamWs.close();
      } catch (e) {}
    }
    phoneStreamWs = null;

    // Reset UI
    if (phoneStreamSetupWrapper) phoneStreamSetupWrapper.classList.remove("hidden");
    if (phoneStreamActiveCard) phoneStreamActiveCard.classList.add("hidden");
    if (phoneStreamPill) {
      phoneStreamPill.className = "stream-live-pill";
      if (phonePillText) phonePillText.textContent = "Standby";
    }
    if (phoneStreamStatusSub) {
      phoneStreamStatusSub.textContent = "Siap menampilkan ke monitor PC";
    }
  }

  // Initialize
  initPhoneStreamSystem();
  updateOrientationState();
  connectWebSocket();
})();
