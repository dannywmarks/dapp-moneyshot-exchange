import rootReducer from "./reducers";
import { createLogger } from "redux-logger";
import { createStore, applyMiddleware, compose } from "redux";

const loggerMiddleware = createLogger();
const middleware = [];

// redux dev tools
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export default function configureStore(preloadedState) {
  return createStore(
    rootReducer,
    preloadedState,
    composeEnhancers(applyMiddleware(...middleware, loggerMiddleware))
  );
}
