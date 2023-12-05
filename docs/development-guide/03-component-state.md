---
parent: Development Guide
---

# Managing State

## Component State

Most state management in the app is done by components. Some state is entirely internal to a component, other state is drilled down to child components. The mechanism for this kind of state management depends on the type of component.

### Function Components

Two options are available for component state in the newer function components:

#### useState

Most function components use the `useState` hook to manage component state. A few guidelines:

- Use a separate instance of `useState` for each piece of state.
- `useState` can infer the type based on the initial value, or can be explicitly typed.
  - **Inferred:** `const [count, setCount] = React.useState(0)`
  - **Explicit:** `const [data, setData] = React.useState<number | null>(null);`
- When referencing the current value during state updates, use the function updater pattern: `setMyState(currentVal => currentVal + 1)`.

#### useReducer

If a component's state is complex, you may consider using `useReducer`. This method requires much more boilerplate, so thoroughly consider the tradeoffs before going down this path. Some tips:

- Actions can be typed using the union operator: `type ReducerAction = { type: 'ADD', payload: number } | { type: 'SUBTRACT', payload: number };`
- Consider using the `immer` package to reduce boilerplate in the reducer.

### Class Components

Class components use the traditional React `this.state` and `this.setState` patterns.

- The state shape is given as a type parameter: `class MyComponent extends React.Component<Props, State>`.
- The default state is defined as a class variable: `state: State = { ... }`.
- When referencing the current state in an update, use the function updater pattern: `this.setState(prevState => ({ count: prevState.count + 1 }))`

## Global State

Two options are currently in use for managing state that many different components care about: Redux and Context.

### Redux

Historically Redux was use heavily for state management and data storage, including almost all data fetched from the API.

Currently, some API data is still stored in Redux, but data fetching in general is being migrated to React Query. Redux is **still used for some global state**.

- Redux code lives in `src/store`.
- Each slice of state has its own directory in `src/store` which includes actions and the reducer.
- Reducers are combined via `combineReducers` in `src/store/index`.
- Components consume Redux state by using the standard react-redux `connect` HOC, though it's common to write a custom, reusable container HOC in `src/containers` for each state slice in the store.

### Context

This is a new pattern that takes advantage of React's `useContext` hook. This pattern has not been used widely in the app, and as such best/common practices are not available.

The general idea is to create a file in `src/context` for a specific slice of context. The context `Provider` is included at a high-level (like `MainContent`) and consumers can use `useContext` to read and update the state.
