import { CSSProperties } from 'react';

export interface LabelProps {
  linkTo?: string;
  prefixComponent?: JSX.Element | null;
  prefixStyle?: CSSProperties;
  suffixComponent?: JSX.Element | null;
  subtitle?: string;
  noCap?: boolean;
}

export interface EditableProps {
  onCancel: () => void;
  onEdit: (value: string) => Promise<any>;
  errorText?: string;
  editableTextTitle: string;
}
