import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from '@material-ui/styles';
import {
  compose as ramdaCompose,
  isEmpty,
  lensIndex,
  map,
  over,
  pathOr,
  splitAt,
  unless
} from 'ramda';
import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import ShowMore from 'src/components/ShowMore';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import TableRowEmptyState from 'src/components/TableRowEmptyState';
import TableRowError from 'src/components/TableRowError';
import TableRowLoading from 'src/components/TableRowLoading';
import Tag from 'src/components/Tag';
import {
  hasGrant,
  isRestrictedUser as _isRestrictedUser
} from 'src/features/Profile/permissionsHelpers';
import StackScriptActionMenu from 'src/features/StackScripts/StackScriptPanel/StackScriptActionMenu';
import { canUserModifyAccountStackScript } from 'src/features/StackScripts/stackScriptUtils';
import { MapState } from 'src/store/types';
import LabelCell from '../LabelCell';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {}
});

interface StackScriptData {
  stackScripts?: Linode.StackScript.Response[];
  loading: boolean;
  error?: Error;
}

interface Props {
  stackScript: StackScriptData;
  currentUser: string;
  triggerDelete: (stackScriptID: number, stackScriptLabel: string) => void;
  triggerMakePublic: (stackScriptID: number, stackScriptLabel: string) => void;
  category: string;
}

type CombinedProps = Props & WithStyles<ClassNames> & StateProps;

export const StackScriptTableRows: React.StatelessComponent<
  CombinedProps
> = props => {
  const {
    stackScript: { loading, error, stackScripts },
    triggerMakePublic,
    triggerDelete,
    isRestrictedUser,
    stackScriptGrants,
    category,
    userCannotAddLinodes
  } = props;

  if (loading) {
    return <TableRowLoading colSpan={6} />;
  }

  if (error) {
    return <TableRowError message="Error loading StackScripts" colSpan={6} />;
  }

  if (stackScripts && stackScripts.length === 0) {
    return <TableRowEmptyState colSpan={6} />;
  }

  return (
    <React.Fragment>
      {stackScripts &&
        stackScripts.map(eachStackScript => {
          return (
            <TableRow key={eachStackScript.id} data-qa-table-row>
              <TableCell
                parentColumn="StackScript"
                data-qa-stackscript-title={eachStackScript.label}
              >
                <LabelCell
                  stackScriptId={eachStackScript.id}
                  label={eachStackScript.label}
                  stackScriptUsername={eachStackScript.username}
                  description={eachStackScript.description}
                />
              </TableCell>
              <TableCell
                parentColumn="Active Deploys"
                data-qa-stackscript-deploys={eachStackScript.deployments_active}
              >
                {eachStackScript.deployments_active}
              </TableCell>
              <TableCell
                parentColumn="Last Revision"
                data-qa-stackscript-revision
              >
                {eachStackScript.updated}
              </TableCell>
              <TableCell parentColumn="Compatible Images">
                {displayTagsAndShowMore(eachStackScript.images)}
              </TableCell>
              <TableCell>
                <StackScriptActionMenu
                  stackScriptID={eachStackScript.id}
                  stackScriptLabel={eachStackScript.label}
                  stackScriptUsername={eachStackScript.username}
                  triggerDelete={triggerDelete}
                  triggerMakePublic={triggerMakePublic}
                  isPublic={eachStackScript.is_public}
                  canModify={canUserModifyAccountStackScript(
                    isRestrictedUser,
                    stackScriptGrants,
                    eachStackScript.id
                  )}
                  canAddLinodes={!userCannotAddLinodes}
                  category={category}
                />
              </TableCell>
            </TableRow>
          );
        })}
    </React.Fragment>
  );
};

const createTag: (images: string | null) => JSX.Element = v => {
  if (!v) {
    return <React.Fragment />;
  }
  return (
    <Tag
      label={stripImageName(v)}
      key={v}
      colorVariant="lightBlue"
      style={{ margin: '2px 2px' }}
    />
  );
};

const createTags: (images: string[]) => JSX.Element[] = map(createTag);

const createShowMore: (images: string[]) => JSX.Element = images => (
  <ShowMore key={0} items={images} render={createTags} />
);

const displayTagsAndShowMore: (s: string[]) => JSX.Element[][] = ramdaCompose<
  string[],
  string[][],
  any,
  JSX.Element[][]
>(
  over(lensIndex(1), unless(isEmpty, createShowMore)),
  over(lensIndex(0), createTags),
  splitAt(3)
);

/*
 * @todo deprecate once we have a reliable way of mapping
 * the slug to the display name
 */
export const stripImageName = (image: string) => {
  return image.replace('linode/', '');
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

export default enhanced(StackScriptTableRows);
