import { Profile } from '@linode/api-v4/lib/profile';
import { APIError } from '@linode/api-v4/lib/types';
import { makeStyles } from '@material-ui/styles';
import { equals, lensPath, remove, set } from 'ramda';
import * as React from 'react';
import { compose } from 'recompose';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import FormControl from 'src/components/core/FormControl';
import Paper from 'src/components/core/Paper';
import { Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import setDocs from 'src/components/DocsSidebar/setDocs';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Select, { Item } from 'src/components/EnhancedSelect/Select';
import Notice from 'src/components/Notice';
import TextField from 'src/components/TextField';
import { LISH } from 'src/documentation';
import { useMutateProfile, useProfile } from 'src/queries/profile';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import getAPIErrorFor from 'src/utilities/getAPIErrorFor';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';

const useStyles = makeStyles((theme: Theme) => ({
  intro: {
    marginBottom: theme.spacing(2),
  },
  modeControl: {
    display: 'flex',
  },
  sshWrap: {
    margin: `${theme.spacing(1)}px 0`,
  },
  keyTextarea: {
    [theme.breakpoints.up('md')]: {
      minWidth: 415,
    },
  },
  sshKeyButton: {
    marginTop: theme.spacing(),
  },
}));

const LishSettings: React.FC = () => {
  const classes = useStyles();
  const { data: profile, isLoading } = useProfile();
  const { mutateAsync: updateProfile } = useMutateProfile();

  const [submitting, setSubmitting] = React.useState<boolean>(false);
  const [lishAuthMethod, setLishAuthMethod] = React.useState<
    Pick<Profile, 'lish_auth_method'> | undefined
  >(profile?.lish_auth_method || ('password_keys' as any));
  const [authorizedKeys, setAuthorizedKeys] = React.useState<string[]>(
    profile?.authorized_keys || []
  );
  const [authorizedKeysCount, setAuthorizedKeysCount] = React.useState<number>(
    profile?.authorized_keys ? profile!.authorized_keys.length : 1
  );

  const [errors, setErrors] = React.useState<APIError[]>([]);
  const [success, setSuccess] = React.useState<string>();

  const thirdPartyEnabled = profile?.authentication_type !== 'password';

  const tooltipText = thirdPartyEnabled
    ? 'Password is disabled because Third-Party Authentication has been enabled.'
    : '';

  const hasErrorFor = getAPIErrorFor(
    {
      lish_auth_method: 'authentication method',
      authorized_keys: 'ssh public keys',
    },
    errors
  );
  const generalError = hasErrorFor('none');
  const authMethodError = hasErrorFor('lish_auth_method');
  const authorizedKeysError = hasErrorFor('authorized_keys');

  const modeOptions = [
    {
      label: 'Allow both password and key authentication',
      value: 'password_keys',
      isDisabled: profile?.authentication_type !== 'password',
    },
    {
      label: 'Allow key authentication only',
      value: 'keys_only',
    },
    {
      label: 'Disable Lish',
      value: 'disabled',
    },
  ];

  const defaultMode = modeOptions.find((eachMode) => {
    if (profile?.authentication_type !== 'password') {
      return (eachMode.value as any) === 'keys_only';
    } else {
      return (eachMode.value as any) === lishAuthMethod;
    }
  });

  const addSSHPublicKeyField = () =>
    setAuthorizedKeysCount(authorizedKeysCount + 1);

  const onSubmit = () => {
    const keys = authorizedKeys.filter((v) => v !== '');

    setErrors([]);
    setSubmitting(false);

    updateProfile({
      lish_auth_method: lishAuthMethod as any,
      authorized_keys: keys,
    })
      .then((profileData) => {
        setSubmitting(false);
        setSuccess('LISH authentication settings have been updated.');
        setAuthorizedKeys(profileData.authorized_keys || []);
        setAuthorizedKeysCount(
          profileData.authorized_keys ? profileData.authorized_keys.length : 1
        );
      })
      .catch((error) => {
        setSubmitting(false);
        setErrors(getAPIErrorOrDefault(error));
        setSuccess(undefined);
        scrollErrorIntoView();
      });
  };

  const onListAuthMethodChange = (e: Item<Pick<Profile, 'lish_auth_method'>>) =>
    setLishAuthMethod(e.value);

  const onPublicKeyChange = (idx: number) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setAuthorizedKeys(set(lensPath([idx]), e.target.value));
  };

  const onPublicKeyRemove = (idx: number) => () => {
    setAuthorizedKeys(remove(idx, 1, authorizedKeys));
    setAuthorizedKeysCount(authorizedKeysCount - 1);
  };

  return (
    <>
      <DocumentTitleSegment segment="LISH Console Settings" />
      <Paper>
        {success && <Notice success text={success} />}
        {authorizedKeysError && <Notice error text={authorizedKeysError} />}
        {generalError && <Notice error text={generalError} />}
        <Typography className={classes.intro}>
          This controls what authentication methods are allowed to connect to
          the Lish console servers.
        </Typography>
        {isLoading ? null : (
          <>
            <FormControl className={classes.modeControl}>
              <Select
                textFieldProps={{
                  dataAttrs: {
                    'data-qa-mode-select': true,
                  },
                  tooltipText,
                }}
                options={modeOptions}
                name="mode-select"
                id="mode-select"
                label="Authentication Mode"
                defaultValue={defaultMode}
                onChange={onListAuthMethodChange as any}
                isClearable={false}
                errorText={authMethodError}
              />
            </FormControl>
            {Array.from(Array(authorizedKeysCount)).map((value, idx) => (
              <div className={classes.sshWrap} key={idx}>
                <TextField
                  key={idx}
                  label="SSH Public Key"
                  onChange={onPublicKeyChange(idx)}
                  value={authorizedKeys[idx] || ''}
                  multiline
                  rows="4"
                  className={classes.keyTextarea}
                  data-qa-public-key
                />
                {(idx === 0 && typeof authorizedKeys[0] !== 'undefined') ||
                idx > 0 ? (
                  <Button
                    buttonType="outlined"
                    className={classes.sshKeyButton}
                    compactX
                    onClick={onPublicKeyRemove(idx)}
                    data-qa-remove
                  >
                    Remove
                  </Button>
                ) : null}
              </div>
            ))}
            <Typography style={{ paddingTop: 2 }}>
              Place your SSH public keys here for use with Lish console access.
            </Typography>
            <Button
              onClick={addSSHPublicKeyField}
              className={classes.sshKeyButton}
              buttonType="outlined"
              compactX
            >
              Add SSH Public Key
            </Button>
          </>
        )}
        <ActionsPanel>
          <Button
            buttonType="primary"
            onClick={onSubmit}
            loading={submitting}
            disabled={
              lishAuthMethod === profile?.lish_auth_method &&
              equals(authorizedKeys, profile?.authorized_keys)
            }
            data-qa-save
          >
            Save
          </Button>
        </ActionsPanel>
      </Paper>
    </>
  );
};

const enhanced = compose(setDocs([LISH]));

export default enhanced(LishSettings);
