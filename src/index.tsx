import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { Provider } from "react-redux";
import { store } from "./shared/store/redux";

const reactRoot = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

reactRoot.render(
  <Provider store={store}>
    <App />
  </Provider>
);
