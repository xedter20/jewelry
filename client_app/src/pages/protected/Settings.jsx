import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../features/common/headerSlice';
import Settings from '../../features/layaway';
import InputText from '../../components/Input/InputText';

import Dropdown from '../../components/Input/Dropdown';
import { Formik, useField, useFormik, Form } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import checkAuth from '../../app/auth';
import { ToastContainer, toast } from 'react-toastify';
const Tab1Content = () => {

  const token = checkAuth();

  const decoded = jwtDecode(token);

  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState({});
  const fetchEmployee = async () => {
    let res = await axios({
      method: 'GET',
      url: `user/${decoded.EmployeeID}/childDetails`
    });
    let user = res.data.data;


    setSelectedEmployee(user[0]);
    setIsLoaded(true);
  };
  useEffect(() => {

    fetchEmployee();


  }, []);
  const formikConfig = (selectedEmployee) => {

    console.log({ selectedEmployee })
    return {
      initialValues: {
        type: selectedEmployee.type,
        Admin_Fname: selectedEmployee.Admin_Fname,
        Admin_Lname: selectedEmployee.Admin_Lname,
        Phone: selectedEmployee.Phone,
        Username: selectedEmployee.Username,
        Password: selectedEmployee.Password,
        BirthDate: selectedEmployee.BirthDate ? selectedEmployee.BirthDate.split('T')[0] : '', // Format as YYYY-MM-DD
      },
      validationSchema: Yup.object({
        Admin_Fname: Yup.string().required('Required'),
        Admin_Lname: Yup.string().required('Required'),
        Phone: Yup.string().required('Required'),
        Username: Yup.string().required('Required'),
        Password: Yup.string().required('Required'),
      }),
      // validateOnMount: true,
      // validateOnChange: false,
      onSubmit: async (values, { setFieldError, setSubmitting }) => {
        setSubmitting(true);

        try {


          let res = await axios({
            method: 'post',
            url: `user/editEmployee`,
            data: {
              EmployeeID: decoded.EmployeeID,
              ...values
            }
          });


        } catch (error) {
          console.log({ error });
        } finally {
        }
      }
    };
  };



  return isLoaded &&
    <div>
      <div className="p-2 space-y-4 md:space-y-6 sm:p-4">
        <Formik {...formikConfig(selectedEmployee)}>
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
            isSubmitting
          }) => {
            console.log({ Dex: values })
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

                <InputText
                  disabled

                  label="Type"
                  name="type"
                  type="text"
                  placeholder=""
                  value={values.type}
                  onBlur={handleBlur} // This apparently updates `touched`?
                />
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 ">


                  <InputText

                    label="First Name"
                    name="Admin_Fname"
                    type="text"
                    placeholder=""
                    value={values.Admin_Fname}
                    onBlur={handleBlur} // This apparently updates `touched`?
                  />
                  <InputText

                    label="Last Name"
                    name="Admin_Lname"
                    type="text"
                    placeholder=""
                    value={values.Admin_Lname}
                    onBlur={handleBlur} // This apparently updates `touched`?
                  />
                </div>
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2 ">
                  <InputText

                    label="Birth Date"
                    name="BirthDate"
                    type="date"
                    placeholder=""
                    value={values.BirthDate}
                    onBlur={handleBlur} // This apparently updates `touched`?
                  />

                  <InputText

                    label="Phone Number"
                    name="Phone"
                    type="text"
                    placeholder=""
                    value={values.Phone}
                    onBlur={handleBlur} // This apparently updates `touched`?
                  />
                </div>



                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 ">


                  <InputText

                    label="Username"
                    name="Username"
                    type="text"
                    placeholder=""
                    value={values.Username}
                    onBlur={handleBlur} // This apparently updates `touched`?
                  />
                  <InputText

                    label="Password"
                    name="Password"
                    type="text"
                    placeholder=""
                    value={values.Password}
                    onBlur={handleBlur} // This apparently updates `touched`?
                  />
                </div>
                <button
                  type="submit"
                  className={
                    'btn mt-4 shadow-lg  bg-buttonPrimary font-bold text-white'
                  }>
                  Update
                </button>
              </Form>
            );
          }}
        </Formik> </div></div>
}
const PricingTab = () => {

  const token = checkAuth();

  const decoded = jwtDecode(token);

  const [isLoaded, setIsLoaded] = useState(false);
  const [pricingSettings, setPricingSettings] = useState({}); // Changed variable name here
  const [error, setError] = useState(null); // Add error state for error handling

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
  const formikConfig = () => {


    return {
      initialValues: {
        ...pricingSettings
      },
      validationSchema: Yup.object({
        Base_Price_Brand_New: Yup.number()
          .required('Base Price for Brand New is required')
          .positive('Base Price must be a positive number'),

        Amount_Per_Gram_Brand_New: Yup.number()
          .required('Amount Per Gram for Brand New is required')
          .positive('Amount Per Gram must be a positive number')
          .test('is-greater', 'Amount Per Gram must be greater than Base Price', function (value) {
            const { Base_Price_Brand_New } = this.parent; // Access the other field
            return value > Base_Price_Brand_New; // Return true if the condition is met
          }),
        Base_Price_Subasta: Yup.number()
          .required('Base Price for Subasta is required')
          .positive('Base Price must be a positive number'),

        Amount_Per_Gram_Subasta: Yup.number()
          .required('Amount Per Gram for Subasta is required')
          .positive('Amount Per Gram must be a positive number')
          .test('is-greater', 'Amount Per Gram must be greater than Base Price', function (value) {
            const { Base_Price_Subasta } = this.parent; // Access the other field
            return value > Base_Price_Subasta; // Return true if the condition is met
          }),
      }),
      // validateOnMount: true,
      // validateOnChange: false,
      onSubmit: async (values, { setFieldError, setSubmitting }) => {
        setSubmitting(true);

        try {



          console.log({ values })
          let res = await axios({
            method: 'put',
            url: `settings/pricing/1`,
            data: {
              ...values
            }
          });

          toast.success('Updated Successfully', {
            position: 'top-right',
            autoClose: 2000,
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



  return isLoaded &&
    <div>
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
            isSubmitting
          }) => {
            console.log({ Dex: values })
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
                <h1 className="text-2xl font-bold text-orange-300">
                  Brand New
                </h1>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 ">


                  <InputText

                    label="Base Price"
                    name="Base_Price_Brand_New"
                    type="number"
                    placeholder=""
                    value={values.Base_Price_Brand_New}
                    onBlur={handleBlur} // This apparently updates `touched`?
                  />
                  <InputText

                    label="Amount Per Gram"
                    name="Amount_Per_Gram_Brand_New"
                    type="number"
                    placeholder=""
                    value={values.Amount_Per_Gram_Brand_New}
                    onBlur={handleBlur} // This apparently updates `touched`?
                  />
                </div>
                <h1 className="text-2xl font-bold text-orange-300">
                  Subasta
                </h1>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 ">


                  <InputText

                    label="Base Price"
                    name="Base_Price_Subasta"
                    type="number"
                    placeholder=""
                    value={values.Base_Price_Subasta}
                    onBlur={handleBlur} // This apparently updates `touched`?
                  />
                  <InputText

                    label="Amount Per Gram"
                    name="Amount_Per_Gram_Subasta"
                    type="number"
                    placeholder=""
                    value={values.Amount_Per_Gram_Subasta}
                    onBlur={handleBlur} // This apparently updates `touched`?
                  />
                </div>
                <button
                  type="submit"
                  className={
                    'btn mt-4 shadow-lg  bg-buttonPrimary font-bold text-white'
                  }>
                  Update
                </button>
              </Form>
            );
          }}
        </Formik> </div></div>
}
const Tab3Content = () => <div>Content for Access Control Tab 3</div>;

function InternalPage() {
  const dispatch = useDispatch();
  const [selectedTab, setSelectedTab] = useState('Account');
  const categories = {
    General: ['Account', 'Pricing', 'Notifications', 'Audit Trail'],
    'Access Control': ['Accounts', 'Record Management'],
  };

  const content = {
    Tab1: 'Accounts',
    Tab2: 'Record Management',

  };

  // Map selectedTab to the corresponding component
  const tabComponents = {
    Account: <Tab1Content />,
    Pricing: <PricingTab />,

  };


  useEffect(() => {
    dispatch(setPageTitle({ title: 'Settings' }));
  }, []);

  return <div className="flex h-screen">
    {/* Sidebar for vertical tabs */}
    <div className="w-1/4 p-4 bg-gray-50">
      <div className="space-y-4">
        {Object.entries(categories).map(([category, tabs]) => (
          <div key={category}>
            <h2 className="mb-2 font-bold text-gray-700 text-xl ">{category}</h2>
            <div className="flex flex-col space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  className={`p-2 text-left ${selectedTab === tab ? 'bg-orange-300 text-white' : 'bg-white text-gray-800'
                    } rounded-md`}
                  onClick={() => setSelectedTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Main content area */}
    <div className="w-3/4 p-4 bg-gray-50">
      <div className="text-xl font-bold">   {tabComponents[selectedTab]}</div>
    </div>
    <ToastContainer />
  </div >
}

export default InternalPage;
