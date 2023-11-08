import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import ErrorPage from './Error';
import GroupView from './pages/GroupView';
import UserNameForm from './pages/UserNameForm';
import CreateGroup from './pages/CreateGroup';
import GroupChat from './pages/GroupChat';
import SignUp from './pages/SignUp';
import 'react-chat-elements/dist/main.css'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import {groupLoader} from './pages/GroupView';
import {groupChatLoader} from './pages/GroupChat';
import ViewMembership from './pages/ViewMembership.js';
import {membershipLoader} from './pages/ViewMembership.js';
import 'bootstrap/dist/css/bootstrap.min.css';


const router = createBrowserRouter([
  {
    path: "/",
    element: <SignUp />,
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
    path:"/view-membership/:groupId",
    element: <ViewMembership />,
    loader: membershipLoader
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
  <link
    rel="stylesheet"
    href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"
    integrity="sha384-9ndCyUaIbzAi2FUVXJi0CjmCapSmO7SnpJef0486qhLnuZ2cdeRhO02iuK6FUUVM"
    crossOrigin="anonymous"
  />
    <RouterProvider router={router} />
  </React.StrictMode>
);

