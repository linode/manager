import type { FileAttachment } from './index';

export const OFFICIAL_USERNAMES = ['Linode', 'Linode Trust & Safety'];

export const reshapeFiles = (files: FileList) => {
  const reshapedFiles = [];

  /* tslint:disable-next-line */
  for (let i = 0; i < files.length; i++) {
    reshapedFiles.push({
      /* The file! These can be quite big */
      file: files[i],
      name: files[i].name,
      /* Used to ensure that the file doesn't get uploaded again */
      uploaded: false,
      /* Used to keep track of initial upload status */
      uploading: false,
    });
  }

  return reshapedFiles;
};

export const updateFileAtIndex = (
  files: FileAttachment[],
  index: number,
  updates: Partial<FileAttachment>
): FileAttachment[] =>
  files.map((file, i) => (i === index ? { ...file, ...updates } : file));
