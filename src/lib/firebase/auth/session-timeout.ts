import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const WARNING_TIMEOUT = 5 * 60 * 1000; // 5 minutes

let timeoutId: NodeJS.Timeout | null = null;
let warningTimeoutId: NodeJS.Timeout | null = null;

export function startSessionTimeout() {
  resetSessionTimeout();
  window.addEventListener('mousemove', resetSessionTimeout);
  window.addEventListener('keypress', resetSessionTimeout);
  window.addEventListener('scroll', resetSessionTimeout);
  window.addEventListener('click', resetSessionTimeout);
}

export function stopSessionTimeout() {
  if (timeoutId) {
    clearTimeout(timeoutId);
    timeoutId = null;
  }
  if (warningTimeoutId) {
    clearTimeout(warningTimeoutId);
    warningTimeoutId = null;
  }
  window.removeEventListener('mousemove', resetSessionTimeout);
  window.removeEventListener('keypress', resetSessionTimeout);
  window.removeEventListener('scroll', resetSessionTimeout);
  window.removeEventListener('click', resetSessionTimeout);
}

function resetSessionTimeout() {
  if (timeoutId) {
    clearTimeout(timeoutId);
  }
  if (warningTimeoutId) {
    clearTimeout(warningTimeoutId);
  }

  warningTimeoutId = setTimeout(() => {
    showWarning();
  }, SESSION_TIMEOUT - WARNING_TIMEOUT);

  timeoutId = setTimeout(() => {
    handleSessionTimeout();
  }, SESSION_TIMEOUT);
}

function showWarning() {
  const warning = document.createElement('div');
  warning.className = 'fixed top-4 right-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4';
  warning.innerHTML = `
    <p class="font-bold">Session Timeout Warning</p>
    <p>Your session will expire in 5 minutes due to inactivity.</p>
  `;
  document.body.appendChild(warning);
  setTimeout(() => {
    warning.remove();
  }, WARNING_TIMEOUT);
}

async function handleSessionTimeout() {
  try {
    await signOut(auth);
    window.location.href = '/login?timeout=true';
  } catch (error) {
    console.error('Error during session timeout:', error);
  }
} 