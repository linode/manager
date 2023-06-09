import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Box from 'src/components/core/Box';
import Button from 'src/components/Button';
import FormControl from 'src/components/core/FormControl';
import getAPIErrorFor from 'src/utilities/getAPIErrorFor';
import Paper from 'src/components/core/Paper';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';
import Select, { Item } from 'src/components/EnhancedSelect/Select';
import TextField from 'src/components/TextField';
import Typography from 'src/components/core/Typography';
import { APIError } from '@linode/api-v4/lib/types';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { equals, lensPath, remove, set } from 'ramda';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { Notice } from 'src/components/Notice/Notice';
import { Profile } from '@linode/api-v4/lib/profile';
import { useMutateProfile, useProfile } from 'src/queries/profile';
import { useTheme } from '@mui/material/styles';

export const LishSettings = () => {
  const theme = useTheme();
  const { data: profile, isLoading } = useProfile();
  const { mutateAsync: updateProfile } = useMutateProfile();
  const [submitting, setSubmitting] = React.useState<boolean>(false);
  const [lishAuthMethod, setLishAuthMethod] = React.useState<
    Profile['lish_auth_method'] | undefined
  >(profile?.lish_auth_method || 'password_keys');
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

  const onListAuthMethodChange = (e: Item<Profile['lish_auth_method']>) =>
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
        <Typography sx={{ marginBottom: theme.spacing(2) }}>
          This controls what authentication methods are allowed to connect to
          the Lish console servers.
        </Typography>
        {isLoading ? null : (
          <>
            <FormControl sx={{ display: 'flex' }}>
              <Select
                defaultValue={defaultMode}
                errorText={authMethodError}
                id="mode-select"
                isClearable={false}
                label="Authentication Mode"
                name="mode-select"
                onChange={onListAuthMethodChange as any}
                options={modeOptions}
                textFieldProps={{
                  dataAttrs: {
                    'data-qa-mode-select': true,
                  },
                  tooltipText,
                }}
              />
            </FormControl>
            {Array.from(Array(authorizedKeysCount)).map((value, idx) => (
              <Box key={idx} sx={{ margin: `${theme.spacing(1)} 0` }}>
                <TextField
                  data-qa-public-key
                  key={idx}
                  label="SSH Public Key"
                  multiline
                  onChange={onPublicKeyChange(idx)}
                  rows={1.75}
                  sx={{
                    [theme.breakpoints.up('md')]: {
                      minWidth: 415,
                    },
                  }}
                  value={authorizedKeys[idx] || ''}
                />
                {(idx === 0 && typeof authorizedKeys[0] !== 'undefined') ||
                idx > 0 ? (
                  <Button
                    buttonType="outlined"
                    compactX
                    data-qa-remove
                    onClick={onPublicKeyRemove(idx)}
                    sx={{ marginTop: theme.spacing() }}
                  >
                    Remove
                  </Button>
                ) : null}
              </Box>
            ))}
            <Typography style={{ paddingTop: 2 }}>
              Place your SSH public keys here for use with Lish console access.
            </Typography>
            <Button
              buttonType="outlined"
              compactX
              onClick={addSSHPublicKeyField}
              sx={{ marginTop: theme.spacing() }}
            >
              Add SSH Public Key
            </Button>
          </>
        )}
        <ActionsPanel>
          <Button
            buttonType="primary"
            data-qa-save
            disabled={
              lishAuthMethod === profile?.lish_auth_method &&
              equals(authorizedKeys, profile?.authorized_keys)
            }
            loading={submitting}
            onClick={onSubmit}
          >
            Save
          </Button>
        </ActionsPanel>
      </Paper>
    </>
  );
};
