import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import ErrorPage from './Error';
import GroupView from './GroupView';
import UserNameForm from './UserNameForm';
import CreateGroup from './CreateGroup';
import GroupChat from './GroupChat';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import {groupLoader} from './GroupView';
import {groupChatLoader} from './GroupChat';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />
  },
  {
    path:"/view-group",
    element : <GroupView />,
    loader: groupLoader,
  },
  {
    path:"/message/:groupId",
    element: <GroupChat />,
    loader: groupChatLoader
  },
  {
    path:"/user",
    element : <UserNameForm />
  },
  {
    path:"/create-group",
    element : <CreateGroup />
  },
]);


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
    />
    <RouterProvider router={router} />
  </React.StrictMode>
);

