/** Icons are imported separatly to reduce build time */
import { jwtDecode } from 'jwt-decode';
import checkAuth from '../app/auth';
import Squares2X2Icon from '@heroicons/react/24/outline/Squares2X2Icon';
import QrCodeIcon from '@heroicons/react/24/outline/QrCodeIcon';
import UsersIcon from '@heroicons/react/24/outline/UsersIcon';
import PresentationChartLineIcon from '@heroicons/react/24/outline/PresentationChartLineIcon';
import BanknotesIcon from '@heroicons/react/24/outline/BanknotesIcon';
const iconClasses = `h-6 w-6`;
const submenuIconClasses = `h-5 w-5`;

const token = checkAuth();
const decoded = jwtDecode(token);

import DocumentChartBarIcon from '@heroicons/react/24/outline/DocumentChartBarIcon';

let routes = [];

if (decoded && decoded.role === 'ADMIN') {
  routes = [
    {
      path: '/app/dashboard',
      icon: <Squares2X2Icon className={iconClasses} />,
      name: 'Dashboard'
    },
    {
      path: '/app/inventory', // url
      icon: <UsersIcon className={iconClasses} />, // icon component
      name: 'Inventory' // name that appear in Sidebar
    },
    {
      path: '/app/users', // url
      icon: <UsersIcon className={iconClasses} />, // icon component
      name: 'Customer Record' // name that appear in Sidebar
    },
    {
      path: '/app/transactions', // url
      icon: <UsersIcon className={iconClasses} />, // icon component
      name: 'Transactions' // name that appear in Sidebar
    },
    {
      path: '/app/layaway', // url
      icon: <UsersIcon className={iconClasses} />, // icon component
      name: 'Lay-away' // name that appear in Sidebar
    },
    {
      path: '/app/suppliers', // url
      icon: <UsersIcon className={iconClasses} />, // icon component
      name: 'Suppliers' // name that appear in Sidebar
    },
    {
      path: '/app/employees', // url
      icon: <UsersIcon className={iconClasses} />, // icon component
      name: 'Employees' // name that appear in Sidebar
    },
    {
      path: '/app/settings', // url
      icon: <UsersIcon className={iconClasses} />, // icon component
      name: 'Settings' // name that appear in Sidebar
    },

    // {
    //   path: '/app/inventory', // url
    //   icon: <DocumentChartBarIcon className={iconClasses} />, // icon component
    //   name: 'Inventory' // name that appear in Sidebar
    // },
    // {
    //   path: '/app/users', // url
    //   icon: <UsersIcon className={iconClasses} />, // icon component
    //   name: 'Customers' // name that appear in Sidebar
    // },
    // {
    //   path: '/app/transactions', // url
    //   icon: <DocumentChartBarIcon className={iconClasses} />, // icon component
    //   name: 'Transactions' // name that appear in Sidebar
    // },
    // {
    //   path: '/app/layaway', // url
    //   icon: <UsersIcon className={iconClasses} />, // icon component
    //   name: 'Lay Away' // name that appear in Sidebar
    // },
    // {
    //   path: '/app/suppliers', // url
    //   icon: <UsersIcon className={iconClasses} />, // icon component
    //   name: 'Suppliers' // name that appear in Sidebar
    // },
    // {
    //   path: '/app/employees', // url
    //   icon: <UsersIcon className={iconClasses} />, // icon component
    //   name: 'Employees' // name that appear in Sidebar
    // },
    // {
    //   path: '/app/settings', // url
    //   icon: <UsersIcon className={iconClasses} />, // icon component
    //   name: 'Setttings' // name that appear in Sidebar
    // }
    // {
    //   path: '/app/users', // url
    //   icon: <UsersIcon className={iconClasses} />, // icon component
    //   name: 'Logout' // name that appear in Sidebar
    // }
  ];
} else {
  routes = [
    // {
    //   path: '/app/dashboard',
    //   icon: <Squares2X2Icon className={iconClasses} />,
    //   name: 'Dashboard'
    // },

    // {
    //   path: '/app/stats',
    //   icon: <Squares2X2Icon className={iconClasses} />,
    //   name: 'Statistics'
    // },
    {
      path: '/app/users', // url
      icon: <UsersIcon className={iconClasses} />, // icon component
      name: 'Customer Record' // name that appear in Sidebar
    },
    {
      path: '/app/employees', // url
      icon: <UsersIcon className={iconClasses} />, // icon component
      name: 'Employees' // name that appear in Sidebar
    },
    // {
    //   path: '/app/reports', // url
    //   icon: <DocumentChartBarIcon className={iconClasses} />, // icon component
    //   name: 'Reports' // name that appear in Sidebar
    // }
  ];
}

export default routes;
