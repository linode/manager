import { CSSProperties } from 'react';

export interface LabelProps {
  linkTo?: string;
  noCap?: boolean;
  prefixComponent?: JSX.Element | null;
  prefixStyle?: CSSProperties;
  suffixComponent?: JSX.Element | null;
}

export interface EditableProps {
  editableTextTitle: string;
  errorText?: string;
  onCancel: () => void;
  onEdit: (value: string) => Promise<any>;
}
