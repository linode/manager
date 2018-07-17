import * as React from 'react';

import Paper from '@material-ui/core/Paper';
import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import CircleProgress from 'src/components/CircleProgress';
import TextField from 'src/components/TextField';

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
}

type CombinedProps = Props & WithStyles<ClassNames>;

class UserProfile extends React.Component<CombinedProps> {
  render() {
    const { classes, username, email, changeUsername, save, reset } = this.props;

    return (
      <React.Fragment>
        {username 
         ? <Paper className={classes.root}>
             <div className={classes.inner}>
               <Typography variant="title">
                 User Profile
               </Typography>
               <TextField
                 className={classes.field}
                 label="Username"
                 value={username}
                 onChange={changeUsername}
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
