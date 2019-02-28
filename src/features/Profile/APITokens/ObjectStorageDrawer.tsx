import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Drawer from 'src/components/Drawer';
import Notice from 'src/components/Notice';
import TextField from 'src/components/TextField';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {}
});

export interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  errors?: Linode.ApiFieldError[];
}

type CombinedProps = Props & WithStyles<ClassNames>;

export const ObjectStorageDrawer: React.StatelessComponent<
  CombinedProps
> = props => {
  const { open, onClose, onSubmit, errors } = props;
  return (
    <Drawer title="Create an Object Storage Key" open={open} onClose={onClose}>
      {errors &&
        errors.map(error => (
          <Notice key={error.reason} text={error.reason} error data-qa-error />
        ))}
      <Typography>
        Generate an Object Storage key pair for use with an S3-compatible
        client.
      </Typography>

      {/* @todo: This label field doesn't actually do anything yet */}
      <TextField label="Label" data-qa-add-label />

      <ActionsPanel>
        <Button type="primary" onClick={onSubmit} data-qa-submit>
          Submit
        </Button>
        <Button
          onClick={onClose}
          data-qa-cancel
          type="secondary"
          className="cancel"
        >
          Cancel
        </Button>
      </ActionsPanel>
    </Drawer>
  );
};

const styled = withStyles(styles);

export default styled(ObjectStorageDrawer);
