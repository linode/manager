import {
  StackScript,
  getStackScript,
  updateStackScript,
} from '@linode/api-v4/lib/stackscripts';
import { APIError } from '@linode/api-v4/lib/types';
import * as React from 'react';
import { useHistory, useLocation, useParams } from 'react-router-dom';

import { CircleProgress } from 'src/components/CircleProgress';
import { LandingHeader } from 'src/components/LandingHeader';
import { NotFound } from 'src/components/NotFound';
import { ProductInformationBanner } from 'src/components/ProductInformationBanner/ProductInformationBanner';
import _StackScript from 'src/components/StackScript';
import { useAccountManagement } from 'src/hooks/useAccountManagement';
import { useGrants } from 'src/queries/profile';
import { getAPIErrorOrDefault, getErrorMap } from 'src/utilities/errorUtils';

import {
  canUserModifyAccountStackScript,
  getStackScriptUrl,
} from './stackScriptUtils';

export const StackScriptsDetail = () => {
  const { _hasGrant, _isRestrictedUser, profile } = useAccountManagement();
  const { data: grants } = useGrants();
  const { stackScriptId } = useParams<{ stackScriptId: string }>();
  const history = useHistory();
  const location = useLocation();

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
      <ProductInformationBanner
        bannerLocation="StackScripts"
        important
        warning
      />
      <LandingHeader
        breadcrumbProps={{
          crumbOverrides: [
            {
              label: 'StackScripts',
              linkTo: stackScript.mine
                ? '/stackscripts/account'
                : '/stackscripts/community',
              position: 1,
            },
          ],
          labelOptions: { noCap: true },
          onEditHandlers: userCanModify
            ? {
                editableTextTitle: stackScriptLabel,
                errorText: labelError,
                onCancel: resetEditableLabel,
                onEdit: handleLabelChange,
              }
            : undefined,
          pathname: location.pathname,
        }}
        createButtonText="Deploy New Linode"
        disabledCreateButton={userCannotAddLinodes}
        docsLabel="Docs"
        docsLink="https://www.linode.com/docs/platform/stackscripts"
        onButtonClick={handleCreateClick}
        title={stackScript.label}
      />
      <div className="detailsWrapper">
        <_StackScript data={stackScript} userCanModify={userCanModify} />
      </div>
    </>
  );
};

export default StackScriptsDetail;
