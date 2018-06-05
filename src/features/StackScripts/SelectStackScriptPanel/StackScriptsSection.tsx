import * as React from 'react';
import { withStyles, StyleRulesCallback, Theme, WithStyles } from 'material-ui';
import SelectionRow from 'src/components/SelectionRow';
type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
});

export interface Props {
  stackScripts: Linode.StackScript.Response[];
  onSelect: (id: number) => void;
  selectedId?: number;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const StackScriptsSection: React.StatelessComponent<CombinedProps> = (props) => {
  const { stackScripts, onSelect, selectedId } = props;
  return (
    <React.Fragment>
      {
        stackScripts.map((s: Linode.StackScript.Response) => (
          <SelectionRow
            label={s.label}
            description={s.description}
            images={s.images}
            deploymentsActive={s.deployments_active}
            updated={s.updated}
            onSelect={() => onSelect(s.id)}
            checked={selectedId === s.id}
          />
        ))
      }
    </React.Fragment>
  );
};

const styled = withStyles(styles, { withTheme: true });

export default styled<Props>(StackScriptsSection) as React.StatelessComponent<Props>;
