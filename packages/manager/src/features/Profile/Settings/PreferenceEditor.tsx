import * as React from 'react';
import Dialog, { DialogProps as _DialogProps } from 'src/components/Dialog';
import Typography from 'src/components/core/Typography';
import Link from 'src/components/Link';
import withPreferences, {
  Props as PreferencesProps,
} from 'src/containers/preferences.container';
import Button from 'src/components/Button';
import Notice from 'src/components/Notice';
import { compose } from 'recompose';

type DialogProps = Pick<_DialogProps, 'onClose' | 'open'>;

type CombinedProps = DialogProps & PreferencesProps;

const PreferenceEditor: React.FC<CombinedProps> = (props) => {
  const { getUserPreferences, updateUserPreferences } = props;

  const [userPrefs, setUserPrefs] = React.useState('');
  const [errorMessage, setErrorMessage] = React.useState('');
  const [successMessage, setSuccessMessage] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    setLoading(true);
    getUserPreferences()
      .then((userPreferences) => {
        setLoading(false);
        setUserPrefs(JSON.stringify(userPreferences, null, 2));
      })
      .catch(() => {
        setErrorMessage('Unable to load user preferences');
      });
  }, [getUserPreferences]);

  const handleSavePreferences = () => {
    try {
      const parsed = JSON.parse(userPrefs);
      setSubmitting(true);
      setSuccessMessage('');
      setErrorMessage('');
      updateUserPreferences(parsed as any)
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

const enhanced = compose<CombinedProps, DialogProps>(withPreferences());

export default enhanced(PreferenceEditor);
