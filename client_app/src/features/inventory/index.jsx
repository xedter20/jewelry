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

import {
  setAppSettings,
  getFeatureList
} from '../settings/appSettings/appSettingsSlice';

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

      <button className="btn btn-outline btn-sm" onClick={() => document.getElementById('addSupplier').showModal()}>
        Add
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
  const [users, setUser] = useState([]);
  const [paymentHistoryList, setActivePaymentHistory] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeChildID, setactiveChildID] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState({});
  const [isAddPaymentOpen, setisAddPaymentOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [suppliers, setSupplierList] = useState([]);
  const [inventoryList, setInventoryList] = useState([]);
  const fetchInventoryList = async (SupplierID) => {
    let res = await axios({
      method: 'post',
      url: 'inventory/list',
      data: {
        SupplierID: SupplierID
      }
    });

    let list = res.data.data;
    setInventoryList(list);
  };
  useEffect(() => {

    fetchSuppliers();
    setIsLoaded(true);

  }, []);

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
  useEffect(() => {

    fetchSuppliers();
    fetchInventoryList()
    setIsLoaded(true);

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
        Header: 'Order ID',
        accessor: 'OrderID',
        Cell: ({ row, value }) => {
          return <span className="">{value}</span>;
        }
      },
      {
        Header: 'Supplier ID',
        accessor: '',
        Cell: ({ row }) => {
          return <span className="">{row.index + 1}</span>;
        }
      },

      {
        Header: 'Supplier Name',
        accessor: 'SupplierName',

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
                <div className="font-bold text-neutral-500">{value.toFixed(2)}</div>
              </div>
            </div>
          );
        }
      },
      {
        Header: 'Category',
        accessor: 'Category',

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
        Header: 'Amount',
        accessor: 'Amount',

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
        Header: 'Modified By',
        accessor: 'Admin_FullName',

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
        Header: 'Date Modified',
        accessor: 'DateModified',

        Cell: ({ row, value }) => {
          let date_modified = format(value, 'MMM dd, yyyy');
          return (
            <div className="flex items-center space-x-3">


              <div>
                <div className="font-bold text-neutral-500">{date_modified}</div>
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

                <button className="btn btn-outline btn-sm mr-2" onClick={() => {

                  setisAddPaymentOpen(true)
                  setSelectedSupplier(l);



                  document.getElementById('inventoryDetails').showModal();
                  // setFieldValue('Admin_Fname', 'dex');
                }}>



                  <i class="fa-regular fa-eye"></i>
                </button>



                <button
                  className="btn btn-outline btn-sm ml-2"
                  onClick={() => {
                    // setactiveChildID(l.ID);
                    // document.getElementById('deleteModal').showModal();
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

  const tableColumns = useMemo(
    () => [

      {
        Header: 'Payment ID',
        accessor: 'PaymentID',
        Cell: ({ row, value }) => {
          return <span className="">{value}</span>;
        }
      },
      {
        Header: 'Supplier ID',
        accessor: 'SupplierID',
        Cell: ({ row, value }) => {
          return <span className="">{value}</span>;
        }
      },
      {
        Header: 'Order ID',
        accessor: 'OrderID',
        Cell: ({ row, value }) => {
          return <span className="">{value}</span>;
        }
      },
      // 
      {
        Header: 'Payment Date',
        accessor: 'Date',

        Cell: ({ row, value }) => {
          //  let date_modified = format(value, 'MMM dd, yyyy');
          return (
            <div className="flex items-center space-x-3">


              <div>
                <div className="font-bold text-neutral-500">{1}</div>
              </div>
            </div>
          );
        }
      },
      {
        Header: 'Status',
        accessor: 'Payment_Status',

        Cell: ({ row, value }) => {
          // let date_modified = format(value, 'MMM dd, yyyy');

          let isPaid = value === 'PAID';
          return (
            <div className="flex items-center space-x-3">


              <div className={`px-4 py-2 rounded-full font-bold text-white ${isPaid ? 'bg-green-500' : 'bg-yellow-500'}`}>
                {isPaid ? 'Paid' : 'Partially Paid'}
              </div>
            </div>
          );
        }
      },
      {
        Header: 'Amount',
        accessor: 'Amount',

        Cell: ({ row, value }) => {
          // let date_modified = format(value, 'MMM dd, yyyy');
          let USDollar = new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'Php',
          });
          return (
            <div className="flex items-center space-x-3">


              <div>
                <div className="font-bold text-neutral-500">{USDollar.format(value)}</div>
              </div>
            </div>
          );
        }
      },
      {
        Header: 'Payment Method',
        accessor: 'Payment_Method',

        Cell: ({ row, value }) => {
          // let date_modified = format(value, 'MMM dd, yyyy');
          return (
            <div className="flex items-center space-x-3">


              <div className={`px-4 py-2 rounded-full font-bold text-white ${value ? 'bg-blue-500' : 'bg-yellow-500'}`}>
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


                  // console.log("Dex")
                  // setisEditModalOpen(true)
                  // console.log({ l })
                  setSelectedPayment(l);

                  document.getElementById('viewProofPaymentImage').showModal();



                }}>



                  <i class="fa-regular fa-eye"></i>
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

    console.log({ selectedSupplier })

    // console.log({ selectedSupplier })

    // console.log({ isAddPaymentOpen })

    // console.log(selectedSupplier.Admin_Fname)




    let validation = {
      SupplierID: Yup.string().required('Required'),
      Category: Yup.string().required('Required'),
      Grams: Yup.number().required('Required'),
      Price: Yup.number().required('Required'),
      Amount: Yup.number().required('Required'),
      Date: Yup.date().required('Required')
    };




    const defaultDate = new Date("2024-10-16T16:00:00.000Z");

    // Format it as YYYY-MM-DD
    const formattedDate = defaultDate.toISOString().split('T')[0]; // '2024-10-1
    console.log({ formattedDate })
    let initialValues = {
      SupplierID: parseInt(selectedSupplier?.SupplierID) || '',
      Category: selectedSupplier?.Category || '',
      Grams: selectedSupplier?.Grams || '',
      Price: selectedSupplier?.Price || '',
      Amount: selectedSupplier?.Amount || '',
      Date: formattedDate
    }


    return {
      enableReinitialize: true,
      initialValues: initialValues,
      validationSchema: Yup.object(validation),
      validateOnMount: true,
      validateOnChange: true,
      onSubmit: async (values, { setFieldError, setSubmitting, resetForm }) => {
        setSubmitting(true);


        try {



          if (selectedSupplier.OrderID) {

            let res = await axios({
              method: 'put',
              url: `inventory/${selectedSupplier.OrderID}`,
              data: values
            })
            document.getElementById('inventoryDetails').close();
            await fetchSuppliers();
            await fetchInventoryList();
            resetForm()
            toast.success('Updated successfully!', {
              onClose: () => {
                setSubmitting(false);

                // navigate('/app/suppliers');
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


          } else {
            let res = await axios({
              method: 'POST',
              url: 'inventory/create',
              data: values
            })
            document.getElementById('addSupplier').close();
            await fetchSuppliers();
            await fetchInventoryList();
            resetForm()
            toast.success('Added successfully!', {
              onClose: () => {
                setSubmitting(false);

                // navigate('/app/suppliers');
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

          }




        } catch (error) {
          console.log({ error });
        } finally {
        }
      }
    };
  };


  const [selectedOption, setSelectedOption] = useState("");

  const handleChange = async (event) => {
    setSelectedOption(event.target.value);
    await fetchInventoryList(event.target.value)
  };


  console.log({ suppliers })
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
            users={inventoryList}
          />
        }>
        <div className="">
          <select
            value={selectedOption}
            onChange={handleChange}
            className="block w-60 px-4 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select supplier</option>
            {suppliers.map(v => {
              return {
                value: v.value,
                label: v.label
              }
            }).map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}

          </select>
          {/* <Dropdown
            // icons={mdiAccount}
            label="Supplier Name"
            name="SupplierID"
            placeholder=""
            // value={values.SupplierID}
            // setFieldValue={setFieldValue}
            // onBlur={handleBlur}
            options={suppliers}
          /> */}
          <Table
            style={{ overflow: 'wrap' }}
            className="table-sm"
            columns={columns}
            data={(inventoryList || []).map(data => {
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

        <dialog id="addSupplier" className="modal">
          <div className="modal-box w-11/12 max-w-2xl">
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
            </form>
            <h1 className="font-bold text-lg">Fill Out Form</h1>
            <p className="text-sm text-gray-500 mt-1 font-bold">Supplier Order Details</p>
            <div className="p-2 space-y- md:space-y-6 sm:p-4">
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
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 ">


                        {
                          console.log({ suppliers })
                        }
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
                        <Dropdown
                          // icons={mdiAccount}
                          label="Category"
                          name="Category"
                          placeholder=""
                          value={values.Category}
                          setFieldValue={setFieldValue}
                          onBlur={handleBlur}
                          options={[
                            { value: 'Pendant', label: 'Pendant' },
                            { value: 'Bangle', label: 'Bangle' },
                            { value: 'Earrings', label: 'Earrings' },
                            { value: 'Bracelet', label: 'Bracelet' },
                            { value: 'Necklace', label: 'Necklace' },
                            { value: 'Rings', label: 'Rings' },
                            { value: 'BRAND NEW', label: 'BRAND NEW' },
                            { value: 'SUBASTA', label: 'SUBASTA' },
                          ]}
                        />
                      </div>
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 ">
                        <InputText

                          label="Total Grams"
                          name="Grams"
                          type="number"
                          placeholder=""
                          value={values.Grams}
                          onBlur={handleBlur} // This apparently updates `touched`?
                        />  <InputText

                          label="Price"
                          name="Price"
                          type="number"
                          placeholder=""
                          value={values.Price}
                          onBlur={handleBlur} // This apparently updates `touched`?
                        />

                      </div>
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 ">
                        <InputText

                          label="Amount"
                          name="Amount"
                          type="number"
                          placeholder=""
                          value={values.Amount}
                          onBlur={handleBlur} // This apparently updates `touched`?
                        />  <InputText

                          label="Date"
                          name="Date"
                          type="date"
                          placeholder=""
                          value={values.Date}
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



        <dialog id="inventoryDetails" className="modal">
          <div className="modal-box">
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                onClick={() => {
                  setisAddPaymentOpen(false)
                }}>✕</button>
            </form>
            <h1 className="font-bold text-lg">Details</h1>
            {/* <p className="text-sm text-gray-500 mt-1 font-bold text-buttonPrimary">Supplier Payment</p> */}
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
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 ">


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
                      <Dropdown
                        // icons={mdiAccount}
                        label="Category"
                        name="Category"
                        placeholder=""
                        value={values.Category}
                        setFieldValue={setFieldValue}
                        onBlur={handleBlur}
                        options={[
                          { value: 'Pendant', label: 'Pendant' },
                          { value: 'Bangle', label: 'Bangle' },
                          { value: 'Earrings', label: 'Earrings' },
                          { value: 'Bracelet', label: 'Bracelet' },
                          { value: 'Necklace', label: 'Necklace' },
                          { value: 'Rings', label: 'Rings' },
                          { value: 'BRAND NEW', label: 'BRAND NEW' },
                          { value: 'SUBASTA', label: 'SUBASTA' },
                        ]}
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 ">
                      <InputText

                        label="Total Grams"
                        name="Grams"
                        type="number"
                        placeholder=""
                        value={values.Grams}
                        onBlur={handleBlur} // This apparently updates `touched`?
                      />  <InputText

                        label="Price"
                        name="Price"
                        type="number"
                        placeholder=""
                        value={values.Price}
                        onBlur={handleBlur} // This apparently updates `touched`?
                      />

                    </div>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 ">
                      <InputText

                        label="Amount"
                        name="Amount"
                        type="number"
                        placeholder=""
                        value={values.Amount}
                        onBlur={handleBlur} // This apparently updates `touched`?
                      />  <InputText

                        label="Date"
                        name="Date"
                        type="date"
                        placeholder=""
                        value={values.date}
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
            </Formik>
          </div>
        </dialog>

        <dialog id="viewTransactionHistory" className="modal">
          <div className="modal-box w-11/12 max-w-5xl">
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                onClick={() => {
                  setisEditModalOpen(false)
                }}>✕</button>
            </form>
            <h1 className="font-bold text-lg">Supplier Payment History</h1>
            <Table
              style={{ overflow: 'wrap' }}
              className="table-sm"
              columns={tableColumns}
              data={(paymentHistoryList || []).map(data => {
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
        </dialog>

        <dialog id="viewProofPaymentImage" className="modal">
          <div className="modal-box">
            <div class="flex justify-center items-center">
              <img id="Proof_Payment" src={`${selectedPayment.Proof_Payment}`} alt="" preview className='object-cover h-120 w-100 ' />
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