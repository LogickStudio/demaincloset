
export const getItem = <T,>(key: string): T | null => {
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) as T : null;
  } catch (error) {
    console.error(`Error reading localStorage key "${key}":`, error);
    return null;
  }
};

export const setItem = <T,>(key: string, value: T): void => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error setting localStorage key "${key}":`, error);
  }
};

export const removeItem = (key: string): void => {
  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing localStorage key "${key}":`, error);
  }
};
