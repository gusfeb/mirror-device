"""
DeskFlow - Main Server
FastAPI + WebSocket + Screen Streamer + Win32 Controller
Provides a responsive Web PWA to control Windows PC from iPhone.
"""

import os
import sys
import json
import socket
import asyncio
import io
import subprocess
import webbrowser
import qrcode
from contextlib import asynccontextmanager

import sys

# Ensure UTF-8 output on Windows console
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request
from fastapi.responses import HTMLResponse, StreamingResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from win32_controller import DesktopController, ensure_desktop_attached
from screen_streamer import ScreenStreamer

controller = DesktopController()
streamer = ScreenStreamer()

STATIC_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "static")
CURRENT_PORT = 8000


def open_desktop_viewer(port: int = 8000):
    """Launch Microsoft Edge in app mode (frameless floating window) or default browser."""
    url = f"http://localhost:{port}/phone-screen"
    edge_paths = [
        os.path.expandvars(r"%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"),
        os.path.expandvars(r"%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"),
        r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
        r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
    ]
    for p in edge_paths:
        if os.path.exists(p):
            try:
                subprocess.Popen([
                    p,
                    f"--app={url}",
                    "--window-size=480,880",
                    "--window-name=DeskFlow - Layar HP",
                ])
                return True
            except Exception:
                pass
    try:
        webbrowser.open(url)
        return True
    except Exception:
        return False


def is_uxplay_running():
    """Check if UxPlay AirPlay receiver is already running."""
    try:
        output = subprocess.check_output('tasklist /FI "IMAGENAME eq uxplay-windows.exe"', shell=True, text=True, stderr=subprocess.DEVNULL)
        return "uxplay-windows.exe" in output
    except Exception:
        return False


def launch_airplay_receiver():
    """Launch UxPlay AirPlay receiver on Windows."""
    if is_uxplay_running():
        return True
    uxplay_paths = [
        r"C:\Program Files\uxplay-windows\uxplay-windows.exe",
        os.path.join(os.path.dirname(os.path.abspath(__file__)), "airplay_iphone.bat"),
    ]
    for p in uxplay_paths:
        if os.path.exists(p):
            try:
                subprocess.Popen([p], shell=p.endswith(".bat"), cwd=os.path.dirname(p))
                return True
            except Exception:
                pass
    return False


class PhoneStreamRelay:
    """Manages WebRTC signaling and binary frame forwarding between phone and desktop monitor."""
    def __init__(self):
        self.senders = set()
        self.receivers = set()
        self.is_streaming = False
        self.last_metadata = {}

    def register_sender(self, ws: WebSocket):
        self.senders.add(ws)

    async def register_receiver(self, ws: WebSocket):
        self.receivers.add(ws)
        if self.is_streaming:
            try:
                await ws.send_text(json.dumps({
                    "type": "stream_started",
                    "metadata": self.last_metadata
                }))
            except Exception:
                pass

    def unregister(self, ws: WebSocket):
        self.senders.discard(ws)
        self.receivers.discard(ws)
        if not self.senders:
            self.is_streaming = False

    async def broadcast_to_receivers(self, text_data: str, exclude: WebSocket = None):
        dead = []
        for r in list(self.receivers):
            if r is not exclude:
                try:
                    await r.send_text(text_data)
                except Exception:
                    dead.append(r)
        for d in dead:
            self.receivers.discard(d)

    async def broadcast_binary_to_receivers(self, binary_data: bytes, exclude: WebSocket = None):
        dead = []
        for r in list(self.receivers):
            if r is not exclude:
                try:
                    await r.send_bytes(binary_data)
                except Exception:
                    dead.append(r)
        for d in dead:
            self.receivers.discard(d)

    async def send_to_senders(self, text_data: str, exclude: WebSocket = None):
        dead = []
        for s in list(self.senders):
            if s is not exclude:
                try:
                    await s.send_text(text_data)
                except Exception:
                    dead.append(s)
        for d in dead:
            self.senders.discard(d)


phone_relay = PhoneStreamRelay()


def get_lan_ip():
    """Detect the active local area network IPv4 address."""
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        # Connect to public DNS without sending packets
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
    except Exception:
        ip = "127.0.0.1"
    finally:
        s.close()
    return ip


