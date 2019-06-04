import { WithStyles } from '@material-ui/core/styles';
import * as React from 'react';
import Button from 'src/components/Button';
import { createStyles, Theme, withStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import ExpansionPanel from 'src/components/ExpansionPanel';

type ClassNames = 'root' | 'helperText';

const styles = (theme: Theme) =>
  createStyles({
    root: {},
    helperText: {
      marginBottom: theme.spacing(2)
    }
  });

interface Props {
  openDrawer: () => void;
}

type CombinedProps = Props & WithStyles<ClassNames>;

export const ImportGroupsAsTags: React.StatelessComponent<
  CombinedProps
> = props => {
  const { classes, openDrawer } = props;
  return (
    <ExpansionPanel
      className={classes.root}
      defaultExpanded={true}
      heading={'Import Display Groups as Tags'}
    >
      <Typography variant="body1" className={classes.helperText}>
        You now have the ability to import your Display Groups from Classic
        Manager as tags and they will be associated with your Linodes and
        Domains. This will give you the ability to organize and view your
        Linodes and Domains by tags.{' '}
        <strong>Your existing tags will not be affected.</strong>
      </Typography>
      <Button
        buttonType="primary"
        onClick={openDrawer}
        data-qa-open-import-drawer-button
      >
        Import Display Groups
      </Button>
    </ExpansionPanel>
  );
};

const styled = withStyles(styles);

export default styled(ImportGroupsAsTags);
