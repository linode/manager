import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import * as React from 'react';
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

const styled = withStyles(styles, { withTheme: true });

export default styled<Props>(TheApplicationIsOnFire);