def generate_qr_code(url: str, output_path: str):
    """Generate both ASCII terminal QR code and save PNG file."""
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=2,
    )
    qr.add_data(url)
    qr.make(fit=True)
    
    # Save image
    img = qr.make_image(fill_color="black", back_color="white")
    img.save(output_path)
    
    # Generate terminal ASCII QR
    buf = io.StringIO()
    qr.print_ascii(out=buf)
    return buf.getvalue()


@asynccontextmanager
async def lifespan(app: FastAPI):
    ensure_desktop_attached()
    yield


app = FastAPI(title="DeskFlow Controller", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/qr")
async def get_qr_image():
    """Serves the generated QR code image."""
    qr_img_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "qr_code.png")
    if os.path.exists(qr_img_path):
        return FileResponse(qr_img_path, media_type="image/png")
    return HTMLResponse("QR code not generated yet", status_code=404)


@app.get("/phone-screen")
@app.get("/receiver")
@app.get("/desktop-mirror")
async def get_phone_screen_page():
    """Serves the desktop monitor viewer page for displaying phone screen."""
    html_path = os.path.join(STATIC_DIR, "phone_screen.html")
    if os.path.exists(html_path):
        return FileResponse(html_path, media_type="text/html")
    return HTMLResponse("<h1>phone_screen.html not found</h1>", status_code=404)


@app.get("/api/open-desktop-viewer")
@app.post("/api/open-desktop-viewer")
async def api_open_desktop_viewer():
    """Trigger the Windows PC to launch the floating phone monitor window."""
    res = open_desktop_viewer(CURRENT_PORT)
    return {"success": res, "port": CURRENT_PORT, "url": f"http://localhost:{CURRENT_PORT}/phone-screen"}


@app.get("/api/launch-airplay")
@app.post("/api/launch-airplay")
async def api_launch_airplay():
    """Trigger the Windows PC to start UxPlay AirPlay receiver."""
    res = launch_airplay_receiver()
    return {"success": res, "running": is_uxplay_running()}


@app.get("/api/phone-stream/status")
async def get_phone_stream_status():
    """Returns status of phone screen broadcast to desktop monitor."""
    return {
        "is_streaming": phone_relay.is_streaming,
        "senders": len(phone_relay.senders),
        "receivers": len(phone_relay.receivers),
        "metadata": phone_relay.last_metadata
    }


@app.get("/api/info")
async def get_system_info():
    """Returns basic system info and resolution."""
    w, h = streamer.get_screen_resolution()
    hostname = socket.gethostname()
    return {
        "hostname": hostname,
        "screen_width": w,
        "screen_height": h,
        "lan_ip": get_lan_ip(),
        "status": "online",
        "phone_screen_url": f"http://localhost:{CURRENT_PORT}/phone-screen",
    }


@app.get("/api/windows")
async def get_windows():
    """Returns a list of all visible open application windows on the desktop."""
    win_list = controller.get_open_windows()
    return {"windows": win_list}


@app.post("/api/windows/action")
async def window_action(request: Request):
    """Perform action on a window: activate, minimize, maximize, close."""
    data = await request.json()
    hwnd = data.get("hwnd")
    action = data.get("action", "activate")
    if not hwnd:
        return {"success": False, "error": "hwnd required"}

    if action == "activate":
        res = controller.activate_window(hwnd)
    elif action == "minimize":
        res = controller.minimize_window(hwnd)
    elif action == "maximize":
        res = controller.maximize_window(hwnd)
    elif action == "close":
        res = controller.close_window(hwnd)
    else:
        res = False
    return {"success": res, "hwnd": hwnd, "action": action}


@app.get("/api/screenshot")
async def get_screenshot(quality: int = 65, width: int = 1280):
    """Returns a single snapshot JPEG frame."""
    frame_bytes = streamer.capture_frame(quality=quality, scale_width=width)
    if not frame_bytes:
        return HTMLResponse(content="Error capturing screen", status_code=500)
    return StreamingResponse(io.BytesIO(frame_bytes), media_type="image/jpeg")


