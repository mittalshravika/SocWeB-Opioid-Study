import React from "react";
import ReactDOM from "react-dom/client";
import App from "./pages/App/App";
import reportWebVitals from "./reportWebVitals";
import "bootstrap/dist/css/bootstrap.css";
import { ConfigProvider } from "antd";
const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <ConfigProvider
    theme={{
      components: {
        Menu: {
          itemActiveBg: "#FFF",
          itemSelectedBg: "#FFF",
          itemSelectedColor: "#000",
          subMenuItemBg: "#FFF",
        },
      },
    }}
  >
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </ConfigProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
