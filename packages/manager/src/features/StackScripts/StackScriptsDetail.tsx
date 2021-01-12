import {
  getStackScript,
  StackScript,
  updateStackScript,
  deleteStackScript
} from '@linode/api-v4/lib/stackscripts';
import { pathOr } from 'ramda';
import * as React from 'react';
import { connect } from 'react-redux';
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
import { getStackScriptUrl, StackScriptCategory } from './stackScriptUtils';

import {
  hasGrant,
  isRestrictedUser as _isRestrictedUser
} from 'src/features/Profile/permissionsHelpers';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import ActionsPanel from 'src/components/ActionsPanel';
import { Grant } from '@linode/api-v4/lib/account/types';
import { MapState } from 'src/store/types';
import DocumentationButton from 'src/components/CMR_DocumentationButton';

interface DialogVariantProps {
  open: boolean;
  submitting: boolean;
  error?: string;
}

interface DialogState {
  makePublic: DialogVariantProps;
  delete: DialogVariantProps;
  stackScriptID: number | undefined;
  stackScriptLabel: string;
}

interface MatchProps {
  stackScriptId: string;
}

interface Props {
  canModify: boolean;
  canAddLinodes: boolean;
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
  dialog: DialogState;
}

interface ProfileProps {
  // From Profile container
  username?: string;
}

