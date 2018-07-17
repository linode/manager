import * as React from 'react';

import {
    StyleRulesCallback,
    Theme,
    WithStyles,
    withStyles,
  } from '@material-ui/core/styles';  
  
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import TextField from 'src/components/TextField';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
});

interface Props {
  error: string | undefined;
  username: string;
  email: string;
  submitting: boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
  onCancel: () => void;
  onSubmit: () => void;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const EmailChangeForm: React.StatelessComponent<CombinedProps> = (props) => {
    const { email,
            error, 
            handleChange,
            onCancel,
            onSubmit,
            submitting,
            username, } = props;
    return (
        <React.Fragment>
            <TextField
                disabled
                label="Username"
                value={username}
                errorGroup="display-settings-email"
                data-qa-username
            />
            <TextField
                label="Email"
                value={email}
                onChange={handleChange}
                errorText={error}
                errorGroup="display-settings-email"
                error={Boolean(error)}
                data-qa-email
            />
            <ActionsPanel>
            <Button
                type="primary"
                onClick={onSubmit}
                loading={submitting}
                data-qa-submit
            >
                Save
            </Button>
            <Button
                type="cancel"
                onClick={onCancel}
                data-qa-cancel
            >
                Cancel
            </Button>
            </ActionsPanel>
        </ React.Fragment>
    )
}

const styled = withStyles(styles, { withTheme: true });

export default styled(EmailChangeForm);