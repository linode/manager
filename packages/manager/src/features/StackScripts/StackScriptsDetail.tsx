import {
  getStackScript,
  StackScript,
  updateStackScript,
} from '@linode/api-v4/lib/stackscripts';
import { APIError } from '@linode/api-v4/lib/types';
import * as classnames from 'classnames';
import * as React from 'react';
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
import { StackScripts as StackScriptsDocs } from 'src/documentation';
import { getAPIErrorOrDefault, getErrorMap } from 'src/utilities/errorUtils';
import { getStackScriptUrl } from './stackScriptUtils';
import useAccountManagement from 'src/hooks/useAccountManagement';

interface MatchProps {
  stackScriptId: string;
}

type RouteProps = RouteComponentProps<MatchProps>;

type CombinedProps = RouteProps & SetDocsProps;

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
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: theme.spacing(),
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
  const { _isRestrictedUser, _hasGrant, profile } = useAccountManagement();
  const { history } = props;
  const { stackScriptId } = props.match.params;

  const [label, setLabel] = React.useState<string | undefined>('');
  const [loading, setLoading] = React.useState<boolean>(true);
  const [errors, setErrors] = React.useState<APIError[] | undefined>(undefined);
  const [stackScript, setStackScript] = React.useState<StackScript | undefined>(
    undefined
  );

  const username = profile.data?.username;
  const userCannotAddLinodes = _isRestrictedUser && !_hasGrant('add_linodes');

  React.useEffect(() => {
    getStackScript(+stackScriptId)
      .then((stackScript) => {
        setLoading(false);
        setStackScript(stackScript);
      })
      .catch((error) => {
        setLoading(false);
        setErrors(error);
      });
  }, [stackScriptId]);

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

  const stackScriptLabel = label ?? stackScript.label;

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
            disabled={userCannotAddLinodes}
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

const enhanced = compose<CombinedProps, {}>(setDocs([StackScriptsDocs]));

export default enhanced(StackScriptsDetail);
