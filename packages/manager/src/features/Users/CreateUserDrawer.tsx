import { User, createUser } from '@linode/api-v4/lib/account';
import { APIError } from '@linode/api-v4/lib/types';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Drawer } from 'src/components/Drawer';
import { FormControlLabel } from 'src/components/FormControlLabel';
import { Notice } from 'src/components/Notice/Notice';
import { TextField } from 'src/components/TextField';
import { Toggle } from 'src/components/Toggle';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import getAPIErrorsFor from 'src/utilities/getAPIErrorFor';

interface Props {
  onClose: () => void;
  open: boolean;
  refetch: () => void;
}

type CreateUserDrawerCombinedProps = Props & RouteComponentProps<{}>;

export const CreateUserDrawer = withRouter(
  ({
    history: { push },
    onClose,
    open,
    refetch,
  }: CreateUserDrawerCombinedProps) => {
    const [username, setUsername] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [restricted, setRestricted] = React.useState<boolean>(false);
    const [errors, setErrors] = React.useState<APIError[]>([]);
    const [submitting, setSubmitting] = React.useState<boolean>(false);

    React.useEffect(() => {
      setUsername('');
      setEmail('');
      setRestricted(false);
      setErrors([]);
      setSubmitting(false);
    }, [open]);

    const hasErrorFor = getAPIErrorsFor(
      { email: 'Email', username: 'Username' },
      errors
    );

    const generalError = hasErrorFor('none');

    const onChangeEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
      setEmail(e.target.value);
    };

    const onChangeRestricted = () => {
      setRestricted(true);
    };

    const onChangeUsername = (e: React.ChangeEvent<HTMLInputElement>) => {
      setUsername(e.target.value);
    };

    const onSubmit = () => {
      setErrors([]);
      setSubmitting(true);

      createUser({ email, restricted, username })
        .then((user: User) => {
          setSubmitting(false);

          onClose();
          if (user.restricted) {
            push(`/account/users/${username}/permissions`, {
              newUsername: user.username,
            });
          }
          refetch();
        })
        .catch((errResponse) => {
          const errors = getAPIErrorOrDefault(
            errResponse,
            'Error creating user.'
          );
          setErrors(errors);
          setSubmitting(false);
        });
    };

    return (
      <Drawer onClose={onClose} open={open} title="Add a User">
        {generalError && <Notice error text={generalError} />}
        <TextField
          data-qa-create-username
          errorText={hasErrorFor('username')}
          label="Username"
          onChange={onChangeUsername}
          required
          value={username}
        />
        <TextField
          data-qa-create-email
          errorText={hasErrorFor('email')}
          label="Email"
          onChange={onChangeEmail}
          required
          type="email"
          value={email}
        />
        <FormControlLabel
          control={
            <Toggle
              checked={!restricted}
              data-qa-create-restricted
              onChange={onChangeRestricted}
            />
          }
          label={
            restricted
              ? `This user will have limited access to account features.
              This can be changed later.`
              : `This user will have full access to account features.
              This can be changed later.`
          }
          style={{ marginTop: 8 }}
        />
        <div style={{ marginTop: 8 }}>
          <Notice
            text="The user will be sent an email to set their password"
            warning
          />
        </div>
        <ActionsPanel
          primaryButtonProps={{
            'data-testid': 'submit',
            label: 'Add User',
            loading: submitting,
            onClick: onSubmit,
          }}
          secondaryButtonProps={{
            'data-testid': 'cancel',
            label: 'Cancel',
            onClick: onClose,
          }}
        />
      </Drawer>
    );
  }
);
