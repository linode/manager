import * as React from 'react';

import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';

import ActionsPanel from 'src/components/ActionsPanel';
import CheckBox from 'src/components/CheckBox';
import Drawer from 'src/components/Drawer';
import TextField from 'src/components/TextField';
import getAPIErrorsFor from 'src/utilities/getAPIErrorFor';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
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
  onChangeLabel: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onChangeRedirectURI: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onChangePublic: () => void;
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
    onSubmit,
  } = props;

  const errorResources = {
    label: 'A label',
    redirect_uri: 'A callback URL',
  };

  const hasErrorFor = getAPIErrorsFor(errorResources, errors);

  return (
    <Drawer title={`${ edit ? 'Edit' : 'Create'} My App`} open={open} onClose={onClose}>
      <TextField
        value={label || ''}
        errorText={hasErrorFor('label')}
        label="Label"
        onChange={props.onChangeLabel}
        data-qa-add-label
      />
      <TextField
        value={redirect_uri || ''}
        label="Callback URL"
        errorText={hasErrorFor('redirect_uri')}
        onChange={props.onChangeRedirectURI}
        data-qa-callback
      />
      <FormControl>
        <FormControlLabel
          label="Public"
          control={
            <CheckBox
              onChange={props.onChangePublic}
              checked={isPublic}
              disabled={edit}
              data-qa-public
            />
          }
        />
      </FormControl>
      <ActionsPanel>
        <Button
          variant="raised"
          color="primary"
          onClick={onSubmit}
          data-qa-submit
          >Submit
        </Button>
        <Button
          onClick={onClose} data-qa-cancel
          variant="raised"
          color="secondary"
          className="cancel"
        >
          Cancel
        </Button>
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