type ClassNames = 'root' | 'cta' | 'button' | 'userName' | 'userNameSlash';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      margin: 0,
      [theme.breakpoints.down('md')]: {
        flexDirection: 'column',
        alignItems: 'flex-start'
      }
    },
    cta: {
      display: 'flex',
      alignItems: 'center',
      [theme.breakpoints.down('md')]: {
        alignSelf: 'flex-end',
        marginBottom: theme.spacing(),
        marginRight: theme.spacing()
      }
    },
    button: {
      marginLeft: theme.spacing(4),
      [theme.breakpoints.down('md')]: {
        marginLeft: theme.spacing(1.5)
      }
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

type CombinedProps = ProfileProps &
  RouteProps &
  StateProps &
  WithStyles<ClassNames> &
  SetDocsProps &
  Props;

export class StackScriptsDetail extends React.Component<CombinedProps, {}> {
  state: State = {
    loading: true,
    stackScript: undefined,
    dialog: {
      makePublic: {
        open: false,
        submitting: false
      },
      delete: {
        open: false,
        submitting: false
      },
      stackScriptID: undefined,
      stackScriptLabel: ''
    }
  };

  // TODO do we even need this?
  mounted: boolean = false;

  componentDidMount() {
    const { stackScriptId } = this.props.match.params;

    this.mounted = true;

    getStackScript(+stackScriptId)
      .then(stackScript => {
        this.setState({ stackScript, loading: false });
      })
      .catch(error => {
        this.setState({ error, loading: false });
      });
  }

  handleCreateClick = () => {
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

  handleOpenDeleteDialog = (id: number, label: string) => {
    this.setState({
      dialog: {
        delete: {
          open: true,
          submitting: false
        },
        makePublic: {
          open: false,
          submitting: false
        },
        stackScriptID: id,
        stackScriptLabel: label
      }
    });
  };

  handleOpenMakePublicDialog = (id: number, label: string) => {
    this.setState({
      dialog: {
        delete: {
          open: false,
          submitting: false
        },
        makePublic: {
          open: true,
          submitting: false
        },
        stackScriptID: id,
        stackScriptLabel: label
      }
    });
  };

  handleCloseDialog = () => {
    this.setState({
      dialog: {
        ...this.state.dialog,
        delete: {
          open: false,
          submitting: false
        },
        makePublic: {
          open: false,
          submitting: false
        }
      }
    });
  };

  handleDeleteStackScript = () => {
    const { history } = this.props;
    const { dialog } = this.state;
    this.setState({
      dialog: {
        ...dialog,
        delete: {
          ...dialog.delete,
          submitting: true,
          error: undefined
        }
      }
    });
    deleteStackScript(this.state.dialog.stackScriptID!)
      .then(_ => {
        if (!this.mounted) {
          return;
        }
        this.setState({
          dialog: {
            delete: {
              open: false,
              submitting: false
            },
            makePublic: {
              open: false,
              submitting: false
            },
            stackScriptID: undefined,
            stackScriptLabel: ''
          }
        });
        history.push('/stackscripts');
      })
      .catch(e => {
        if (!this.mounted) {
          return;
        }
        this.setState({
          dialog: {
            ...dialog,
            delete: {
              open: true,
              submitting: false,
              error: e[0].reason
            },
            makePublic: {
              open: false,
              submitting: false
            }
          }
        });
      });
  };

  handleMakePublic = () => {
    const { dialog } = this.state;

    updateStackScript(dialog.stackScriptID!, { is_public: true })
      .then(_ => {
        if (!this.mounted) {
          return;
        }
        this.setState({
          successMessage: `${dialog.stackScriptLabel} successfully published to the public library`,
          dialog: {
            delete: {
              open: false,
              submitting: false
            },
            makePublic: {
              open: false,
              submitting: false
            },
            stackScriptID: undefined,
            stackScriptLabel: ''
          }
        });
      })
      .catch(_ => {
        if (!this.mounted) {
          return;
        }
        this.setState({
          dialog: {
            delete: {
              open: false,
              submitting: false
            },
            makePublic: {
              open: false,
              submitting: false
            },
            stackScriptID: undefined,
            stackScriptLabel: ''
          },
          fieldError: {
            reason: 'Unable to complete your request at this time'
          }
        });
      });
  };

  renderConfirmMakePublicActions = () => {
    return (
      <ActionsPanel>
        <Button buttonType="cancel" onClick={this.handleCloseDialog}>
          Cancel
        </Button>
        <Button
          buttonType="primary"
          destructive
          onClick={this.handleMakePublic}
        >
          Yes, make me a star!
        </Button>
      </ActionsPanel>
    );
  };

  renderConfirmDeleteActions = () => {
    return (
      <ActionsPanel>
        <Button buttonType="cancel" onClick={this.handleCloseDialog}>
          Cancel
        </Button>
        <Button
          buttonType="primary"
          destructive
          onClick={this.handleDeleteStackScript}
          loading={this.state.dialog.delete.submitting}
        >
          Delete
        </Button>
      </ActionsPanel>
    );
  };

  renderDeleteStackScriptDialog = () => {
    const { dialog } = this.state;

    return (
      <ConfirmationDialog
        title={`Delete ${dialog.stackScriptLabel}?`}
        open={dialog.delete.open}
        actions={this.renderConfirmDeleteActions}
        onClose={this.handleCloseDialog}
        error={dialog.delete.error}
      >
        <Typography>
          Are you sure you want to delete this StackScript?
        </Typography>
      </ConfirmationDialog>
    );
  };

  renderMakePublicDialog = () => {
    const { dialog } = this.state;

    return (
      <ConfirmationDialog
        title={`Woah, just a word of caution...`}
        open={dialog.makePublic.open}
        actions={this.renderConfirmMakePublicActions}
        onClose={this.handleCloseDialog}
      >
        <Typography>
          Are you sure you want to make {dialog.stackScriptLabel} public? This
          action cannot be undone, nor will you be able to delete the
          StackScript once made available to the public.
        </Typography>
      </ConfirmationDialog>
    );
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

    const userNameSlash = (
      <Typography className={classes.userName}>
        {stackScript.username} <span className={classes.userNameSlash}>/</span>
      </Typography>
    );

    return (
      <React.Fragment>
        <Grid
          container
          className={classes.root}
          alignItems="center"
          justify="space-between"
        >
          <Grid item className="p0">
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
          <Grid item className={`${classes.cta} p0`}>
            <DocumentationButton href="https://www.linode.com/docs/platform/stackscripts" />
            <Button
              buttonType="primary"
              className={classes.button}
              onClick={this.handleCreateClick}
              data-qa-stack-deploy
            >
              Deploy New Linode
            </Button>
          </Grid>
        </Grid>
        {/* )} */}
        <div className="detailsWrapper">
          <_StackScript data={stackScript} />
        </div>
      </React.Fragment>
    );
  }
}

interface StateProps {
  isRestrictedUser: boolean;
  stackScriptGrants: Grant[];
  userCannotAddLinodes: boolean;
}

const mapStateToProps: MapState<StateProps, {}> = state => ({
  isRestrictedUser: _isRestrictedUser(state),
  stackScriptGrants: pathOr(
    [],
    ['__resources', 'profile', 'data', 'grants', 'stackscript'],
    state
  ),
  userCannotAddLinodes:
    _isRestrictedUser(state) && !hasGrant(state, 'add_linodes')
});

const connected = connect(mapStateToProps);

const enhanced = compose<CombinedProps, {}>(
  connected,
  setDocs([StackScriptsDocs]),
  withProfile<ProfileProps, {}>((ownProps, { profileData: profile }) => ({
    username: profile?.username
  })),
  withStyles(styles)
);

export default enhanced(StackScriptsDetail);
