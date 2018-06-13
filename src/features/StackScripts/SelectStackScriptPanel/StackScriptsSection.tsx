import * as React from 'react';
import { withStyles, StyleRulesCallback, Theme, WithStyles } from 'material-ui';
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
    <div>
      {
        data && data.map(stackScript(onSelect, selectedId))
      }
    </div>
  );
};

const stackScript: (fn: (s: Linode.StackScript.Response) => void, id?: number) =>
  (s: Linode.StackScript.Response) => JSX.Element =
  (onSelect, selectedId) => s => (
    <SelectionRow
      key={s.id}
      label={s.label}
      description={s.description}
      images={s.images}
      deploymentsActive={s.deployments_active}
      updated={s.updated}
      onSelect={() => onSelect(s)}
      checked={selectedId === s.id}
      updateFor={[selectedId === s.id]}
    />
  );

const styled = withStyles(styles, { withTheme: true });

export default styled<Props>(StackScriptsSection) as React.StatelessComponent<Props>;
