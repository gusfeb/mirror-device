"""
DeskFlow - Win32 Controller
Handles low-level mouse, keyboard, system, and media controls for Windows.
Attaches automatically to the active user desktop station (WinSta0\\Default).
"""

import ctypes
from ctypes import wintypes
import time
import subprocess
import os

user32 = ctypes.windll.user32
gdi32 = ctypes.windll.gdi32
kernel32 = ctypes.windll.kernel32

# Input Constants
INPUT_MOUSE = 0
INPUT_KEYBOARD = 1
INPUT_HARDWARE = 2

# Mouse flags
MOUSEEVENTF_MOVE = 0x0001
MOUSEEVENTF_LEFTDOWN = 0x0002
MOUSEEVENTF_LEFTUP = 0x0004
MOUSEEVENTF_RIGHTDOWN = 0x0008
MOUSEEVENTF_RIGHTUP = 0x0010
MOUSEEVENTF_MIDDLEDOWN = 0x0020
MOUSEEVENTF_MIDDLEUP = 0x0040
MOUSEEVENTF_WHEEL = 0x0800
MOUSEEVENTF_HWHEEL = 0x1000
MOUSEEVENTF_ABSOLUTE = 0x8000

# Keyboard flags
KEYEVENTF_EXTENDEDKEY = 0x0001
KEYEVENTF_KEYUP = 0x0002
KEYEVENTF_UNICODE = 0x0004
KEYEVENTF_SCANCODE = 0x0008

# Virtual Key Codes
VK_LBUTTON = 0x01
VK_RBUTTON = 0x02
VK_MBUTTON = 0x04
VK_BACK = 0x08
VK_TAB = 0x09
VK_RETURN = 0x0D
VK_SHIFT = 0x10
VK_CONTROL = 0x11
VK_MENU = 0x12  # Alt
VK_PAUSE = 0x13
VK_CAPITAL = 0x14
VK_ESCAPE = 0x1B
VK_SPACE = 0x20
VK_PRIOR = 0x21  # Page Up
VK_NEXT = 0x22   # Page Down
VK_END = 0x23
VK_HOME = 0x24
VK_LEFT = 0x25
VK_UP = 0x26
VK_RIGHT = 0x27
VK_DOWN = 0x28
VK_SNAPSHOT = 0x2C  # PrintScreen
VK_INSERT = 0x2D
VK_DELETE = 0x2E
VK_F5 = 0x74
VK_F11 = 0x7A
VK_LWIN = 0x5B
VK_RWIN = 0x5C
VK_APPS = 0x5D
VK_VOLUME_MUTE = 0xAD
VK_VOLUME_DOWN = 0xAE
VK_VOLUME_UP = 0xAF
VK_MEDIA_NEXT_TRACK = 0xB0
VK_MEDIA_PREV_TRACK = 0xB1
VK_MEDIA_STOP = 0xB2
VK_MEDIA_PLAY_PAUSE = 0xB3

# Win32 Structs
class MOUSEINPUT(ctypes.Structure):
    _fields_ = [
        ("dx", wintypes.LONG),
        ("dy", wintypes.LONG),
        ("mouseData", wintypes.DWORD),
        ("dwFlags", wintypes.DWORD),
        ("time", wintypes.DWORD),
        ("dwExtraInfo", ctypes.c_size_t),
    ]

class KEYBDINPUT(ctypes.Structure):
    _fields_ = [
        ("wVk", wintypes.WORD),
        ("wScan", wintypes.WORD),
        ("dwFlags", wintypes.DWORD),
        ("time", wintypes.DWORD),
        ("dwExtraInfo", ctypes.c_size_t),
    ]

class HARDWAREINPUT(ctypes.Structure):
    _fields_ = [
        ("uMsg", wintypes.DWORD),
        ("wParamL", wintypes.WORD),
        ("wParamH", wintypes.WORD),
    ]

class _INPUT_UNION(ctypes.Union):
    _fields_ = [
        ("mi", MOUSEINPUT),
        ("ki", KEYBDINPUT),
        ("hi", HARDWAREINPUT),
    ]

class INPUT(ctypes.Structure):
    _fields_ = [
        ("type", wintypes.DWORD),
        ("union", _INPUT_UNION),
    ]

class POINT(ctypes.Structure):
    _fields_ = [("x", ctypes.c_long), ("y", ctypes.c_long)]


def ensure_desktop_attached():
    """Ensure current thread is attached to the interactive Windows desktop."""
    try:
        h_winsta0 = user32.OpenWindowStationW("WinSta0", False, 0x00020000 | 0x037F)
        if h_winsta0:
            user32.SetProcessWindowStation(h_winsta0)
        h_desk = user32.OpenDesktopW("Default", 0, False, 0x01FF)
        if h_desk:
            user32.SetThreadDesktop(h_desk)
    except Exception:
        pass


