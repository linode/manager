import { compose, path } from 'ramda';
import * as React from 'react';

import { RouteComponentProps } from 'react-router-dom';
import Breadcrumb from 'src/components/Breadcrumb';
import Button from 'src/components/Button';
import CircleProgress from 'src/components/CircleProgress';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import setDocs, { SetDocsProps } from 'src/components/DocsSidebar/setDocs';
import Grid from 'src/components/Grid';
import NotFound from 'src/components/NotFound';
import StackScript from 'src/components/StackScript';
import withProfile from 'src/containers/profile.container';
import { StackScripts as StackScriptsDocs } from 'src/documentation';

import { getStackScript } from 'src/services/stackscripts';

import { getStackScriptUrl } from './stackScriptUtils';

interface MatchProps {
  stackScriptId: string;
}
type RouteProps = RouteComponentProps<MatchProps>;
interface State {
  loading: boolean;
  stackScript?: Linode.StackScript.Response;
}

type ClassNames = 'root' | 'titleWrapper' | 'cta' | 'button';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {},
  titleWrapper: {
    display: 'flex',
    alignItems: 'center',
    marginTop: 5
  },
  cta: {
    marginTop: theme.spacing.unit,
    [theme.breakpoints.down('sm')]: {
      margin: 0,
      display: 'flex',
      flexBasis: '100%'
    }
  },
  button: {
    marginBottom: theme.spacing.unit * 2
  }
});

interface ProfileProps {
  // From Profile container
  username?: string;
}

type CombinedProps = ProfileProps &
  RouteProps &
  WithStyles<ClassNames> &
  SetDocsProps;

export class StackScriptsDetail extends React.Component<CombinedProps, {}> {
  state: State = {
    loading: true,
    stackScript: undefined
  };

  componentDidMount() {
    const { stackScriptId } = this.props.match.params;

    getStackScript(+stackScriptId)
      .then(stackScript => {
        this.setState({ stackScript, loading: false });
      })
      .catch(error => {
        this.setState({ error, loading: false });
      });
  }

  handleClick = () => {
    const { history, username } = this.props;
    const { stackScript } = this.state;
    if (!stackScript) {
      return;
    }
    const url = getStackScriptUrl(
      stackScript.username,
      stackScript.id,
      username
    );
    history.push(url);
  };

  render() {
    const { classes } = this.props;
    const { loading, stackScript } = this.state;

    if (loading) {
      return <CircleProgress />;
    }

    if (!stackScript) {
      return <NotFound />;
    }

    return (
      <React.Fragment>
        <Grid container justify="space-between">
          <Grid item className={classes.titleWrapper}>
            <div className={classes.titleWrapper}>
              <Breadcrumb
                linkTo="/stackscripts"
                linkText="StackScripts"
                labelTitle={`${stackScript.username} / ${stackScript.label}`}
              />
            </div>
          </Grid>
          <Grid item className={classes.cta}>
            <Button
              type="primary"
              className={classes.button}
              onClick={this.handleClick}
              data-qa-stack-deploy
            >
              Deploy New Linode
            </Button>
          </Grid>
        </Grid>
        <div className="detailsWrapper">
          <StackScript data={stackScript} />
        </div>
      </React.Fragment>
    );
  }
}

export default compose(
  withStyles(styles),
  setDocs([StackScriptsDocs]),
  withProfile((ownProps, profile) => {
    return {
      ...ownProps,
      username: path(['username'], profile)
    };
  })
)(StackScriptsDetail);
