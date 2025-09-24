import * as React from 'react';
import type { AccountBeta, Beta } from '@linode/api-v4';
interface Props {
    beta: AccountBeta | Beta;
    dataQA: string;
}
declare const BetaDetails: (props: Props) => React.JSX.Element;
export default BetaDetails;
