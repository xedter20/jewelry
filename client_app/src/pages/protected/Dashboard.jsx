import { useEffect, useState, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../features/common/headerSlice';
import Dashboard from '../../features/dashboard/index';
import { LineChart, AreaChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import { FaCheckCircle } from 'react-icons/fa'; // Add any icons you want to use
import axios from 'axios';
import { format, startOfToday } from 'date-fns';
import { formatAmount } from './../../features/dashboard/helpers/currencyFormat';

import DatePicker from "react-tailwindcss-datepicker";
import { DateTime } from 'luxon';

import Table, {
  AvatarCell,
  SelectColumnFilter,
  StatusPill,
  DateCell
} from '../../pages/protected/DataTables/Table'; // new


import * as XLSX from 'xlsx';

function InternalPage() {
  const dispatch = useDispatch();
  let loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
  // Set today's date as default for the DatePicker
  const today = startOfToday(); // Get today's date
  const [value, setValue] = useState({
    startDate: today,
    endDate: today
  });


  const [resultData, setResultData] = useState([]);

  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('');
  const handleFilterClick = () => {
    setDropdownVisible((prev) => !prev);
  };

  const handleFilterChange = (event) => {
    const selectedValue = event.target.value;
    setSelectedFilter(selectedValue);
    // Perform any filtering action here based on selectedValue
    console.log('Selected Filter:', selectedValue);
    // Optionally close the dropdown after selection
    // setDropdownVisible(false);
  };
  useEffect(() => {
    const fetchData = async () => {

      let { startDate, endDate } = value;

      // Convert dates to Philippine Time (PHT)
      const start = DateTime.fromJSDate(new Date(startDate))
        .setZone('Asia/Manila', { keepLocalTime: true }) // Set timezone
        .startOf('day') // Start of the day
        .toISO(); // Convert to ISO string

      const end = DateTime.fromJSDate(new Date(endDate))
        .setZone('Asia/Manila', { keepLocalTime: true }) // Set timezone
        .endOf('day') // End of the day
        .toISO(); // Convert to ISO string

      const response = await axios.post('/inventory/generateDashboardReport', {
        data: {
          startDate: start, // Convert to ISO string for backend
          endDate: end,
          itemName: selectedFilter // Convert to ISO string for backend
        },
      });


      const reportData = response.data.data.salesPerDateRange;

      setResultData(reportData)

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
  }, [value.startDate, value.endDate, selectedFilter]);



  useEffect(() => {
    dispatch(setPageTitle({ title: 'Dashboard' }));
  }, []);

  // const resultData = [
  //   { date_created: '2024-10-19T10:24:44.000Z', Total_Sales: '3500.00', Total_Grams: 1 },
  //   { date_created: '2024-10-19T10:27:22.000Z', Total_Sales: '10500.00', Total_Grams: 3 },
  //   { date_created: '2024-10-20T01:06:19.000Z', Total_Sales: '10500.00', Total_Grams: 3 },
  //   { date_created: '2024-10-20T01:07:03.000Z', Total_Sales: '7000.00', Total_Grams: 2 },
  //   { date_created: '2024-10-20T11:49:23.000Z', Total_Sales: '10800.00', Total_Grams: 3 },
  //   { date_created: '2024-10-21T01:06:19.000Z', Total_Sales: '10500.00', Total_Grams: 3 }
  // ];

  const formattedData = resultData.map(item => ({
    date_created: new Date(item.date_created).getTime(), // Convert to timestamp
    Total_Sales: parseFloat(item.Total_Price), // Convert to number
    Total_Profit: parseFloat(item.Total_Profit)
  }));



  const formattedDataItemsSold = resultData.map(item => ({
    date_created: new Date(item.date_created).getTime(), // Convert to timestamp
    Total_Sales: parseFloat(item.Total_Grams), // Convert to number
  }));


  // //console.log({ formattedData })

  const suppliers = [
    { id: 1, name: 'Supplier #1', completion: 55 },
    { id: 2, name: 'Supplier #2', completion: 100 },
    { id: 3, name: 'Supplier #3', completion: 100 },
  ];

  // return loggedInUser.role === 'super_admin' ? <Dashboard /> : <Dashboard />;

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

  //console.log({ layAwayList })

  let layAwayTotalValue = layAwayList.reduce((acc, current) => {
    return acc + parseInt(current.Price)

  }, 0)
  const totalRevenue = resultData.reduce((acc, item) => acc + parseFloat(item.Total_Price), 0);


  const totalGramsSold = resultData.reduce((acc, item) => acc + parseFloat(item.Total_Grams), 0);


  const totalProfit = resultData.reduce((acc, item) => acc + parseFloat(item.Total_Profit), 0);


  const columns = useMemo(
    () => [

      {
        Header: '#',
        accessor: '',
        Cell: ({ row }) => {
          return <span className="">{row.index + 1}</span>;
        }
      },
      {
        Header: 'Date',
        accessor: 'date_created',
        Cell: ({ row, value }) => {
          return <span className="">{format(value, 'MMM dd, yyyy')}</span>;
        }
      },
      {
        Header: 'Supplier Name',
        accessor: 'SupplierName',
        Cell: ({ row, value }) => {
          return <span className="">{value}</span>;
        }
      },
      {
        Header: 'Total Grams Sold',
        accessor: 'Total_Grams',
        Cell: ({ row, value }) => {
          return <span className="">{value}</span>;
        }
      },
      {
        Header: 'Total Sales',
        accessor: 'Total_Price',
        Cell: ({ row, value }) => {
          return <span className="">{formatAmount(value)}</span>;
        }
      },
      {
        Header: 'Total Profit',
        accessor: 'Total_Profit',
        Cell: ({ row, value }) => {
          return <span className="">{formatAmount(value)}</span>;
        }
      },
      {
        Header: 'Items',
        accessor: 'itemNames',

        filter: 'includes',
        // Filter: SelectColumnFilter,
        Cell: ({ row, value }) => {
          return <span className="">
            <ul className="">
              {value.map(({ item, count }, index) => (
                <li
                  key={index}
                  className="flex justify-between items-center bg-white p-3 rounded-lg shadow"
                >
                  <span className="font-semibold text-gray-800 text-sm">{item}</span>
                  <span className="text-gray-600 text-sm">Count: {count}</span>
                </li>
              ))}
            </ul>

          </span>;
        }
      }

    ],
    []
  );


  const exportToXLS = () => {
    try {
      // Process the resultData to format itemNames
      const processedData = resultData.map(row => {
        return {
          ...row,
          itemNames: JSON.stringify(row.itemNames)
        };
      });

      // Convert processed table data to a worksheet
      const worksheet = XLSX.utils.json_to_sheet(processedData);

      // Create a new workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

      // Export the workbook to an XLS file
      XLSX.writeFile(workbook, 'table_data.xlsx');
      //  alert('Export successful!'); // Feedback to user
    } catch (error) {
      console.error('Export failed:', error);
      //alert('Export failed. Please try again.'); // Error feedback
    }
  };

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
          value={value} // Use the state value
          onChange={newValue => setValue(newValue)} // Update the state on change
          className="border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholderText="Select a date"
        />
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-lg transition-transform transform hover:scale-105">
          <h2 className="font-bold text-gray-700">Total Sales</h2>
          <p className="text-3xl font-semibold text-orange-600 text-center">


            {formatAmount(totalRevenue)}
          </p>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date_created" domain={['dataMin', 'dataMax']}

                tickFormatter={(timestamp) => {
                  const date = new Date(timestamp);
                  return date.toLocaleDateString('en-US', {
                    month: 'long', day: 'numeric', year: 'numeric'
                  });
                }}
              />
              <YAxis />
              <Tooltip labelFormatter={(value) => new Date(value).toLocaleString()} />
              <Area type="monotone" dataKey="Total_Sales" stroke="#8884d8" fill="#8884d8" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg transition-transform transform hover:scale-105">
          <h2 className="font-bold text-gray-700">Total Profit</h2>
          <p className="text-3xl font-semibold text-orange-600 text-center">


            {formatAmount(totalProfit)}
          </p>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date_created" domain={['dataMin', 'dataMax']}

                tickFormatter={(timestamp) => {
                  const date = new Date(timestamp);
                  return date.toLocaleDateString('en-US', {
                    month: 'long', day: 'numeric', year: 'numeric'
                  });
                }}
              />
              <YAxis />
              <Tooltip labelFormatter={(value) => new Date(value).toLocaleString()} />
              <Area type="monotone" dataKey="Total_Profit" stroke="#8884d8" fill="#8884d8" />
            </AreaChart>
          </ResponsiveContainer>

        </div>

        {/* <div className="bg-white p-6 rounded-lg shadow-lg transition-transform transform hover:scale-105">
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
        </div> */}
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-lg">

          <div className='flex justify-between items-center'>

            <h2 className="font-bold text-gray-700">Sales Breakdown</h2>
            <button
              onClick={exportToXLS}
              className="btn btn-outline btn-sm ml-2 bg-green-500 hover:bg-green-600 text-white"
            >
              Export to XLS
            </button>
          </div>

          <Table
            style={{ overflow: 'wrap' }}
            className="table-sm"
            columns={columns}
            data={(resultData).map(data => {
              return {
                ...data
                // fullName,
                // address: fullAddress,
                // packageDisplayName: aP && aP.displayName,
                // date_created:
                //   data.date_created &&
                //   format(data.date_created, 'MMM dd, yyyy hh:mm:ss a')
              };
            })}
            searchField="lastName"
          />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-gray-700 text-center">Items Sold</h2>
            {dropdownVisible && (
              <div className=" bg-white rounded mt-2 p-4 text-center ml-4">
                <select className="border p-2 rounded" onChange={handleFilterChange}>
                  <option value="">Select Item</option>
                  {
                    [
                      { value: 'Pendant', label: 'Pendant' },
                      { value: 'Bangle', label: 'Bangle' },
                      { value: 'Earrings', label: 'Earrings' },
                      { value: 'Bracelet', label: 'Bracelet' },
                      { value: 'Necklace', label: 'Necklace' },
                      { value: 'Rings', label: 'Rings' }
                    ].map((item) => {
                      return <option value={item.value}>{item.label}</option>
                    })

                  }
                </select>
              </div>
            )}
            <div className="flex items-center">
              <i className="fa-solid fa-filter text-gray-500 cursor-pointer"
                onClick={handleFilterClick}
              ></i>


            </div>
          </div>
          <p className="text-3xl font-semibold text-orange-600 text-center">


            {totalGramsSold.toFixed(2)} Grams
          </p>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={formattedDataItemsSold}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date_created" domain={['dataMin', 'dataMax']}

                tickFormatter={(timestamp) => {
                  const date = new Date(timestamp);
                  return date.toLocaleDateString('en-US', {
                    month: 'long', day: 'numeric', year: 'numeric'
                  });
                }}
              />
              <YAxis />
              <Tooltip labelFormatter={(value) => new Date(value).toLocaleString()} />
              <Area type="monotone" dataKey="Total_Sales" stroke="#8884d8" fill="#8884d8" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Payment per Supplier */}
      {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
      </div> */}

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
            {layAwayList.map(item => {

              let remains = parseInt(item.Price) - parseInt(item.totalPaidAmount);
              let intergerAmount = remains > 0 ? remains : 0
              return <tr key={item.OrderID} className="border-b hover:bg-gray-50">
                <td className="p-2">{item.OrderID}</td>
                <td className="p-2">{item.CustomerName}</td>
                <td className="p-2">{item.OrderID}</td>
                <td className="p-2">{format(item.Due_Date, 'MMM dd, yyyy')}</td>
                <td className="p-2">{formatAmount(item.Price)}</td>
                <td className="p-2">{formatAmount(item.totalPaidAmount)}</td>
                <td className="p-2">{formatAmount(intergerAmount)}</td>
              </tr>
            })}
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
