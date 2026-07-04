const ACTIVE_SESSION_KEY = "proofbox_active_session";
const HISTORY_KEY = "proofbox_session_history";
const MEMORY_KEY = "proofbox_user_memory";

function hasWxStorage() {
  return typeof wx !== "undefined" && wx && typeof wx.setStorageSync === "function";
}

const memoryFallback = new Map();

function read(key) {
  if (hasWxStorage()) {
    return wx.getStorageSync(key);
  }
  return memoryFallback.get(key);
}

function write(key, value) {
  if (hasWxStorage()) {
    wx.setStorageSync(key, value);
    return;
  }
  memoryFallback.set(key, value);
}

export function saveActiveSession(session) {
  const next = {
    ...session,
    updatedAt: new Date().toISOString()
  };
  write(ACTIVE_SESSION_KEY, next);
  return next;
}

export function loadActiveSession() {
  return read(ACTIVE_SESSION_KEY);
}

export function clearActiveSession() {
  if (hasWxStorage()) {
    wx.removeStorageSync(ACTIVE_SESSION_KEY);
    return;
  }
  memoryFallback.delete(ACTIVE_SESSION_KEY);
}

export function archiveSession(session) {
  const history = read(HISTORY_KEY) || [];
  const nextHistory = [session, ...history].slice(0, 20);
  write(HISTORY_KEY, nextHistory);
}

export function loadUserMemory() {
  return read(MEMORY_KEY) || {
    preferredCategory: "phone",
    tone: "礼貌但坚定",
    privacyReminder: true,
    platform: "电商平台"
  };
}

export function updateUserMemory(patch) {
  const next = {
    ...loadUserMemory(),
    ...patch,
    updatedAt: new Date().toISOString()
  };
  write(MEMORY_KEY, next);
  return next;
}

export function resetUserMemory() {
  if (hasWxStorage()) {
    wx.removeStorageSync(MEMORY_KEY);
    return;
  }
  memoryFallback.delete(MEMORY_KEY);
}
