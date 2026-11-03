const API_BASE =
  window.location.protocol === "file:" ? "http://localhost:3000/api" : "/api";

const TOKEN_KEY = "vertice_token";
const USER_KEY = "vertice_user";

async function apiRequest(path, options = {}) {
  const method = options.method || "GET";
  const auth = options.auth === true;
  const headers = { "Content-Type": "application/json" };

  if (auth) {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      headers.Authorization = "Bearer " + token;
    }
  }

  let response;

  try {
    response = await fetch(API_BASE + path, {
      method: method,
      headers: headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
  } catch (networkError) {
    const error = new Error("No se pudo conectar con el servidor");
    error.status = 0;
    throw error;
  }

  const text = await response.text();
  let data = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      data = { message: text };
    }
  }

  if (!response.ok) {
    const error = new Error((data && data.message) || "Error en la solicitud");
    error.status = response.status;
    error.details = data ? data.errors : null;
    throw error;
  }

  return data;
}

function saveSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function getStoredUser() {
  const raw = localStorage.getItem(USER_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch (parseError) {
    return null;
  }
}
