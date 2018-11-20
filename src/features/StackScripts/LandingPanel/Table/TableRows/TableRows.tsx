import {
  StyleRulesCallback,
  Theme,
  withStyles,
  WithStyles,
} from '@material-ui/core/styles';
import { compose, isEmpty, lensIndex, map, over, splitAt, unless } from 'ramda';
import * as React from 'react';

import ShowMore from 'src/components/ShowMore';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import TableRowEmptyState from 'src/components/TableRowEmptyState';
import TableRowError from 'src/components/TableRowError';
import TableRowLoading from 'src/components/TableRowLoading';
import Tag from 'src/components/Tag';

import StackScriptActionMenu
  from 'src/features/StackScripts/SelectStackScriptPanel/StackScriptActionMenu';
import LabelCell from '../LabelCell';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
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
}

type CombinedProps = Props & WithStyles<ClassNames>;

export const StackScriptTableRows: React.StatelessComponent<CombinedProps> = (props) => {
  const {
    stackScript: {
      loading,
      error,
      stackScripts,
    },
    triggerMakePublic,
    triggerDelete
  } = props;

  if (loading) { return <TableRowLoading colSpan={6} /> }

  if (error) { return <TableRowError message="Error loading StackScripts" colSpan={6} /> }

  if (stackScripts && stackScripts.length === 0) { return <TableRowEmptyState colSpan={6} /> }

  return (
    <React.Fragment>
      {stackScripts &&
        stackScripts.map(eachStackScript => {
          return (
            <TableRow key={eachStackScript.id}>
              <TableCell parentColumn="StackScript">
                <LabelCell
                  stackScriptId={eachStackScript.id}
                  label={eachStackScript.label}
                  stackScriptUsername={eachStackScript.username}
                  description={eachStackScript.description}
                />
              </TableCell>
              <TableCell parentColumn="Active Deploys">
                {eachStackScript.deployments_active}
              </TableCell>
              <TableCell parentColumn="Last Revision">
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
                  canDelete={
                    determineCanDelete(
                      eachStackScript.username,
                      props.currentUser,
                      eachStackScript.is_public)
                  }
                  canEdit={
                    determineCanEdit(
                      eachStackScript.username,
                      props.currentUser
                    )
                  }
                />
              </TableCell>
            </TableRow>
          )
        })
      }
    </React.Fragment>
  );
};

/*
 * We can only delete a stackscript if it's ours
 * and it's not publicly available
 */
export const determineCanDelete = (stackScriptUser: string, currentUser: string, stackScriptIsPublic: boolean) => {
  if (stackScriptUser === currentUser && !stackScriptIsPublic) {
    return true;
  }
  return false;
}

/*
 * We can only edit a stackscript if it's ours
 * it doesn't matter if it's public or not
 */
export const determineCanEdit = (stackScriptUser: string, currentUser: string) => {
  if (stackScriptUser === currentUser) {
    return true;
  }
  return false;
}

const createTag: (images: string) => JSX.Element =
  v => <Tag label={stripImageName(v)} key={v} colorVariant="lightBlue" style={{ margin: '2px 2px' }} />;

const createTags: (images: string[]) => JSX.Element[] =
  map(createTag);

const createShowMore: (images: string[]) => JSX.Element =
  images => <ShowMore key={0} items={images} render={createTags} />;

const displayTagsAndShowMore: (s: string[]) => JSX.Element[][] =
  compose<string[], string[][], any, JSX.Element[][]>(
    over(lensIndex(1), unless(isEmpty, createShowMore)),
    over(lensIndex(0), createTags),
    splitAt(3),
  );

/*
 * @todo deprecate once we have a reliable way of mapping
 * the slug to the display name
 */
export const stripImageName = (image: string) => {
  return image.replace('linode/', '');
};

const styled = withStyles(styles);

export default styled(StackScriptTableRows);
