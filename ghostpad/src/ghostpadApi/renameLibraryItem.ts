export const renameLibraryItem = (filename: string, newName: string, fileType: string) => {
  return fetch("/ghostpad/api/library/rename", {
    method: "POST",
    body: JSON.stringify({
      filename,
      newName,
      fileType,
    }),
  });
};
