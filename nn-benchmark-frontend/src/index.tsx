import "./index.scss";

import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { HashRouter } from "react-router-dom";
import { store } from "Store/store";

// import reportWebVitals from "Utils/reportWebVitals";
import App from "./Components/App/App";

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <HashRouter>
        <App />
      </HashRouter>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

//reportWebVitals(console.log);
