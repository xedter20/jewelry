import { useState, useRef, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import LandingIntro from './LandingIntro'
import ErrorText from '../../components/Typography/ErrorText'
import InputText from '../../components/Input/InputText'
import CheckCircleIcon from '@heroicons/react/24/solid/CheckCircleIcon'
import { Formik, useField, useFormik } from 'formik';
import * as Yup from 'yup'
import { mdiAccount, mdiLockOutline } from '@mdi/js';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { useParams } from 'react-router';

import { formatAmount } from '../dashboard/helpers/currencyFormat';
import Table, {
    AvatarCell,
    SelectColumnFilter,
    StatusPill,
    DateCell
} from '../../pages/protected/DataTables/Table';

function ForgotPassword() {




    const INITIAL_USER_OBJ = {
        emailId: ""
    }

    const [loading, setLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")
    const [linkSent, setLinkSent] = useState(false)
    const [userObj, setUserObj] = useState(INITIAL_USER_OBJ)
    const [isLoaded, setIsLoaded] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState({});
    const params = useParams()

    let userId = params.userId;


    const [selectedUser, setSelectedUser] = useState({});
    const [orders, setOrders] = useState([]);

    const getUser = async () => {
        let res = await axios({
            method: 'GET',
            url: `user/${userId}/findCustomer`
        });
        let [user] = res.data.data;


        setSelectedUser(user);
        setIsLoaded(true);
    };


    const fetchOrders = async () => {
        let res = await axios({
            method: 'POST',
            url: 'transactions/listOrder',
            data: {
                customerId: userId

            }
        });

        let list = res.data.data;


        setOrders(list)
    };

    useEffect(() => {
        getUser();
        fetchOrders();
    }, []);




    const submitForm = (e) => {
        e.preventDefault()
        setErrorMessage("")

        if (userObj.emailId.trim() === "") return setErrorMessage("Email Id is required! (use any value)")
        else {
            setLoading(true)
            // Call API to send password reset link
            setLoading(false)
            setLinkSent(true)
        }
    }

    const updateFormValue = ({ updateType, value }) => {
        setErrorMessage("")
        setUserObj({ ...userObj, [updateType]: value })
    }

    console.log({ selectedUser })


    const columns = useMemo(
        () => [

            {
                Header: 'Transaction ID',
                accessor: 'TransactionID',
                Cell: ({ row, value }) => {
                    return <span className="">{value}</span>;
                }
            },
            {
                Header: 'Item Name',
                accessor: 'ItemName',
                Cell: ({ row, value }) => {

                    return <span className="">{value}</span>;
                }
            },
            {
                Header: 'Amount',
                accessor: 'Price',
                Cell: ({ row, value }) => {
                    let thisRow = row.original;
                    const totalAmount = thisRow.Price * thisRow.Grams;
                    return <span className="">{formatAmount(totalAmount)}</span>;
                }
            },
            // {
            //     Header: 'Grams',
            //     accessor: '',
            //     Cell: ({ row, value }) => {
            //         return <span className=""></span>;
            //     }
            // },
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
                    return (
                        <div className="flex items-center space-x-1">


                            <div className={`px-2 py-1 rounded-full font-normal text-white ${colors[value]}`}>
                                {value}
                            </div>
                        </div>
                    );
                }
            },
            {
                Header: 'Action',
                accessor: '',
                Cell: ({ row, value }) => {


                    let thisOrder = row.original;

                    return <div className="flex">


                        <Link to={`/myProfile/${userId}/order/${thisOrder.TransactionID}`}>
                            <button className="btn btn-outline btn-sm mr-2" onClick={async () => {


                                setSelectedOrder(thisOrder);

                                document.getElementById('viewReceipt').showModal();


                            }}>  <i class="fa-regular fa-eye"></i>
                            </button>
                        </Link>

                        {/* <button className="btn btn-outline btn-sm mr-2" onClick={async () => {


                            setSelectedOrder(thisOrder);

                            document.getElementById('paymentModal').showModal();


                        }}>  <i class="fa-regular fa-credit-card"></i>
                        </button> */}


                    </div >
                }
            },
        ]);


    console.log({ orders })
    let totalAmountToPay = orders.filter(o => o.Status !== 'PAID').reduce((acc, current) => {

        let total = current.Grams * current.Price;
        return acc + total;

    }, 0);
    console.log({ totalAmountToPay })
    return (
        selectedUser ? <div className="min-h-screen bg-base-200 flex items-center bg-customBlue shadow-lg">
            <div className="card mx-auto w-full max-w-7xl  shadow-xl">
                <div className="grid md:grid-cols-2 grid-cols-1  bg-base-100 rounded-xl">
                    <div className=''>
                        {/* <LandingIntro /> */}

                        <div className=" bg-gray-100 p-6">
                            {/* Profile Header */}
                            <h2 className='text-2xl font-bold mb-4'>
                                My Profile</h2>

                            <div className="bg-white shadow rounded-lg p-6">
                                <div className="flex items-center space-x-6">
                                    <img
                                        className="w-24 h-24 rounded-full object-cover"
                                        src={
                                            'https://img.freepik.com/premium-vector/young-smiling-man-avatar-man-with-brown-beard-mustache-hair-wearing-yellow-sweater-sweatshirt-3d-vector-people-character-illustration-cartoon-minimal-style_365941-860.jpg?w=740'
                                        }
                                        alt="Profile"
                                    />
                                    <div>
                                        <h2 className="text-2xl font-semibold text-gray-800">{
                                            selectedUser.CustomerName}</h2>
                                        <p className="text-gray-600">{
                                            selectedUser.Facebook}</p>
                                        <p className="mt-2 text-gray-500">{selectedUser.Contact} | {selectedUser.Address}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Profile Details */}
                            <div className="mt-8 grid ">
                                <div className="stats shadow">
                                    <div className="stat">
                                        <div className="stat-figure text-warning">
                                            <i className="fa-solid fa-rectangle-list fa-2xl text-green-500"></i>
                                        </div>
                                        <div className="stat-title">Total Orders</div>
                                        <div className="stat-value">{
                                            orders.length
                                        }</div>
                                        {/* <div className="stat-desc">Jan 1st - Feb 1st</div> */}
                                    </div>

                                    <div className="stat">
                                        <div className="stat-figure text-warning">
                                            <i className="fa-solid fa-money-bill fa-2xl text-green-500"></i>
                                        </div>
                                        <div className="stat-title">To Pay</div>
                                        <div className="stat-value">{
                                            formatAmount(totalAmountToPay)}</div>
                                        {/* <div className="stat-desc">↗︎ 400 (22%)</div> */}
                                    </div>



                                </div>

                            </div>
                        </div>
                    </div>
                    <div className='p-6 '>
                        <h2 className='text-2xl font-bold mb-2'>
                            My Orders</h2>
                        <Table
                            style={{ overflow: 'wrap' }}
                            className="table-sm"
                            columns={columns}
                            data={orders}
                            searchField="lastName"
                            persistTableHead={true}

                        />

                    </div>
                </div>
            </div > <ToastContainer />

            <dialog id="viewReceipt" className="modal">
                <div className="modal-box w-11/12 max-w-3xl">
                    <form method="dialog">
                        {/* if there is a button in form, it will close the modal */}
                        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 bg-white"
                            onClick={() => {
                                //  setisEditModalOpen(false)
                            }}>✕</button>
                    </form>
                    {/* <h1 className="font-bold text-lg text-center">RECEIPT</h1> */}
                    {/* <div className=' flex justify-center items-center mt-4'>
              <QRCodeSVG value={
                JSON.stringify({ dex: 1 })
              } />,
            </div> */}
                    <div className="p-2 space-y-4 md:space-y-6 sm:p-4">


                        <div className="overflow-x-auto">
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

                                <div className="flex justify-end mb-8">
                                    <div className="text-gray-700 mr-2">Grand Total:</div>
                                    <div className="text-gray-700 font-bold text-xl"> <span className='font-bold text-green-500'>
                                        {formatAmount(selectedOrder.Grams * selectedOrder.Price)}
                                    </span></div>
                                </div>

                            </div>

                        </div>




                    </div>
                </div>
            </dialog>

            <dialog id="paymentModal" className="modal">
                <div className="modal-box w-11/12 max-w-3xl">
                    <form method="dialog">
                        {/* if there is a button in form, it will close the modal */}
                        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 bg-white"
                            onClick={() => {
                                //  setisEditModalOpen(false)
                            }}>✕</button>
                    </form>
                    {/* <h1 className="font-bold text-lg text-center">RECEIPT</h1> */}
                    {/* <div className=' flex justify-center items-center mt-4'>
              <QRCodeSVG value={
                JSON.stringify({ dex: 1 })
              } />,
            </div> */}
                    <div className="p-2 space-y-4 md:space-y-6 sm:p-4">


                        <div className="divider font-bold">Scan QR</div>

                        <p className='text-center'>Please pay  <span className='font-bold text-green-500'>{formatAmount(selectedOrder.Grams * selectedOrder.Price)}.
                        </span> You may capture these QR Codes or ask admin for the Mode of Payment.</p>
                        <div className="flex justify-center items-center p-4">
                            <div className="w-1/2 h-1/2">
                                <img
                                    src="/paymentMethod.png"
                                    alt="Placeholder"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>



                    </div>
                </div>
            </dialog>

        </div > : <div className="flex items-center justify-center h-screen bg-gray-100">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-800 mb-4">Unknown User</h1>
                <p className="text-lg text-gray-600">We couldn't find the user you're looking for.</p>
            </div>
        </div>
    )
}

export default ForgotPassword