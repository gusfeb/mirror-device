"""
DeskFlow - Screen Streamer
Captures the Windows desktop screen using MSS and encodes frames as JPEG.
Provides optimized, low-latency screen frames for WebSocket and MJPEG streams.
"""

import io
import time
import threading
import mss
from PIL import Image
from win32_controller import ensure_desktop_attached

class ScreenStreamer:
    def __init__(self):
        self.lock = threading.Lock()
        self._sct = None
        self.quality = 55
        self.scale_width = 1152  # Great resolution for iPhone Retina screens without lag
        self.fps_target = 25
        self.last_frame_bytes = None
        self.last_capture_time = 0

    def _get_sct(self):
        ensure_desktop_attached()
        if self._sct is None:
            self._sct = mss.MSS()
        return self._sct

    def capture_frame(self, quality=None, scale_width=None):
        """Capture a single frame and return JPEG bytes."""
        with self.lock:
            try:
                ensure_desktop_attached()
                sct = self._get_sct()
                monitor = sct.monitors[1]  # Primary monitor
                raw = sct.grab(monitor)

                # Convert raw BGRA to PIL Image
                img = Image.frombytes("RGB", raw.size, raw.bgra, "raw", "BGRX")

                q = quality or self.quality
                w = scale_width or self.scale_width

                if w and img.width > w:
                    aspect = img.height / img.width
                    new_h = int(w * aspect)
                    img = img.resize((w, new_h), Image.Resampling.BILINEAR)

                buf = io.BytesIO()
                img.save(buf, format="JPEG", quality=q, optimize=False)
                frame_bytes = buf.getvalue()
                self.last_frame_bytes = frame_bytes
                self.last_capture_time = time.time()
                return frame_bytes
            except Exception as e:
                # In case MSS context got invalid, recreate MSS instance
                try:
                    self._sct = None
                    ensure_desktop_attached()
                    self._sct = mss.MSS()
                except Exception:
                    pass
                return self.last_frame_bytes

    def get_screen_resolution(self):
        """Get the resolution of the primary monitor."""
        ensure_desktop_attached()
        try:
            sct = self._get_sct()
            m = sct.monitors[1]
            return m["width"], m["height"]
        except Exception:
            return 1920, 1080
