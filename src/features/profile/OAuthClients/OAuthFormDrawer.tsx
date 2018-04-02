import * as React from 'react';
import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
} from 'material-ui';

import FormControl from 'material-ui/Form/FormControl';
import FormControlLabel from 'material-ui/Form/FormControlLabel';
import Button from 'material-ui/Button';
import Drawer from 'src/components/Drawer';
import ActionsPanel from 'src/components/ActionsPanel';

import TextField from 'src/components/TextField';
import CheckBox from 'src/components/CheckBox';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
});

interface Props {
  open: boolean;
  label?: string;
  redirect_uri?: string;
  public: boolean;
  errors?: { field: string, reason: string }[];
  edit?: boolean;
  onClose: () => void;
  onSubmit: () => void;
  onCancel: () => void;
  onChange: (key: string, value: string | boolean) => void;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const OAuthCreationDrawer: React.StatelessComponent<CombinedProps> = (props) => {
  const {
    label,
    redirect_uri,
    open,
    public: isPublic,
    edit,
    errors,
    onClose,
    onCancel,
    onChange,
    onSubmit,
  } = props;

  const hasErrorFor = getErrors(errors);

  return (
    <Drawer title="Create OAuth Client" open={open} onClose={onClose}>
      <TextField
        value={label || ''}
        errorText={hasErrorFor('label')}
        label="Label"
        onChange={e => onChange('label', e.target.value)}
      />
      <TextField
        value={redirect_uri || ''}
        label="Callback URL"
        errorText={hasErrorFor('redirect_uri')}
        onChange={e => onChange('redirect_uri', e.target.value)}
      />
      <FormControl>
        <FormControlLabel
          label="Public"
          control={
            <CheckBox
              onChange={() => onChange('public', !isPublic)}
              checked={isPublic}
              disabled={edit}
            />
          }
        />
      </FormControl>
      <ActionsPanel>
        <Button variant="raised" color="primary" onClick={() => onSubmit()}>Submit</Button>
        <Button onClick={() => onCancel()}>Cancel</Button>
      </ActionsPanel>
    </Drawer>
  );
};

OAuthCreationDrawer.defaultProps = {
  label: '',
  redirect_uri: '',
  errors: [],
};

const styled = withStyles(styles, { withTheme: true });

export default styled<Props>(OAuthCreationDrawer);

const errorResources = {
  label: 'A label',
  redirect_uri: 'A callback URL',
};

const getErrors = (arr: Linode.ApiFieldError[] = []) => (field: string): undefined | string => {

  const err = arr.find(e => e.field === field);
  if (!err) {
    return;
  }
  return err.reason.replace(err.field, errorResources[err.field]);
};
