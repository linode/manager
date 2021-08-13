import { APIError } from '@linode/api-v4/lib/types';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import CheckBox from 'src/components/CheckBox';
import FormControl from 'src/components/core/FormControl';
import FormControlLabel from 'src/components/core/FormControlLabel';
import Drawer from 'src/components/Drawer';
import Notice from 'src/components/Notice';
import TextField from 'src/components/TextField';
import getAPIErrorsFor from 'src/utilities/getAPIErrorFor';

interface Props {
  open: boolean;
  loading: boolean;
  label?: string;
  redirect_uri?: string;
  public: boolean;
  errors?: APIError[];
  edit?: boolean;
  onClose: () => void;
  onSubmit: () => void;
  onChangeLabel: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onChangeRedirectURI: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onChangePublic: () => void;
}

type CombinedProps = Props;

const OAuthCreationDrawer: React.FC<CombinedProps> = (props) => {
  const {
    label,
    redirect_uri,
    open,
    public: isPublic,
    edit,
    errors,
    loading,
    onClose,
    onSubmit,
  } = props;

  const errorResources = {
    label: 'A label',
    redirect_uri: 'A callback URL',
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
          onClick={onClose}
          data-qa-cancel
          buttonType="secondary"
          className="cancel"
        >
          Cancel
        </Button>
        <Button
          buttonType="primary"
          onClick={onSubmit}
          loading={loading}
          data-qa-submit
        >
          {edit ? 'Save Changes' : 'Create'}
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

export default OAuthCreationDrawer;
