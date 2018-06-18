import * as React from 'react';
import { withStyles, StyleRulesCallback, Theme, WithStyles } from 'material-ui';
import TableBody from 'material-ui/Table/TableBody';

import SelectionRow from 'src/components/SelectionRow';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
});

export interface Props {
  onSelect: (s: Linode.StackScript.Response) => void;
  selectedId?: number;
  data: Linode.StackScript.Response[];
  getNext: () => void;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const StackScriptsSection: React.StatelessComponent<CombinedProps> = (props) => {
  const {
    onSelect,
    selectedId,
    data,
  } = props;

  return (
    <TableBody>
      {
        data && data.map(stackScript(onSelect, selectedId))
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
