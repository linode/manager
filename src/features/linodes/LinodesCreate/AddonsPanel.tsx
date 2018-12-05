import { compose } from 'ramda';
import * as React from 'react';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import CheckBox from 'src/components/CheckBox';
import Divider from 'src/components/core/Divider';
import FormControlLabel from 'src/components/core/FormControlLabel';
import Paper from 'src/components/core/Paper';
import { StyleRulesCallback, withStyles, WithStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import RenderGuard from 'src/components/RenderGuard';

type ClassNames = 'root'
  | 'flex'
  | 'title'
  | 'divider'
  | 'lastItem'
  | 'inner'
  | 'panelBody'
  | 'label'
  | 'subLabel'
  | 'caption';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {
    flexGrow: 1,
    width: '100%',
    marginTop: theme.spacing.unit * 3,
    backgroundColor: theme.color.white,
  },
  flex: {
    flex: 1,
  },
  title: {
    marginBottom: theme.spacing.unit * 2,
  },
  divider: {
    marginTop: theme.spacing.unit,
  },
  lastItem: {
    paddingBottom: '0 !important',
  },
  inner: {
    padding: theme.spacing.unit * 3,
  },
  panelBody: {
    padding: `${theme.spacing.unit * 3}px 0 ${theme.spacing.unit}px`,
  },
  label: {
    '& > span:last-child': {
      color: theme.color.headline,
      fontFamily: 'LatoWebBold',
      fontSize: '1rem',
      lineHeight: '1.2em',
      [theme.breakpoints.up('md')]: {
        marginLeft: 16,
      },
    },
  },
  subLabel: {
    display: 'inline-block',
    position: 'relative',
    top: 3,
  },
  caption: {
    marginTop: -8,
    paddingLeft: 39,
    [theme.breakpoints.up('md')]: {
      paddingLeft: 55,
    },
  },
});

const styled = withStyles(styles);

interface Props {
  backups: boolean;
  accountBackups: boolean;
  backupsMonthly: number | null;
  privateIP: boolean;
  changeBackups: () => void;
  changePrivateIP: () => void;
}

type CombinedProps = Props & RouteComponentProps<{}> & WithStyles<ClassNames>;
class AddonsPanel extends React.Component<CombinedProps> {
  renderBackupsPrice = () => {
    const { classes, backupsMonthly } = this.props;
    return backupsMonthly && (
      <Grid item className={classes.subLabel}>
        <Typography variant="body1">
          {`$${backupsMonthly.toFixed(2)}`} per month
        </Typography>
      </Grid>
    );
  }

  render() {
    const { accountBackups, classes, changeBackups, changePrivateIP } = this.props;

    return (
      <Paper className={classes.root} data-qa-add-ons>
        <div className={classes.inner}>
          <Typography role="header" variant="h2" className={classes.title} >Optional Add-ons</Typography>
          <Grid container>
            <Grid item xs={12}>
              <FormControlLabel
                className={classes.label}
                control={
                  <CheckBox
                    checked={accountBackups || this.props.backups}
                    onChange={changeBackups}
                    disabled={accountBackups}
                    data-qa-check-backups={accountBackups ? 'auto backup enabled' : 'auto backup disabled'}
                  />
                }
                label="Backups"
              />
              {this.renderBackupsPrice()}
              <Typography variant="body1" className={classes.caption}>
                {accountBackups
                  ? <React.Fragment>
                      You have enabled automatic backups for your account. This Linode will automatically
                      have backups enabled. To change this setting, <Link to={'/account/settings'}>click here.</Link>
                    </React.Fragment>
                  : <React.Fragment>
                      Three backup slots are executed and rotated automatically: a daily backup, a 2-7
                      day old backup, and an 8-14 day old backup. Plans are priced according to the
                      Linode plan selected above.
                    </React.Fragment>
                }
              </Typography>
            </Grid>
          </Grid>
          <Grid container className={classes.divider}>
            <Grid item xs={12}>
              <Divider />
            </Grid>
          </Grid>
          <Grid container>
            <Grid item xs={12} className={classes.lastItem}>
              <FormControlLabel
                className={classes.label}
                control={
                  <CheckBox
                    checked={this.props.privateIP}
                    onChange={() => changePrivateIP()}
                    data-qa-check-private-ip
                  />
                }
                label="Private IP (Free!)"
              />
            </Grid>
          </Grid>
        </div>
      </Paper>
    );
  }
}


const enhanced: any = compose(
  styled,
  withRouter,
  RenderGuard,
)(AddonsPanel)

export default enhanced;
