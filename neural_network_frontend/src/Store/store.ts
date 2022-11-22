import { applyMiddleware, createStore } from "redux";
// use this for debugging
import { composeWithDevTools } from "redux-devtools-extension";
import thunkMiddleware from "redux-thunk";
import { rootReducer } from "Store/rootReducer";

// use this export for debugging
export const store = createStore(
  rootReducer,
  composeWithDevTools(applyMiddleware(thunkMiddleware))
);

// use this export for production use
// export const store = createStore(rootReducer, applyMiddleware(thunkMiddleware));
