import { Grid, Radio } from '@mui/material';
import { useFormikContext } from 'formik';
import * as React from 'react';

import { SelectionCard } from 'src/components/SelectionCard/SelectionCard';

import { firewallRuleCreateOptions } from './shared';

import type {
  FirewallCreateEntityType,
  FormRuleSetState,
  FormState,
} from './FirewallRuleDrawer.types';

interface CreateEntitySelectionProps {
  createEntityType: FirewallCreateEntityType;
  mode: string;
  setCreateEntityType: (value: FirewallCreateEntityType) => void;
}

export const CreateEntitySelection = (props: CreateEntitySelectionProps) => {
  const { createEntityType, setCreateEntityType, mode } = props;

  const formik = useFormikContext<FormRuleSetState | FormState>();

  // Reset form & errors when switching between "rule" and "ruleset"
  React.useEffect(() => {
    if (mode !== 'create') return;

    formik.setErrors({});
    formik.setTouched({});
    formik.setStatus(undefined);
    formik.resetForm({});
  }, [createEntityType]);

  return (
    <Grid container spacing={2}>
      {firewallRuleCreateOptions.map((option) => (
        <SelectionCard
          checked={createEntityType === option.value}
          gridSize={{
            md: 6,
            sm: 12,
            xs: 12,
          }}
          heading={option.label}
          key={option.value}
          onClick={() => setCreateEntityType(option.value)}
          renderIcon={() => (
            <Radio checked={createEntityType === option.value} />
          )}
          subheadings={[]}
          sxCardBase={(theme) => ({
            gap: 0,
            '& .cardSubheadingTitle': {
              fontSize: theme.tokens.font.FontSize.Xs,
            },
          })}
          sxCardBaseIcon={(theme) => ({
            svg: { fontSize: theme.tokens.font.FontSize.L },
          })}
        />
      ))}
    </Grid>
  );
};
