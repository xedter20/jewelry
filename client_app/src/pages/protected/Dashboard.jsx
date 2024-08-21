import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../features/common/headerSlice';
import Dashboard from '../../features/dashboard/index';

function InternalPage() {
  const dispatch = useDispatch();
  let loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

  console.log({ loggedInUser });
  useEffect(() => {
    dispatch(setPageTitle({ title: 'Dashboard' }));
  }, []);

  // return loggedInUser.role === 'ADMIN' ? <Dashboard /> : <Dashboard />;

  return <div></div>;
}

export default InternalPage;
