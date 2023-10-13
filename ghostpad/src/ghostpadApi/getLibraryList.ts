export const getLibraryList = (fileType: string) => {
  return fetch(`/ghostpad/api/library/list?${new URLSearchParams({ fileType })}`, {
    method: "GET",
  });
};
