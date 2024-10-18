import {
  type Dispatch,
  type SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import { latestVersion, updateToLatestVersion } from "../utils/Versioning";

export function useLocalStorage<T>(
  key: string,
  defaultState: T
): [T, Dispatch<SetStateAction<T>>] {
  const state = useState<T>(() => {
    try {
      const value = localStorage.getItem(key);
      if (value) {
        const parsedValue = JSON.parse(value);
        return updateToLatestVersion(parsedValue) as T;
      }
    } catch (error: any) {
      if (typeof window !== "undefined") {
        console.error(error);
      }
    }

    return defaultState;
  });
  const value = state[0];

  const isFirstRenderRef = useRef(true);
  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }
    try {
      if (value === null) {
        localStorage.removeItem(key);
      } else {
        const valueWithVersion = {
          version: latestVersion, // Add the version back here
          ...value, // Retain the existing data
        };
        localStorage.setItem(key, JSON.stringify(valueWithVersion));
      }
    } catch (error: any) {
      if (typeof window !== "undefined") {
        console.error(error);
      }
    }
  }, [value, key]);

  return state;
}
