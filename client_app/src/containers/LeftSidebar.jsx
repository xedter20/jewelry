import React, { useEffect, useState } from 'react';
import routes from '../routes/sidebar';
import { NavLink, Routes, Link, useLocation } from 'react-router-dom';
import SidebarSubmenu from './SidebarSubmenu';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';
import { useDispatch } from 'react-redux';
import axios from 'axios';

function LeftSidebar() {
  const location = useLocation();

  const dispatch = useDispatch();

  let loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
  const [selectedUser, setSelectedUser] = useState({});

  const [isLoaded, setIsLoaded] = useState(false);

  const getUser = async () => {
    let res = await axios({
      method: 'GET',
      url: `user/${loggedInUser.userId}/details`
    });
    let user = res.data.data;

    console.log({ user });

    setSelectedUser(user[0]);
    setIsLoaded(true);
  };

  useEffect(() => {
    getUser();
    //console.log({ selectedUser: selectedUser });
  }, []);

  const close = e => {
    document.getElementById('left-sidebar-drawer').click();
  };

  return isLoaded && (

    <div className="drawer-side text-white bg-customBlue h-screen w-60">
      <label htmlFor="left-sidebar-drawer" className="drawer-overlay"></label>
      <div className="flex items-center justify-center mb-8 mt-4">
        <img src="/A.V. Logo.png" alt="Logo" className="w-30 h-24" />
      </div>
      <hr class="border-t-2 border-white mx-auto w-1/2 my-2"></hr>
      <div className="flex items-center justify-center mb-3 mt-6">
        <img
          src="/Admin Picture.png"
          alt="Logo"
          className="w-24 h-24 rounded-full"
        />
      </div>

      <ul className="menu  bg-customBlue text-white">
        {/* p-10 min-h-full w-100 */}
        <button
          className="btn btn-ghost bg-base-300  btn-circle z-50 top-0 right-0 mt-4 mr-2 absolute lg:hidden"
          onClick={() => close()}>
          <XMarkIcon className="h-5 inline-block w-5" />
        </button>
        {/* <li className="flex items-center justify-between  mb-7">
          <Link to={'/app/dashboard'}>
            <img
              className="mask mask-squircle w-30 h-20"
              src="/system_logo.jpg"
              alt="Logo"
            />
          </Link>
        </li> */}
        <li className="flex items-center justify-between mb-3 text-white ">
          {selectedUser && (
            <label className=" text-white">
              Hello,{' '}


              <span className="font-bold">
                {selectedUser.Admin_Fname} {selectedUser.Admin_Lname}
              </span>
              !
            </label>
          )}
          <label className="bg-customBrown text-white rounded-lg text-xs p-1">
            <span className="border-lg text-xs">{selectedUser.role}</span>
          </label>
        </li>
        {routes.map((route, k) => {
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
        })}
      </ul>
    </div>
  );
}

export default LeftSidebar;
