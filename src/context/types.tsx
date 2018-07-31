import * as React from 'react';
import { createHOCForConsumer, Requestable } from 'src/requestableContext';

export interface WithTypesProps extends Requestable<Linode.LinodeType[]> {
}

const initialState: WithTypesProps = {
  lastUpdated: 0,
  loading: false,
  request: () => Promise.resolve(),
  update: () => null,
};

const typesContext = React.createContext<WithTypesProps>({ ...initialState });

export const withTypes = createHOCForConsumer<Linode.LinodeType[]>(typesContext.Consumer, 'WithTypes');

export const TypesProvider = typesContext.Provider;

export const TypesConsumer = typesContext.Consumer;
