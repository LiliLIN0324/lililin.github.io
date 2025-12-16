// import React from 'react';
// import ReactDOM from 'react-dom/client';
// import App from '../App';
// import './index.css';

// const rootElement = document.getElementById('root');
// if (!rootElement) {
//   throw new Error("Could not find root element to mount to");
// }

// const root = ReactDOM.createRoot(rootElement);
// root.render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>
// );
import React from "react";
import { createRoot } from "react-dom/client";
import App from "../../../../App";

const container = document.getElementById("root");

if (!container) {
  throw new Error("Root container missing in index.html");
}

const root = createRoot(container);
root.render(<App />);

export default App;