import axios from "axios";

const API_URL = "http://127.0.0.1:9000"; // Replace with your backend URL

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};

// Intercept requests to check if token exists in localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const signUp = async (userData) => {
  try {
    const response = await api.post("/signup", userData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const signIn = async (credentials) => {
  try {
    const response = await api.post("/signin", credentials);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// in api.js
export const getBoard = async () => {
  try {
    const response = await api.get("/game/board");
    console.log("Raw API response:", response);
    console.log("Board data:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error in getBoard:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch game board"
    );
  }
};

export const makeMove = async (moveData) => {
  try {
    const response = await api.put("/game/make_move", moveData);
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(
        error.response.data.message || "An error occurred while making the move"
      );
    }
    throw error;
  }
};

export const resetBoard = async () => {
  try {
    const response = await api.post("/game/reset");
    console.log("Reset board response:", response);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 400) {
      // The board is already in its initial state
      console.log("Board is already in initial state");
      return { message: "Board is already in initial state" };
    }
    console.error("Error in resetBoard:", error);
    throw new Error(
      error.response?.data?.message || "Failed to reset game board"
    );
  }
};

export const logout = () => {
  localStorage.removeItem("token");
};

// Add more API calls as needed

export default api;