import * as React from 'react';
import Button from 'src/components/Button';
import { StyleRulesCallback, withStyles, WithStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import ExpansionPanel from 'src/components/ExpansionPanel';

type ClassNames = 'root' | 'helperText';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
  helperText: {
    marginBottom: theme.spacing.unit * 2,
  }
});

interface Props {
  openDrawer: () => void;
}

type CombinedProps = Props & WithStyles<ClassNames>;

export const ImportGroupsAsTags: React.StatelessComponent<CombinedProps> = (props) => {
  const { classes, openDrawer } = props;
  return (
    <ExpansionPanel
      className={classes.root}
      defaultExpanded={true}
      heading={"Import Display Groups as Tags!"}
    >
      <Typography variant="body1" className={classes.helperText}>
      You now have the ability to import your Display Groups in the Classic Manager to tags and they will be associated to your Domains and Linodes.  
      This will give you the ability to organize and view your Linodes by tags. Your existing tags will not be affected.
      </Typography>
      <Button type="primary" onClick={openDrawer} data-qa-open-group-import-drawer>
        Import Display Groups!
      </Button>
    </ExpansionPanel>
  );
};

const styled = withStyles(styles);

export default styled(ImportGroupsAsTags);
