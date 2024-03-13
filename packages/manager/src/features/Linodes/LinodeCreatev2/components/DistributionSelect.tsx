import { Image } from '@linode/api-v4';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import React from 'react';

import {
  Autocomplete,
  EnhancedAutocompleteProps,
} from 'src/components/Autocomplete/Autocomplete';
import { SelectedIcon } from 'src/components/Autocomplete/Autocomplete.styles';
import { distroIcons } from 'src/components/ImageSelect/icons';
import { Stack } from 'src/components/Stack';
import { TooltipIcon } from 'src/components/TooltipIcon';
import { Typography } from 'src/components/Typography';
import { useFlags } from 'src/hooks/useFlags';
import { useAllImagesQuery } from 'src/queries/images';

interface Props
  extends Omit<Partial<EnhancedAutocompleteProps<Image>>, 'value'> {
  /**
   * The ID of the selected image
   */
  value: null | string | undefined;
}

export const DistributionSelect = (props: Props) => {
  const flags = useFlags();
  const { data: images, error, isLoading } = useAllImagesQuery(
    {},
    { '+order_by': 'label', is_public: true }
  );

  // We can't filter out Kubernetes images using the API so we filter them here.
  const options = images?.filter((image) => !image.id.includes('kube')) ?? [];

  const value = images?.find((i) => i.id === props.value);

  return (
    <Autocomplete
      renderOption={(props, option, state) => (
        <li {...props}>
          <Stack
            alignItems="center"
            direction="row"
            flexGrow={1}
            gap={2}
            maxHeight="20px"
          >
            <i
              className={
                option.vendor
                  ? `fl-${distroIcons[option.vendor] ?? 'tux'}`
                  : `fl-tux`
              }
              style={{ fontSize: '1.8em' }}
            />
            <Typography color="inherit">{option.label}</Typography>
            <Stack flexGrow={1} />
            {flags.metadata && option.capabilities.includes('cloud-init') && (
              <TooltipIcon
                sxTooltipIcon={{
                  '& svg': {
                    height: 20,
                    width: 20,
                  },
                  '&:hover': {
                    color: 'inherit',
                  },
                  color: 'inherit',
                  padding: 0,
                }}
                icon={<DescriptionOutlinedIcon />}
                status="other"
                text="This image is compatible with cloud-init."
              />
            )}
            {state.selected && <SelectedIcon visible />}
          </Stack>
        </li>
      )}
      errorText={error?.[0].reason}
      groupBy={(option) => option.vendor ?? 'Other'}
      label="Image"
      loading={isLoading}
      options={options}
      {...props}
      value={value}
    />
  );
};
