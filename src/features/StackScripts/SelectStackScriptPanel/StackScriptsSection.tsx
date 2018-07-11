import * as React from 'react';

import {  StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';

import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';

import CircleProgress from 'src/components/CircleProgress';
import SelectionRow from 'src/components/SelectionRow';

import { formatDate } from 'src/utilities/format-date-iso8601';

type ClassNames = 'root' | 'loadingWrapper';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme & Linode.Theme) => ({
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
    publicImages,
    triggerDelete,
    currentUser,
  } = props;

  const hasNonDeprecatedImages = (stackScriptImages: string[]) => {
    for (const stackScriptImage of stackScriptImages) {
      for (const publicImage of publicImages) {
        if (stackScriptImage === publicImage.id) {
          return true;
        }
      }
    }
    return false;
  }

  const renderStackScriptTable = () => {
    return (!!onSelect)
    ? selectStackScript(onSelect, selectedId)
    : listStackScript(true, triggerDelete, selectedId)
  }

  const selectStackScript: (fn: (s: Linode.StackScript.Response) => void, id?: number) =>
  (s: Linode.StackScript.Response) => JSX.Element =
  (onSelect, selectedId) => s => (
    <SelectionRow
      key={s.id}
      label={s.label}
      stackScriptUsername={s.username}
      description={truncateDescription(s.description)}
      images={stripImageName(s.images)}
      deploymentsActive={s.deployments_active}
      updated={formatDate(s.updated, false)}
      onSelect={() => onSelect(s)}
      checked={selectedId === s.id}
      updateFor={[selectedId === s.id]}
      stackScriptID={s.id}
      canDelete={false}
    />
  )

const listStackScript: (
  showDeployLink: boolean,
  triggerDelete: (id: number, label: string) => void,
  id?: number
) =>
  (s: Linode.StackScript.Response) => JSX.Element =
  (showDeployLink, triggerDelete, selectedId) => s => (
    <SelectionRow
      key={s.id}
      label={s.label}
      stackScriptUsername={s.username}
      description={truncateDescription(s.description)}
      images={stripImageName(s.images)}
      deploymentsActive={s.deployments_active}
      updated={formatDate(s.updated, false)}
      showDeployLink={showDeployLink}
      stackScriptID={s.id}
      triggerDelete={triggerDelete}
      canDelete={canDelete(s.username, s.is_public)}
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

  return (
    <TableBody>
      {!isSorting
        ? data && data
          .filter(stackScript => hasNonDeprecatedImages(stackScript.images))
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

const truncateDescription = (desc: string) => {
  if (desc.length > 200) { // 200 characters
    return `${desc.split(' ').splice(0, 30).join(' ')} [...]`; // truncate to 30 words
  }
  return desc;
};

const stripImageName = (images: string[]) => {
  return images.map((image: string) => {
    return image.replace('linode/', '');
  });
};

const styled = withStyles(styles, { withTheme: true });

export default styled<Props>(StackScriptsSection) as React.StatelessComponent<Props>;
