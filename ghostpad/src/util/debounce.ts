/* eslint-disable @typescript-eslint/no-explicit-any */
export const debounce = (
  fn: (...args: any[]) => any,
  delay: number
) => {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
};
