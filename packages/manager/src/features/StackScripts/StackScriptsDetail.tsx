import {
  getStackScript,
  StackScript,
  updateStackScript,
} from '@linode/api-v4/lib/stackscripts';
import { APIError } from '@linode/api-v4/lib/types';
import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';
import Breadcrumb from 'src/components/Breadcrumb';
import Button from 'src/components/Button';
import CircleProgress from 'src/components/CircleProgress';
import { makeStyles, Theme } from 'src/components/core/styles';
import setDocs, { SetDocsProps } from 'src/components/DocsSidebar/setDocs';
import DocumentationButton from 'src/components/DocumentationButton';
import Grid from 'src/components/Grid';
import NotFound from 'src/components/NotFound';
import _StackScript from 'src/components/StackScript';
import { StackScripts as StackScriptsDocs } from 'src/documentation';
import useAccountManagement from 'src/hooks/useAccountManagement';
import { getAPIErrorOrDefault, getErrorMap } from 'src/utilities/errorUtils';
import {
  canUserModifyAccountStackScript,
  getStackScriptUrl,
} from './stackScriptUtils';

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
    alignSelf: 'flex-start',
    justifyContent: 'flex-end',
    marginTop: 6,
    marginLeft: theme.spacing(),
  },
  button: {
    marginLeft: theme.spacing(3),
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

  const isRestrictedUser = profile?.data?.restricted ?? false;
  const stackScriptGrants = profile?.data?.grants?.stackscript ?? [];

  const userCanModify = Boolean(
    stackScript?.mine &&
      canUserModifyAccountStackScript(
        isRestrictedUser,
        stackScriptGrants,
        +stackScriptId
      )
  );

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

  const errorMap = getErrorMap(['label'], errors);
  const labelError = errorMap.label;

  const stackScriptLabel = label ?? stackScript.label;

  return (
    <>
      <Grid container className={classes.root} justify="space-between">
        <Grid item className="p0">
          <Breadcrumb
            pathname={props.location.pathname}
            labelTitle={stackScript.label}
            labelOptions={{ noCap: true }}
            crumbOverrides={[
              {
                position: 1,
                label: 'StackScripts',
                linkTo: stackScript.mine
                  ? '/stackscripts/account'
                  : '/stackscripts/community',
              },
            ]}
            onEditHandlers={
              userCanModify
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
        <Grid item className={`${classes.cta} p0`}>
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
        <_StackScript data={stackScript} userCanModify={userCanModify} />
      </div>
    </>
  );
};

const enhanced = compose<CombinedProps, {}>(setDocs([StackScriptsDocs]));

export default enhanced(StackScriptsDetail);
