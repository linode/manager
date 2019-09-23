import * as React from 'react';

import Typography from 'src/components/core/Typography';
import ExpansionPanel from 'src/components/ExpansionPanel';
import Grid from 'src/components/Grid';
import useFlags from 'src/hooks/useFlags';

interface Props {
  isManaged: boolean;
}

export const EnableManaged: React.FC<Props> = props => {
  const { isManaged } = props;
  const flags = useFlags();

  if (!flags.managed) {
    return null;
  }

  return (
    <>
      <ExpansionPanel heading="Linode Managed" defaultExpanded={true}>
        <Grid container direction="column">
          <Grid item>
            <Typography variant="h2">Managed panel {isManaged}</Typography>
          </Grid>
        </Grid>
      </ExpansionPanel>
    </>
  );
};

export default EnableManaged;
