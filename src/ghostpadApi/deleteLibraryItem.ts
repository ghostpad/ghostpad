export const deleteLibraryItem = (filename: string, fileType: string) => {
  return fetch("/api/library/remove", {
    method: "POST",
    body: JSON.stringify({
      filename,
      fileType,
    }),
  });
};
