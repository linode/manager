import * as React from 'react';

import { makeStyles, Theme } from 'src/components/core/styles';
import Grid from 'src/components/Grid';
import Typography from 'src/components/core/Typography';
import Button from 'src/components/Button';

const useStyles = makeStyles((theme: Theme) => ({}));

export interface HeaderProps {
  title: string;
  iconType: string;
  onAddNew?: () => void;
}

export type CombinedProps = HeaderProps;

export const LandingHeader: React.FC<CombinedProps> = props => {
  const { onAddNew, title } = props;

  return (
    <Grid container alignItems="center" justify="space-between">
      <Grid item>
        <Grid container direction="row" alignItems="center">
          <Grid item>
            <div>Icon here</div>
          </Grid>
          <Grid item>
            <Typography variant="h2">{title}s</Typography>
          </Grid>
        </Grid>
      </Grid>
      {onAddNew && (
        <Grid item>
          <Button buttonType="primary" onClick={onAddNew}>
            Create a {title}
          </Button>
        </Grid>
      )}
    </Grid>
  );
};

export default React.memo(LandingHeader);
