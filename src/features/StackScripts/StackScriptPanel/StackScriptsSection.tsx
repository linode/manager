import * as React from 'react';
import CircleProgress from 'src/components/CircleProgress';
import { StyleRulesCallback, withStyles, WithStyles } from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import TableCell from 'src/components/core/TableCell';
import TableRow from 'src/components/core/TableRow';
import { formatDate } from 'src/utilities/format-date-iso8601';
import stripImageName from 'src/utilities/stripImageName';
import truncateText from 'src/utilities/truncateText';
import StackScriptRow from './StackScriptRow';

type ClassNames = 'root' | 'loadingWrapper';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
  loadingWrapper: {
    border: 0,
    paddingTop: 100,
  },
});

export interface Props {
  data: Linode.StackScript.Response[];
  isSorting: boolean;
  publicImages: Linode.Image[];
  triggerDelete: (id: number, label: string) => void;
  triggerMakePublic: (id: number, label: string) => void;
  currentUser: string;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const StackScriptsSection: React.StatelessComponent<CombinedProps> = (props) => {
  const {
    data,
    isSorting,
    classes,
    triggerDelete,
    currentUser,
    triggerMakePublic
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
      canDelete={canDelete(s.username, s.is_public)}
      canEdit={canEdit(s.username)}
    />
  )

  /*
  * We can only delete a stackscript if it's ours
  * and it's not publicly available
  */
  const canDelete = (stackScriptUser: string, stackScriptIsPublic: boolean) => {
    if (stackScriptUser === currentUser && !stackScriptIsPublic) {
      return true;
    }
    return false;
  }

  /*
  * We can only edit a stackscript if it's ours
  * it doesn't matter if it's public or not
  */
  const canEdit = (stackScriptUser: string) => {
    if (stackScriptUser === currentUser) {
      return true;
    }
    return false;
  }

  return (
    <TableBody>
      {!isSorting
        ? data && data
          .map(listStackScript)
        : <TableRow>
          <TableCell colSpan={5} className={classes.loadingWrapper}>
            <CircleProgress noTopMargin/>
          </TableCell>
        </TableRow>
      }
    </TableBody>
  );
};

const styled = withStyles(styles);

export default styled(StackScriptsSection) as React.StatelessComponent<Props>;
