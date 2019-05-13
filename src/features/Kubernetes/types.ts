export interface PoolNode {
  type: string;
  count: number;
}

export interface ExtendedPoolNode extends PoolNode {
  totalMonthlyPrice: number;
}
