export const reshapeFiles = (files: FileList) => {
  const reshapedFiles = [];

  /* tslint:disable-next-line */
  for (let i = 0; i < files.length; i++) {
    reshapedFiles.push({
      name: files[i].name,
      /* The file! These can be quite big */
      file: files[i],
      /* Used to keep track of initial upload status */
      uploading: false,
      /* Used to ensure that the file doesn't get uploaded again */
      uploaded: false
    });
  }

  return reshapedFiles;
};
