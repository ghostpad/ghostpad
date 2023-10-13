export const loadLibraryItem = (fileType: string, filename: string) => {
  return fetch(
    `/ghostpad/api/library/load?${new URLSearchParams({
      fileType,
      filename,
    })}`,
    {
      method: "GET",
    }
  );
};
