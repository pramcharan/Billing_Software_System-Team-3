const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:5000/api';

export const apiRequest = async (
  endpoint,
  options = {}
) => {
  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      ...options,

      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    }
  );

  let result = null;

  try {
    result = await response.json();
  } catch {
    result = null;
  }

  if (!response.ok) {
    const error = new Error(
      result?.message ||
        `Request failed with status ${response.status}`
    );

    error.status = response.status;
    error.errors = result?.errors || [];

    throw error;
  }

  return result;
};

export default API_BASE_URL;