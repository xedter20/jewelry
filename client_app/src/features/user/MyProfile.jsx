import { useState, useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Table, { StatusPill } from '../../pages/protected/DataTables/Table';
import { formatAmount } from '../dashboard/helpers/currencyFormat';
import { format } from 'date-fns';

function ForgotPassword() {
    const [activeTab, setActiveTab] = useState(1); // State to control active tab
    const INITIAL_USER_OBJ = { emailId: "" };
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [linkSent, setLinkSent] = useState(false);
    const [userObj, setUserObj] = useState(INITIAL_USER_OBJ);
    const [isLoaded, setIsLoaded] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState({});
    const params = useParams();
    let userId = params.userId;
    const [selectedUser, setSelectedUser] = useState({});
    const [orders, setOrders] = useState([]);

    const [layAwayOrders, setlayAwayOrders] = useState([]);
    const [orderType, setOrderType] = useState('direct');
    const getUser = async () => {
        let res = await axios.get(`user/${userId}/findCustomer`);
        let [user] = res.data.data;
        setSelectedUser(user);
        setIsLoaded(true);
    };

    const fetchOrders = async () => {
        let res = await axios.post('transactions/listOrder', {
            customerId: userId, type: orderType
        });
        let list = res.data.data;
        setOrders(list);
    };

    useEffect(() => {
        getUser();
        fetchOrders();
    }, [orderType]);

    const submitForm = (e) => {
        e.preventDefault();
        setErrorMessage("");

        if (userObj.emailId.trim() === "") return setErrorMessage("Email Id is required! (use any value)");
        setLoading(true);
        // Call API to send password reset link
        setLoading(false);
        setLinkSent(true);
    };

    const updateFormValue = ({ updateType, value }) => {
        setErrorMessage("");
        setUserObj({ ...userObj, [updateType]: value });
    };

    const columns = useMemo(() => [
        {
            Header: 'Action',
            Cell: ({ row }) => {
                let TransactionID = row.original.TransactionID || row.original.LayawayID

                let link = `/myProfile/${userId}/order/${TransactionID}`;

                if (row.original.LayawayID) {

                    link = `/myProfile/${userId}/layway/${TransactionID}`;
                }
                return (
                    <div className="flex space-x-2">
                        <Link to={link}>
                            <button className="btn btn-outline btn-sm">
                                <i className="fa-regular fa-eye"></i>
                            </button>
                        </Link>
                    </div>
                );
            },
        },
        {
            Header: 'Transaction ID',
            accessor: 'TransactionID',
            Cell: ({ row, value }) => {
                let TransactionID = row.original.TransactionID || row.original.LayawayID
                return TransactionID;
            },
        },
        {
            Header: 'Date Created',
            accessor: '',
            Cell: ({ row, value }) => {
                let dateCreated = row.original.Date_Modified || row.original.Date_Created
                return format(dateCreated, 'MMM dd, yyyy');
            },

        },
        {
            Header: 'Item Name',
            accessor: 'ItemName',
        },
        {
            Header: 'Amount To Pay',
            accessor: 'Price',
            Cell: ({ row }) => {
                const totalAmount = row.original.Price * row.original.Grams;
                return formatAmount(totalAmount);
            },
        },
        {
            Header: 'Status',
            accessor: 'Status',
            Cell: ({ row, value }) => {
                let Status = row.original.Status || row.original.status
                const colors = {
                    'IN_PROGRESS': 'bg-yellow-500',
                    'PAID': 'bg-green-500',
                    'COMPLETED': 'bg-blue-500',
                    'CANCELLED': 'bg-red-500',
                };
                return <StatusPill value={Status} />
            },
        },

    ], [userId]);



    let totalAmountToPay = [...orders, ...layAwayOrders]
        .filter(o => o.Status !== 'PAID')
        .reduce((acc, current) => acc + current.Price, 0);

    return (
        selectedUser ? (
            <div className="min-h-screen bg-base-200 flex items-center p-4 sm:p-8">
                <div className="card w-full max-w-7xl mx-auto shadow-xl">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-base-100 rounded-xl">
                        <div className="bg-gray-100 p-4 sm:p-6">
                            <h2 className="text-2xl font-bold mb-4">My Profile</h2>
                            <div className="bg-white shadow rounded-lg p-4 sm:p-6">
                                <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
                                    <img
                                        className="w-24 h-24 rounded-full object-cover"
                                        src="https://img.freepik.com/premium-vector/young-smiling-man-avatar-man-with-brown-beard-mustache-hair-wearing-yellow-sweater-sweatshirt-3d-vector-people-character-illustration-cartoon-minimal-style_365941-860.jpg?w=740"
                                        alt="Profile"
                                    />
                                    <div>
                                        <h2 className="text-xl font-semibold text-gray-800">{selectedUser.CustomerName}</h2>
                                        <p className="text-gray-600">{selectedUser.Facebook}</p>
                                        <p className="mt-2 text-gray-500">{selectedUser.Contact} | {selectedUser.Address}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-8 grid gap-4">
                                <div className="stats shadow">
                                    <div className="stat">
                                        <div className="stat-figure text-warning">
                                            <i className="fa-solid fa-rectangle-list fa-2xl text-green-500"></i>
                                        </div>
                                        <div className="stat-title">Total Orders</div>
                                        <div className="stat-value">{orders.length}</div>
                                    </div>
                                    <div className="stat">
                                        <div className="stat-figure text-warning">
                                            <i className="fa-solid fa-money-bill fa-2xl text-green-500"></i>
                                        </div>
                                        <div className="stat-title">To Pay</div>
                                        <div className="stat-value">{formatAmount(totalAmountToPay)}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 sm:p-6">
                            <h2 className="text-2xl font-bold mb-2">My Orders</h2>

                            <div>
                                <ul
                                    className="flex mb-0 list-none flex-wrap pt-0 pb-4 flex-row"
                                    role="tablist">
                                    <li className="mr-2 last:mr-0 flex-auto text-center">
                                        <a
                                            className={
                                                'text-xs font-bold uppercase px-5 py-3 shadow-sm rounded block leading-normal ' +
                                                (activeTab === 1
                                                    ? 'text-white bg-slate-700 rounded-lg shadow-lg'
                                                    : 'text-slate-700 bg-slate-200 shadow-md')
                                            }
                                            onClick={e => {
                                                e.preventDefault();
                                                setActiveTab(1);
                                                setOrderType('direct')
                                            }}
                                            data-toggle="tab"
                                            href="#link1"
                                            role="tablist">
                                            <i className="fa-solid fa-check-to-slot mr-2"></i>
                                            Direct
                                        </a>
                                    </li>
                                    <li className="-mb-px mr-2 last:mr-0 flex-auto text-center">
                                        <a
                                            className={
                                                'text-xs font-bold uppercase px-5 py-3 shadow-sm rounded block leading-normal ' +
                                                (activeTab === 2
                                                    ? 'text-white bg-slate-700 rounded-lg shadow-lg'
                                                    : 'text-slate-700 bg-slate-200 shadow-md')
                                            }
                                            onClick={e => {
                                                e.preventDefault();
                                                setActiveTab(2);
                                                setOrderType('layaway')
                                            }}
                                            data-toggle="tab"
                                            href="#link2"
                                            role="tablist">
                                            <i className="fa-solid fa-hourglass-half mr-2"></i>
                                            Layaway
                                        </a>
                                    </li>
                                </ul>
                            </div>


                            <div
                                className={activeTab === 1 ? 'block' : 'hidden'}
                                id="link1">
                                <div className="overflow-auto">
                                    <Table columns={columns} data={orders} />
                                </div>
                            </div>
                            <div
                                className={activeTab === 2 ? 'block' : 'hidden'}
                                id="link1">
                                <div className="overflow-auto">
                                    <Table columns={columns} data={orders} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <ToastContainer />
            </div>
        ) : (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">Unknown User</h1>
                    <p className="text-lg text-gray-600">We couldn't find the user you're looking for.</p>
                </div>
            </div>
        )
    );
}

export default ForgotPassword;
