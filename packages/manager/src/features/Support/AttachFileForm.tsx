import { Button } from '@linode/ui';
import AttachFile from '@mui/icons-material/AttachFile';
import { remove } from 'ramda';
import * as React from 'react';

import { AttachFileListItem } from './AttachFileListItem';
import { reshapeFiles } from './ticketUtils';

import type { FileAttachment } from './index';

interface Props {
  files: FileAttachment[];
  updateFiles: (newFiles: FileAttachment[]) => void;
}

export const AttachFileForm = (props: Props) => {
  const { files, updateFiles } = props;

  const clickAttachButton = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files: selectedFiles } = e.target;

    if (selectedFiles && selectedFiles.length) {
      const reshapedFiles = reshapeFiles(selectedFiles);
      updateFiles([...files, ...reshapedFiles]);
    }
  };

  const inputRef = React.useRef<HTMLInputElement>(null);

  const removeFile = (fileIdx: number) => {
    const newFiles = remove(fileIdx, 1, files);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    // Send the updated file list to the parent component's state
    updateFiles(newFiles);
  };

  const selectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelected(e);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <React.Fragment>
      <input
        id="attach-file"
        multiple
        onChange={selectFile}
        ref={inputRef}
        style={{ display: 'none' }}
        type="file"
      />
      <Button
        buttonType="secondary"
        compactX
        onClick={clickAttachButton}
        sx={(theme) => ({
          display: 'flex',
          justifyContent: 'flex-start',
          marginTop: theme.spacing(1),
        })}
      >
        <AttachFile />
        Attach a file
      </Button>
      {files.map((file, idx) => (
        <AttachFileListItem
          file={file}
          fileIdx={idx}
          key={idx}
          removeFile={removeFile}
        />
      ))}
    </React.Fragment>
  );
};
