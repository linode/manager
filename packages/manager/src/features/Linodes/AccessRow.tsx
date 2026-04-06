import { usePreferences } from '@linode/queries';
import { Stack, VisibilityTooltip } from '@linode/ui';
import React from 'react';

import { CopyTooltip } from 'src/components/CopyTooltip/CopyTooltip';
import { TableCell } from 'src/components/TableCell';

import {
  StyledCopyTooltip,
  StyledGradientDiv,
  StyledTableCell,
} from './LinodeEntityDetail.styles';
import { StyledTableRow } from './LinodeEntityDetail.styles';
import { PublicIPAddressTooltip } from './PublicIPAddressTooltip';

interface AccessRowProps {
  hasPublicInterface?: boolean;
  heading?: string;
  isDisabled: boolean;
  isLinodeInterface?: boolean;
  text: string;
}

export const AccessRow = (props: AccessRowProps) => {
  const { heading, text, isDisabled, hasPublicInterface, isLinodeInterface } =
    props;

  const { data: maskedPreferenceSetting } = usePreferences(
    (preferences) => preferences?.maskSensitiveData
  );

  const [isTextMasked, setIsTextMasked] = React.useState(
    maskedPreferenceSetting
  );

  return (
    <StyledTableRow disabled={isDisabled} key={text}>
      {heading ? (
        <TableCell component="th" scope="row">
          {heading}
        </TableCell>
      ) : null}
      <StyledTableCell>
        <StyledGradientDiv>
          <CopyTooltip
            copyableText
            disabled={isDisabled}
            isMaskingControlled
            masked={isTextMasked}
            text={text}
          />
        </StyledGradientDiv>
        <Stack alignItems="center" direction="row" spacing={1}>
          {isDisabled ? (
            <PublicIPAddressTooltip
              hasPublicInterface={Boolean(hasPublicInterface)}
              isLinodeInterface={Boolean(isLinodeInterface)}
            />
          ) : (
            <StyledCopyTooltip text={text} />
          )}
          {maskedPreferenceSetting && (
            <VisibilityTooltip
              handleClick={() => setIsTextMasked(!isTextMasked)}
              isVisible={!isTextMasked}
            />
          )}
        </Stack>
      </StyledTableCell>
    </StyledTableRow>
  );
};