@app.get("/stream")
async def stream_mjpeg(request: Request, fps: int = 20, quality: int = 50, width: int = 960):
    """MJPEG stream endpoint for real-time video display in browsers."""
    delay = 1.0 / max(1, min(30, fps))

    async def frame_generator():
        while True:
            if await request.is_disconnected():
                break
            frame = streamer.capture_frame(quality=quality, scale_width=width)
            if frame:
                yield (
                    b"--frame\r\n"
                    b"Content-Type: image/jpeg\r\n\r\n" + frame + b"\r\n"
                )
            await asyncio.sleep(delay)

    return StreamingResponse(
        frame_generator(),
        media_type="multipart/x-mixed-replace; boundary=frame",
    )


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    stream_task = None
    is_streaming = False

    async def screen_stream_loop():
        """Optional WebSocket binary frame stream for high-performance canvas rendering."""
        while is_streaming:
            try:
                frame = streamer.capture_frame(quality=streamer.quality, scale_width=streamer.scale_width)
                if frame:
                    await websocket.send_bytes(frame)
                await asyncio.sleep(1.0 / streamer.fps_target)
            except Exception:
                break

    try:
        while True:
            data = await websocket.receive_text()
            msg = json.loads(data)
            mtype = msg.get("type")

            if mtype == "mouse_move":
                dx = msg.get("dx", 0)
                dy = msg.get("dy", 0)
                controller.move_mouse_relative(dx, dy)

            elif mtype == "mouse_abs":
                x = msg.get("x", 0.0)
                y = msg.get("y", 0.0)
                controller.move_mouse_absolute(x, y)
                if msg.get("click"):
                    controller.mouse_click(msg.get("click", "left"))

            elif mtype == "mouse_click":
                btn = msg.get("button", "left")
                controller.mouse_click(btn)

            elif mtype == "mouse_double_click":
                btn = msg.get("button", "left")
                controller.mouse_double_click(btn)

            elif mtype == "mouse_down":
                btn = msg.get("button", "left")
                controller.mouse_down(btn)

            elif mtype == "mouse_up":
                btn = msg.get("button", "left")
                controller.mouse_up(btn)

            elif mtype == "mouse_scroll":
                dy = msg.get("dy", 0)
                dx = msg.get("dx", 0)
                controller.mouse_scroll(dy, dx)

            elif mtype == "key":
                key = msg.get("key", "")
                controller.execute_special_key(key)

            elif mtype == "type_text":
                text = msg.get("text", "")
                controller.type_unicode_text(text)

            elif mtype == "system_action":
                act = msg.get("action", "")
                controller.system_action(act)

            elif mtype == "get_windows":
                wins = controller.get_open_windows()
                await websocket.send_text(json.dumps({"type": "windows_list", "windows": wins}))

            elif mtype == "window_action":
                hwnd = msg.get("hwnd")
                action = msg.get("action", "activate")
                if hwnd:
                    if action == "activate":
                        controller.activate_window(hwnd)
                    elif action == "minimize":
                        controller.minimize_window(hwnd)
                    elif action == "maximize":
                        controller.maximize_window(hwnd)
                    elif action == "close":
                        controller.close_window(hwnd)
                wins = controller.get_open_windows()
                await websocket.send_text(json.dumps({"type": "windows_list", "windows": wins}))

            elif mtype == "open_desktop_viewer":
                open_desktop_viewer(CURRENT_PORT)

            elif mtype == "stream_config":
                enabled = msg.get("enabled", False)
                if "fps" in msg:
                    streamer.fps_target = max(5, min(30, int(msg["fps"])))
                if "quality" in msg:
                    streamer.quality = max(20, min(85, int(msg["quality"])))
                if "width" in msg:
                    streamer.scale_width = max(640, min(1920, int(msg["width"])))

                if enabled and not is_streaming:
                    is_streaming = True
                    stream_task = asyncio.create_task(screen_stream_loop())
                elif not enabled and is_streaming:
                    is_streaming = False
                    if stream_task:
                        stream_task.cancel()

    except WebSocketDisconnect:
        pass
    except Exception as e:
        pass
    finally:
        is_streaming = False
        if stream_task and not stream_task.done():
            stream_task.cancel()


