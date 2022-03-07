/**
 * Code from:
 * https://stackoverflow.com/questions/3665115/how-to-create-a-file-in-memory-for-user-to-download-but-not-through-server
 *
 * downloadFile
 *
 * @param filename (String) the name of the target file, e.g. 'package.json'
 * @param fileString (String) the contents to be written to the file
 */

export const downloadFile = (filename: string, fileString: string) => {
  const blob = new Blob([fileString], { type: 'text/yaml' });
  if (window.navigator.msSaveOrOpenBlob) {
    window.navigator.msSaveOrOpenBlob(blob, filename);
  } else {
    const elem = window.document.createElement('a');
    elem.href = window.URL.createObjectURL(blob);
    elem.download = filename;
    document.body.appendChild(elem);
    elem.click();
    document.body.removeChild(elem);
  }
};
