import { WithStyles } from '@material-ui/core/styles';
import AttachFile from '@material-ui/icons/AttachFile';
import { equals, remove } from 'ramda';
import * as React from 'react';
import { compose } from 'recompose';
import { createStyles, Theme, withStyles } from 'src/components/core/styles';

import Button from 'src/components/Button';

import AttachFileListItem from './AttachFileListItem';
import { FileAttachment } from './index';
import { reshapeFiles } from './ticketUtils';

type ClassNames = 'root' | 'attachFileButton';

const styles = (theme: Theme) =>
  createStyles({
    root: {},
    attachFileButton: {
      padding: '4px 8px 4px 4px',
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(2)
    }
  });

interface Props {
  files: FileAttachment[];
  updateFiles: any;
  inlineDisplay?: boolean;
}

type CombinedProps = Props & WithStyles<ClassNames>;

export class AttachFileForm extends React.Component<CombinedProps, {}> {
  inputRef = React.createRef<HTMLInputElement>();

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
    const { updateFiles, files } = this.props;

    if (selectedFiles && selectedFiles.length) {
      const reshapedFiles = reshapeFiles(selectedFiles);
      updateFiles([...files, ...reshapedFiles]);
    }
  };

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

  render() {
    const { classes, files, inlineDisplay } = this.props;
    return (
      <React.Fragment>
        <input
          ref={this.inputRef}
          type="file"
          multiple
          id="attach-file"
          style={{ display: 'none' }}
          onChange={this.selectFile}
        />
        <Button
          component="span"
          className={classes.attachFileButton}
          buttonType="secondary"
          onClick={this.clickAttachButton}
        >
          <AttachFile />
          Attach a file
        </Button>
        {files.map((file, idx) => (
          <AttachFileListItem
            key={idx}
            inlineDisplay={Boolean(inlineDisplay)}
            file={file}
            fileIdx={idx}
            removeFile={this.removeFile}
          />
        ))}
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles);

export default compose<CombinedProps, Props>(styled)(AttachFileForm);
