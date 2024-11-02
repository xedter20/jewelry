import axios from 'axios';
import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import checkAuth from '../app/auth';
import {
  Squares2X2Icon,
  UsersIcon,
  PresentationChartLineIcon,
  BanknotesIcon,
  DocumentChartBarIcon,
  CogIcon,
  IdentificationIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';

const iconClasses = 'h-6 w-6';
import { NavLink, Routes, Link, useLocation } from 'react-router-dom';
import SidebarSubmenu from '../containers/SidebarSubmenu';
const AppRoutes = () => {
  const [accountSettings, setAccountSettings] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [isLoaded, setIsLoaded] = useState([]);

  const fetchAccountSettings = async () => {
    try {
      let res = await axios({
        method: 'GET',
        url: `settings/accounts/get`
      });
      const token = checkAuth();
      const decoded = jwtDecode(token);
      let role = decoded.role;
      let result = res.data.data.filter((item) => item[role]).map(item => item.name);


      // result = res.data.data.map(item => item.name)

      console.log({ result })
      setAccountSettings(result);
      setIsLoaded(true)

      // Map the available routes based on account settings


      const newRoutes = [];






      newRoutes.push({
        path: '/app/dashboard',
        icon: <Squares2X2Icon className={iconClasses} />,
        name: 'Dashboard',
      });

      newRoutes.push({
        path: '/app/employees',
        icon: <IdentificationIcon className={iconClasses} />,
        name: 'Employees',
      });

      if (result.includes('Inventory')) {
        newRoutes.push({
          path: '/app/inventory',
          icon: <DocumentChartBarIcon className={iconClasses} />,
          name: 'Inventory',
        });
      }
      if (result.includes("Customer's Record")) {
        newRoutes.push({
          path: '/app/users',
          icon: <UsersIcon className={iconClasses} />,
          name: 'Customer Record',
        });
      }
      if (result.includes('Transaction History')) {
        newRoutes.push({
          path: '/app/transactions',
          icon: <PresentationChartLineIcon className={iconClasses} />,
          name: 'Transactions',
        });
      }
      if (result.includes('Layaway')) {
        newRoutes.push({
          path: '/app/layaway',
          icon: <BanknotesIcon className={iconClasses} />,
          name: 'Lay-away',
        });
      }
      if (result.includes('Supplier Details')) {
        newRoutes.push({
          path: '/app/suppliers',
          icon: <UsersIcon className={iconClasses} />,
          name: 'Suppliers',
        });
      }


      newRoutes.push({
        path: '/app/faq',
        icon: <QuestionMarkCircleIcon className={iconClasses} />,
        name: 'FAQ',
      });

      if (result.includes('Settings')) {
        newRoutes.push({
          path: '/app/settings',
          icon: <CogIcon className={iconClasses} />,
          name: 'Settings',
        });

      }


      setRoutes(newRoutes);
    } catch (error) {
      console.error('Error fetching account settings:', error);
    }
  };

  useEffect(() => {
    fetchAccountSettings();
  }, []);




  return isLoaded && <div>
    {
      routes.map((route, k) => {


        return (
          <li className="p-2 text-center" key={k}>
            {route.submenu ? (
              <SidebarSubmenu {...route} />
            ) : (
              <NavLink
                end
                to={route.path}
                className={({ isActive }) =>
                  `${isActive ? 'font-bold bg-customGray text-grey-900' : ''}`
                }>
                {route.icon} {route.name}
                {location.pathname === route.path ? (
                  <span
                    className="absolute inset-y-0 left-0 w-2 rounded-tr-md rounded-br-md"
                    aria-hidden="true"></span>
                ) : null}
              </NavLink>
            )}
          </li>
        );
      })
    }

  </div>




};

export default AppRoutes;
