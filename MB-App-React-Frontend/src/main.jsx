// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom';

import './index.css';
import Root from './root';
import Forums from './Forums';
import Layout from './Layout';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,        // <-- global layout with nav bar
    children: [
      {
        index: true,            // matches "/"
        element: <Root />,
      },
      {
        path: 'Forums/:forumId', // matches "/Forums/123"
        element: <Forums />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
