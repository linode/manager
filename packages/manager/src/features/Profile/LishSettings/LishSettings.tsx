import {
  Autocomplete,
  Box,
  Button,
  FormControl,
  Notice,
  Paper,
  TextField,
  Typography,
} from '@linode/ui';
import { useTheme } from '@mui/material/styles';
import { createLazyRoute } from '@tanstack/react-router';
import { equals, lensPath, remove, set } from 'ramda';
import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { useMutateProfile, useProfile } from 'src/queries/profile/profile';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { getAPIErrorFor } from 'src/utilities/getAPIErrorFor';
import { scrollErrorIntoView } from 'src/utilities/scrollErrorIntoView';

import type { Profile } from '@linode/api-v4/lib/profile';
import type { APIError } from '@linode/api-v4/lib/types';

export interface LishAuthOption<T = string, L = string> {
  label: L;
  value: T;
}

export const LishSettings = () => {
  const theme = useTheme();
  const { data: profile, isLoading } = useProfile();
  const { mutateAsync: updateProfile } = useMutateProfile();
  const [submitting, setSubmitting] = React.useState<boolean>(false);
  const [errors, setErrors] = React.useState<APIError[]>([]);
  const [success, setSuccess] = React.useState<string>();
  const thirdPartyEnabled = profile?.authentication_type !== 'password';

  const [lishAuthMethod, setLishAuthMethod] = React.useState<
    Profile['lish_auth_method'] | undefined
  >(profile?.lish_auth_method || 'password_keys');

  const [authorizedKeys, setAuthorizedKeys] = React.useState<string[]>(
    profile?.authorized_keys || []
  );

  const [authorizedKeysCount, setAuthorizedKeysCount] = React.useState<number>(
    profile?.authorized_keys ? profile!.authorized_keys.length : 1
  );

  const tooltipText = thirdPartyEnabled
    ? 'Password is disabled because Third-Party Authentication has been enabled.'
    : '';

  const hasErrorFor = getAPIErrorFor(
    {
      authorized_keys: 'ssh public keys',
      lish_auth_method: 'authentication method',
    },
    errors
  );

  const generalError = hasErrorFor('none');
  const authMethodError = hasErrorFor('lish_auth_method');
  const authorizedKeysError = hasErrorFor('authorized_keys');

  const modeOptions = [
    {
      disabled: profile?.authentication_type !== 'password',
      label: 'Allow both password and key authentication',
      value: 'password_keys',
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
      return (eachMode.value as Profile['lish_auth_method']) === 'keys_only';
    } else {
      return (eachMode.value as Profile['lish_auth_method']) === lishAuthMethod;
    }
  });

  const addSSHPublicKeyField = () =>
    setAuthorizedKeysCount(authorizedKeysCount + 1);

  const onSubmit = () => {
    const keys = authorizedKeys.filter((v) => v !== '');

    setErrors([]);
    setSubmitting(false);

    updateProfile({
      authorized_keys: keys,
      lish_auth_method: lishAuthMethod as Profile['lish_auth_method'],
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
        {success && <Notice text={success} variant="success" />}
        {authorizedKeysError && (
          <Notice text={authorizedKeysError} variant="error" />
        )}
        {generalError && <Notice text={generalError} variant="error" />}
        <Typography sx={{ marginBottom: theme.spacing(2) }}>
          This controls what authentication methods are allowed to connect to
          the Lish console servers.
        </Typography>
        {isLoading ? null : (
          <>
            <FormControl sx={{ display: 'flex' }}>
              <Autocomplete
                onChange={(
                  _,
                  item: LishAuthOption<Profile['lish_auth_method']>
                ) => setLishAuthMethod(item.value)}
                textFieldProps={{
                  dataAttrs: {
                    'data-qa-mode-select': true,
                  },
                  tooltipText,
                }}
                value={modeOptions.find(
                  (option) => option.value === lishAuthMethod
                )}
                defaultValue={defaultMode}
                disableClearable
                errorText={authMethodError}
                getOptionDisabled={(option) => option.disabled === true}
                id="mode-select"
                label="Authentication Mode"
                options={modeOptions}
              />
            </FormControl>
            {Array.from(Array(authorizedKeysCount)).map((value, idx) => (
              <Box key={idx} sx={{ margin: `${theme.spacing(1)} 0` }}>
                <TextField
                  sx={{
                    [theme.breakpoints.up('md')]: {
                      minWidth: 415,
                    },
                  }}
                  data-qa-public-key
                  key={idx}
                  label="SSH Public Key"
                  multiline
                  onChange={onPublicKeyChange(idx)}
                  rows={1.75}
                  value={authorizedKeys[idx] || ''}
                />
                {(idx === 0 && typeof authorizedKeys[0] !== 'undefined') ||
                idx > 0 ? (
                  <Button
                    buttonType="outlined"
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
              onClick={addSSHPublicKeyField}
              sx={{ marginTop: theme.spacing() }}
            >
              Add SSH Public Key
            </Button>
          </>
        )}
        <ActionsPanel
          primaryButtonProps={{
            'data-testid': 'save',
            disabled:
              lishAuthMethod === profile?.lish_auth_method &&
              equals(authorizedKeys, profile?.authorized_keys),
            label: 'Save',
            loading: submitting,
            onClick: onSubmit,
          }}
        />
      </Paper>
    </>
  );
};

export const lishSettingsLazyRoute = createLazyRoute('/profile/lish')({
  component: LishSettings,
});
