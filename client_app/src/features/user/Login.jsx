import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import LandingIntro from './LandingIntro';
import ErrorText from '../../components/Typography/ErrorText';
import InputText from '../../components/Input/InputText';
import { Formik, useField, useFormik, Form } from 'formik';
import * as Yup from 'yup';
import { mdiAccount, mdiLockOutline } from '@mdi/js';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
function Login() {
  const INITIAL_LOGIN_OBJ = {
    password: '',
    emailId: ''
  };

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loginObj, setLoginObj] = useState(INITIAL_LOGIN_OBJ);

  const updateFormValue = ({ updateType, value }) => {
    setErrorMessage('');
    setLoginObj({ ...loginObj, [updateType]: value });
  };

  const formikConfig = {
    initialValues: {
      email: '',
      password: ''
    },
    validationSchema: Yup.object({
      email: Yup.string().required('Required field'),
      password: Yup.string()
        .min(8, 'Minimun of 8 character(s)')
        .required('Required field')
    }),
    onSubmit: async (
      values,
      { setSubmitting, setFieldValue, setErrorMessage, setErrors }
    ) => {
      try {
        let res = await axios({
          method: 'POST',
          url: 'auth/login',
          data: values
        });

        let { token } = res.data;
        let user = res.data.data;

        localStorage.setItem('token', token);
        localStorage.setItem('loggedInUser', JSON.stringify(user));

        window.location.href = '/app/dashboard';
      } catch (error) {

        // console.log(error.response.data.message)
        toast.error(`Login Failed. Unknown User.`, {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: 'light'
        });
      }

      // setErrorMessage('');
      // localStorage.setItem('token', 'DumyTokenHere');
      // setLoading(false);
      // window.location.href = '/app/dashboard';
    }
  };

  return (
    // <div
    //   className={`min-h-screen bg-gray-300 flex items-center

    // `}>
    //   <ToastContainer />
    //   <div className="card mx-auto w-full max-w-2xl  shadow-xl ">
    //     <div
    //       className="grid  md:grid-cols-1 grid-cols-1  bg-base-100 rounded-xl

    //      ">
    //       <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
    //         <div className="shadow-l">
    //           {' '}
    //           <img
    //             className="mask mask-squircle w-30 h-30 mx-auto shadow-lg"
    //             src="/system_logo.jpg"
    //             alt="Amulet"
    //           />
    //         </div>
    //         <h1
    //           className="text-xl font-bold leading-tight tracking-tight
    //          text-gray-900 md:text-2xl dark:text-white text-center">
    //           Login
    //         </h1>

    //       </div>
    //     </div>
    //   </div>
    // </div>

    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Left Column for Background Image */}
      <div className="w-1/2 flex items-center justify-center bg-customBlue shadow-lg">
        <div className="w-full max-w-md p-8 space-y-6">
          <h1
            className="text-xl font-bold leading-tight tracking-tight
             text-gray-900 md:text-2xl dark:text-white text-center text-white">
            Log In
          </h1>
          <div>
            <Formik {...formikConfig}>
              {({
                handleSubmit,
                handleChange,
                handleBlur, // handler for onBlur event of form elements
                values,
                touched,
                errors
              }) => {
                return (
                  <Form className="space-y-4 md:space-y-6">
                    <InputText
                      icons={mdiAccount}
                      label="Username"
                      labelColor="text-white"
                      name="email"
                      type="text"
                      placeholder=""
                      value={values.email}
                      onBlur={handleBlur} // This apparently updates `touched`?
                    />
                    <InputText
                      icons={mdiLockOutline}
                      labelColor="text-white"
                      label="Password"
                      name="password"
                      type="password"
                      placeholder="Enter your password"
                      value={values.password}
                      onBlur={handleBlur} // This apparently updates `touched`?
                    />
                    <div class="text-right text-primary"><a href="/forgot-password"><span class="text-sm  text-white inline-block  hover:text-buttonPrimary  hover:underline hover:cursor-pointer transition duration-200">Forgot Password?</span></a></div>

                    <button
                      type="submit"
                      className={
                        'btn mt-2 w-full bg-buttonPrimary font-bold' +
                        (loading ? ' loading' : '')
                      }>
                      Sign in
                    </button>

                    {/* <div className="text-sm font-light text-gray-500 dark:text-gray-400 mt-4">
                      Don't have an account yet?
                      <Link to="/register">
                        <span className="  inline-block  hover:text-primary hover:underline hover:cursor-pointer transition duration-200">
                          Register
                        </span>
                      </Link>
                    </div> */}
                  </Form>
                );
              }}
            </Formik>
          </div>
        </div>
      </div>
      <div
        className="md:w-1/2 bg-cover bg-center h-64 md:h-auto"
        style={{
          backgroundImage: "url('/Log In Page.png')"
        }}></div>
      <ToastContainer />
    </div>
  );
}

export default Login;
