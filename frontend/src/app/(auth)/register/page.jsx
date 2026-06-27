"use client";
import CustomButton from '@/components/CustomButton';
import { useMainContext } from '@/context/MainContext';
import { axiosClient } from '@/utils/AxiosClient';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react'
import { FaEye, FaEyeSlash } from 'react-icons/fa6';
import { toast } from 'react-toastify';
import *as yup from 'yup'

const RegisterPage = () => {
    const {fetchUserProfile } = useMainContext()

        const [isHide,setIsHide] = useState(true)
        const [loading,setIsLoading] = useState(false)
        const router = useRouter()

        const initialValues ={
            name: '',
            email: '',
            password: '',
            role:'' //user|admin|vendor
        }
        const validationSchema = yup.object({
            name: yup.string() 
             .required('Name is required'),
            email: yup.string()
             .email('Invalid email address')
             .required('Email is required'),
            password: yup.string()
             .min(8, 'Password should be at least 8 characters long')
             .required('Password is required'),
             role: yup.string()
             .oneOf(['user','vendor'],"user must a valid user or a vendor")
             .required('Role is required'),
        })
        const onSubmitHandler = async(values,helpers)=>{
            try {
                setIsLoading(true)
                const response = await axiosClient.post("/auth/register",values)
                const data = await response.data;
      
                toast.success(data.msg)
                localStorage.setItem("token",data.token)
                await fetchUserProfile()
                
                // Redirect vendors to payment page
                if (values.role === 'vendor') {
                    router.push("/payment");
                } else {
                    router.push("/dashboard");
                }

            } catch (error) {
                let errMsg = error?.response?.data?.message || error?.message || "Registration failed";
                if (error?.message === "Network Error") {
                    errMsg = "Network Error: Cannot reach server. Please check your internet connection and Server Settings.";
                }
                toast.error(errMsg)
            } finally {
                setIsLoading(false)
            }
        }
        


  return (
    <>
           <div className="flex min-h-[80vh] justify-center items-center">
         
                <Formik onSubmit={onSubmitHandler} validationSchema={validationSchema} initialValues={initialValues}>
                <Form className=" w-[96%] md:w-1/2 xl:w-1/2 2xl:w-1/3 shadow border border-tertary bg-white/5 py-10 px-10 rounded-md mx-auto ">
                        <div className="mb-3">
                            <label htmlFor="name">Name</label>
                            <Field type="text" id='name' name='name' className="w-full py-3 bg-transparant rounded-md border outline-none px-4 border-indigo-400 " placeholder='Enter Your Name' />
                            <ErrorMessage className='text-sm text-red-500' component={'p'} name='name' />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="email">Email</label>
                            <Field type="text" id='email' name='email' className="w-full py-3 bg-transparant rounded-md border outline-none px-4 border-indigo-400 " placeholder='Enter Your Email' />
                            <ErrorMessage className='text-sm text-red-500' component={'p'} name='email' />

                        </div>
                        <div className="mb-3">
                            <label htmlFor="password">Password</label>
                      <div className="flex items-center justify-center gap-x-2 border border-indigo-400 px-3 rounded-md ">
                      <Field type={isHide?"password":"text"} id='password' name='password' className="w-full py-3 bg-transparant  outline-none    " placeholder='Enter Your Password' />
                     {      
                                isHide ?  <FaEye onClick={()=>setIsHide(!isHide)} className='text-3xl text-primary' />:
                                <FaEyeSlash onClick={()=>setIsHide(!isHide)} className='text-3xl text-primary'/>
                     }
                      </div>
                      <ErrorMessage className='text-sm text-red-500' component={'p'} name='password' />

                        </div>

                        <div className="mb-3">
                            <label htmlFor="role">Role</label>
                            <Field as="select" type="text" id='role' name='role' className="w-full py-3 bg-transparant rounded-md border outline-none px-4 border-indigo-400 " >
                                <option value="">Select Role</option>
                                <option value="user">User</option>
                                <option value="vendor">Vendor</option>
                            </Field>
                            <ErrorMessage className='text-sm text-red-500' component={'p'} name='role' />

                        </div>




                        <div className="mb-3">
                            <CustomButton className={'py-4'} type="submit" isLoading={loading} label={'Register'} />
                        </div>
                        <div className="mb-3">
                            <p className="text-end text-indigo-500">
                                Already Have An Account ? <Link href={'/login'} className='text-indigo-600 font-psmbold'>Login</Link>
                            </p>
                        </div>
                        
                        <div className="mt-6 border-t border-indigo-400/20 pt-4 text-center">
                            <button
                                type="button"
                                onClick={() => {
                                    const currentUrl = localStorage.getItem("custom_api_url") || "http://192.168.1.34:5000/api/v1";
                                    const newUrl = prompt("Configure backend server URL (e.g. http://192.168.1.34:5000/api/v1):", currentUrl);
                                    if (newUrl !== null) {
                                        if (newUrl.trim() === "") {
                                            localStorage.removeItem("custom_api_url");
                                            toast.info("Reset to default server URL");
                                        } else {
                                            localStorage.setItem("custom_api_url", newUrl.trim());
                                            toast.success("Updated server URL to: " + newUrl.trim());
                                        }
                                    }
                                }}
                                className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                            >
                                ⚙️ Server Settings
                            </button>
                        </div>
                        
           </Form>
                </Formik>

           </div>
    </>
  )
}

export default RegisterPage
