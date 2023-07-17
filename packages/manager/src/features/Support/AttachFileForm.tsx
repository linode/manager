import AttachFile from '@mui/icons-material/AttachFile';
import { Theme } from '@mui/material/styles';
import { WithStyles, createStyles, withStyles } from '@mui/styles';
import { equals, remove } from 'ramda';
import * as React from 'react';
import { compose } from 'recompose';

import { Button } from 'src/components/Button/Button';

import AttachFileListItem from './AttachFileListItem';
import { FileAttachment } from './index';
import { reshapeFiles } from './ticketUtils';

type ClassNames = 'attachFileButton';

const styles = (theme: Theme) =>
  createStyles({
    attachFileButton: {
      marginBottom: 4,
      marginTop: theme.spacing(2),
    },
  });

interface Props {
  files: FileAttachment[];
  updateFiles: any;
}

type CombinedProps = Props & WithStyles<ClassNames>;

export class AttachFileForm extends React.Component<CombinedProps, {}> {
  render() {
    const { classes, files } = this.props;
    return (
      <React.Fragment>
        <input
          id="attach-file"
          multiple
          onChange={this.selectFile}
          ref={this.inputRef}
          style={{ display: 'none' }}
          type="file"
        />
        <Button
          buttonType="secondary"
          className={classes.attachFileButton}
          compactX
          onClick={this.clickAttachButton}
        >
          <AttachFile />
          Attach a file
        </Button>
        {files.map((file, idx) => (
          <AttachFileListItem
            file={file}
            fileIdx={idx}
            key={idx}
            removeFile={this.removeFile}
          />
        ))}
      </React.Fragment>
    );
  }

  shouldComponentUpdate(nextProps: CombinedProps) {
    return (
      !equals(this.props.files, nextProps.files) ||
      !equals(this.props.classes, nextProps.classes)
    );
  }

  clickAttachButton = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (this.inputRef.current) {
      this.inputRef.current.click();
    }
  };

  handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files: selectedFiles } = e.target;
    const { files, updateFiles } = this.props;

    if (selectedFiles && selectedFiles.length) {
      const reshapedFiles = reshapeFiles(selectedFiles);
      updateFiles([...files, ...reshapedFiles]);
    }
  };

  inputRef = React.createRef<HTMLInputElement>();

  removeFile = (fileIdx: number) => {
    const { files, updateFiles } = this.props;
    const newFiles = remove(fileIdx, 1, files);
    if (this.inputRef.current) {
      this.inputRef.current.value = '';
    }
    // Send the updated file list to the parent component's state
    updateFiles(newFiles);
  };

  selectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.handleFileSelected(e);
    if (this.inputRef.current) {
      this.inputRef.current.value = '';
    }
  };
}

const styled = withStyles(styles);

export default compose<CombinedProps, Props>(styled)(AttachFileForm);
