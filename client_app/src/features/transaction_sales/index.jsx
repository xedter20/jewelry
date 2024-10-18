import moment from 'moment';
import { useEffect, useState, useMemo } from 'react';
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
      <div className="badge badge-neutral mr-2 px-2 p-4">Total Orders: {users.length}</div>

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
  const [file, setFile] = useState(null);
  const [users, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [paymentHistoryList, setActivePaymentHistory] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeChildID, setactiveChildID] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState({});
  const [isAddPaymentOpen, setisAddPaymentOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [suppliers, setSupplierList] = useState([]);


  const fetchOrders = async () => {
    let res = await axios({
      method: 'POST',
      url: 'transactions/listOrder',
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
  }
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
        Header: 'Transaction ID',
        accessor: 'uuid',
        Cell: ({ row, value }) => {
          return <span className="">{value}</span>;
        }
      },

      {
        Header: 'Customer ID',
        accessor: 'CustomerID',

        Cell: ({ row, value }) => {
          // let date_modified = format(value, 'MMM dd, yyyy');
          return (
            <div className="flex items-center space-x-3">


              <div>
                <div className="font-bold text-neutral-500">{value}</div>
              </div>
            </div>
          );
        }
      },
      {
        Header: 'Customer Name',
        accessor: 'CustomerName',

        Cell: ({ row, value }) => {
          // let date_modified = format(value, 'MMM dd, yyyy');
          return (
            <div className="flex items-center space-x-3">


              <div>
                <div className="font-bold text-neutral-500">{value}</div>
              </div>
            </div>
          );
        }
      },
      {
        Header: 'Facebook Link',
        accessor: 'Facebook',

        Cell: ({ row, value }) => {
          // let date_modified = format(value, 'MMM dd, yyyy');
          return (
            <div className="flex items-center space-x-3">


              <div>
                <div className="font-bold text-neutral-500">{value}</div>
              </div>
            </div>
          );
        }
      },
      {
        Header: 'Grams',
        accessor: 'Grams',

        Cell: ({ row, value }) => {
          // let date_modified = format(value, 'MMM dd, yyyy');
          return (
            <div className="flex items-center space-x-3">


              <div>
                <div className="font-bold text-neutral-500">{value}</div>
              </div>
            </div>
          );
        }
      },
      {
        Header: 'Price',
        accessor: 'Price',

        Cell: ({ row, value }) => {
          // let date_modified = format(value, 'MMM dd, yyyy');
          return (
            <div className="flex items-center space-x-3">


              <div>
                <div className="font-bold text-neutral-500">{value}</div>
              </div>
            </div>
          );
        }
      },
      {
        Header: 'Supplier',
        accessor: 'SupplierID',

        Cell: ({ row, value }) => {

          return (
            <div className="flex items-center space-x-3">


              <div>
                <div className="font-bold text-neutral-500">{value}</div>
              </div>
            </div>
          );
        }
      },
      {
        Header: 'Category',
        accessor: 'Category',
        Cell: ({ row, value }) => {



          return (
            <div className="flex items-center space-x-3">


              <div>
                <div className="font-bold text-neutral-500">{value}</div>
              </div>
            </div>
          );


        }
      },
      {
        Header: 'Status',
        accessor: 'Status',
        Cell: ({ row, value }) => {
          let colors = {
            'IN_PROGRESS': 'bg-yellow-500',
            'PAID': 'bg-green-500',
            'COMPLETED': 'bg-blue-500',
            'CANCELLED': 'bg-red-500'
          }

          console.log(value)
          return (
            <div className="flex items-center space-x-3">


              <div className={`px-4 py-2 rounded-full font-bold text-white ${colors[value]}`}>
                {value}
              </div>
            </div>
          );



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


                  setSelectedOrder(l);

                  document.getElementById('viewReceipt').showModal();


                }}>



                  <i class="fa-regular fa-eye"></i> View
                </button>
                <button className="btn btn-outline btn-sm mr-2" onClick={async () => {


                  setSelectedOrder(l);

                  document.getElementById('viewTransactionHistory').showModal();


                }}>



                  <i class="fa-solid fa-barcode"></i> QR
                </button>



                {/* <button
                  className="btn btn-outline btn-sm ml-0"
                  onClick={() => {
                    // setactiveChildID(l.ID);
                    // document.getElementById('deleteModal').showModal();
                  }}>
                  <i class="fa-solid fa-download"></i>
                </button> */}
              </div >
            )
          );
        }
      }
    ],
    []
  );



  const handleOnChange = e => {
    console.log(e.target.files[0]);
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
      CustomerID: Yup.string().required('Required'),
      Facebook: Yup.string().required('Required'),
      ItemName: Yup.string().required('Required'),
      Category: Yup.string().required('Required'),
      SupplierID: Yup.string().required('Required'),
      Grams: Yup.number().required('Required'),
      Price: Yup.number().required('Required')

    };

    let initialValues = {
      CustomerID: '',
      Facebook: '',
      Category: '',
      SupplierID: '',
      Grams: '',
      Price: '',
      ItemName: ''
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
      onSubmit: async (values, { setFieldError, setSubmitting }) => {
        setSubmitting(true);

        // console.log("here")
        // console.log({ isEditModalOpen })




        try {







          let res = await axios({
            method: 'POST',
            url: 'transactions/addOrder',
            data: values
          })
          await fetchAll();
          document.getElementById('addOrder').close();
          // await fetchSuppliers();
          toast.success('Added Successfully!', {
            onClose: () => {
              setSubmitting(false);
              navigate('/app/transactions');
            },
            position: 'top-right',
            autoClose: 500,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: 'light'
          });




        } catch (error) {
          console.log({ error });
        } finally {
        }
      }
    };
  };



  const formikConfigViewReciept = (selectedOrder) => {

    let validation = {
      Comments: Yup.string().required('Required'),
      Status: Yup.string().required('Required')
    };

    let initialValues = {


      Comments: '',
      Status: ''
    }





    return {
      initialValues: initialValues,
      validationSchema: Yup.object(validation),
      // validateOnMount: true,
      // validateOnChange: false,
      onSubmit: async (values, { setFieldError, setSubmitting }) => {
        setSubmitting(true);



        try {







          let res = await axios({
            method: 'POST',
            url: 'admin/transactions/updateOrder',
            data: {
              ...values,
              transactionId: selectedOrder.TransactionID
            }
          })
          // await fetchAll();
          // document.getElementById('addOrder').close();
          // // await fetchSuppliers();
          document.getElementById('viewReceipt').close();
          toast.success('Updated successfully!', {
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
        }
      }
    };
  };


  return (
    isLoaded && (
      <TitleCard
        title="Orders"
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
        <form >
          <dialog id="my_modal_1" className="modal">
            <div className="modal-box">
              <h3 className="font-bold text-lg">Upload Excel File</h3>
              {/* <p className="py-4">Pick a file</p> */}

              {isSubmitting && (
                <div
                  class="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mt-2"
                  role="alert">
                  <p class="font-bold">Please wait</p>
                  <p>Uploading ...</p>
                </div>
              )}

              <label className="form-control w-full">
                <div className="label">
                  {/* <span className="label-text">Pick a file</span> */}
                </div>
                <input
                  type="file"
                  className="file-input file-input-bordered w-full max-w-xs w-full"
                  onChange={handleOnChange}
                />
              </label>

              <div className="modal-action">
                {/* if there is a button in form, it will close the modal */}
                <button
                  className="btn mr-2 btn-primary"
                  disabled={isSubmitting || !file}
                  onClick={async e => {
                    if (!isSubmitting && file) {
                      await handleSubmit(e);
                    }
                  }}>
                  Upload
                </button>
                <button className="btn" disabled={isSubmitting || !file}>
                  Close
                </button>
              </div>
            </div>
          </dialog>
        </form>
        <ToastContainer />

        <dialog id="deleteModal" className="modal">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Delete Confirmation</h3>
            <p className="py-4">Are you sure you want to delete this record?</p>
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
                    // let res = await axios({
                    //   method: 'POST',
                    //   url: 'user/deleteChildRecord',
                    //   data: {
                    //     activeChildID: activeChildID
                    //   }
                    // });

                    // document.getElementById('deleteModal').close();
                    // toast.success(`Deleted Successfully`, {
                    //   onClose: () => {
                    //     window.location.reload();
                    //   },
                    //   position: 'top-right',
                    //   autoClose: 1000,
                    //   hideProgressBar: false,
                    //   closeOnClick: true,
                    //   pauseOnHover: true,
                    //   draggable: true,
                    //   progress: undefined,
                    //   theme: 'light'
                    // });
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

            <p className="text-sm text-gray-500 mt-1 font-bold">Order Details</p>

            <div class="bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4 mt-4" role="alert">
              <p class="font-bold">Note</p>
              <p>Information will be recorded and cannot be changed</p>
            </div>
            <div className="p-2 space-y-4 md:space-y-6 sm:p-4">
              <Formik {...formikConfig(selectedSupplier)}>
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
                  const checkValidateTab = () => {
                    // submitForm();
                  };
                  const errorMessages = () => {
                    // you can add alert or console.log or any thing you want
                    alert('Please fill in the required fields');
                  };

                  // console.log({ values })

                  return (
                    <Form className="">
                      {/* <label
                        className={`block mb-2 text-green-400 text-left font-bold`}>
                        Child
                      </label> */}

                      <div className="grid grid-cols-1 gap-3 md:grid-cols-1 ">


                        <div className='mt-2'>
                          <Dropdown
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
                        </div>

                      </div>

                      <div className="grid grid-cols-1 gap-3 md:grid-cols- ">


                        <InputText
                          className="border-2 border-none focus:border-purple-500 rounded-lg p-2 w-full"

                          label="Facebook Link"
                          name="Facebook"
                          type="text"
                          placeholder=""
                          value={values.Facebook}
                          disabled
                          onBlur={handleBlur} // This apparently updates `touched`?
                        />

                      </div>
                      <div className="grid grid-cols-1 gap-3 md:grid-cols- ">


                        <Dropdown
                          // icons={mdiAccount}
                          label="Item Name"
                          name="ItemName"
                          placeholder=""
                          value={values.ItemName}
                          setFieldValue={setFieldValue}
                          onBlur={handleBlur}
                          options={[
                            { value: 'Pendant', label: 'Pendant' },
                            { value: 'Bangle', label: 'Bangle' },
                            { value: 'Earrings', label: 'Earrings' },
                            { value: 'Bracelet', label: 'Bracelet' },
                            { value: 'Necklace', label: 'Necklace' },
                            { value: 'Rings', label: 'Rings' }
                          ]}
                        />


                      </div>
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-1 ">


                        <div className='mt-2'>
                          <Dropdown
                            // icons={mdiAccount}
                            label="Category"
                            name="Category"
                            placeholder=""
                            value={values.Category}
                            setFieldValue={setFieldValue}
                            onBlur={handleBlur}
                            options={[
                              // { value: 'Pendant', label: 'Pendant' },
                              // { value: 'Bangle', label: 'Bangle' },
                              // { value: 'Earrings', label: 'Earrings' },
                              // { value: 'Bracelet', label: 'Bracelet' },
                              // { value: 'Necklace', label: 'Necklace' },
                              // { value: 'Rings', label: 'Rings' },
                              { value: 'BRAND NEW', label: 'BRAND NEW' },
                              { value: 'SUBASTA', label: 'SUBASTA' },
                            ]}
                          />
                        </div>

                      </div>
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-1 ">


                        <div className='mt-2'>
                          <Dropdown
                            // icons={mdiAccount}
                            label="Supplier Name"
                            name="SupplierID"
                            placeholder=""
                            value={values.SupplierID}
                            setFieldValue={setFieldValue}
                            onBlur={handleBlur}
                            options={suppliers}
                          />
                        </div>

                      </div>

                      <div className="grid grid-cols-1 gap-2 md:grid-cols-2 ">
                        <InputText

                          label="Grams per Item * ₱3,500"
                          name="Grams"
                          type="number"
                          placeholder=""
                          value={values.Grams}
                          onChange={(e) => {
                            const grams = parseFloat(e.target.value); // Parse grams, default to 0
                            console.log({ grams })
                            setFieldValue('Grams', grams);
                            setFieldValue('Price', grams * 3500); // Update price based on grams
                          }}
                          onBlur={handleBlur} // This apparently updates `touched`?
                        />

                        <InputText
                          disabled
                          label="Price"
                          name="Price"
                          type="number"
                          placeholder=""
                          value={values.Price}
                          onBlur={handleBlur} // This apparently updates `touched`?
                        />
                      </div>



                      <button
                        // type="button"
                        type="submit"
                        className={
                          'btn mt-4 shadow-lg w-full bg-buttonPrimary font-bold text-white' +
                          (loading ? ' loading' : '')
                        }>
                        Submit
                      </button>
                    </Form>
                  );
                }}
              </Formik> </div>
          </div>
        </dialog>



        {selectedOrder.TransactionID && <dialog id="viewReceipt" className="modal">
          <div className="modal-box w-full max-w-none">
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 bg-white"
                onClick={() => {
                  //  setisEditModalOpen(false)
                }}>✕</button>
            </form>
            {/* <h1 className="font-bold text-lg text-center">Order Summary</h1> */}
            {/* <div className=' flex justify-center items-center mt-4'>
              <QRCodeSVG value={
                JSON.stringify({ dex: 1 })
              } />,
            </div> */}
            <div className="p-2 space-y-4 md:space-y-6 sm:p-4">
              <Formik {...formikConfigViewReciept(selectedOrder)}>
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
                  const checkValidateTab = () => {
                    // submitForm();
                  };
                  const errorMessages = () => {
                    // you can add alert or console.log or any thing you want
                    alert('Please fill in the required fields');
                  };

                  // console.log({ values })

                  // console.log({ selectedOrder })

                  return (
                    <Form className="">


                      <div className={
                        `grid md: grid-cols-3 grid-cols-1  bg-base-100 rounded-xl`}>
                        <div className=''>

                          <div className="bg-gray-100 p-2 bg-base-100 rounded-xl">
                            <div className="bg-white rounded-lg shadow-lg px-8 py-10 max-w-xl mx-auto">
                              <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center">
                                  {/* <!-- <img className="h-8 w-8 mr-2" src="https://tailwindflex.com/public/images/logos/favicon-32x32.png"
                                alt="Logo" /> --> */}
                                  <div className="text-gray-700 font-semibold text-lg"> A.V De Asis</div>
                                </div>
                                <div className="text-gray-700">
                                  <div className="font-bold text-xl mb-2">INVOICE</div>
                                  <div className="text-sm">Date: {selectedOrder.Date_Created}</div>
                                  <div className="text-sm">Invoice #: INV-{selectedOrder.TransactionID}</div>
                                </div>
                              </div>
                              <div className="border-b-2 border-gray-300 pb-8 mb-8">
                                <h2 className="text-2xl font-bold mb-4">Bill To:</h2>
                                <div className="text-gray-700 mb-2">{selectedOrder.CustomerName}</div>
                                <div className="text-gray-700 mb-2">{selectedOrder.Address}</div>
                                <div className="text-gray-700 mb-2">{selectedOrder.Contact}</div>
                                <div className="text-gray-700">{selectedOrder.Email}</div>
                              </div>
                              <table className="w-full text-left mb-8">
                                <thead>
                                  <tr>
                                    <th className="text-gray-700 font-bold uppercase py-2">Description</th>
                                    <th className="text-gray-700 font-bold uppercase py-2">Quantity</th>
                                    <th className="text-gray-700 font-bold uppercase py-2">Price</th>
                                    <th className="text-gray-700 font-bold uppercase py-2">Total</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr>
                                    <td className="py-4 text-gray-700">{selectedOrder.ItemName}</td>
                                    <td className="py-4 text-gray-700">{selectedOrder.Grams}</td>
                                    <td className="py-4 text-gray-700">{formatAmount(selectedOrder.Price)}</td>
                                    <td className="py-4 text-gray-700">

                                      <span className='font-bold'>
                                        {formatAmount(selectedOrder.Grams * selectedOrder.Price)}
                                      </span>
                                    </td>
                                  </tr>

                                </tbody>
                              </table>
                              {/* <div className="flex justify-end mb-8">
                            <div className="text-gray-700 mr-2">Subtotal:</div>
                            <div className="text-gray-700">$425.00</div>
                          </div> */}
                              {/* <div className="text-right mb-8">
                            <div className="text-gray-700 mr-2">Tax:</div>
                            <div className="text-gray-700">$25.50</div>

                          </div> */}
                              <div className="flex justify-end mb-8">
                                <div className="text-gray-700 mr-2">Grand Total:</div>
                                <div className="text-gray-700 font-bold text-xl"> <span className='font-bold text-green-500'>
                                  {formatAmount(selectedOrder.Grams * selectedOrder.Price)}
                                </span></div>
                              </div>
                              {/* <div className="border-t-2 border-gray-300 pt-8 mb-8">
                            <div className="text-gray-700 mb-2">Payment is due within 30 days. Late payments are subject to fees.</div>
                            <div className="text-gray-700 mb-2">Please make checks payable to Your Company Name and mail to:</div>
                            <div className="text-gray-700"></div>
                          </div> */}
                            </div>

                          </div>



                        </div>
                        <div className="">
                          {/* Profile Header */}
                          <div className="flex items-center justify-center">
                            {/* <h2 className='text-2xl font-bold mb-4'>
                                TO PAY</h2> */}


                            <div className={`px-2 py-1  font-normal text-white bg-blue-600 `}>
                              Proof of Payment
                            </div>
                          </div>
                          <div className="p-2 space-y-4 md:space-y-6 sm:p-4">
                            <div className="overflow-x-auto">
                              <div className="bg-white rounded-lg shadow-lg px-8 py-10 max-w-xl mx-auto">

                                <div class="max-w-sm mx-auto">
                                  <img src={
                                    selectedOrder.proof_of_payment
                                  } alt="Responsive Image" class="w-full h-90 object-fit" />

                                </div>


                              </div>

                            </div>




                          </div>
                        </div>
                        <div className='mt-2'>


                          <Dropdown
                            // icons={mdiAccount}
                            label="Status"
                            name="Status"
                            placeholder=""
                            value={values.Status}
                            setFieldValue={setFieldValue}
                            onBlur={handleBlur}
                            v
                            options={[
                              { value: 'PAID', label: 'PAID' },
                              { value: 'CANCELLED', label: 'CANCELLED' },
                              { value: 'IN_PROGRESS', label: 'IN_PROGRESS' },
                              { value: 'COMPLETED', label: 'COMPLETED' }
                            ]}
                          />
                          <InputText

                            label="Comments"
                            name="Comments"
                            type="text"
                            placeholder=""
                            value={values.Comments}

                            onBlur={handleBlur} // This apparently updates `touched`?
                          />

                          <button
                            type="submits"
                            // onClick={(e) => {
                            //   console.log("dex")


                            // }}
                            // type="submit"
                            className={
                              'btn mt-4 shadow-lg w-full bg-buttonPrimary font-bold text-white' +
                              (loading ? ' loading' : '')
                            }>
                            Update
                          </button>
                        </div>
                      </div>

                    </Form>
                  );
                }}
              </Formik> </div>
          </div>
        </dialog>
        }



        <dialog id="viewTransactionHistory" className="modal">
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

                  <QRCodeSVG value={
                    JSON.stringify({
                      url: `${import.meta.env.VITE_REACT_APP_FRONTEND_URL}/myprofile/${selectedOrder.CustomerID}/order/${selectedOrder.TransactionID}`
                    })
                  }

                    size={200} />,


                  <div className="card-actions justify-end">
                    <button
                      // type="button"
                      size="sm"
                      type="submit"
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

        <dialog id="viewProofPaymentImage" className="modal">
          <div className="modal-box">
            <div class="flex justify-center items-center">
              <img id="Proof_Payment" alt="" preview className='object-cover h-120 w-100 ' />
            </div>
            <div className="modal-action">


              <form method="dialog">
                {/* if there is a button in form, it will close the modal */}
                <button className="btn">Close</button>
              </form>
            </div>
          </div>
        </dialog>

      </TitleCard>
    )
  );
}

export default Transactions;
