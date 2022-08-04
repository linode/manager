import * as React from 'react';
import Button from 'src/components/Button';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Accordion from 'src/components/Accordion';

const useStyles = makeStyles((theme: Theme) => ({
  helperText: {
    marginBottom: theme.spacing(2),
  },
}));

interface Props {
  openDrawer: () => void;
}

export const ImportGroupsAsTags = (props: Props) => {
  const { openDrawer } = props;
  const classes = useStyles();
  return (
    <Accordion defaultExpanded={true} heading={'Import Display Groups as Tags'}>
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
        data-testid="open-import-drawer"
      >
        Import Display Groups
      </Button>
    </Accordion>
  );
};

export default ImportGroupsAsTags;
