import * as React from 'react';

import { Box } from 'src/components/Box';
import { Button } from 'src/components/Button/Button';
import { Dialog, DialogProps } from 'src/components/Dialog/Dialog';
import { Link } from 'src/components/Link';
import { Notice } from 'src/components/Notice/Notice';
import { Typography } from 'src/components/Typography';
import { useMutatePreferences, usePreferences } from 'src/queries/preferences';

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
        <Notice spacingBottom={8} variant="error" text={errorMessage} />
      )}
      {successMessage && (
        <Notice spacingBottom={8} variant="success" text={successMessage} />
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
          style={{
            fontFamily: '"Ubuntu Mono", monospace"',
            height: 300,
            marginTop: 16,
            width: '100%',
          }}
          onChange={(e) => setUserPrefs(e.target.value)}
          value={userPrefs}
        ></textarea>
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
