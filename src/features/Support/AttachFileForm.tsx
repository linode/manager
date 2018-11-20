import { remove } from 'ramda';
import * as React from 'react';

import { StyleRulesCallback, withStyles, WithStyles } from 'src/components/core/styles';

import AttachFile from '@material-ui/icons/AttachFile';

import Button from 'src/components/Button';

import AttachFileListItem from './AttachFileListItem';

type ClassNames = 'root'
| 'attachFileButton';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
  attachFileButton: {
    paddingLeft: 14,
    paddingRight: 20,
    marginTop: theme.spacing.unit,
    marginBottom: theme.spacing.unit * 2,
  },
});

export interface FileAttachment {
  name: string,
  file: File,
  /* Used to keep track of initial upload status */
  uploading: boolean,
  /* Used to ensure that the file doesn't get uploaded again */
  uploaded: boolean,
  /* Each file needs to keep track of its own errors because each request hits the same endpoint */
  errors?: Linode.ApiFieldError[];
}

interface Props {
  files: FileAttachment[];
  handleFileSelected: any;
  updateFiles: any;
  inlineDisplay?: boolean;
}

type CombinedProps = Props & WithStyles<ClassNames>;

export class AttachFileForm extends React.Component<CombinedProps, {}> {
  inputRef = React.createRef<HTMLInputElement>();

  clickAttachButton = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (this.inputRef.current) {
      this.inputRef.current.click();
    }
  }

  removeFile = (fileIdx: number) => {
    const { files, updateFiles } = this.props;
    const newFiles = remove(fileIdx, 1, files);
    if (this.inputRef.current) {
      this.inputRef.current.value = '';
    }
    // Send the updated file list to the parent component's state
    updateFiles(newFiles);
  }

  selectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.props.handleFileSelected(e);
    if (this.inputRef.current) {
      this.inputRef.current.value = '';
    }
  }

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
};

const styled = withStyles(styles);

export default styled(AttachFileForm);
