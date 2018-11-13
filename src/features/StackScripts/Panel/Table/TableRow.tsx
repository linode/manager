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
import TableRowError from 'src/components/TableRowError';
import TableRowLoading from 'src/components/TableRowLoading';
import Tag from 'src/components/Tag';

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
  stackScript: StackScriptData
}

type CombinedProps = Props & WithStyles<ClassNames>;

const StackScriptTableRow: React.StatelessComponent<CombinedProps> = (props) => {
  const {
    loading,
    error,
    stackScripts
  } = props.stackScript;

  if (loading) { return <TableRowLoading colSpan={5} /> }

  if (error) { return <TableRowError message="Error loading StackScripts" colSpan={5} /> }

  return (
    <React.Fragment>
      {stackScripts &&
        stackScripts.map(eachStackScript => {
          return (
            <TableRow key={eachStackScript.id}>
              <TableCell parentColumn="StackScript">
                {eachStackScript.label}
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
                actions
              </TableCell>
            </TableRow>
          )
        })
      }
    </React.Fragment>
  );
};

const createTag: (images: string) => JSX.Element =
  v => <Tag label={v} key={v} variant="lightBlue" style={{ margin: '2px 2px' }} />;

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

const styled = withStyles(styles, { withTheme: true });

export default styled<Props>(StackScriptTableRow);
