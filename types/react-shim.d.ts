
import 'react';

declare module 'react' {
  // useActionState is available in React 19 but might be missing from types
  function useActionState<State, Payload>(
    action: (state: State, payload: Payload) => State | Promise<State>,
    initialState: State,
    permalink?: string
  ): [State, (payload: Payload) => void, boolean];
}
