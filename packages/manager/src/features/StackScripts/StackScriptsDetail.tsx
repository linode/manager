import { Grant } from '@linode/api-v4/lib/account/types';
import {
  deleteStackScript,
  getStackScript,
  StackScript,
  updateStackScript,
} from '@linode/api-v4/lib/stackscripts';
import { APIError } from '@linode/api-v4/lib/types';
import * as classnames from 'classnames';
import { pathOr } from 'ramda';
import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';
import ActionsPanel from 'src/components/ActionsPanel';
import Breadcrumb from 'src/components/Breadcrumb';
import Button from 'src/components/Button';
import CircleProgress from 'src/components/CircleProgress';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import setDocs, { SetDocsProps } from 'src/components/DocsSidebar/setDocs';
import DocumentationButton from 'src/components/DocumentationButton';
import Grid from 'src/components/Grid';
import NotFound from 'src/components/NotFound';
import _StackScript from 'src/components/StackScript';
import withProfile from 'src/containers/profile.container';
import { StackScripts as StackScriptsDocs } from 'src/documentation';
import {
  hasGrant,
  isRestrictedUser as _isRestrictedUser,
} from 'src/features/Profile/permissionsHelpers';
import { MapState } from 'src/store/types';
import { getAPIErrorOrDefault, getErrorMap } from 'src/utilities/errorUtils';
import { getStackScriptUrl } from './stackScriptUtils';

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

type RouteProps = RouteComponentProps<MatchProps>;

interface State {
  loading: boolean;
  stackScript?: StackScript;
  dialog: DialogState;
  labelInput?: string;
  errors?: APIError[];
}

interface ProfileProps {
  // From Profile container
  username?: string;
}

type ClassNames =
  | 'root'
  | 'cta'
  | 'ctaError'
  | 'button'
  | 'userName'
  | 'userNameSlash'
  | 'error';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      margin: 0,
      '& .MuiFormHelperText-root': {
        [theme.breakpoints.down('md')]: {
          top: 26,
          left: 5,
          width: 400,
        },
      },
      [theme.breakpoints.down('sm')]: {
        paddingRight: theme.spacing(),
      },
      [theme.breakpoints.down('xs')]: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        paddingLeft: theme.spacing(),
      },
    },
    cta: {
      display: 'flex',
      alignItems: 'center',
      marginLeft: theme.spacing(),
      [theme.breakpoints.down('sm')]: {
        alignSelf: 'flex-end',
        marginBottom: theme.spacing(),
      },
    },
    ctaError: {
      [theme.breakpoints.down(772)]: {
        marginTop: 20,
      },
    },
    button: {
      marginLeft: theme.spacing(3),
    },
    userName: {
      color: theme.cmrTextColors.tableStatic,
      fontFamily: theme.font.bold,
      fontSize: '1.125rem',
      marginTop: -1,
    },
    userNameSlash: {
      color: theme.cmrTextColors.tableHeader,
      fontFamily: theme.font.normal,
      fontSize: 20,
      marginRight: 4,
    },
    error: {
      [theme.breakpoints.between(772, 'md')]: {
        paddingBottom: 20,
      },
    },
  });

type CombinedProps = ProfileProps &
  RouteProps &
  StateProps &
  WithStyles<ClassNames> &
  SetDocsProps;

export class StackScriptsDetail extends React.Component<CombinedProps, {}> {
  state: State = {
    loading: true,
    stackScript: undefined,
    dialog: {
      makePublic: {
        open: false,
        submitting: false,
      },
      delete: {
        open: false,
        submitting: false,
      },
      stackScriptID: undefined,
      stackScriptLabel: '',
    },
    errors: undefined,
  };

  // TODO do we even need this?
  mounted: boolean = false;

