import { getStackScript, StackScript } from '@linode/api-v4/lib/stackscripts';
import { path } from 'ramda';
import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';
import Breadcrumb from 'src/components/Breadcrumb';
import Button from 'src/components/Button';
import CircleProgress from 'src/components/CircleProgress';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import setDocs, { SetDocsProps } from 'src/components/DocsSidebar/setDocs';
import Grid from 'src/components/Grid';
import NotFound from 'src/components/NotFound';
import _StackScript from 'src/components/StackScript';
import withProfile from 'src/containers/profile.container';
import { StackScripts as StackScriptsDocs } from 'src/documentation';
import {
  getStackScriptUrl,
  StackScriptCategory,
  canUserModifyAccountStackScript
} from './stackScriptUtils';
import EntityHeader from 'src/components/EntityHeader';
import StackScriptActionMenu from './StackScriptPanel/StackScriptActionMenu_CMR';
import withFeatureFlagConsumerContainer, {
  FeatureFlagConsumerProps
} from 'src/containers/withFeatureFlagConsumer.container';
import {
  hasGrant,
  isRestrictedUser as _isRestrictedUser
} from 'src/features/Profile/permissionsHelpers';
import { Grant } from '@linode/api-v4/lib/account/types';

interface MatchProps {
  stackScriptId: string;
}

interface Props {
  triggerDelete: (id: number, label: string) => void;
  triggerMakePublic: (id: number, label: string) => void;
  canModify: boolean;
  canAddLinodes: boolean;
  isPublic: boolean;
  // @todo: when we implement StackScripts pagination, we should remove "| string" in the type below.
  // Leaving this in as an escape hatch now, since there's a bunch of code in
  // /LandingPanel that uses different values for categories that we shouldn't
  // change until we're actually using it.
  category: StackScriptCategory | string;
}

type RouteProps = RouteComponentProps<MatchProps>;
interface State {
  loading: boolean;
  stackScript?: StackScript;
  isRestrictedUser: boolean;
  stackScriptGrants: Grant;
}

type ClassNames = 'root' | 'cta' | 'button' | 'userName' | 'userNameSlash';

const styles = (theme: Theme) =>
  createStyles({
    root: {},
    cta: {
      marginTop: theme.spacing(1),
      [theme.breakpoints.down('sm')]: {
        margin: 0,
        display: 'flex',
        flexBasis: '100%'
      }
    },
    button: {
      marginBottom: theme.spacing(1)
    },
    userName: {
      ...theme.typography.h1
    },
    userNameSlash: {
      color: theme.color.grey1,
      fontFamily: theme.font.normal,
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1)
    }
  });

interface ProfileProps {
  // From Profile container
  username?: string;
}

type CombinedProps = ProfileProps &
  RouteProps &
  WithStyles<ClassNames> &
  SetDocsProps &
  Props &
  FeatureFlagConsumerProps;

export class StackScriptsDetail extends React.Component<CombinedProps, {}> {
  state: State = {
    loading: true,
    stackScript: undefined
    // isRestrictedUser: ,
    // stackScriptGrants:
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
    const {
      classes,
      triggerDelete,
      triggerMakePublic,
      isPublic,
      category,
      canAddLinodes,
      flags
    } = this.props;
    const {
      loading,
      stackScript,
      isRestrictedUser,
      stackScriptGrants
    } = this.state;

    if (loading) {
      return <CircleProgress />;
    }

    if (!stackScript) {
      return <NotFound />;
    }

    const userNameSlash = (
      <Typography className={classes.userName}>
        {stackScript.username} <span className={classes.userNameSlash}>/</span>
      </Typography>
    );

    return (
      <React.Fragment>
        {flags.cmr ? (
          <EntityHeader
            title={stackScript.label}
            parentLink="/stackscripts"
            parentText="Stackscripts"
            iconType="stackscript"
            isSecondary
            actions={
              <StackScriptActionMenu
                stackScriptID={stackScript.id}
                stackScriptUsername={stackScript.username}
                stackScriptLabel={stackScript.label}
                triggerDelete={triggerDelete}
                triggerMakePublic={triggerMakePublic}
                canModify={canUserModifyAccountStackScript(
                  isRestrictedUser,
                  stackScriptGrants,
                  stackScript.id
                )}
                canAddLinodes={canAddLinodes}
                isPublic={isPublic}
                category={category}
              />
            }
          />
        ) : (
          <Grid container justify="space-between" alignItems="center">
            <Grid item>
              <Breadcrumb
                pathname={this.props.location.pathname}
                labelOptions={{ prefixComponent: userNameSlash, noCap: true }}
                labelTitle={stackScript.label}
                crumbOverrides={[
                  {
                    position: 1,
                    label: 'StackScripts'
                  }
                ]}
              />
            </Grid>
            <Grid item className={classes.cta}>
              <Button
                buttonType="primary"
                className={classes.button}
                onClick={this.handleClick}
                data-qa-stack-deploy
              >
                Deploy New Linode
              </Button>
            </Grid>
          </Grid>
        )}
        <div className="detailsWrapper">
          <_StackScript data={stackScript} />
        </div>
      </React.Fragment>
    );
  }
}

export default compose<CombinedProps, {}>(
  setDocs([StackScriptsDocs]),
  withProfile((ownProps, { profileData: profile }) => {
    return {
      username: path(['data', 'username'], profile)
    };
  }),
  withStyles(styles),
  withFeatureFlagConsumerContainer
)(StackScriptsDetail);
