import axios from "axios";

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

client.interceptors.request.use((config) => {
  const existingAuth = config.headers?.Authorization;
  if (!existingAuth) {
    const access = window.localStorage.getItem("access");
    if (access) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${access}`;
    }
  }
  return config;
});

async function request(method, path, body, token) {
  const config = {
    method,
    url: path,
    headers: {},
  };

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (method === "GET" || method === "DELETE") {
    if (body) config.params = body;
  } else if (body) {
    config.data = body;

    if (body instanceof FormData) {
      if (config.headers && "Content-Type" in config.headers) {
        delete config.headers["Content-Type"];
      }
      if (config.headers && "content-type" in config.headers) {
        delete config.headers["content-type"];
      }
    }
  }

  try {
    const res = await client.request(config);

    const json = res.data;

    const successFlag =
      json && typeof json === "object" && "success" in json
        ? json.success
        : true;

    if (successFlag === false) {
      const message =
        (json && (json.message || json.detail)) ||
        "Request failed (success=false)";
      const error = new Error(message);
      error.status = res.status;
      error.payload = json;
      throw error;
    }

    if (json && typeof json === "object" && "data" in json) {
      return json.data;
    }

    return json;
  } catch (err) {
    if (err.response) {
      const { status, data } = err.response;
      const message =
        (data && (data.message || data.detail)) ||
        err.message ||
        `Request failed with status ${status}`;
      const error = new Error(message);
      error.status = status;
      error.payload = data;
      throw error;
    }
    throw err;
  }
}

const api = {
  client,
  get: (path, token) => request("GET", path, null, token),
  post: (path, body, token) => request("POST", path, body, token),
  put: (path, body, token) => request("PUT", path, body, token),
  delete: (path, body, token) => request("DELETE", path, body, token),
  patch: (path, body, token) => request("PATCH", path, body, token),
};

export default api;
