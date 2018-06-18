import * as React from 'react';
import { withStyles, StyleRulesCallback, Theme, WithStyles } from 'material-ui';
import TableBody from 'material-ui/Table/TableBody';
import TableRow from 'material-ui/Table/TableRow';
import TableCell from 'material-ui/Table/TableCell';

import SelectionRow from 'src/components/SelectionRow';
import CircleProgress from 'src/components/CircleProgress';

type ClassNames = 'root' | 'loadingWrapper' | 'username';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
  loadingWrapper: {
    border: 0,
    paddingTop: 100,
  },
  username: {
    color: 'grey',
  },
});

export interface Props {
  onSelect: (s: Linode.StackScript.Response) => void;
  selectedId?: number;
  data: Linode.StackScript.Response[];
  getNext: () => void;
  isSorting: boolean;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const StackScriptsSection: React.StatelessComponent<CombinedProps> = (props) => {
  const {
    onSelect,
    selectedId,
    data,
    isSorting,
    classes,
  } = props;

  return (
    <TableBody>
      {!isSorting
        ? data && data.map(stackScript(onSelect, selectedId))
        : <TableRow>
            <TableCell colSpan={5} className={classes.loadingWrapper}>
              <CircleProgress />
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

const stackScript: (fn: (s: Linode.StackScript.Response) => void, id?: number) =>
  (s: Linode.StackScript.Response) => JSX.Element =
  (onSelect, selectedId) => s => (
    <SelectionRow
      key={s.id}
      label={s.label}
      stackScriptUsername={s.username}
      description={truncateDescription(s.description)}
      images={stripImageName(s.images)}
      deploymentsActive={s.deployments_active}
      updated={s.updated}
      onSelect={() => onSelect(s)}
      checked={selectedId === s.id}
      updateFor={[selectedId === s.id]}
      stackScriptID={s.id}
    />
  );

const styled = withStyles(styles, { withTheme: true });

export default styled<Props>(StackScriptsSection) as React.StatelessComponent<Props>;
