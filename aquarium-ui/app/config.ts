let API_BASE_URL = "http://localhost:3000";

// Load config from API on the client side
if (typeof window !== "undefined") {
  fetch("/api/config")
    .then((response) => response.json())
    .then((config) => {
      API_BASE_URL = config.API_BASE_URL;
    })
    .catch((error) => {
      console.error("Failed to load config:", error);
    });
}

export { API_BASE_URL };
