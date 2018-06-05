import * as React from 'react';
import { withStyles, StyleRulesCallback, Theme, WithStyles } from 'material-ui';
import SelectionRow from 'src/components/SelectionRow';
import { PromiseLoaderResponse } from 'src/components/PromiseLoader';
type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
});

export interface Props {
  onSelect: (id: number) => void;
  selectedId?: number;
}

interface PreloadedProps {
  stackScripts: PromiseLoaderResponse<Linode.StackScript.Response[]>;
}

type CombinedProps = Props & PreloadedProps & WithStyles<ClassNames>;

const StackScriptsSection: React.StatelessComponent<CombinedProps> = (props) => {
  const {
    stackScripts: { response: stackScripts },
    onSelect,
    selectedId,
  } = props;

  return (
    <React.Fragment>
      {
        stackScripts && stackScripts.map(stackScript(onSelect, selectedId))
      }
    </React.Fragment>
  );
};

const stackScript: (fn: (id: number) => void, id?: number) =>
  (s: Linode.StackScript.Response) => JSX.Element =
  (onSelect, selectedId) => s => (
    <SelectionRow
      key={s.id}
      label={s.label}
      description={s.description}
      images={s.images}
      deploymentsActive={s.deployments_active}
      updated={s.updated}
      onSelect={() => onSelect(s.id)}
      checked={selectedId === s.id}
    />
  );

const styled = withStyles(styles, { withTheme: true });

export default styled<Props>(StackScriptsSection) as React.StatelessComponent<Props>;
