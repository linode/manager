import AttachFile from '@material-ui/icons/AttachFile';
import { equals, remove } from 'ramda';
import * as React from 'react';
import { compose } from 'recompose';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';

import Button from 'src/components/Button';

import AttachFileListItem from './AttachFileListItem';
import { FileAttachment } from './index';
import { reshapeFiles } from './ticketUtils';

type ClassNames = 'root' | 'attachFileButton';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {},
  attachFileButton: {
    paddingLeft: 14,
    paddingRight: 20,
    marginTop: theme.spacing.unit,
    marginBottom: theme.spacing.unit * 2
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
    return !equals(this.props.files, nextProps.files);
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
          type="secondary"
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

export default compose<CombinedProps, Props>(
  styled,
  React.memo
)(AttachFileForm);
