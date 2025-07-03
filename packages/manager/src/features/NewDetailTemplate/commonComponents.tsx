import React from 'react';
import { styled } from '@mui/material/styles';

interface DataItemWrapperProps {
  backgroundColor?: string;
}

const DataItemWrapper = styled('div', {
  label: 'DataItemWrapper',
  shouldForwardProp: (prop) => prop !== 'backgroundColor',
})<DataItemWrapperProps>(({ theme, backgroundColor }) => ({
  backgroundColor: backgroundColor || 'white',
  minWidth: 120,
  display: 'flex',
  flexDirection: 'column',
}));

export const DataItemLabel = styled('div', { label: 'DataItemLabel' })(
  ({ theme }) => ({
    fontSize: 14,
    color: theme.textColors.tableStatic,
    marginBottom: 4,
    fontWeight: theme.font.bold,
  })
);

const DataItemValue = styled('div', { label: 'DataItemValue' })(
  ({ theme }) => ({
    fontSize: 14,
    fontWeight: 600,
    color: theme.textColors.headlineStatic,
  })
);

export const SectionTitleWrapper = styled('div', { label: 'SectionTitle' })(
  ({ theme }) => ({
    backgroundColor: theme.tokens.alias.Interaction.Background.Secondary,
    color: theme.textColors.headlineStatic,
    padding: '2px 0',
    borderRadius: '8px 8px 0 0',
    fontWeight: 800,
    fontSize: 12,
    marginBottom: 10,
  })
);
interface DataItemProps {
  label: React.ReactNode;
  value: React.ReactNode;
  backgroundColor?: string;
}

interface SectionTitleProps {
  title: React.ReactNode;
}

export const DataItem: React.FC<DataItemProps> = ({
  label,
  value,
  backgroundColor = 'white',
}) => (
  <DataItemWrapper backgroundColor={backgroundColor}>
    <DataItemLabel>{label}</DataItemLabel>
    <DataItemValue>{value}</DataItemValue>
  </DataItemWrapper>
);

export const SectionTitle: React.FC<SectionTitleProps> = ({ title }) => (
  <SectionTitleWrapper>{title}</SectionTitleWrapper>
);
