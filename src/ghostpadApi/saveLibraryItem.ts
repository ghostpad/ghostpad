export const saveLibraryItem = (
  filename: string,
  fileType: string,
  content: string,
  overwrite: boolean
) => {
  return fetch("/api/library/save", {
    method: "POST",
    body: JSON.stringify({
      filename,
      fileType,
      content,
      overwrite,
    }),
  });
};