class DesktopController:
    def __init__(self):
        ensure_desktop_attached()
        self.screen_width = user32.GetSystemMetrics(0)
        self.screen_height = user32.GetSystemMetrics(1)

    def refresh_screen_metrics(self):
        ensure_desktop_attached()
        self.screen_width = user32.GetSystemMetrics(0)
        self.screen_height = user32.GetSystemMetrics(1)
        return self.screen_width, self.screen_height

    def get_cursor_pos(self):
        ensure_desktop_attached()
        pt = POINT()
        if user32.GetCursorPos(ctypes.byref(pt)):
            return pt.x, pt.y
        return 0, 0

    def move_mouse_relative(self, dx, dy):
        """Move cursor relative to current position with sub-pixel or integer precision."""
        ensure_desktop_attached()
        inp = INPUT()
        inp.type = INPUT_MOUSE
        inp.union.mi.dx = int(dx)
        inp.union.mi.dy = int(dy)
        inp.union.mi.dwFlags = MOUSEEVENTF_MOVE
        user32.SendInput(1, ctypes.byref(inp), ctypes.sizeof(INPUT))

    def move_mouse_absolute(self, normalized_x, normalized_y):
        """Move mouse to absolute normalized coordinates (0.0 to 1.0)."""
        ensure_desktop_attached()
        target_x = max(0, min(self.screen_width - 1, int(normalized_x * self.screen_width)))
        target_y = max(0, min(self.screen_height - 1, int(normalized_y * self.screen_height)))
        user32.SetCursorPos(target_x, target_y)

    def mouse_click(self, button="left"):
        ensure_desktop_attached()
        down_flag, up_flag = {
            "left": (MOUSEEVENTF_LEFTDOWN, MOUSEEVENTF_LEFTUP),
            "right": (MOUSEEVENTF_RIGHTDOWN, MOUSEEVENTF_RIGHTUP),
            "middle": (MOUSEEVENTF_MIDDLEDOWN, MOUSEEVENTF_MIDDLEUP),
        }.get(button, (MOUSEEVENTF_LEFTDOWN, MOUSEEVENTF_LEFTUP))

        inp_down = INPUT()
        inp_down.type = INPUT_MOUSE
        inp_down.union.mi.dwFlags = down_flag

        inp_up = INPUT()
        inp_up.type = INPUT_MOUSE
        inp_up.union.mi.dwFlags = up_flag

        user32.SendInput(1, ctypes.byref(inp_down), ctypes.sizeof(INPUT))
        time.sleep(0.01)
        user32.SendInput(1, ctypes.byref(inp_up), ctypes.sizeof(INPUT))

    def mouse_down(self, button="left"):
        ensure_desktop_attached()
        down_flag = {
            "left": MOUSEEVENTF_LEFTDOWN,
            "right": MOUSEEVENTF_RIGHTDOWN,
            "middle": MOUSEEVENTF_MIDDLEDOWN,
        }.get(button, MOUSEEVENTF_LEFTDOWN)

        inp = INPUT()
        inp.type = INPUT_MOUSE
        inp.union.mi.dwFlags = down_flag
        user32.SendInput(1, ctypes.byref(inp), ctypes.sizeof(INPUT))

    def mouse_up(self, button="left"):
        ensure_desktop_attached()
        up_flag = {
            "left": MOUSEEVENTF_LEFTUP,
            "right": MOUSEEVENTF_RIGHTUP,
            "middle": MOUSEEVENTF_MIDDLEUP,
        }.get(button, MOUSEEVENTF_LEFTUP)

        inp = INPUT()
        inp.type = INPUT_MOUSE
        inp.union.mi.dwFlags = up_flag
        user32.SendInput(1, ctypes.byref(inp), ctypes.sizeof(INPUT))

    def mouse_double_click(self, button="left"):
        self.mouse_click(button)
        time.sleep(0.08)
        self.mouse_click(button)

    def mouse_scroll(self, delta_y, delta_x=0):
        ensure_desktop_attached()
        if delta_y != 0:
            inp = INPUT()
            inp.type = INPUT_MOUSE
            inp.union.mi.mouseData = int(delta_y)
            inp.union.mi.dwFlags = MOUSEEVENTF_WHEEL
            user32.SendInput(1, ctypes.byref(inp), ctypes.sizeof(INPUT))
        if delta_x != 0:
            inp = INPUT()
            inp.type = INPUT_MOUSE
            inp.union.mi.mouseData = int(delta_x)
            inp.union.mi.dwFlags = MOUSEEVENTF_HWHEEL
            user32.SendInput(1, ctypes.byref(inp), ctypes.sizeof(INPUT))

    def press_vk(self, vk, release=False):
        """Send virtual key down or up."""
        ensure_desktop_attached()
        inp = INPUT()
        inp.type = INPUT_KEYBOARD
        inp.union.ki.wVk = vk
        inp.union.ki.dwFlags = KEYEVENTF_KEYUP if release else 0
        user32.SendInput(1, ctypes.byref(inp), ctypes.sizeof(INPUT))

    def tap_vk(self, vk):
        """Send key down followed by key up."""
        self.press_vk(vk, release=False)
        time.sleep(0.015)
        self.press_vk(vk, release=True)

    def tap_combo(self, *vks):
        """Tap a key combination (e.g. Ctrl+C, Alt+Tab, Win+D)."""
        for vk in vks:
            self.press_vk(vk, release=False)
            time.sleep(0.01)
        for vk in reversed(vks):
            self.press_vk(vk, release=True)
            time.sleep(0.01)

    def type_unicode_text(self, text):
        """Type arbitrary Unicode string (supports emojis, accented chars, Indonesian text)."""
        ensure_desktop_attached()
        for char in text:
            # Key Down
            inp_down = INPUT()
            inp_down.type = INPUT_KEYBOARD
            inp_down.union.ki.wVk = 0
            inp_down.union.ki.wScan = ord(char)
            inp_down.union.ki.dwFlags = KEYEVENTF_UNICODE

            # Key Up
            inp_up = INPUT()
            inp_up.type = INPUT_KEYBOARD
            inp_up.union.ki.wVk = 0
            inp_up.union.ki.wScan = ord(char)
            inp_up.union.ki.dwFlags = KEYEVENTF_UNICODE | KEYEVENTF_KEYUP

            user32.SendInput(1, ctypes.byref(inp_down), ctypes.sizeof(INPUT))
            user32.SendInput(1, ctypes.byref(inp_up), ctypes.sizeof(INPUT))
            time.sleep(0.005)

    def execute_special_key(self, key_name):
        """Execute special key or shortcut."""
        key_name = key_name.lower().strip()
        key_map = {
            "enter": VK_RETURN,
            "backspace": VK_BACK,
            "tab": VK_TAB,
            "esc": VK_ESCAPE,
            "escape": VK_ESCAPE,
            "space": VK_SPACE,
            "delete": VK_DELETE,
            "up": VK_UP,
            "down": VK_DOWN,
            "left": VK_LEFT,
            "right": VK_RIGHT,
            "home": VK_HOME,
            "end": VK_END,
            "pageup": VK_PRIOR,
            "pagedown": VK_NEXT,
            "win": VK_LWIN,
            "volup": VK_VOLUME_UP,
            "voldown": VK_VOLUME_DOWN,
            "volmute": VK_VOLUME_MUTE,
            "playpause": VK_MEDIA_PLAY_PAUSE,
            "nexttrack": VK_MEDIA_NEXT_TRACK,
            "prevtrack": VK_MEDIA_PREV_TRACK,
            "printscreen": VK_SNAPSHOT,
            "f5": VK_F5,
            "f11": VK_F11,
        }

        if key_name in key_map:
            self.tap_vk(key_map[key_name])
            return True

        # Shortcuts
        shortcuts = {
            "copy": (VK_CONTROL, 0x43),            # Ctrl + C
            "paste": (VK_CONTROL, 0x56),           # Ctrl + V
            "cut": (VK_CONTROL, 0x58),             # Ctrl + X
            "undo": (VK_CONTROL, 0x5A),            # Ctrl + Z
            "redo": (VK_CONTROL, 0x59),            # Ctrl + Y
            "selectall": (VK_CONTROL, 0x41),       # Ctrl + A
            "save": (VK_CONTROL, 0x53),            # Ctrl + S
            "find": (VK_CONTROL, 0x46),            # Ctrl + F
            "alttab": (VK_MENU, VK_TAB),           # Alt + Tab
            "desktop": (VK_LWIN, 0x44),            # Win + D (Show Desktop)
            "explorer": (VK_LWIN, 0x45),           # Win + E (File Explorer)
            "run": (VK_LWIN, 0x52),                # Win + R (Run dialog)
            "taskmgr": (VK_CONTROL, VK_SHIFT, VK_ESCAPE), # Ctrl + Shift + Esc
            "lock": (VK_LWIN, 0x4C),               # Win + L (Lock PC)
            "snipping": (VK_LWIN, VK_SHIFT, 0x53), # Win + Shift + S
            "closewindow": (VK_MENU, 0x73),        # Alt + F4
            "altf4": (VK_MENU, 0x73),              # Alt + F4
            "winv": (VK_LWIN, 0x56),               # Win + V (Clipboard)
            "wintab": (VK_LWIN, VK_TAB),           # Win + Tab (Task View)
            "zoom_in": (VK_CONTROL, 0xBB),         # Ctrl + Plus
            "zoom_out": (VK_CONTROL, 0xBD),        # Ctrl + Minus
        }

        if key_name in shortcuts:
            self.tap_combo(*shortcuts[key_name])
            return True

        return False

    def get_open_windows(self):
        """Returns a list of all visible, active application windows."""
        ensure_desktop_attached()
        dwmapi = ctypes.windll.dwmapi
        windows = []

        def enum_cb(hwnd, lparam):
            if not user32.IsWindowVisible(hwnd):
                return True
            length = user32.GetWindowTextLengthW(hwnd)
            if length == 0:
                return True
            buff = ctypes.create_unicode_buffer(length + 1)
            user32.GetWindowTextW(hwnd, buff, length + 1)
            title = buff.value.strip()
            if not title:
                return True

            # Filter cloaked windows (UWP background apps)
            cloaked = ctypes.c_int(0)
            dwmapi.DwmGetWindowAttribute(hwnd, 14, ctypes.byref(cloaked), ctypes.sizeof(cloaked))
            if cloaked.value != 0:
                return True

            # Filter tool windows
            GWL_EXSTYLE = -20
            WS_EX_TOOLWINDOW = 0x00000080
            ex_style = user32.GetWindowLongW(hwnd, GWL_EXSTYLE)
            if ex_style & WS_EX_TOOLWINDOW:
                return True

            pid = wintypes.DWORD()
            user32.GetWindowThreadProcessId(hwnd, ctypes.byref(pid))

            # Query process executable name
            proc_name = ""
            h_proc = kernel32.OpenProcess(0x1000, False, pid.value)  # PROCESS_QUERY_LIMITED_INFORMATION
            if h_proc:
                buf = ctypes.create_unicode_buffer(512)
                size = wintypes.DWORD(512)
                if kernel32.QueryFullProcessImageNameW(h_proc, 0, buf, ctypes.byref(size)):
                    proc_name = os.path.basename(buf.value)
                kernel32.CloseHandle(h_proc)

            # Skip background shell processes
            ignored_titles = ["Program Manager", "Settings", "Windows Input Experience"]
            ignored_procs = ["shellexperiencehost.exe", "searchhost.exe"]
            if title in ignored_titles or proc_name.lower() in ignored_procs:
                return True

            is_min = bool(user32.IsIconic(hwnd))

            windows.append({
                "hwnd": int(hwnd),
                "title": title,
                "app": proc_name or "Aplikasi",
                "pid": pid.value,
                "is_minimized": is_min,
            })
            return True

        WNDENUMPROC = ctypes.WINFUNCTYPE(ctypes.c_bool, wintypes.HWND, wintypes.LPARAM)
        user32.EnumWindows(WNDENUMPROC(enum_cb), 0)
        return windows

    def activate_window(self, hwnd):
        """Brings the specified window to the foreground and un-minimizes it."""
        ensure_desktop_attached()
        SW_RESTORE = 9
        SW_SHOW = 5
        if user32.IsIconic(hwnd):
            user32.ShowWindow(hwnd, SW_RESTORE)
        else:
            user32.ShowWindow(hwnd, SW_SHOW)

        cur_thread = kernel32.GetCurrentThreadId()
        fg_hwnd = user32.GetForegroundWindow()
        fg_thread = user32.GetWindowThreadProcessId(fg_hwnd, None)

        if cur_thread != fg_thread:
            user32.AttachThreadInput(cur_thread, fg_thread, True)

        user32.BringWindowToTop(hwnd)
        res = bool(user32.SetForegroundWindow(hwnd))

        if cur_thread != fg_thread:
            user32.AttachThreadInput(cur_thread, fg_thread, False)

        return res

    def minimize_window(self, hwnd):
        ensure_desktop_attached()
        return bool(user32.ShowWindow(hwnd, 6))  # SW_MINIMIZE

    def maximize_window(self, hwnd):
        ensure_desktop_attached()
        return bool(user32.ShowWindow(hwnd, 3))  # SW_MAXIMIZE

    def close_window(self, hwnd):
        ensure_desktop_attached()
        WM_CLOSE = 0x0010
        return bool(user32.PostMessageW(hwnd, WM_CLOSE, 0, 0))

    def system_action(self, action_name):
        """Execute Windows system power actions."""
        action_name = action_name.lower().strip()
        if action_name == "lock":
            user32.LockWorkStation()
            return True
        elif action_name == "sleep":
            # Sleep PC
            subprocess.run(["powershell", "-Command", "rundll32.exe powrprof.dll,SetSuspendState 0,1,0"], shell=True)
            return True
        elif action_name == "restart":
            subprocess.run(["shutdown", "/r", "/t", "5"], shell=True)
            return True
        elif action_name == "shutdown":
            subprocess.run(["shutdown", "/s", "/t", "5"], shell=True)
            return True
        elif action_name == "cancel_shutdown":
            subprocess.run(["shutdown", "/a"], shell=True)
            return True
        return False
