import { useCallback, useState } from 'react';

function readStorage(key, initialValue) {
  try {
    const stored = window.localStorage.getItem(key);
    if (!stored) return initialValue;
    try {
      return JSON.parse(stored);
    } catch {
      return stored;
    }
  } catch {
    return initialValue;
  }
}

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => readStorage(key, initialValue));

  const setStoredValue = useCallback(
    (nextValue) => {
      setValue((currentValue) => {
        const resolvedValue =
          typeof nextValue === 'function' ? nextValue(currentValue) : nextValue;
        try {
          window.localStorage.setItem(key, JSON.stringify(resolvedValue));
        } catch {
          // localStorage can fail in privacy modes; state should still update.
        }
        return resolvedValue;
      });
    },
    [key],
  );

  const removeStoredValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Ignore storage failures.
    }
    setValue(initialValue);
  }, [initialValue, key]);

  return [value, setStoredValue, removeStoredValue];
}
