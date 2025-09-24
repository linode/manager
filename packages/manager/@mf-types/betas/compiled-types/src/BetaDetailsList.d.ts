import * as React from 'react';
import type { APIError } from '@linode/api-v4';
import type { AccountBeta } from '@linode/api-v4/lib/account';
import type { Beta } from '@linode/api-v4/lib/betas';
interface Props {
    betas: (AccountBeta | Beta)[];
    dataQA: string;
    errors: APIError[] | null;
    isLoading: boolean;
    title: string;
}
export declare const BetaDetailsList: (props: Props) => React.JSX.Element;
export {};
