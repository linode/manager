import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import CheckBox from 'src/components/CheckBox';
import FormControl from 'src/components/core/FormControl';
import FormControlLabel from 'src/components/core/FormControlLabel';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Drawer from 'src/components/Drawer';
import Notice from 'src/components/Notice';
import TextField from 'src/components/TextField';
import getAPIErrorsFor from 'src/utilities/getAPIErrorFor';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {}
});

interface Props {
  open: boolean;
  loading: boolean;
  label?: string;
  redirect_uri?: string;
  public: boolean;
  errors?: Linode.ApiFieldError[];
  edit?: boolean;
  onClose: () => void;
  onSubmit: () => void;
  onChangeLabel: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onChangeRedirectURI: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onChangePublic: () => void;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const OAuthCreationDrawer: React.StatelessComponent<CombinedProps> = props => {
  const {
    label,
    redirect_uri,
    open,
    public: isPublic,
    edit,
    errors,
    loading,
    onClose,
    onSubmit
  } = props;

  const errorResources = {
    label: 'A label',
    redirect_uri: 'A callback URL'
  };

  const hasErrorFor = getAPIErrorsFor(errorResources, errors);

  return (
    <Drawer
      title={`${edit ? 'Edit' : 'Create'} OAuth App`}
      open={open}
      onClose={onClose}
    >
      {hasErrorFor('none') && <Notice text={hasErrorFor('none')} error />}
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
          type="primary"
          onClick={onSubmit}
          loading={loading}
          data-qa-submit
        >
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

OAuthCreationDrawer.defaultProps = {
  label: '',
  redirect_uri: '',
  errors: []
};

const styled = withStyles(styles);

export default styled(OAuthCreationDrawer);
