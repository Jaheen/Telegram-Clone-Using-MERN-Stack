import "popstate-direction"
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import store from 'store';
import App from 'App';
import { initializeApp } from "firebase/app"
import { FIREBASE_CONFIG } from 'config';

// Initialize Firebase
initializeApp(FIREBASE_CONFIG);

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <Provider store={store}>
    <App />
  </Provider>
);
