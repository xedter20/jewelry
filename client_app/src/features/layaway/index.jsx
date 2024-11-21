import moment from 'moment';
import { useEffect, useState, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { showNotification } from '../common/headerSlice';
import TitleCard from '../../components/Cards/TitleCard';
// import { RECENT_TRANSACTIONS } from '../../utils/dummyData';
import FunnelIcon from '@heroicons/react/24/outline/FunnelIcon';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';
import SearchBar from '../../components/Input/SearchBar';
import { NavLink, Routes, Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ViewColumnsIcon from '@heroicons/react/24/outline/EyeIcon';
import PlusCircleIcon from '@heroicons/react/24/outline/PlusCircleIcon';
import TrashIcon from '@heroicons/react/24/outline/TrashIcon';
import { format, formatDistance, formatRelative, subDays } from 'date-fns';

import { QRCodeSVG } from 'qrcode.react';
import { formatAmount } from '../dashboard/helpers/currencyFormat';
import {
  setAppSettings,
  getFeatureList
} from '../settings/appSettings/appSettingsSlice';

import easyinvoice from 'easyinvoice';

import Table, {
  AvatarCell,
  SelectColumnFilter,
  StatusPill,
  DateCell
} from '../../pages/protected/DataTables/Table'; // new

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


import InputText from '../../components/Input/InputText';

import Dropdown from '../../components/Input/Dropdown';
import { Formik, useField, useFormik, Form } from 'formik';
import * as Yup from 'yup';
import RadioText from '../../components/Input/Radio';
const TopSideButtons = ({ removeFilter, applyFilter, applySearch, users }) => {
  const [filterParam, setFilterParam] = useState('');
  const [searchText, setSearchText] = useState('');

  const locationFilters = [''];

  const showFiltersAndApply = params => {
    applyFilter(params);
    setFilterParam(params);
  };

  const removeAppliedFilter = () => {
    removeFilter();
    setFilterParam('');
    setSearchText('');
  };

  useEffect(() => {
    if (searchText === '') {
      removeAppliedFilter();
    } else {
      applySearch(searchText);
    }
  }, [searchText]);
  let loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
  return (
    <div className="inline-block float-right">
      {/* <SearchBar
        searchText={searchText}
        styleClass="mr-4"
        setSearchText={setSearchText}
      />
      {filterParam != '' && (
        <button
          onClick={() => removeAppliedFilter()}
          className="btn btn-xs mr-2 btn-active btn-ghost normal-case">
          {filterParam}
          <XMarkIcon className="w-4 ml-2" />
        </button>
      )} */}
      <div className="badge badge-neutral mr-2 px-2 p-4">Total: {users.length}</div>

      <button className="btn btn-outline btn-sm" onClick={() => document.getElementById('addOrder').showModal()}>
        Add Order
        <PlusCircleIcon className="h-6 w-6 text-white-500" />
      </button>

      {/* 
      <button
        className="btn ml-2 font-bold bg-yellow-500 text-white"
        onClick={() => document.getElementById('my_modal_1').showModal()}>
        Import from file
        <PlusCircleIcon className="h-6 w-6 text-white-500" />
      </button> */}

      {/* <div className="dropdown dropdown-bottom dropdown-end">
        <label tabIndex={0} className="btn btn-sm btn-outline">
          <FunnelIcon className="w-5 mr-2" />
          Filter
        </label>
        <ul
          tabIndex={0}
          className="z-40 dropdown-content menu p-2 text-sm shadow bg-base-100 rounded-box w-52">
          {locationFilters.map((l, k) => {
            return (
              <li key={k}>
                <a onClick={() => showFiltersAndApply(l)}>{l}</a>
              </li>
            );
          })}
          <div className="divider mt-0 mb-0"></div>
          <li>
            <a onClick={() => removeAppliedFilter()}>Remove Filter</a>
          </li>
        </ul>
      </div> */}
    </div>
  );
};

function Transactions() {

  const allItemOptions = [
    { value: 'Pendant', label: 'Pendant' },
    { value: 'Bangle', label: 'Bangle' },
    { value: 'Earrings', label: 'Earrings' },
    { value: 'Bracelet', label: 'Bracelet' },
    { value: 'Necklace', label: 'Necklace' },
    { value: 'Rings', label: 'Rings' }
  ];

  const [preview, setPreview] = useState('');
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);


  const [filePhotoOfItems, setfilePhotoOfItems] = useState(null);

  const [previewPhotoOfItems, setpreviewPhotoOfItems] = useState('');
  const [users, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [paymentHistoryList, setActivePaymentHistory] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeChildID, setactiveChildID] = useState('');

  const [isAddPaymentOpen, setisAddPaymentOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [suppliers, setSupplierList] = useState([]);


  const [payments, setPayments] = useState([]);
  const [totalPaid, setTotalPaid] = useState(0);
  const [remainingBalance, setRemainingBalance] = useState(8000); // Adjust based on your data


  const [inventoryList, setInventoryList] = useState([]);
  const [selectedSupplierID, setSelectedSupplier] = useState({});


  const [pricingSettings, setPricingSettings] = useState({}); // Changed variable name here
  const [pricingSettingsSelected, setPricingSettingsSelected] = useState(); //
  const fetchPricingSettings = async () => {
    try {
      const res = await axios.get(`settings/pricing/1`); // Using shorthand for axios.get
      const settings = res.data.data; // Changed variable name here
      setPricingSettings(settings); // Changed function call here
    } catch (err) {
      console.error('Error fetching pricing settings:', err); // Log the error
      setError('Failed to fetch pricing settings'); // Changed error message here
    } finally {
      setIsLoaded(true); // Ensure isLoaded is set to true regardless of success or error
    }
  };


  useEffect(() => {
    fetchPricingSettings(); // Changed function call here
  }, []);

  const fetchInventoryOrders = async () => {
    let res = await axios({
      method: 'POST',
      url: 'inventory/list',
      data: {
        // SupplierID: selectedSupplierID
      }
    });

    let list = res.data.data;




    setInventoryList(list.map((s) => {
      return {
        label: `${s.OrderID}`,
        value: s.OrderID,
        SupplierID: s.SupplierID,
        Total_Grams_Sold: s.Total_Grams_Sold,
        maxGramsOffer: s.Grams - s.Total_Grams_Sold

      }
    }));
  };


  // Sample function to fetch payment data (replace with your API call)
  const fetchPayments = async () => {
    // Example data: replace with your API call


    let res = await axios({
      method: 'POST',
      url: 'layaway/payment/list',
      data: {
        LayawayID: selectedOrder.LayawayID
      }
    });

    let list = res.data.data;


    setPayments(list);

    // calculateTotalPaid(samplePayments);
  };

  // Calculate total paid
  const calculateTotalPaid = (payments) => {
    const total = payments.reduce((acc, payment) => acc + payment.amount, 0);
    setTotalPaid(total);
  };

  useEffect(() => {
    setIsLoaded(false);
    fetchPayments();
    setIsLoaded(true);
  }, [selectedOrder]);


  const fetchOrders = async () => {
    let res = await axios({
      method: 'POST',
      url: 'layaway/list',
      data: {

      }
    });

    let list = res.data.data;




    setOrders(list)
  };

  const fetchCustomers = async () => {
    let res = await axios({
      method: 'POST',
      url: 'user/getCustomerList',
      data: {

      }
    });

    let list = res.data.data;


    setCustomers(list.map((s) => {
      return {
        label: `${s.CustomerName} - ${s.Contact}`,
        value: s.CustomerID,
        Facebook: s.Facebook
      }
    }));
  };

  const fetchSuppliers = async () => {
    let res = await axios({
      method: 'POST',
      url: 'supplier/list',
      data: {

      }
    });

    let list = res.data.data;


    setSupplierList(list.map((s) => {
      return {
        label: s.SupplierName,
        value: s.SupplierID,

      }
    }));
  };

  const fetchAll = () => {

    fetchSuppliers();
    fetchCustomers();
    fetchOrders();
    fetchInventoryOrders()
    fetchPayments();
  }

  useEffect(() => {
    fetchInventoryOrders()
  }, [selectedSupplierID]);

  useEffect(() => {
    dispatch(getFeatureList()).then(result => {
      fetchAll();
      setIsLoaded(true);
    });
  }, []);

  const appSettings = useSelector(state => state.appSettings);
  let { codeTypeList, packageList } = appSettings;

  const removeFilter = async () => {
    // let res = await axios({
    //   method: 'POST',
    //   url: 'user/getChildrenList',
    //   data: {
    //     sponsorIdNumber: ''
    //   }
    // });
    // let list = res.data.data;

    // console.log({ list });
    // setUser(list);
  };

  const applyFilter = params => {
    let filteredUsers = users.filter(t => {
      return t.address === params;
    });
    setUser(filteredUsers);
  };

  // Search according to name
  const applySearch = value => {
    let filteredUsers = users.filter(t => {
      return (
        t.email.toLowerCase().includes(value.toLowerCase()) ||
        t.firstName.toLowerCase().includes(value.toLowerCase()) ||
        t.lastName.toLowerCase().includes(value.toLowerCase())
      );
    });
    setUser(filteredUsers);
  };

  function classNames(...classes) {
    return classes.filter(Boolean).join(' ');
  }

  // console.log(users);
  let loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
  const columns = useMemo(
    () => [

      {
        Header: 'QR Code',
        accessor: 'qr',
        Cell: ({ row }) => {
          let l = row.original;



          return (
            (
              <div className="flex">






                <button className="btn btn-outline btn-sm mr-2" onClick={async () => {


                  setSelectedOrder(l);

                  document.getElementById('viewQRCode').showModal();


                }}>



                  <i class="fa-solid fa-barcode"></i> QR
                </button>

              </div>
            )
          );
        }
      },

      {
        Header: 'Date Created',
        accessor: 'Date_Created',
        Cell: ({ row, value }) => {
          return <span className="">{value && format(value, 'MMM dd, yyyy hh:mm:ss a')}</span>;
        }
      },
      {
        Header: 'Layaway ID',
        accessor: 'LayawayID',
        Cell: ({ row, value }) => {
          return <span className="">{value}</span>;
        }
      },
      {
        Header: 'Customer ID',
        accessor: 'CustomerID',
        Cell: ({ row, value }) => {
          return <span className="">{value}</span>;
        }
      },
      {
        Header: 'Customer Name',
        accessor: 'CustomerName',
        Cell: ({ row, value }) => {
          return <span className="">{value}</span>;
        }
      },
      {
        Header: 'Grams',
        accessor: 'Grams',
        Cell: ({ row, value }) => {
          return <span className="">{value.toFixed(2)}</span>;
        }
      },
      {
        Header: 'Category',
        accessor: 'Category',
        Cell: ({ row, value }) => {
          return <span className="">{value}</span>;
        }
      },
      {
        Header: 'Price',
        accessor: 'Price',
        Cell: ({ row, value }) => {
          return <span className="">{value}</span>;
        }
      },
      {
        Header: 'Months to Pay',
        accessor: 'MonthsToPay',
        Cell: ({ row, value }) => {
          return <span className="">{value} Month(s)</span>;
        }
      },
      {
        Header: 'Start Date',
        accessor: 'Start_Date',
        Cell: ({ row, value }) => {
          let date = format(value, 'MMM dd, yyyy');
          return <span className="">{date}</span>;
        }
      },
      {
        Header: 'Due Date',
        accessor: 'Due_Date',
        Cell: ({ row, value }) => {
          let date = format(value, 'MMM dd, yyyy');
          return <span className="">{date}</span>;
        }
      },
      {
        Header: 'Status',
        accessor: 'status',
        Cell: ({ row, value }) => {

          let dueDate = row.original.Due_Date;


          const targetDate = new Date(dueDate);
          const now = new Date(); // Gets the current date and time

          // Check if the current date matches the target date
          const isMatchingDate = now.toISOString() === targetDate.toISOString();
          // const isPastDueDate = now > dueDate;

          return <StatusPill value={value} />
        }
      },
      {
        Header: 'Action',
        accessor: '',
        Cell: ({ row }) => {
          let l = row.original;



          return (
            (
              <div className="flex">



                <button className="btn btn-outline btn-sm mr-2" onClick={async () => {


                  // console.log("Dex")
                  // setisEditModalOpen(true)
                  // console.log({ l })
                  setSelectedOrder(l);

                  document.getElementById('viewProofPaymentImage').showModal();



                }}>



                  <i class="fa-regular fa-eye"></i>
                </button>

                <button
                  className="btn btn-outline btn-sm ml-2"
                  onClick={() => {


                    setactiveChildID(l.LayawayID);
                    document.getElementById('deleteModal').showModal();
                  }}>
                  <i class="fa-solid fa-archive"></i>
                </button>


              </div>
            )
          );
        }
      },
    ],
    []
  );



  const handleOnChange = e => {

    setFile(e.target.files[0]);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const data = new FormData();
      data.append('file', file);
      let res = await axios({
        // headers: {
        //   'content-type': 'multipart/form-data'
        // },
        method: 'POST',
        url: 'user/uploadFile',
        data
      });

      setIsSubmitting(false);
      fetchSuppliers();
      toast.success(`Uploaded Successfully`, {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'light'
      });
    } catch (error) {
      toast.error(`Something went wrong`, {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'light'
      });
    } finally {
      document.getElementById('my_modal_1').close();
    }
  };


  const formikConfig = (selectedSupplier) => {




    let validation = {
      MonthsToPay: Yup.number().required('Required'),
      Start_Date: Yup.date().required('Required'),
      CustomerID: Yup.string().required('Required'),
      Facebook: Yup.string().required('Required'),
      // ItemName: Yup.string().required('Required'),
      // Category: Yup.string().required('Required'),
      // SupplierID: Yup.string().required('Required'),
      Grams: Yup.number().required('Required').min(1, 'Must be greater than or equal to 1'),
      // Price: Yup.number()
      //   .required('Price is required')
      //   .min(0, 'Must be greater than or equal to 0')
      //   .max(1000000, 'Price cannot exceed 1 million')
      //   .typeError('Price must be a number'),
      PriceWithInterest: Yup.number()
        .required('Price is required')
        .min(0, 'Must be greater than or equal to 0')
        .max(1000000, 'Price cannot exceed 1 million')
        .typeError('Price must be a number'),
      quantity: Yup.number().required('Quantity is required').positive('Must be a positive number').integer('Must be an integer'),
      // itemNames: Yup.array().of(
      //   Yup.number()
      //     // .required('Item count is required')
      //     .test(
      //       'max-toTal-quantity',
      //       'The item count must not exceed the total quantity available',
      //       function (value) {

      //         let total = this.parent.reduce((acc, current) => {
      //           let sum = current;
      //           if (!current) {
      //             sum = 0;
      //           }
      //           return acc + sum
      //         }, 0)




      //         const quantity = this.from[0].value.quantity; // Access sibling value return value <= quantity; 


      //         if (total > quantity) {
      //           return false
      //         }
      //         return true
      //       }
      //     )
      //     .test(
      //       'max-to-quantity',
      //       'The item count must not exceed or less than the quantity',
      //       function (value) {

      //         let total = this.parent.reduce((acc, current) => {
      //           let sum = current;
      //           if (!current) {
      //             sum = 0;
      //           }
      //           return acc + sum
      //         }, 0)




      //         const quantity = this.from[0].value.quantity; // Access sibling value return value <= quantity; 

      //         if (total === 0) {
      //           return false
      //         }
      //         else if (total < quantity) {

      //           return false

      //         }
      //         else if (value > quantity) {
      //           return false
      //         }
      //         return true
      //       }
      //     )

      // ),
      Downpayment: Yup.number()
        .required('Required')
        .moreThan(0, 'Downpayment must be greater than 0') // Downpayment must be greater than 0
        .lessThan(Yup.ref('PriceWithInterest'), 'Downpayment must be less than Price'), // Downpayment must be less than Price
      Payment_Method: Yup.string().required('Required'),
      Karat_Value: Yup.array().min(1, 'Please select at least one Karat value').required('Required'),
    };

    let initialValues = {
      Karat_Value: [],
      items: [
        {
          SupplierID: '',
          orderID: '',
          Category: '',
          quantity: 0,
          Grams: 0,
          Price: 0,
          itemCodes: [],
        }
      ],
      PriceWithInterest: '',
      quantity: 1,
      itemNames: [

      ],
      MonthsToPay: '',
      Start_Date: '',
      Due_Date: '',
      CustomerID: '',
      Facebook: '',
      Category: '',
      SupplierID: '',
      Grams: '',
      Price: '',
      // ItemName: '',
      Downpayment: '',
      Payment_Method: ''
    }


    // if (isAddPaymentOpen) {
    //   validation = {
    //     OrderID: Yup.string().required('Required'),
    //     Date: Yup.string().required('Required'),
    //     Amount: Yup.string().required('Required'),
    //     Payment_Status: Yup.string().required('Required'),

    //     Payment_Method: Yup.string().required('Required')
    //   }
    //   initialValues = {
    //     OrderID: '',
    //     Amount: '',
    //     Payment_Status: '',
    //     Date: '',
    //     Payment_Method: '',
    //     Proof_Payment: '',
    //     SupplierID: selectedSupplier.SupplierID,
    //     SupplierName: selectedSupplier.SupplierName
    //   };
    // }

    return {
      initialValues: initialValues,
      validationSchema: Yup.object(validation),
      validateOnMount: true,
      validateOnChange: false,
      onSubmit: async (values, { setFieldError, setSubmitting, resetForm }) => {
        setSubmitting(true);

        console.log("here")
        // console.log({ isEditModalOpen })

        if (!file) {
          setFieldError('Proof_Payment', 'Required');
        }



        try {



          let items = values.items;
          console.log(items)
          const itemNames = items.reduce((acc, item) => {
            // Loop through each itemCode in itemCodes
            item.itemCodes.forEach(code => {
              // Check if the item already exists in the accumulator
              const existingItem = acc.find(i => i.item === code);
              if (existingItem) {
                // If item exists, increase the count
                existingItem.count += 1;
              } else {
                // If item does not exist, add it with a count of 1
                acc.push({
                  item: code,  // The item name
                  count: 1      // Set count as 1 for each new item
                });
              }
            });

            return acc; // Return the accumulated array
          }, []);

          values.ItemName = items;
          values.itemNames = itemNames;


          let finalData = { ...values, Due_Date: endDate, Price: values.PriceWithInterest };




          let res = await axios({
            method: 'POST',
            url: 'layaway/create',
            data: finalData
          })



          let result = res.data.data;

          // console.log({ result })
          const updateData = new FormData();

          updateData.append('layAwayID', result.LayawayID);
          updateData.append('Proof_Payment', file);
          updateData.append('Payment_Method', values.Payment_Method);
          await axios({

            method: 'POST',
            url: 'layaway/addInitialPaymentProof',
            data: updateData
          });




          const updateData1 = new FormData();
          updateData1.append('layAwayID', result.LayawayID);
          updateData1.append('Thumbnail', file);
          await axios({

            method: 'POST',
            url: 'layaway/addPhotoOfItems',
            data: updateData
          });




          setFile(null);
          setPreview(null);
          // document.getElementById('fileInput').value = '';
          // fileInputRef.current.value = '';
          fetchOrders()
          document.getElementById('addOrder').close();
          toast.success('Added Successfully!', {
            onClose: () => {
              setSubmitting(false);
              // navigate('/app/transactions');
            }
          })

          // await fetchAll();

          // // await fetchSuppliers();
          // toast.success('Added Successfully!', {
          //   onClose: () => {
          //     setSubmitting(false);
          //     navigate('/app/transactions');
          //   },
          //   position: 'top-right',
          //   autoClose: 500,
          //   hideProgressBar: false,
          //   closeOnClick: true,
          //   pauseOnHover: true,
          //   draggable: true,
          //   progress: undefined,
          //   theme: 'light'
          // });


          resetForm()

        } catch (error) {
          console.log({ error });
        } finally {

        }
      }
    };
  };


  const totalAmountPaid = selectedOrder ? payments.filter(s => ['PAYMENT_FOR_APPROVAL', 'PARTIALLY_PAID', 'PAID'].includes(s.status)).reduce((acc, current) => {
    return acc + parseInt(current.amount)
  }, 0) : 0;
  console.log({ totalAmountPaid })

  let amountPaid = parseFloat(parseFloat(totalAmountPaid).toFixed(2));

  let originalPrice = parseFloat(parseFloat(selectedOrder?.Price).toFixed(2));


  console.log(amountPaid === originalPrice)
  let mainStatus = selectedOrder?.status;
  if (amountPaid === originalPrice) {
    mainStatus = 'PAID'

  } else {
    mainStatus = 'IN_PROGRESS'
  }
  const formikConfigAddPayment = () => {

    let remainingBalance = parseInt(selectedOrder?.Price) - totalAmountPaid;


    let validation = {
      amount: Yup.number()
        .required('Required')
        .moreThan(0, 'Amount must be greater than 0') // Downpayment must be greater than 0
        .max(remainingBalance, `Amount must be less than remaining balance of ₱${remainingBalance.toFixed(2)}`), // Downpayment must be less than Price
      payment_method: Yup.string().required('Required')
    };

    let initialValues = {

      proof_of_payment: '',
      amount: '',
      payment_method: ''
    }





    return {
      initialValues: initialValues,
      validationSchema: Yup.object(validation),
      // validateOnMount: true,
      // validateOnChange: false,
      onSubmit: async (values, { setFieldError, setSubmitting }) => {
        setSubmitting(true);



        try {


          console.log({ dex: 1 })


          const data = new FormData();



          data.append('Proof_Payment', file);
          data.append('payment_method', values.payment_method);
          data.append('amount', values.amount);
          data.append('customer_id', selectedOrder.CustomerID);
          data.append('layAwayID', selectedOrder.LayawayID);


          let updatedStatus = remainingBalance - values.amount === 0 ? 'PAID' : 'PARTIALLY_PAID';



          data.append('status', updatedStatus);

          let result = await axios({
            // headers: {
            //   'content-type': 'multipart/form-data'
            // },
            method: 'POST',
            url: 'layaway/makePayment',
            data
          });

          fetchPayments()
          document.getElementById('addPayment').close();
          await fetchAll();
          // document.getElementById('addOrder').close();
          // // await fetchSuppliers();
          document.getElementById('viewReceipt').close();
          toast.success('Payment added successfully!', {
            // onClose: () => {
            //   setSubmitting(false);
            //   navigate('/app/transactions');
            // },
            position: 'top-right',
            autoClose: 500,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: 'light'
          });

          fetchAll();


        } catch (error) {
          console.log({ error });
        } finally {
          resetForm()
        }
      }
    };
  };



  const [plan, setPlan] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Calculate end date based on plan selection and start date
  useEffect(() => {
    if (plan && startDate) {
      const monthsToAdd = parseInt(plan);
      const start = new Date(startDate);
      const calculatedEndDate = new Date(start.setMonth(start.getMonth() + monthsToAdd));
      console.log({ calculatedEndDate })
      calculatedEndDate && setEndDate(calculatedEndDate.toISOString().split('T')[0]);
    } else {
      setEndDate('');
    }
  }, [plan, startDate]);


  const qrCodeRef = useRef();
  const downloadQRCode = () => {
    // Create a canvas element to convert SVG to image  
    const canvas = document.createElement('canvas');
    const size = 200; // size of the QR code  
    canvas.width = size;
    canvas.height = size;

    // Get the SVG data  
    const svg = qrCodeRef.current.querySelector('svg'); // Adjust to get the SVG element  
    const svgData = new XMLSerializer().serializeToString(svg);

    // Convert SVG to data URL  
    const img = new Image();
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      // Draw the image on the canvas  
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, size, size);
      URL.revokeObjectURL(url); // Clean up the URL object  

      // Trigger the download of the image  
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png'); // Convert to png  
      link.download = 'qrcode.png'; // Set the file name  
      link.click(); // Simulate a click to trigger download  
    };

    // Set the src of the image to the URL created from SVG blob  
    img.src = url;
  };


  return (
    isLoaded && (
      <TitleCard
        title="List"
        topMargin="mt-2"
        TopSideButtons={
          <TopSideButtons
            applySearch={applySearch}
            applyFilter={applyFilter}
            removeFilter={removeFilter}
            users={orders}
          />
        }>
        <div className="">
          <Table
            style={{ overflow: 'wrap' }}
            className="table-sm"
            columns={columns}
            data={(orders || []).map(data => {
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



        <ToastContainer />

        <dialog id="deleteModal" className="modal">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Archive Confirmation</h3>
            <p className="py-4">Do you want to archive this record? </p>
            <hr />
            <div className="modal-action mt-12">
              <button
                className="btn btn-outline   "
                type="button"
                onClick={() => {
                  document.getElementById('deleteModal').close();
                }}>
                Cancel
              </button>

              <button
                className="btn bg-buttonPrimary text-white"
                onClick={async () => {
                  try {
                    let res = await axios({
                      method: 'put',
                      url: `/archive/layaway/${activeChildID}/LayawayID`,
                      data: {
                        activeChildID: activeChildID
                      }
                    });

                    document.getElementById('deleteModal').close();
                    fetchAll()
                    toast.success(`Archived Successfully`, {
                      onClose: () => {
                        // window.location.reload();
                      },
                      position: 'top-right',
                      autoClose: 1000,
                      hideProgressBar: false,
                      closeOnClick: true,
                      pauseOnHover: true,
                      draggable: true,
                      progress: undefined,
                      theme: 'light'
                    });
                  } catch (error) { }
                }}>
                Yes
              </button>
            </div>
          </div>
        </dialog>


        <dialog id="addOrder" className="modal">
          <div className="modal-box w-11/12 max-w-2xl">
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
            </form>
            <h1 className="font-bold text-lg">Fill Out Form</h1>

            <p className="text-sm text-gray-500 mt-1 font-bold">Lay-Away Order Details</p>

            <div class="bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4 mt-4" role="alert">
              <p class="font-bold">Note</p>
              <p>Information will be recorded and cannot be changed</p>
            </div>
            <div className="p-2 space-y-4 md:space-y-6 sm:p-4">
              <Formik {...formikConfig()}>
                {({
                  handleSubmit,
                  handleChange,
                  handleBlur, // handler for onBlur event of form elements
                  values,
                  touched,
                  errors,
                  submitForm,
                  setFieldTouched,
                  setFieldValue,
                  setFieldError,
                  setErrors,
                  isSubmitting,

                }) => {

                  console.log({ errors })
                  useEffect(() => {
                    if (values.items) {
                      const sumPrices = values.items.reduce((total, item) => total + parseFloat(item.Price), 0);
                      const sumGrams = values.items.reduce((total, item) => total + parseFloat(item.Grams), 0);


                      setFieldValue('PriceWithInterest', sumPrices.toFixed(2)); // Update items dynamically based on Karat_Value length
                      setFieldValue('Grams', sumGrams.toFixed(2));

                    }
                  }, [values.items, setFieldValue]); // Re-run whenever Karat_Value changes


                  useEffect(() => {
                    if (values.Karat_Value) {
                      const numberOfItems = values.Karat_Value.length; // Assuming Karat_Value length determines the number of items
                      const newItems = Array.from({ length: numberOfItems }).map(() => ({
                        orderID: '',
                        Category: '',
                        quantity: 0,
                        Grams: 0,
                        Price: 0,
                      }));
                      setFieldValue('items', newItems); // Update items dynamically based on Karat_Value length
                    }
                  }, [values.Karat_Value.length, setFieldValue]); // Re-run whenever Karat_Value changes
                  // console.log({ values })
                  let selectString = {
                    'SUBASTA': 'Amount_Per_Gram_Subasta',
                    'BRAND NEW': 'Amount_Per_Gram_Brand_New'
                  }

                  let selectStringinterest = {
                    'SUBASTA': 'Interest_Subasta',
                    'BRAND NEW': 'Interest_Brand_New'
                  }


                  const calculatePriceInterest = (grams, monthsToPay = 1, categoryCalue) => {
                    let categoryDropdownValue = categoryCalue || values.Category;


                    const interestPerGramInDb = parseFloat(pricingSettings[`${selectStringinterest[categoryDropdownValue]}_Layaway`]);





                    let interestTimeMonthsToPay = interestPerGramInDb * monthsToPay * grams;






                    let basicPrice = parseFloat(grams * pricingSettingsSelected)




                    return interestTimeMonthsToPay

                    //setFieldValue('PriceWithInterest', basicPrice + interestTimeMonthsToPay)

                    // console.log({ interestPrice, price: price })
                    // setFieldValue('PriceWithInterest', 2); //
                  }


                  return (
                    <Form className="">
                      {/* <label
                        className={`block mb-2 text-green-400 text-left font-bold`}>
                        Child
                      </label> */}



                      <div className="grid grid-cols-1 gap-3 md:grid-cols-1 ">


                        <div className='mt-2'>
                          <Dropdown
                            isRequired
                            // icons={mdiAccount}
                            label="Lay-away Plan"
                            name="MonthsToPay"
                            placeholder=""
                            value={1}
                            setFieldValue={setFieldValue}
                            onBlur={handleBlur}
                            options={[
                              {
                                label: "1 Month",
                                value: 1
                              },
                              {
                                label: "2 Months",
                                value: 2
                              },
                              {
                                label: "3 Months",
                                value: 3
                              }
                            ]}
                            functionToCalled={async (value) => {

                              // setPlan();
                              // let user = users.find(u => {
                              //   return u.value === value
                              // })
                              setPlan(value)
                              setFieldValue('MonthsToPay', value);
                              let interestAmount = await calculatePriceInterest(values.Grams, value)





                            }}
                          />
                        </div>

                      </div>
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 ">


                        <InputText
                          isRequired
                          label="Start Date"
                          name="Start_Date"
                          type="date"
                          placeholder=""
                          value={values.Start_Date}

                          onChange={(e) => {
                            setFieldValue('Start_Date', e.target.value);
                            setFieldValue('Due_Date', endDate);
                            setStartDate(e.target.value)

                          }}
                          onBlur={handleBlur} // This apparently updates `touched`?
                        />


                        <InputText
                          isRequired
                          label="Due Date"
                          name="Due_Date"
                          type="date"
                          placeholder=""
                          value={endDate}
                          disabled
                          onBlur={handleBlur} // This apparently updates `touched`?
                        />



                      </div>
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 ">



                        <Dropdown
                          isRequired
                          // icons={mdiAccount}
                          label="Customer"
                          name="CustomerID"
                          placeholder=""
                          value={values.CustomerID}
                          setFieldValue={setFieldValue}
                          onBlur={handleBlur}
                          options={users}
                          functionToCalled={(value) => {

                            let user = users.find(u => {
                              return u.value === value
                            })

                            setFieldValue('Facebook', user.Facebook)
                          }}
                        />
                        <InputText
                          isRequired
                          className="border-2 py-3 border-none focus:border-purple-500 rounded-lg p-2 w-full"
                          label="Facebook Link"
                          name="Facebook"
                          type="text"
                          placeholder=""
                          value={values.Facebook}
                          disabled
                          onBlur={handleBlur} // This apparently updates `touched`?
                        />

                      </div>
                      <div className="grid grid-cols-1 gap-2 md:grid-cols-1 ">
                        <RadioText
                          isRequired
                          // icons={mdiAccount}
                          label="Karat Value"
                          name="Karat_Value"
                          placeholder=""
                          value={values.Karat_Value}
                          setFieldValue={setFieldValue}
                          onBlur={handleBlur}
                          options={[
                            { value: '21K', label: '21K' },
                            { value: '18K', label: '18K' },
                            { value: '18K Diamond', label: '18K Diamond' },
                            { value: '14K', label: '14K' },
                            { value: '14K Diamond', label: '14K Diamond' },

                          ]}
                        />
                      </div>
                      {values.Karat_Value.length > 0 && (
                        <>
                          {values.items.map((_, index) => (
                            <div key={index} className="border p-4 mb-4 rounded-lg">
                              <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                                {/* <InputText

                                  label="supp id"
                                  name={`items[${index}].SupplierID`}
                                  type="hiddent"
                                  value={values.items[index].SupplierID}
                                  onBlur={handleBlur}
                                  onChange={handleChange}
                                /> */}
                                <Dropdown
                                  isRequired
                                  label="Inventory Order ID"
                                  name={`items[${index}].orderID`}
                                  value={values.items[index].orderID}
                                  setFieldValue={setFieldValue}
                                  onBlur={handleBlur}
                                  options={inventoryList}
                                  functionToCalled={(value) => {
                                    let suppID = inventoryList.find(i => i.value === value).SupplierID

                                    setFieldValue(`items[${index}].SupplierID`, suppID);
                                  }}
                                />
                                <Dropdown
                                  isRequired
                                  label="Category"
                                  name={`items[${index}].Category`}
                                  value={values.items[index].Category}
                                  setFieldValue={setFieldValue}
                                  onBlur={handleBlur}
                                  options={[
                                    { value: 'BRAND NEW', label: 'BRAND NEW' },
                                    { value: 'SUBASTA', label: 'SUBASTA' },
                                  ]}
                                  functionToCalled={(value) => {

                                    let selectString = {
                                      'SUBASTA': 'Amount_Per_Gram_Subasta',
                                      'BRAND NEW': 'Amount_Per_Gram_Brand_New'
                                    }

                                    let multiplyBry = pricingSettings[selectString[value]];


                                    setPricingSettingsSelected(multiplyBry)

                                    setFieldValue(`items[${index}].Price`, (values[`items[${index}].Grams}`] * pricingSettingsSelected).toFixed(2)); // Update price based on grams

                                    // setSelectedSupplier(value);



                                    // if (inventoryList.length === 0) {
                                    //   setFieldValue('orderID', '')
                                    // }
                                    // //console.log(inventoryList.filter(i => i.SupplierID === `${value}`))

                                    // setInventoryList(inventoryList.filter(i => i.SupplierID === `${value}`))
                                  }}

                                />
                              </div>

                              <div className="grid grid-cols-1 gap-2 md:grid-cols-1">
                                <InputText
                                  isRequired
                                  label="Item Quantity"
                                  name={`items[${index}].quantity`}
                                  type="number"
                                  value={values.items[index].quantity}
                                  onBlur={handleBlur}
                                  onChange={handleChange}
                                />
                              </div>

                              {values.items[index].quantity > 0 && (
                                <>
                                  <label className="mt-2 font-bold text-neutral-600 block mb-2">
                                    Item Codes *
                                  </label>
                                  <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                                    {Array.from({ length: values.items[index].quantity }).map((_, nestedIndex) => (
                                      <div key={nestedIndex}>
                                        <InputText
                                          isRequired
                                          name={`items[${index}].itemCodes[${nestedIndex}]`}
                                          type="text"

                                          onBlur={handleBlur}
                                          onChange={(e) => {
                                            const orderID = values.items[index].orderID || '';
                                            const inputValue = e.target.value;

                                            // console.log(e.target.value)
                                            // setFieldValue(`items[${index}].itemCodes[${nestedIndex}]`, e.target.value);
                                            handleChange({
                                              target: {
                                                name: `items[${index}].itemCodes[${nestedIndex}]`,
                                                value: inputValue
                                              },
                                            });
                                          }}
                                        />
                                      </div>
                                    ))}
                                  </div>
                                </>
                              )}

                              <div className="grid grid-cols-1 gap-2 md:grid-cols-2 mt-2">
                                <InputText
                                  isRequired
                                  label={`Grams per Items * ₱${pricingSettingsSelected || 0}`}
                                  name={`items[${index}].Grams`}
                                  type="number"
                                  value={values.items[index].Grams}
                                  onChange={(e) => {

                                    let findTotal_Grams_Sold = inventoryList.find(i => i.value === values.items[index].orderID);




                                    //console.log({ findTotal_Grams_Sold })


                                    let maxOrder = findTotal_Grams_Sold.maxGramsOffer;



                                    if (maxOrder < 1) {
                                      setFieldError(
                                        `items[${index}].Grams`, `Stock is already 0`
                                      );
                                    }


                                    const grams = e.target.value;

                                    //console.log({ grams })

                                    // Regex to allow only numbers and up to 2 decimal places
                                    const gramsRegex = /^\d*\.?\d{0,2}$/;

                                    if (gramsRegex.test(grams) || grams === "") {
                                      setFieldValue(`items[${index}].Grams`, grams); // Update grams directly as a string
                                      let gramsNumber = parseFloat(grams);

                                      //console.log({ gramsNumber })

                                      if (!isNaN(gramsNumber) && gramsNumber >= 0) {

                                        let interestAmount = calculatePriceInterest(grams, values.MonthsToPay, values.items[index].Category)




                                        setFieldValue(`items[${index}].InterestAmount`, (interestAmount).toFixed(2)); // Update price based on grams



                                        setFieldValue(`items[${index}].OriginalPrice`, (gramsNumber * parseFloat(pricingSettingsSelected)).toFixed(2));



                                        let tentativeAmount = (gramsNumber * parseFloat(pricingSettingsSelected)) + interestAmount;



                                        console.log({ tentativeAmount })
                                        setFieldValue(`items[${index}].Price`, tentativeAmount.toFixed(2)); // Update price based on grams


                                        console.log({
                                          dex: values.items[index].OriginalPrice, ter: values.items[index].InterestAmount
                                        }
                                        )
                                        // console.log({sumPrices, sumGrams})
                                        // setFieldValue('Price', sumPrices.toFixed(2))
                                        // setFieldValue('Grams', sumGrams.toFixed(2))
                                      } else {
                                        setFieldValue(`items[${index}].Price`, '0.00'); // Reset price if grams is invalid
                                      }
                                    }
                                  }}
                                  onBlur={handleBlur}
                                />
                                <InputText
                                  isRequired
                                  disabled
                                  label={`Price ${values.items[index].OriginalPrice || ''} + ${values.items[index].InterestAmount || ''} (Interest)`}
                                  name={`items[${index}].Price`}
                                  type="number"
                                  value={values.items[index].Price}
                                  onBlur={handleBlur}
                                />
                              </div>
                            </div>
                          ))}
                        </>
                      )}



                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">


                        <InputText
                          isRequired
                          className="py-3 border-2 border-none focus:border-purple-500 rounded-lg p-2 w-full"
                          label={`Total Price`}
                          name="PriceWithInterest"
                          type="number"
                          placeholder=""
                          disabled
                          value={values.PriceWithInterest}
                          onBlur={handleBlur} // This apparently updates `touched`?
                        />
                        <InputText
                          className="py-3 border-2 border-none focus:border-purple-500 rounded-lg p-2 w-full"
                          disabled
                          label={'Total Grams'}
                          name="Grams"
                          type="number"
                          placeholder=""
                          value={values.Grams}


                        />
                      </div>

                      <InputText
                        isRequired
                        label="Initial Downpayment"
                        name="Downpayment"
                        type="number"
                        placeholder=""
                        value={values.Downpayment}
                        onBlur={handleBlur} // This apparently updates `touched`?
                      />


                      <InputText
                        label="Upload Photo of Items"
                        name="Thumbnail"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          setfilePhotoOfItems(file);
                          if (file) {
                            setpreviewPhotoOfItems(URL.createObjectURL(file));
                          }
                        }}
                        onBlur={handleBlur}
                      />

                      <div className="flex justify-center">
                        <img id="blah" alt="" className="h-40 w-28 sm:h-60 sm:w-40 object-contain" src={previewPhotoOfItems} />
                      </div>

                      <div className="grid grid-cols-1 gap-2 md:grid-cols-1 ">
                        <RadioText
                          isRequired
                          type='radio'
                          // icons={mdiAccount}
                          label="Payment Method *"
                          name="Payment_Method"
                          placeholder=""
                          value={values.Payment_Method}
                          setFieldValue={setFieldValue}
                          onBlur={handleBlur}
                          options={[
                            { value: 'CASH', label: 'Cash' },
                            // { value: 'Cash', label: 'Cash' },
                            { value: 'BDO', label: 'BDO' },
                            { value: 'BPI', label: 'BPI' }
                          ]}
                        />


                      </div>
                      <InputText
                        label="Proof of Payment"
                        name="Proof_Payment"
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={(e) => {
                          const file = e.target.files[0];
                          setFile(file);
                          if (file) {
                            setPreview(URL.createObjectURL(file));
                          }
                        }}
                        onBlur={handleBlur}
                      />
                      <div className="flex justify-center">
                        <img id="blah" alt="" className="h-40 w-28 sm:h-60 sm:w-40 object-contain" src={preview} />
                      </div>

                      * All fields are required.
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className={
                          'btn mt-4 shadow-lg w-full bg-buttonPrimary font-bold text-white flex justify-center items-center'

                        }>
                        {isSubmitting ? (
                          <div><span className="spinner-border animate-spin inline-block w-4 h-4 border-2 rounded-full"></span> Processing </div>
                        ) : (
                          'Submit'
                        )}
                      </button>

                    </Form>
                  );
                }}
              </Formik> </div>
          </div>
        </dialog>







        <Formik {...formikConfigAddPayment()}>
          {({
            handleSubmit,
            handleChange,
            handleBlur, // handler for onBlur event of form elements
            values,
            touched,
            errors,
            submitForm,
            setFieldTouched,
            setFieldValue,
            setFieldError,
            setErrors,
            isSubmitting,

          }) => {
            return <dialog id="addPayment" className="modal">
              <div className="modal-box">
                <h3 className="font-bold text-lg">Add Payment</h3>
                {/* <p className="py-4">Pick a file</p> */}
                {/* 
                {isSubmitting && (
                  <div
                    class="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mt-2"
                    role="alert">
                    <p class="font-bold">Please wait</p>
                    <p>Uploading ...</p>
                  </div>
                )} */}
                <div className="grid grid-cols-1 gap-3 md:grid-cols-1 ">
                  <InputText

                    label="Customer Name"
                    name="CustomerName"
                    type="text"
                    placeholder=""
                    value={selectedOrder.CustomerName}

                    onBlur={handleBlur} // This apparently updates `touched`?
                    disabled


                  /></div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 mt-2">
                  <Dropdown

                    // icons={mdiAccount}
                    label="Payment Method"
                    name="payment_method"
                    placeholder=""
                    value={"Cash"}
                    setFieldValue={setFieldValue}
                    onBlur={handleBlur}
                    options={[
                      {
                        label: "Cash",
                        value: "Cash"
                      },
                      {
                        label: "BDO",
                        value: "BDO"
                      },
                      {
                        label: "BPI",
                        value: "BPI"
                      }
                    ]}
                    functionToCalled={(value) => {

                      // setPlan();
                      // let user = users.find(u => {
                      //   return u.value === value
                      // })
                      setPlan(value)
                      setFieldValue('MonthsToPay', value)
                    }}

                  />
                  <InputText

                    label="Amount"
                    name="amount"
                    type="number"
                    placeholder=""


                    onBlur={handleBlur} // This apparently updates `touched`?


                  />

                </div>
                <label className="form-control w-full">
                  <div className="label font-bold">
                    Proof of Payment
                    {/* <span className="label-text">Pick a file</span> */}
                  </div>
                  <input
                    name="proof_of_payment"
                    type="file"
                    className="file-input file-input-bordered w-full max-w-xs w-full"
                    onChange={handleOnChange}
                  />
                </label>

                <div className="modal-action">
                  {/* if there is a button in form, it will close the modal */}
                  <button
                    className="btn mr-2 bg-green-500"
                    disabled={isSubmitting || !file}
                    type='submit'
                    onClick={e => {
                      e.preventDefault();
                      if (!isSubmitting && file) {
                        handleSubmit(e);
                      }
                    }}
                  >
                    Submit
                  </button>
                  <button className="btn" onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('addPayment').close();
                  }}>
                    Close
                  </button>
                </div>
              </div>
            </dialog>
          }}
        </Formik>

        <dialog id="viewProofPaymentImage" className="modal">
          <div className="modal-box w-11/12 max-w-5xl">

            <div className="container mx-auto p-4">
              <h1 className="text-2xl font-bold mb-4">Payment Summary</h1>
              <div className="p-4">
                <div className="flex justify-between font-bold">
                  <span>Status:</span>
                  <span className='font-2xl'><StatusPill value={selectedOrder.status} /></span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Customer Name:</span>
                  <span>{selectedOrder.CustomerName}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Customer ID</span>
                  <span>{selectedOrder.CustomerID}</span>
                </div>
              </div>
              <div className="bg-white shadow-md rounded-lg  overflow-auto">
                <table className="min-w-full ">
                  <thead className="bg-gray-200 ">
                    <tr>
                      <th className="py-2 px-4 text-left">Layaway ID</th>
                      <th className="py-2 px-4 text-left">Amount Paid</th>
                      <th className="py-2 px-4 text-left">Payment Method</th>
                      <th className="py-2 px-4 text-left">Payment Date</th>
                      <th className="py-2 px-4 text-left">Proof of Payment</th>
                      <th className="py-2 px-4 text-left">Status</th>
                      <th className="py-2 px-4 text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody>

                    {
                      console.log({ payments, selectedOrder })
                    }
                    {payments.filter(p => p.layAwayID === selectedOrder.LayawayID).map(payment => {

                      let forApproval = payment.status === 'PAYMENT_FOR_APPROVAL'
                      return <tr key={payment.layAwayID} className="border-b">
                        <td className="py-2 px-4">{payment.layAwayID}</td>
                        <td className="py-2 px-4">{formatAmount(payment.amount)}</td>
                        <td className="py-2 px-4">{payment.payment_method}</td>
                        <td className="py-2 px-4">{format(payment.payment_date, 'MMM dd, yyyy')}</td>
                        <td className="py-2 px-4">

                          <button className="btn btn-outline btn-sm mr-2" onClick={async () => {

                            window.open(payment.proof_of_payment, '_blank'); // Opens the image in a new tab



                          }}>



                            <i class="fa-regular fa-eye"></i>
                          </button>


                        </td>
                        <td className="py-2 px-4">

                          <StatusPill value={payment.status} />
                        </td>
                        <td className="py-2 px-4">

                          {forApproval && <div className="flex">
                            <button
                              className="btn btn-success btn-sm flex items-center mr-2"

                              onClick={async () => {

                                let result = await axios({
                                  // headers: {
                                  //   'content-type': 'multipart/form-data'
                                  // },
                                  method: 'POST',
                                  url: 'layaway/payment/updateStatus',
                                  data: {
                                    LayawayID: selectedOrder.LayawayID,
                                    paymentID: payment.id,
                                    status: 'PAID',
                                    mainStatus
                                  }
                                });
                                fetchAll();
                              }}
                            >
                              <i className="fa-solid fa-check"></i>

                            </button>
                            <button className="btn btn-error  btn-sm  flex items-center"
                              onClick={async () => {
                                let result = await axios({
                                  // headers: {
                                  //   'content-type': 'multipart/form-data'
                                  // },
                                  method: 'POST',
                                  url: 'layaway/payment/updateStatus',
                                  data: {
                                    LayawayID: selectedOrder.LayawayID,
                                    paymentID: payment.id,
                                    status: 'REJECTED',
                                    mainStatus
                                  }
                                });
                                fetchAll();
                              }}
                            >
                              <i className="fa-solid fa-times"></i>

                            </button>
                          </div>}

                        </td>
                      </tr>
                    })}
                  </tbody>
                </table>
                <div className="p-4">
                  <div className="flex justify-between font-bold">
                    <span className=''>Order Amount:</span>
                    <span className='text-green-500'>{formatAmount(selectedOrder.Price)}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Total Amount Paid:</span>
                    <span>{formatAmount(totalAmountPaid)}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Remaining Balance:</span>
                    <span className='text-yellow-500'>{formatAmount(selectedOrder.Price - totalAmountPaid)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-action">



              {/* if there is a button in form, it will close the modal */}
              <div className='flex'>

                {/* <button

                  disabled={orders.find(o => {
                    return o.LayawayID === selectedOrder.LayawayID && o.status === 'PAID'
                  })}
                  className="btn mr-2 bg-green-500" onClick={() => document.getElementById('addPayment').showModal()}>Add Payment</button> */}

                <button className="btn"
                  onClick={() => document.getElementById('viewProofPaymentImage').close()}
                >Close</button>
              </div>


            </div>
          </div>
        </dialog>


        <dialog id="viewQRCode" className="modal">
          <div className="modal-box  bg-customBlue ">
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 bg-white"
                onClick={() => {
                  //  setisEditModalOpen(false)
                }}>✕</button>
            </form>
            <h1 className="font-bold text-lg text-center">QR CODE</h1>
            {/* <div className=' flex justify-center items-center mt-4'>
              <QRCodeSVG value={
                JSON.stringify({ dex: 1 })
              } />,
            </div> */}
            <div className=' flex justify-center items-center mt-4'>
              <div className="card bg-base-100 w-80 shadow-xl">
                {/* <figure>
                
                </figure> */}
                <div className="card-body justify-center items-center">
                  <h2 className="card-title text-center mt-4 font-bold">
                    QR CODE

                  </h2>

                  <div
                    ref={qrCodeRef}
                  >
                    <QRCodeSVG


                      value={
                        `${import.meta.env.VITE_REACT_APP_FRONTEND_URL}/myprofile/${selectedOrder.CustomerID}/layaway/${selectedOrder.LayawayID}`

                      }

                      size={200} />
                  </div>

                  <div className="card-actions justify-end">
                    <button
                      // type="button"
                      size="sm"
                      type="submit"
                      onClick={() => {
                        downloadQRCode()
                      }}
                      className={
                        'btn mt-4 shadow-lg w-full bg-buttonPrimary font-bold text-white' +
                        (loading ? ' loading' : '')
                      }>
                      Download
                    </button>

                  </div>
                </div>
              </div></div>
          </div>
        </dialog>

      </TitleCard >
    )
  );
}

export default Transactions;
