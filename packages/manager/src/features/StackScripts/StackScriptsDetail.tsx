import {
  getStackScript,
  StackScript,
  updateStackScript,
} from '@linode/api-v4/lib/stackscripts';
import { APIError } from '@linode/api-v4/lib/types';
import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';
import CircleProgress from 'src/components/CircleProgress';
import setDocs, { SetDocsProps } from 'src/components/DocsSidebar/setDocs';
import NotFound from 'src/components/NotFound';
import _StackScript from 'src/components/StackScript';
import { StackScripts as StackScriptsDocs } from 'src/documentation';
import useAccountManagement from 'src/hooks/useAccountManagement';
import { useGrants } from 'src/queries/profile';
import { getAPIErrorOrDefault, getErrorMap } from 'src/utilities/errorUtils';
import {
  canUserModifyAccountStackScript,
  getStackScriptUrl,
} from './stackScriptUtils';
import LandingHeader from 'src/components/LandingHeader';

interface MatchProps {
  stackScriptId: string;
}

type RouteProps = RouteComponentProps<MatchProps>;

type CombinedProps = RouteProps & SetDocsProps;

export const StackScriptsDetail: React.FC<CombinedProps> = (props) => {
  const { _isRestrictedUser, _hasGrant, profile } = useAccountManagement();
  const { data: grants } = useGrants();
  const { history } = props;
  const { stackScriptId } = props.match.params;

  const [label, setLabel] = React.useState<string | undefined>('');
  const [loading, setLoading] = React.useState<boolean>(true);
  const [errors, setErrors] = React.useState<APIError[] | undefined>(undefined);
  const [stackScript, setStackScript] = React.useState<StackScript | undefined>(
    undefined
  );

  const username = profile?.username;
  const userCannotAddLinodes = _isRestrictedUser && !_hasGrant('add_linodes');

  const isRestrictedUser = profile?.restricted ?? false;
  const stackScriptGrants = grants?.stackscript ?? [];

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
      <LandingHeader
        title={stackScript.label}
        docsLabel="Docs"
        createButtonText="Deploy New Linode"
        disabledCreateButton={userCannotAddLinodes}
        onButtonClick={handleCreateClick}
        docsLink="https://www.linode.com/docs/platform/stackscripts"
        breadcrumbProps={{
          pathname: props.location.pathname,
          labelOptions: { noCap: true },
          crumbOverrides: [
            {
              position: 1,
              label: 'StackScripts',
              linkTo: stackScript.mine
                ? '/stackscripts/account'
                : '/stackscripts/community',
            },
          ],
          onEditHandlers: userCanModify
            ? {
                editableTextTitle: stackScriptLabel,
                onEdit: handleLabelChange,
                onCancel: resetEditableLabel,
                errorText: labelError,
              }
            : undefined,
        }}
      />
      <div className="detailsWrapper">
        <_StackScript data={stackScript} userCanModify={userCanModify} />
      </div>
    </>
  );
};

const enhanced = compose<CombinedProps, {}>(setDocs([StackScriptsDocs]));

export default enhanced(StackScriptsDetail);
