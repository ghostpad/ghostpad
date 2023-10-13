export const sanitizeFilename = (filename: string) => {
  // Regex from https://stackoverflow.com/questions/42210199/remove-illegal-characters-from-a-file-name-but-leave-spaces
  return filename.replace(/[/\\?%*:|"<>]/g, "-");
};