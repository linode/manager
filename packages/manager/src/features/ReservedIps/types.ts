export interface Action {
  disabled?: boolean;
  hidden?: boolean;
  id?: string;
  onClick: () => void;
  pendoId?: string;
  title: string;
  tooltip?: string;
}
