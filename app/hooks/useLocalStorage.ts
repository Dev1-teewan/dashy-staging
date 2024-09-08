export const useLocalStorage = (key: string) => {
  const getLocalStorage = () => {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : {};
  };

  const setLocalStorage = (value: any) => {
    localStorage.setItem(key, JSON.stringify(value));
  };

  return [getLocalStorage, setLocalStorage] as const;
};
