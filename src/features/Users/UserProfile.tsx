import * as React from 'react';

import Paper from '@material-ui/core/Paper';
import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import CircleProgress from 'src/components/CircleProgress';
import Notice from 'src/components/Notice';
import TextField from 'src/components/TextField';
import getAPIErrorsFor from 'src/utilities/getAPIErrorFor';

type ClassNames = 'root' | 'inner' | 'field'

const styles: StyleRulesCallback<ClassNames> = (theme: Theme & Linode.Theme) => ({
  root: {
    flexGrow: 1,
    width: '100%',
    marginTop: theme.spacing.unit,
    backgroundColor: theme.color.white,
  },
  inner: {
    padding: theme.spacing.unit * 3,
  },
  field: {
    marginTop: theme.spacing.unit * 3,
  }
});

interface Props {
  username?: string;
  email?: string;
  changeUsername: (e: React.ChangeEvent<HTMLInputElement>) => void;
  save: () => void;
  reset: () => void;
  saving: boolean;
  success: boolean;
  errors?: Linode.ApiFieldError[];
}

type CombinedProps = Props & WithStyles<ClassNames>;

class UserProfile extends React.Component<CombinedProps> {
  render() {
    const {
      classes,
      username,
      email,
      changeUsername,
      save,
      reset,
      saving,
      success,
      errors
    } = this.props;
    const hasErrorFor = getAPIErrorsFor({ username: "Username" }, errors,)
    const generalError = hasErrorFor('none');

    return (
      <React.Fragment>
        {username 
         ? <Paper className={classes.root}>
             <div className={classes.inner}>
               {success &&
                 <Notice success>User Profile updated successfully</Notice> 
               }
               {generalError &&
                 <Notice error>Error when updating user profile</Notice> 
               }
               <Typography variant="title">
                 User Profile
               </Typography>
               <TextField
                 className={classes.field}
                 label="Username"
                 value={username}
                 onChange={changeUsername}
                 errorText={hasErrorFor('username')}
               />
               <TextField
                 disabled /* API doesn't allow changing user email address */
                 className={classes.field}
                 label="Email Address"
                 value={email}
               />
               <ActionsPanel style={{ marginTop: 16 }}>
                <Button
                  type="primary"
                  loading={saving}
                  onClick={save}
                  data-qa-submit
                >
                  Save
                </Button>
                <Button
                  type="cancel"
                  onClick={reset}
                  data-qa-cancel
                >
                  Cancel
                </Button>
               </ActionsPanel>
             </div>
           </Paper>
         : <CircleProgress />
        }
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default styled(UserProfile);