  componentDidMount() {
    const { stackScriptId } = this.props.match.params;

    this.mounted = true;

    getStackScript(+stackScriptId)
      .then((stackScript) => {
        this.setState({ stackScript, loading: false });
      })
      .catch((error) => {
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

  handleLabelChange = (label: string) => {
    const { stackScript } = this.state;

    // This should never actually happen, but TypeScript is expecting a Promise here.
    if (stackScript === undefined) {
      return Promise.resolve();
    }

    this.setState({ errors: undefined });

    return updateStackScript(stackScript.id, { label })
      .then(() => {
        this.setState({
          stackScript: { ...stackScript, label },
          labelInput: label,
        });
      })
      .catch((e) => {
        this.setState(() => ({
          errors: getAPIErrorOrDefault(e, 'Error updating label', 'label'),
          labelInput: label,
        }));
        return Promise.reject(e);
      });
  };

  resetEditableLabel = () => {
    this.setState({
      errors: undefined,
      labelInput: this.state.stackScript?.label,
    });
  };

  handleOpenDeleteDialog = (id: number, label: string) => {
    this.setState({
      dialog: {
        delete: {
          open: true,
          submitting: false,
        },
        makePublic: {
          open: false,
          submitting: false,
        },
        stackScriptID: id,
        stackScriptLabel: label,
      },
    });
  };

  handleOpenMakePublicDialog = (id: number, label: string) => {
    this.setState({
      dialog: {
        delete: {
          open: false,
          submitting: false,
        },
        makePublic: {
          open: true,
          submitting: false,
        },
        stackScriptID: id,
        stackScriptLabel: label,
      },
    });
  };

  handleCloseDialog = () => {
    this.setState({
      dialog: {
        ...this.state.dialog,
        delete: {
          open: false,
          submitting: false,
        },
        makePublic: {
          open: false,
          submitting: false,
        },
      },
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
          error: undefined,
        },
      },
    });
    deleteStackScript(this.state.dialog.stackScriptID!)
      .then((_) => {
        if (!this.mounted) {
          return;
        }
        this.setState({
          dialog: {
            delete: {
              open: false,
              submitting: false,
            },
            makePublic: {
              open: false,
              submitting: false,
            },
            stackScriptID: undefined,
            stackScriptLabel: '',
          },
        });
        history.push('/stackscripts');
      })
      .catch((e) => {
        if (!this.mounted) {
          return;
        }
        this.setState({
          dialog: {
            ...dialog,
            delete: {
              open: true,
              submitting: false,
              error: e[0].reason,
            },
            makePublic: {
              open: false,
              submitting: false,
            },
          },
        });
      });
  };

  handleMakePublic = () => {
    const { dialog } = this.state;

    updateStackScript(dialog.stackScriptID!, { is_public: true })
      .then((_) => {
        if (!this.mounted) {
          return;
        }
        this.setState({
          successMessage: `${dialog.stackScriptLabel} successfully published to the public library`,
          dialog: {
            delete: {
              open: false,
              submitting: false,
            },
            makePublic: {
              open: false,
              submitting: false,
            },
            stackScriptID: undefined,
            stackScriptLabel: '',
          },
        });
      })
      .catch((_) => {
        if (!this.mounted) {
          return;
        }
        this.setState({
          dialog: {
            delete: {
              open: false,
              submitting: false,
            },
            makePublic: {
              open: false,
              submitting: false,
            },
            stackScriptID: undefined,
            stackScriptLabel: '',
          },
          fieldError: {
            reason: 'Unable to complete your request at this time',
          },
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
    const { classes, username } = this.props;
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

    const errorMap = getErrorMap(['label'], this.state.errors);
    const labelError = errorMap.label;

    const stackScriptLabel =
      this.state.labelInput !== undefined
        ? this.state.labelInput
        : stackScript.label;

    return (
      <React.Fragment>
        <Grid
          container
          className={classnames({
            [classes.root]: true,
            [classes.error]: Boolean(labelError),
          })}
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
                  label: 'StackScripts',
                },
              ]}
              onEditHandlers={
                stackScript && username === stackScript.username
                  ? {
                      editableTextTitle: stackScriptLabel,
                      onEdit: this.handleLabelChange,
                      onCancel: this.resetEditableLabel,
                      errorText: labelError,
                    }
                  : undefined
              }
            />
          </Grid>
          <Grid
            item
            className={classnames({
              [classes.cta]: true,
              [classes.ctaError]: Boolean(labelError),
              p0: true,
            })}
          >
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

const mapStateToProps: MapState<StateProps, {}> = (state) => ({
  isRestrictedUser: _isRestrictedUser(state),
  stackScriptGrants: pathOr(
    [],
    ['__resources', 'profile', 'data', 'grants', 'stackscript'],
    state
  ),
  userCannotAddLinodes:
    _isRestrictedUser(state) && !hasGrant(state, 'add_linodes'),
});

const connected = connect(mapStateToProps);

const enhanced = compose<CombinedProps, {}>(
  connected,
  setDocs([StackScriptsDocs]),
  withProfile<ProfileProps, {}>((ownProps, { profileData: profile }) => ({
    username: profile?.username,
  })),
  withStyles(styles)
);

export default enhanced(StackScriptsDetail);
