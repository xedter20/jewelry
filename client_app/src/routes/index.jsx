// All components mapping with path for internal routes

import { lazy } from 'react';
import { jwtDecode } from 'jwt-decode';
import checkAuth from '../app/auth';

const Dashboard = lazy(() => import('../pages/protected/Dashboard'));

const Welcome = lazy(() => import('../pages/protected/Welcome'));
const Page404 = lazy(() => import('../pages/protected/404'));
const Blank = lazy(() => import('../pages/protected/Blank'));

const Users = lazy(() => import('../pages/protected/Transactions'));
const Employees = lazy(() => import('../pages/protected/Employees'));
const Suppliers = lazy(() => import('../pages/protected/Suppliers'));
const Transactions = lazy(() => import('../pages/protected/Transactions_Sales'));


const Reports = lazy(() => import('../pages/protected/Reports'));

const Statistics = lazy(() => import('../pages/protected/Statistics'));

const ProfileSettings = lazy(() =>
  import('../pages/protected/ProfileSettings')
);

const GettingStarted = lazy(() => import('../pages/GettingStarted'));
const DocFeatures = lazy(() => import('../pages/DocFeatures'));
const DocComponents = lazy(() => import('../pages/DocComponents'));
const AddMember = lazy(() => import('../pages/protected/Leads'));

const token = checkAuth();

const decoded = jwtDecode(token);

let routes = [];

console.log({ decoded })

if (decoded && decoded.role === 'ADMIN') {
  routes = [
    {
      path: '/dashboard', // the url
      component: Dashboard // view rendered
    },
    {
      path: '/dashboard', // the url
      component: Dashboard // view rendered
    },

    {
      path: '/stats', // the url
      component: Statistics // view rendered
    },

    {
      path: '/settings-profile',
      component: ProfileSettings
    },
    {
      path: '/settings-profile/:slug',
      component: ProfileSettings
    },

    {
      path: '/404',
      component: Page404
    },
    {
      path: '/blank',
      component: Blank
    },
    {
      path: '/users',
      component: Users
    },
    {
      path: '/addMember',
      component: AddMember
    },
    {
      path: '/reports', // the url
      component: Reports // view rendered
    },
    {
      path: '/employees',
      component: Employees
    },
    {
      path: '/suppliers',
      component: Suppliers
    },
    {
      path: '/transactions',
      component: Transactions
    },
  ];
} else {
  routes = [
    {
      path: '/dashboard', // the url
      component: Dashboard // view rendered
    },
    {
      path: '/dashboard', // the url
      component: Dashboard // view rendered
    },

    {
      path: '/stats', // the url
      component: Statistics // view rendered
    },

    {
      path: '/settings-profile',
      component: ProfileSettings
    },
    {
      path: '/settings-profile/:slug',
      component: ProfileSettings
    },

    {
      path: '/404',
      component: Page404
    },
    {
      path: '/blank',
      component: Blank
    },
    {
      path: '/users',
      component: Transactions
    },
    {
      path: '/addMember',
      component: AddMember
    },
    {
      path: '/reports', // the url
      component: Reports // view rendered
    },
    {
      path: '/employees',
      component: Employees
    },
    {
      path: '/suppliers',
      component: Suppliers
    },
    {
      path: '/myProfile',
      component: Suppliers
    },
  ];
}

export default routes;
