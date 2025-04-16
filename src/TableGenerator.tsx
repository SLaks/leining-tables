import { Component, createSignal } from "solid-js";

export const TableGenerator: Component = () => {};

function usePersistentState<T>(name: string, initialValue: T) {
  const storedValue = localStorage.getItem(name);
  const [state, setState] = createSignal<T>(
    storedValue ? (JSON.parse(storedValue) as T) : initialValue,
    { name }
  );

  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  const setPersistentState = (value: Exclude<T, Function>) => {
    localStorage.setItem(name, JSON.stringify(value));
    setState(value);
  };

  return [state, setPersistentState];
}
