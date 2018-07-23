import * as React from 'react';

import Paper from '@material-ui/core/Paper';
import { StyleRulesCallback, Theme, WithStyles, withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import CircleProgress from 'src/components/CircleProgress';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import Toggle from 'src/components/Toggle';
import { getGrants, updateUser } from 'src/services/account';
import getAPIErrorsFor from 'src/utilities/getAPIErrorFor';

type ClassNames = 'titleWrapper' | 'topGrid' | 'unrestrictedRoot'

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  topGrid: {
    marginTop: -(theme.spacing.unit * 2),
  },
  titleWrapper: {
    display: 'flex',
    alignItems: 'center',
  },
  unrestrictedRoot: {
    marginTop: theme.spacing.unit * 2,
    padding: theme.spacing.unit * 3,
  }
});

interface Props {
  username?: string;
}

interface State {
  loading: boolean;
  grants?: Linode.Grants;
  restricted?: boolean;
  errors?: Linode.ApiFieldError[];
}

type CombinedProps = Props & WithStyles<ClassNames>;

class UserPermissions extends React.Component<CombinedProps, State> {
  state: State = {
    loading: true,
  };

  getUserGrants = () => {
    const { username } = this.props;
    if (username) {
      getGrants(username)
        .then((grants) => {
          if (grants.global) {
            this.setState({
              grants,
              loading: false,
              restricted: true,
            })
          } else {
            this.setState({
              grants,
              loading: false,
              restricted: false,
            })
          }
        })
        .catch((errResponse) => {
          this.setState({
            errors: [{ reason: 
              'Unknown error occured while fetching user permissions. Try again later.'}]
          })
        });
    }
  }

  componentDidMount() {
    this.getUserGrants();
  }

  componentDidUpdate(prevProps: CombinedProps) {
    if (prevProps.username !== this.props.username) {
      this.getUserGrants();
    }
  }

  onChangeRestricted = () => {
    const { username } = this.props;
    this.setState({
      errors: [],
    })
    if (username) {
      updateUser(username, { restricted: !this.state.restricted })
        .then((user) => {
          this.setState({
            restricted: user.restricted,
          })
        })
        .catch((errResponse) => {
          this.setState({
            errors: [{
              reason: 'Error when updating user restricted status. Please try again later.'
            }],
          })
        })
    }
  }

  renderPermissions = () => {
    return (
      <div>Permissions</div>
    )
  }

  renderUnrestricted = () => {
    const { classes } = this.props;
    /* TODO: render all permissions disabled with this message above */
    return (
      <Paper className={classes.unrestrictedRoot}>
        <Typography>
          This user has unrestricted access to the account.
        </Typography>
      </Paper>
    );
  }

  renderBody = () => {
    const { classes } = this.props;
    const { restricted, errors } = this.state;
    const hasErrorFor = getAPIErrorsFor({ restricted: "Restricted" }, errors,)
    const generalError = hasErrorFor('none');

    return (
      <React.Fragment>
        {generalError &&
          <Notice error text={generalError} />
        }
        <Grid container className={classes.topGrid} justify="space-between">
          <Grid item className={classes.titleWrapper}>
            <Typography variant="title">
              Update User Permissions
            </Typography>
          </Grid>
          <Grid item>
            <Grid container alignItems="center">
              <Grid item>
                <Typography variant="title">
                  Restrict Access:
                </Typography>
              </Grid>
              <Grid item>
                <Typography variant="title">
                  {restricted
                    ? 'On'
                    : 'Off'
                  }
                </Typography>
              </Grid>
              <Grid item>
                <Toggle
                  checked={restricted}
                  onChange={this.onChangeRestricted}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        {restricted
          ? this.renderPermissions()
          : this.renderUnrestricted()
        }
      </React.Fragment>
    );
  }

  render() {
    const { loading } = this.state;
    return (
      <React.Fragment>
        {loading
          ? <CircleProgress />
          : this.renderBody()
        }
      </React.Fragment>
    )
  }
}

const styled = withStyles(styles, { withTheme: true });

export default styled(UserPermissions);
