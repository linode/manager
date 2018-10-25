import * as React from 'react';

import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';

import CircleProgress from 'src/components/CircleProgress';
import SelectionRow from 'src/components/SelectionRow';

import { formatDate } from 'src/utilities/format-date-iso8601';
import truncateText from 'src/utilities/truncateText';

type ClassNames = 'root' | 'loadingWrapper';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
  loadingWrapper: {
    border: 0,
    paddingTop: 100,
  },
});

export interface Props {
  onSelect?: (s: Linode.StackScript.Response) => void;
  selectedId?: number;
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
    onSelect,
    selectedId,
    data,
    isSorting,
    classes,
    triggerDelete,
    currentUser,
    triggerMakePublic
  } = props;

  const renderStackScriptTable = () => {
    return (!!onSelect)
    ? selectStackScript()
    : listStackScript()
  }

  const selectStackScript = () => (s: Linode.StackScript.Response) => (
    <SelectionRow
      key={s.id}
      label={s.label}
      stackScriptUsername={s.username}
      description={truncateText(s.description, 100)}
      isPublic={s.is_public}
      images={stripImageName(s.images)}
      deploymentsActive={s.deployments_active}
      updated={formatDate(s.updated, false)}
      onSelect={() => onSelect!(s)}
      checked={selectedId === s.id}
      updateFor={[selectedId === s.id]}
      stackScriptID={s.id}
      canDelete={false}
      canEdit={false}
    />
  )

const listStackScript = () => (s: Linode.StackScript.Response) => (
    <SelectionRow
      key={s.id}
      label={s.label}
      stackScriptUsername={s.username}
      description={truncateText(s.description, 100)}
      isPublic={s.is_public}
      images={stripImageName(s.images)}
      deploymentsActive={s.deployments_active}
      updated={formatDate(s.updated, false)}
      showDeployLink={true}
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
          .map(renderStackScriptTable())
        : <TableRow>
          <TableCell colSpan={5} className={classes.loadingWrapper}>
            <CircleProgress noTopMargin/>
          </TableCell>
        </TableRow>
      }
    </TableBody>
  );
};

/*
* @TODO Deprecate once we have a reliable way of mapping
* the slug to the display name
*/
const stripImageName = (images: string[]) => {
  return images.map((image: string) => {
    return image.replace('linode/', '');
  });
};

const styled = withStyles(styles, { withTheme: true });

export default styled<Props>(StackScriptsSection) as React.StatelessComponent<Props>;
