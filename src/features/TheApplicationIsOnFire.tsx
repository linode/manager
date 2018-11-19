import * as React from 'react';
import Dialog from 'src/components/core/Dialog';
import DialogContent from 'src/components/core/DialogContent';
import DialogTitle from 'src/components/core/DialogTitle';
import { StyleRulesCallback, Theme, withStyles, WithStyles } from 'src/components/core/styles';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
});

interface Props { }

type CombinedProps = Props & WithStyles<ClassNames>;

const TheApplicationIsOnFire: React.StatelessComponent<CombinedProps> = (props) => {
  return (
    <Dialog open>
      <DialogTitle>Oh snap!</DialogTitle>
      <DialogContent>
        Something went terribly wrong. Did you try {<ReloadLink />}?
      </DialogContent>
    </Dialog>
  );
};

const ReloadLink = () => <a onClick={() => { location.reload(); }}>restarting it</a>;

const styled = withStyles(styles);

export default styled(TheApplicationIsOnFire);
