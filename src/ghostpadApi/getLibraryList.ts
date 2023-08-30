export const getLibraryList = (fileType: string) => {
  return fetch(`/api/library/list?${new URLSearchParams({ fileType })}`, {
    method: "GET",
  });
};
