import * as React from 'react';
import {
  Dialog,
  DialogProps as _DialogProps,
} from 'src/components/Dialog/Dialog';
import { Typography } from 'src/components/Typography';
import Link from 'src/components/Link';
import { Button } from 'src/components/Button/Button';
import { Notice } from 'src/components/Notice/Notice';
import { useMutatePreferences, usePreferences } from 'src/queries/preferences';

type DialogProps = Pick<_DialogProps, 'onClose' | 'open'>;

const PreferenceEditor: React.FC<DialogProps> = (props) => {
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
      title="Edit Preferences"
      open={props.open}
      onClose={props.onClose}
      maxWidth="sm"
      fullWidth
    >
      {errorMessage && <Notice spacingBottom={8} error text={errorMessage} />}
      {successMessage && (
        <Notice spacingBottom={8} success text={successMessage} />
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
          value={userPrefs}
          style={{
            marginTop: 16,
            width: 400,
            height: 300,
            fontFamily: '"Ubuntu Mono", monospace"',
          }}
          onChange={(e) => setUserPrefs(e.target.value)}
        ></textarea>
      </div>
      <Button
        style={{ marginTop: 8 }}
        buttonType="primary"
        onClick={handleSavePreferences}
        loading={submitting}
      >
        Submit
      </Button>
    </Dialog>
  );
};

export default PreferenceEditor;
