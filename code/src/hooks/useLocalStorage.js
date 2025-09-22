import { useState, useEffect } from "react";

/**
 * useLocalStorage Hook
 *
 * A custom React hook that synchronizes a piece of state with localStorage.
 * - On initialization: reads the value from localStorage (if present).
 * - On updates: serializes the state to JSON and writes back to localStorage.
 *
 * Usage:
 *   const [name, setName] = useLocalStorage("profile:name", "Anonymous");
 *
 *   - The first call tries to load "profile:name" from localStorage.
 *   - If no value is found, "Anonymous" becomes the initial state.
 *   - Whenever 'setName' is called, both React state and localStorage update.
 *
 * @param {string} key - The key under which the value is stored in localStorage.
 * @param {*} initial - Default value to use if nothing is stored yet.
 * @returns {[any, Function]} A stateful value and a setter (same interface as useState).
 */
export function useLocalStorage(key, initial) {
  // Initialize state. On first render, check localStorage for an existing value.
  // If found, parse the JSON string back into a JS value; otherwise, use 'initial'.
  const [value, setValue] = useState(() => {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : initial;
  });

  // Effect: whenever 'key' or 'value' changes, update localStorage with the new value.
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  // Return the state value and setter, just like React.useState.
  return [value, setValue];
}
