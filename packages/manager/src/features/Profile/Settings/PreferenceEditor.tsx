import { useMutatePreferences, usePreferences } from '@linode/queries';
import { Box, Button, Dialog, Notice, Typography } from '@linode/ui';
import * as React from 'react';

import { Link } from 'src/components/Link';

import type { DialogProps } from '@linode/ui';

type Props = Pick<DialogProps, 'onClose' | 'open'>;

export const PreferenceEditor = (props: Props) => {
  const { refetch: refetchPreferences } = usePreferences();
  const { mutateAsync: updatePreferences } = useMutatePreferences(true);

  const [userPrefs, setUserPrefs] = React.useState('');
  const [errorMessage, setErrorMessage] = React.useState('');
  const [successMessage, setSuccessMessage] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    setLoading(true);
    refetchPreferences()
      .then(({ data: userPreferences }) => userPreferences ?? Promise.reject())
      .then((userPreferences) => {
        setLoading(false);
        setUserPrefs(JSON.stringify(userPreferences, null, 2));
      })
      .catch(() => {
        setErrorMessage('Unable to load user preferences');
      });
  }, []);

  const handleSavePreferences = () => {
    try {
      const parsed = JSON.parse(userPrefs);
      setSubmitting(true);
      setSuccessMessage('');
      setErrorMessage('');
      updatePreferences(parsed)
        .then(() => {
          setSuccessMessage('Preferences updated successfully');
          setSubmitting(false);
        })
        .catch(() => {
          setErrorMessage('Unable to set preferences');
        });
    } catch {
      setErrorMessage('Invalid JSON');
    }
  };

  return (
    <Dialog
      fullWidth
      maxWidth="sm"
      onClose={props.onClose}
      open={props.open}
      title="Edit Preferences"
    >
      {errorMessage && (
        <Notice spacingBottom={8} text={errorMessage} variant="error" />
      )}
      {successMessage && (
        <Notice spacingBottom={8} text={successMessage} variant="success" />
      )}
      <Typography>
        Update user preferences tied to Cloud Manager. See the{' '}
        <Link to="https://developers.linode.com/api/v4/profile-preferences">
          Linode API documentation
        </Link>{' '}
        for more information about user preferences.
      </Typography>
      {loading && <Typography>Loading...</Typography>}
      <div>
        <textarea
          onChange={(e) => setUserPrefs(e.target.value)}
          style={{
            fontFamily: '"Ubuntu Mono", monospace"',
            height: 300,
            marginTop: 16,
            width: '100%',
          }}
          value={userPrefs}
        />
      </div>
      <Box display="flex" justifyContent="flex-end">
        <Button
          buttonType="primary"
          loading={submitting}
          onClick={handleSavePreferences}
          sx={{ marginTop: 1 }}
        >
          Save
        </Button>
      </Box>
    </Dialog>
  );
};