@app.websocket("/ws/phone-stream")
async def phone_stream_endpoint(websocket: WebSocket):
    """Dedicated low-latency WebSocket for phone-to-desktop WebRTC signaling & fallback frame relay."""
    await websocket.accept()
    client_role = None

    try:
        while True:
            raw = await websocket.receive()
            if "bytes" in raw and raw["bytes"]:
                # Relay binary frame directly to desktop receivers
                await phone_relay.broadcast_binary_to_receivers(raw["bytes"], exclude=websocket)
            elif "text" in raw and raw["text"]:
                msg = json.loads(raw["text"])
                mtype = msg.get("type")

                if mtype == "register":
                    client_role = msg.get("role")
                    if client_role == "phone_sender":
                        phone_relay.register_sender(websocket)
                    elif client_role == "desktop_receiver":
                        await phone_relay.register_receiver(websocket)

                elif mtype == "webrtc_offer":
                    await phone_relay.broadcast_to_receivers(raw["text"], exclude=websocket)

                elif mtype == "webrtc_answer":
                    await phone_relay.send_to_senders(raw["text"], exclude=websocket)

                elif mtype == "ice_candidate":
                    if client_role == "phone_sender":
                        await phone_relay.broadcast_to_receivers(raw["text"], exclude=websocket)
                    else:
                        await phone_relay.send_to_senders(raw["text"], exclude=websocket)

                elif mtype == "stream_started":
                    phone_relay.is_streaming = True
                    phone_relay.last_metadata = msg.get("metadata", {})
                    await phone_relay.broadcast_to_receivers(raw["text"], exclude=websocket)

                elif mtype == "stream_stopped":
                    phone_relay.is_streaming = False
                    await phone_relay.broadcast_to_receivers(raw["text"], exclude=websocket)

                elif mtype == "open_desktop_viewer":
                    open_desktop_viewer(CURRENT_PORT)

    except WebSocketDisconnect:
        pass
    except Exception:
        pass
    finally:
        phone_relay.unregister(websocket)
        if client_role == "phone_sender" and not phone_relay.senders:
            phone_relay.is_streaming = False
            await phone_relay.broadcast_to_receivers(json.dumps({"type": "stream_stopped"}))


# Mount static assets
if os.path.isdir(STATIC_DIR):
    app.mount("/", StaticFiles(directory=STATIC_DIR, html=True), name="static")


def print_banner(port=8000):
    lan_ip = get_lan_ip()
    local_url = f"http://localhost:{port}"
    lan_url = f"http://{lan_ip}:{port}"
    qr_img_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "qr_code.png")

    try:
        ascii_qr = generate_qr_code(lan_url, qr_img_path)
    except Exception:
        ascii_qr = ""

    print("=" * 64)
    print("       DESKFLOW - KONTROL DESKTOP WINDOWS DARI IPHONE        ")
    print("=" * 64)
    print(f"[*] PC Hostname : {socket.gethostname()}")
    print(f"[*] Local PC    : {local_url}")
    print(f"[*] URL iPhone  : {lan_url}")
    print(f"[*] Layar HP    : {local_url}/phone-screen  (Tampil di Monitor PC)")
    print(f"[*] QR Code File: {qr_img_path}")
    print("-" * 64)
    print("Scan QR code ini dengan kamera smartphone (pastikan 1 Wi-Fi):")
    if ascii_qr:
        try:
            print(ascii_qr)
        except Exception:
            print("[Info] Gambar QR Code tersimpan di: qr_code.png")
    print("-" * 64)
    print(f"Buka browser di HP lalu ketik: {lan_url}")
    print("Fitur Baru: Tampilkan Layar HP Anda langsung ke Monitor Desktop!")
    print(f"  -> Penampil Monitor: {local_url}/phone-screen (atau view_phone.bat)")
    print("=" * 64)


def check_or_find_port(preferred_port=8000):
    """Find available port if preferred port is temporarily busy."""
    for p in [preferred_port, 8001, 8080, 8888]:
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
                s.bind(("0.0.0.0", p))
                return p
        except OSError:
            continue
    return preferred_port


if __name__ == "__main__":
    port = check_or_find_port(8000)
    CURRENT_PORT = port
    print_banner(port)
    uvicorn.run(app, host="0.0.0.0", port=port, log_level="warning")
