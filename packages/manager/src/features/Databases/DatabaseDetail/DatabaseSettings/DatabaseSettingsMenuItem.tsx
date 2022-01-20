import * as React from 'react';
import Grid from 'src/components/Grid';
import Typography from 'src/components/core/Typography';
import Button from 'src/components/Button';

interface Props {
  buttonText: string;
  descriptiveText: string;
  sectionTitle: string;
  onClick: () => void;
  disabled?: boolean;
}

export const DatabaseSettingsMenuItem: React.FC<Props> = (props) => {
  const {
    buttonText,
    descriptiveText,
    sectionTitle,
    onClick,
    disabled = false,
    children,
  } = props;

  return (
    <Grid container>
      <Grid item lg={9}>
        <Typography variant="h3">{sectionTitle}</Typography>
        <Typography>{descriptiveText}</Typography>
        {children}
      </Grid>
      <Grid item lg={3}>
        <Button
          disabled={disabled}
          buttonType="primary"
          onClick={onClick}
          fullWidth
        >
          {buttonText}
        </Button>
      </Grid>
    </Grid>
  );
};

export default DatabaseSettingsMenuItem;
