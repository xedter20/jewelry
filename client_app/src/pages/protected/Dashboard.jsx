import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../features/common/headerSlice';
import Dashboard from '../../features/dashboard/index';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import { FaCheckCircle } from 'react-icons/fa'; // Add any icons you want to use
import axios from 'axios';
import { format, formatDistance, formatRelative, subDays } from 'date-fns';

import DatePicker from "react-tailwindcss-datepicker";
function InternalPage() {
  const dispatch = useDispatch();
  let loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
  const [value, setValue] = useState({
    startDate: null,
    endDate: null
  });

  let { startDate, endDate } = value
  useEffect(() => {
    const fetchData = async () => {
      // const response = await axios.get('layaway/generate/report', {
      //   params: {
      //     startDate: startDate.toISOString().split('T')[0],
      //     endDate: endDate.toISOString().split('T')[0],
      //   },
      // });
      // const reportData = response.data;

      // // Process data for chart
      // const labels = reportData.map(item => item.Date_Modified);
      // const totalPaid = reportData.map(item => parseFloat(item.TotalPaid) || 0);

      // setData({
      //   labels,
      //   datasets: [
      //     {
      //       label: 'Total Amount Paid',
      //       data: totalPaid,
      //       borderColor: 'rgba(75, 192, 192, 1)',
      //       backgroundColor: 'rgba(75, 192, 192, 0.2)',
      //       fill: true,
      //     },
      //   ],
      // });
    };

    fetchData();
  }, [value.startDate, value.endDate]);


  console.log({ loggedInUser });
  useEffect(() => {
    dispatch(setPageTitle({ title: 'Dashboard' }));
  }, []);
  const data = [
    { name: 'Jan', revenue: 30000, earnings: 50000 },
    { name: 'Feb', revenue: 25000, earnings: 40000 },
    { name: 'Mar', revenue: 20000, earnings: 30000 },
    // Add more data as needed
  ];

  const suppliers = [
    { id: 1, name: 'Supplier #1', completion: 55 },
    { id: 2, name: 'Supplier #2', completion: 100 },
    { id: 3, name: 'Supplier #3', completion: 100 },
  ];

  const LayawaySchedule = [
    { id: '1', name: 'Juliette Teodoro', orderId: '01163401', dueDate: '04/15/24', amount: 2500 },
    { id: '2', name: 'Rizalle Santos', orderId: '02163402', dueDate: '04/15/24', amount: 3600 },
    { id: '3', name: 'Deocles Dionisio', orderId: '01163403', dueDate: '04/15/24', amount: 2600 },
    // Add more data as needed
  ];
  // return loggedInUser.role === 'ADMIN' ? <Dashboard /> : <Dashboard />;

  const [isLoaded, setIsLoaded] = useState(false);
  const [layAwayList, setLayAwayList] = useState([]);
  const fetchOrders = async () => {
    let res = await axios({
      method: 'POST',
      url: 'layaway/list',
      data: {

      }
    });

    let list = res.data.data;


    setLayAwayList(list)
  };

  useEffect(() => {

    fetchOrders();
    setIsLoaded(true);

  }, []);

  console.log({ layAwayList })

  let layAwayTotalValue = layAwayList.reduce((acc, current) => {
    return acc + parseInt(current.Price)

  }, 0)

  return <div>
    <div className="p-6 bg-gray-50 space-y-6">
      {/* Sales Summary */}
      <div className="flex flex-col">
        <label className="mb-2 text-gray-700" htmlFor="datepicker">
          Select Date
        </label>
        <DatePicker
          showShortcuts={true}
          id="datepicker"
          // selected={startDate}
          onChange={newValue => setValue(newValue)}
          className="border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholderText="Select a date"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-lg transition-transform transform hover:scale-105">
          <h2 className="font-bold text-gray-700">Revenue</h2>
          <p className="text-3xl font-semibold text-blue-600">₱30,789.00</p>
          <ResponsiveContainer width="100%" height={100}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg transition-transform transform hover:scale-105">
          <h2 className="font-bold text-gray-700">Earnings</h2>
          <p className="text-3xl font-semibold text-green-600">₱50,789.20</p>
          <ResponsiveContainer width="100%" height={100}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Line type="monotone" dataKey="earnings" stroke="#22c55e" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg transition-transform transform hover:scale-105">
          <h2 className="font-bold text-gray-700">Sales</h2>
          <p className="text-3xl font-semibold text-orange-600">₱45,908</p>
          <ResponsiveContainer width="100%" height={100}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#fb923c" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Payment per Supplier */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {suppliers.map(supplier => (
          <div key={supplier.id} className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center transition-transform transform hover:scale-105">
            <h3 className="font-bold text-gray-700">{supplier.name}</h3>
            <div className="w-24 h-24 flex items-center justify-center rounded-full border-4 border-green-500 text-green-600 font-bold text-3xl">
              {supplier.completion}%
            </div>
            <p className="text-sm text-gray-500">Completion</p>
            <FaCheckCircle className="text-green-500 mt-2" />
          </div>
        ))}
      </div>

      {/* Lay-away Payment Schedule */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="font-bold text-gray-700">Lay-away Payment Schedule</h2>
        <table className="min-w-full mt-4 border border-gray-200">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="p-2 text-left text-gray-600">Layaway ID</th>
              <th className="p-2 text-left text-gray-600">Name</th>
              <th className="p-2 text-left text-gray-600">Order ID</th>
              <th className="p-2 text-left text-gray-600">Due Date</th>
              <th className="p-2 text-left text-gray-600">Total Amount</th>
              <th className="p-2 text-left text-gray-600">Paid Amount</th>
              <th className="p-2 text-left text-gray-600">Remaining Amount</th>
            </tr>
          </thead>
          <tbody>
            {layAwayList.map(item => (
              <tr key={item.OrderID} className="border-b hover:bg-gray-50">
                <td className="p-2">{item.OrderID}</td>
                <td className="p-2">{item.CustomerName}</td>
                <td className="p-2">{item.OrderID}</td>
                <td className="p-2">{format(item.Due_Date, 'MMM dd, yyyy')}</td>
                <td className="p-2">₱{item.Price}</td>
                <td className="p-2">₱{item.totalPaidAmount}</td>
                <td className="p-2">₱{parseInt(item.Price) - parseInt(item.totalPaidAmount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Lay-away Management Overview */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="font-bold text-gray-700">Lay-away Management Overview</h2>
        <p className="mt-2 text-gray-600">Total Lay-Away Items: <span className="font-semibold">{layAwayList.length}</span></p>
        {/* <p className="mt-2 text-gray-600">Subtasks: Brand-New (<span className="font-semibold">5</span> items)</p> */}
        <p className="mt-2 text-gray-600">Total Value: <span className="font-semibold">₱{layAwayTotalValue}</span></p>
        <p className="mt-2 text-gray-600">Active Lay-away: <span className="font-semibold">{layAwayList.length}</span></p>
      </div>
    </div>
  </div>;
}

export default InternalPage;
