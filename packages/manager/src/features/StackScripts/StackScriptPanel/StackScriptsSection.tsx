import { Grant } from '@linode/api-v4/lib/account';
import { Image } from '@linode/api-v4/lib/images';
import { StackScript } from '@linode/api-v4/lib/stackscripts';
import { pathOr } from 'ramda';
import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import CircleProgress from 'src/components/CircleProgress';
import { makeStyles } from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import TableCell from 'src/components/TableCell/TableCell_CMR';
import TableRow from 'src/components/TableRow/TableRow_CMR';
import {
  hasGrant,
  isRestrictedUser as _isRestrictedUser
} from 'src/features/Profile/permissionsHelpers';
import {
  canUserModifyAccountStackScript,
  StackScriptCategory
} from 'src/features/StackScripts/stackScriptUtils';
import { MapState } from 'src/store/types';
import { formatDate } from 'src/utilities/formatDate';
import stripImageName from 'src/utilities/stripImageName';
import truncateText from 'src/utilities/truncateText';
import StackScriptRow from './StackScriptRow';

const useStyles = makeStyles(() => ({
  loadingWrapper: {
    border: 0,
    paddingTop: 100
  }
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

type CombinedProps = Props & StateProps;

const StackScriptsSection: React.FC<CombinedProps> = props => {
  const classes = useStyles();
  const {
    data,
    isSorting,
    triggerDelete,
    triggerMakePublic,
    isRestrictedUser,
    stackScriptGrants,
    category,
    userCannotAddLinodes
  } = props;

  const listStackScript = (s: StackScript) => (
    <StackScriptRow
      key={s.id}
      label={s.label}
      stackScriptUsername={s.username}
      description={truncateText(s.description, 80)}
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
            <CircleProgress noTopMargin />
          </TableCell>
        </TableRow>
      )}
    </TableBody>
  );
};

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

const enhanced = compose<CombinedProps, Props>(connected);

export default enhanced(StackScriptsSection);
