import { Grant } from '@linode/api-v4/lib/account/types';
import {
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
import Breadcrumb from 'src/components/Breadcrumb';
import Button from 'src/components/Button';
import CircleProgress from 'src/components/CircleProgress';
import { makeStyles, Theme } from 'src/components/core/styles';
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

interface MatchProps {
  stackScriptId: string;
}

interface ProfileProps {
  // From Profile container
  username?: string;
}

type RouteProps = RouteComponentProps<MatchProps>;

type CombinedProps = ProfileProps & RouteProps & StateProps & SetDocsProps;

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    margin: 0,
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
    marginRight: 2,
  },
}));

export const StackScriptsDetail: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();

  const { history, username } = props;

  const [label, setLabel] = React.useState<string | undefined>('');
  const [loading, setLoading] = React.useState<boolean>(true);
  const [errors, setErrors] = React.useState<APIError[] | undefined>(undefined);
  const [stackScript, setStackScript] = React.useState<StackScript | undefined>(
    undefined
  );

  React.useEffect(() => {
    const { stackScriptId } = props.match.params;

    getStackScript(+stackScriptId)
      .then((stackScript) => {
        setLoading(false);
        setStackScript(stackScript);
      })
      .catch((error) => {
        setLoading(false);
        setErrors(error);
      });
  }, [props.match.params]);

  const handleCreateClick = () => {
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

  const handleLabelChange = (label: string) => {
    // This should never actually happen, but TypeScript is expecting a Promise here.
    if (stackScript === undefined) {
      return Promise.resolve();
    }

    setErrors(undefined);

    return updateStackScript(stackScript.id, { label })
      .then(() => {
        setLabel(label);
        setStackScript({ ...stackScript, label });
      })
      .catch((e) => {
        setLabel(label);
        setErrors(getAPIErrorOrDefault(e, 'Error updating label', 'label'));
        return Promise.reject(e);
      });
  };

  const resetEditableLabel = () => {
    setLabel(stackScript?.label);
    setErrors(undefined);
  };

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

  const errorMap = getErrorMap(['label'], errors);
  const labelError = errorMap.label;

  const stackScriptLabel = label !== undefined ? label : stackScript.label;

  return (
    <>
      <Grid
        container
        className={classes.root}
        alignItems="center"
        justify="space-between"
      >
        <Grid item className="p0">
          <Breadcrumb
            pathname={props.location.pathname}
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
                    onEdit: handleLabelChange,
                    onCancel: resetEditableLabel,
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
            onClick={handleCreateClick}
            data-qa-stack-deploy
          >
            Deploy New Linode
          </Button>
        </Grid>
      </Grid>
      <div className="detailsWrapper">
        <_StackScript data={stackScript} />
      </div>
    </>
  );
};

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
  }))
);

export default enhanced(StackScriptsDetail);
