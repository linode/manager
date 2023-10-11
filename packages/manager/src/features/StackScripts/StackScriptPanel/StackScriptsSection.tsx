import { Image } from '@linode/api-v4/lib/images';
import { StackScript } from '@linode/api-v4/lib/stackscripts';
import * as React from 'react';

import { CircleProgress } from 'src/components/CircleProgress';
import { TableBody } from 'src/components/TableBody';
import { TableRow } from 'src/components/TableRow';
import {
  StackScriptCategory,
  canUserModifyAccountStackScript,
} from 'src/features/StackScripts/stackScriptUtils';
import { useGrants, useProfile } from 'src/queries/profile';
import { formatDate } from 'src/utilities/formatDate';
import stripImageName from 'src/utilities/stripImageName';

import StackScriptRow from './StackScriptRow';
import { StyledTableCell } from '../SelectStackScriptPanel/SelectStackScriptsSection';

export interface Props {
  // change until we're actually using it.
  category: StackScriptCategory | string;
  currentUser: string;
  data: StackScript[];
  isSorting: boolean;
  publicImages: Record<string, Image>;
  triggerDelete: (id: number, label: string) => void;
  // @todo: when we implement StackScripts pagination, we should remove "| string" in the type below.
  // Leaving this in as an escape hatch now, since there's a bunch of code in
  // /LandingPanel that uses different values for categories that we shouldn't
  triggerMakePublic: (id: number, label: string) => void;
}

export const StackScriptsSection = (props: Props) => {
  const { category, data, isSorting, triggerDelete, triggerMakePublic } = props;

  const { data: profile } = useProfile();
  const { data: grants } = useGrants();

  const isRestrictedUser = Boolean(profile?.restricted);
  const stackScriptGrants = grants?.stackscript;
  const userCannotAddLinodes = isRestrictedUser && grants?.global.add_linodes;

  const listStackScript = (s: StackScript) => (
    <StackScriptRow
      canModify={canUserModifyAccountStackScript(
        isRestrictedUser,
        stackScriptGrants ?? [],
        s.id
      )}
      updated={formatDate(s.updated, {
        displayTime: false,
        timezone: profile?.timezone,
      })}
      canAddLinodes={!userCannotAddLinodes}
      category={category}
      deploymentsTotal={s.deployments_total}
      description={s.description}
      images={stripImageName(s.images)}
      isPublic={s.is_public}
      key={s.id}
      label={s.label}
      stackScriptID={s.id}
      stackScriptUsername={s.username}
      triggerDelete={triggerDelete}
      triggerMakePublic={triggerMakePublic}
    />
  );

  return (
    <TableBody>
      {!isSorting ? (
        data && data.map(listStackScript)
      ) : (
        <TableRow>
          <StyledTableCell colSpan={5}>
            <CircleProgress />
          </StyledTableCell>
        </TableRow>
      )}
    </TableBody>
  );
};