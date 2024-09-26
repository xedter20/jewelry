import { useState, useRef, useEffect, useMemo } from 'react'
import { NavLink, Routes, Link, useLocation, useNavigate } from 'react-router-dom';
import LandingIntro from './LandingIntro'
import ErrorText from '../../components/Typography/ErrorText'
import InputText from '../../components/Input/InputText'
import TextAreaInput from '../../components/Input/TextAreaInput'
import CheckCircleIcon from '@heroicons/react/24/solid/CheckCircleIcon'
import { Formik, useField, useFormik, Form } from 'formik';
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



    const navigate = useNavigate();
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
    let transactionId = params.transactionId;


    const [selectedUser, setSelectedUser] = useState({});
    const [orders, setOrders] = useState([]);


    const [file, setFile] = useState(null);


    const handleOnChange = e => {
        console.log(e.target.files[0]);
        setFile(e.target.files[0]);
    };

    const getUser = async () => {
        let res = await axios({
            method: 'GET',
            url: `user/${userId}/findCustomer`
        });
        let [user] = res.data.data;


        setSelectedUser(user);

    };


    const fetchOrders = async () => {
        let res = await axios({
            method: 'POST',
            url: 'transactions/listOrder',
            data: {
                customerId: userId,
                transactionId

            }
        });

        let list = res.data.data;



        setSelectedOrder(list[0])
    };

    useEffect(() => {
        getUser();
        fetchOrders();

        setIsLoaded(true);
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



                        <button className="btn btn-outline btn-sm mr-2" onClick={async () => {


                            setSelectedOrder(thisOrder);

                            document.getElementById('viewReceipt').showModal();


                        }}>  <i class="fa-regular fa-eye"></i>
                        </button>

                        <button className="btn btn-outline btn-sm mr-2" onClick={async () => {


                            setSelectedOrder(thisOrder);

                            document.getElementById('paymentModal').showModal();


                        }}>  <i class="fa-regular fa-credit-card"></i>
                        </button>


                    </div >
                }
            },
        ]);


    console.log({ selectedOrder })
    let colors = {
        'IN_PROGRESS': 'bg-yellow-500',
        'PAID': 'bg-green-500',
        'COMPLETED': 'bg-blue-500',
        'CANCELLED': 'bg-red-500'
    }



    const formikConfigViewReciept = () => {


        let validation = {
            Comments: Yup.string().required('Required'),
            // Proof_Payment: Yup.string().required('Required')
        };

        let initialValues = {

            Proof_Payment: '',
            Comments: ''
        }




        return {

            initialValues: initialValues,
            validationSchema: Yup.object(validation),
            // validateOnMount: true,
            // validateOnChange: true,
            onSubmit: async (values, { setFieldError, setSubmitting, }) => {





                console.log({ file })

                if (!file) {
                    setFieldError('Proof_Payment', 'Required');
                }



                if (file && values.Comments) {
                    const data = new FormData();
                    data.append('Proof_Payment', file);
                    data.append('Comments', values.Comments);


                    data.append('TransactionID', selectedOrder.TransactionID);
                    // data.append('TransactionID', selectedOrder.TransactionID);
                    // if(file){

                    // }

                    let res = await axios({
                        // headers: {
                        //   'content-type': 'multipart/form-data'
                        // },
                        method: 'POST',
                        url: 'transactions/makePayment',
                        data
                    });



                    toast.success(`Submitted Successfully`, {
                        position: 'top-right',
                        autoClose: 3000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: 'light'
                    });

                    navigate(`/myProfile/${userId}`);
                }




            }
        }
    };

    let isPaid = selectedOrder.Status === 'PAID';
    return (
        selectedUser ? isLoaded && <div className="min-h-screen bg-base-200 flex items-center bg-customBlue shadow-lg">
            <div className="card mx-auto w-full max-w-7xl  shadow-xl">
                <div className={
                    `grid md: grid-cols-${isPaid ? `2` : `3`} grid-cols-1  bg-base-100 rounded-xl`}>
                    <div className=''>
                        {/* <LandingIntro /> */}

                        < div className=" bg-gray-100 p-2">
                            {/* Profile Header */}
                            <div className="flex items-center justify-between">
                                {/* <h2 className='text-2xl font-bold mb-4'>
                                    TO PAY</h2> */}


                                <div className={`px-2 py-1 rounded-full font-normal text-white ${colors[selectedOrder.Status]} `}>
                                    {selectedOrder.Status}
                                </div>
                            </div>




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
                    </div>


                    {
                        selectedOrder.Status === 'PAID' &&
                        <div className=" bg-gray-100 p-2">
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
                    }

                    {
                        selectedOrder.Status !== 'PAID' &&
                        <>

                            <div className='p-6 '>
                                <h2 className='text-2xl font-bold mb-2'>
                                    Step 1: Pay</h2>

                                <div className="p-2 space-y-4 md:space-y-6 sm:p-4">


                                    <div className="divider font-bold">Scan QR</div>

                                    <p className='text-center'>Please pay  <span className='font-bold text-green-500'>{formatAmount(selectedOrder.Grams * selectedOrder.Price)}
                                    </span> using the QR Code below.</p>
                                    <div className="flex justify-center items-center p-4">
                                        <div className="w-full h-1/2  text-center">
                                            <img
                                                src="/paymentMethod.png"
                                                alt="Placeholder"
                                                className="w-full h-full object-fit text-center"
                                            />
                                        </div>
                                    </div>




                                </div>
                            </div>
                            <div className='p-6 '>

                                <h2 className='text-2xl font-bold mb-2 '>
                                    Step 2: Upload Proof of Payment</h2>

                                <div className="p-2 space-y-4 md:space-y-6 sm:p-4">




                                    <Formik {...formikConfigViewReciept()}>
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


                                            return <Form className="">
                                                <div
                                                >



                                                    {/* <div
                                                className={
                                                    errors.Comments
                                                        ? `mt - 2 p - 2 border - solid border - 2 border - red - 500`
                                                        : `mt - 2 p - 2 `
                                                }> */}

                                                    <InputText

                                                        label="Upload"
                                                        name="Proof_Payment"
                                                        type="file"
                                                        accept="image/*"
                                                        placeholder=""
                                                        value={values.Proof_Payment}
                                                        onChange={(e) => {
                                                            let file = e.target.files[0];
                                                            setFile(file);

                                                            // console.log(file.name)
                                                            if (file) {
                                                                blah.src = URL.createObjectURL(file);
                                                                // setFieldValue('Proof_Payment', file);
                                                                // setFieldValue("Proof_Payment", e.currentTarget.files[0]);
                                                            }
                                                            else {
                                                                setFieldValue('Proof_Payment', '');
                                                            }

                                                        }}
                                                        onBlur={handleBlur} // This apparently updates `touched`?
                                                    />

                                                    <div class="flex justify-center items-center">


                                                        <img id="blah" alt="" preview className='object-fit h-60 w-40 ' />




                                                    </div>


                                                    {/* <div
                                                className={
                                                    errors.Comments
                                                        ? `mt - 2 p - 2 border - solid border - 2 border - red - 500`
                                                        : `mt - 2 p - 2 `
                                                }> */}
                                                    <InputText

                                                        label="Comments"
                                                        name="Comments"
                                                        type="text"
                                                        placeholder=""
                                                        value={values.Comments}

                                                        onBlur={handleBlur} // This apparently updates `touched`?
                                                    />
                                                    {/* </div> */}
                                                    <button
                                                        // type="button"
                                                        type="submit"
                                                        className={
                                                            'btn mt-4 shadow-lg w-full bg-buttonPrimary font-bold text-white' +
                                                            (loading ? ' loading' : '')
                                                        }>
                                                        Submit
                                                    </button>

                                                </div>


                                            </Form>
                                        }}
                                    </Formik>



                                </div>
                            </div>
                        </>
                    }


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