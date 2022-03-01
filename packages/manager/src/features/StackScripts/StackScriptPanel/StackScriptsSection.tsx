import { Image } from '@linode/api-v4/lib/images';
import { StackScript } from '@linode/api-v4/lib/stackscripts';
import * as React from 'react';
import CircleProgress from 'src/components/CircleProgress';
import { makeStyles } from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import { getGrants, hasGrant } from 'src/features/Profile/permissionsHelpers';
import {
  canUserModifyAccountStackScript,
  StackScriptCategory,
} from 'src/features/StackScripts/stackScriptUtils';
import { useGrants, useProfile } from 'src/queries/profile';
import { formatDate } from 'src/utilities/formatDate';
import stripImageName from 'src/utilities/stripImageName';
import StackScriptRow from './StackScriptRow';

const useStyles = makeStyles(() => ({
  loadingWrapper: {
    border: 0,
    paddingTop: 100,
  },
}));

export interface Props {
  data: StackScript[];
  isSorting: boolean;
  publicImages: Record<string, Image>;
  triggerDelete: (id: number, label: string) => void;
  triggerMakePublic: (id: number, label: string) => void;
  currentUser: string;
  // @todo: when we implement StackScripts pagination, we should remove "| string" in the type below.
  // Leaving this in as an escape hatch now, since there's a bunch of code in
  // /LandingPanel that uses different values for categories that we shouldn't
  // change until we're actually using it.
  category: StackScriptCategory | string;
}

const StackScriptsSection: React.FC<Props> = (props) => {
  const classes = useStyles();
  const { data, isSorting, triggerDelete, triggerMakePublic, category } = props;

  const { data: profile } = useProfile();
  const { data: grants } = useGrants();

  const isRestrictedUser = Boolean(profile?.restricted);
  const stackScriptGrants = getGrants(grants, 'stackscript');
  const userCannotAddLinodes =
    isRestrictedUser && !hasGrant('add_linodes', grants);

  const listStackScript = (s: StackScript) => (
    <StackScriptRow
      key={s.id}
      label={s.label}
      stackScriptUsername={s.username}
      description={s.description}
      isPublic={s.is_public}
      images={stripImageName(s.images)}
      deploymentsTotal={s.deployments_total}
      updated={formatDate(s.updated, { displayTime: false })}
      stackScriptID={s.id}
      triggerDelete={triggerDelete}
      triggerMakePublic={triggerMakePublic}
      canModify={canUserModifyAccountStackScript(
        isRestrictedUser,
        stackScriptGrants,
        s.id
      )}
      canAddLinodes={!userCannotAddLinodes}
      category={category}
    />
  );

  return (
    <TableBody>
      {!isSorting ? (
        data && data.map(listStackScript)
      ) : (
        <TableRow>
          <TableCell colSpan={5} className={classes.loadingWrapper}>
            <CircleProgress />
          </TableCell>
        </TableRow>
      )}
    </TableBody>
  );
};

export default StackScriptsSection;
