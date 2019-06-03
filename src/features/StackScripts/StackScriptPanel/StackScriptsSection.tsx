import { pathOr } from 'ramda';
import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import CircleProgress from 'src/components/CircleProgress';
import {
  createStyles,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import TableCell from 'src/components/core/TableCell';
import TableRow from 'src/components/core/TableRow';
import {
  hasGrant,
  isRestrictedUser as _isRestrictedUser
} from 'src/features/Profile/permissionsHelpers';
import {
  canUserModifyAccountStackScript,
  StackScriptCategory
} from 'src/features/StackScripts/stackScriptUtils';
import { MapState } from 'src/store/types';
import { formatDate } from 'src/utilities/format-date-iso8601';
import stripImageName from 'src/utilities/stripImageName';
import truncateText from 'src/utilities/truncateText';
import StackScriptRow from './StackScriptRow';

type ClassNames = 'root' | 'loadingWrapper';

const styles = (theme: Theme) =>
  createStyles({
  root: {},
  loadingWrapper: {
    border: 0,
    paddingTop: 100
  }
});

export interface Props {
  data: Linode.StackScript.Response[];
  isSorting: boolean;
  publicImages: Linode.Image[];
  triggerDelete: (id: number, label: string) => void;
  triggerMakePublic: (id: number, label: string) => void;
  currentUser: string;
  // @todo: when we implement StackScripts pagination, we should remove "| string" in the type below.
  // Leaving this in as an escape hatch now, since there's a bunch of code in
  // /LandingPanel that uses different values for categories that we shouldn't
  // change until we're actually using it.
  category: StackScriptCategory | string;
}

type CombinedProps = Props & WithStyles<ClassNames> & StateProps;

const StackScriptsSection: React.StatelessComponent<CombinedProps> = props => {
  const {
    data,
    isSorting,
    classes,
    triggerDelete,
    triggerMakePublic,
    isRestrictedUser,
    stackScriptGrants,
    category,
    userCannotAddLinodes
  } = props;

  const listStackScript = (s: Linode.StackScript.Response) => (
    <StackScriptRow
      key={s.id}
      label={s.label}
      stackScriptUsername={s.username}
      description={truncateText(s.description, 100)}
      isPublic={s.is_public}
      images={stripImageName(s.images)}
      deploymentsActive={s.deployments_active}
      updated={formatDate(s.updated, false)}
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

const styled = withStyles(styles);

interface StateProps {
  isRestrictedUser: boolean;
  stackScriptGrants: Linode.Grant[];
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

const enhanced = compose<CombinedProps, Props>(
  connected,
  styled
);

export default enhanced(StackScriptsSection);
