"use client";
import { UserSlicePath } from '@/app/redux/slices/UserSlice';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { PiPencilSimple } from "react-icons/pi";
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import * as yup from 'yup'
import { IoCloudUploadOutline } from "react-icons/io5";
import DefaultPic from '@/assets/images/default_icon.avif'


import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import CustomButton from '@/components/CustomButton';
import { axiosClient } from '@/utils/AxiosClient';
import { CgSpinner } from 'react-icons/cg';
import { IoCallOutline, IoLocationOutline, IoMailOutline, IoPersonOutline } from 'react-icons/io5';
import Image from 'next/image';
import { useMainContext } from '@/context/MainContext';
const ProfilePage = () => {
    const user = useSelector(UserSlicePath)
    const {fetchUserProfile}= useMainContext()
    const [loading,setLoading] = useState(false)

    const initialValues = {
        name: user.name || '',
        gender: user.gender || '',
        bio: user.bio || '',
        phone_no:user.phone_no||'',
        address:{
            street:user.address?.street|| '',
            landmark: user.address?.landmark||'',
            pincode: user.address?.pincode||'',
        }

    }

    const validationSchema = yup.object({
        name: yup.string().required('Name is required'),
        gender: yup.string().required('Gender is required'),
        bio: yup.string().required('Bio is required'),
        address: yup.object().shape({
            street: yup.string().required('Street is required'),
            landmark: yup.string().required('Landmark is required'),
            pincode: yup.string().required('Pin Code is required'),  
        }),
        phone_no: yup.string().matches(/^(\+?8801|01)[3-9]\d{8}$/, {
            message: 'Invalid Bangladeshi mobile number',
            type: 'pattern',
        }).required("Mobile Number is Required")

    });

    const onBasicProfileUpdateHandler = async(values, helpers) => {
        try {
            
            setLoading(true)
            const response = await  axiosClient.put("/auth/update-profile",values,{
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            })

            const data = await response.data
            toast.success(data.msg)
            await fetchUserProfile()

        } catch (error) {
            toast.error(error.response.data.message || error.message)
        }finally{
            setLoading(false)
        }
    }
    return (
        <>

            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                    <aside className="bg-white border border-zinc-200 rounded-md p-6 lg:sticky lg:top-24">
                        <ImageUpdateComponent />
                        <div className="mt-6 text-center">
                            <h1 className="text-2xl font-psmbold text-zinc-950">{user.name || 'WeddingSphere Member'}</h1>
                            <p className="text-sm text-zinc-500 mt-1 capitalize">{user.gender || 'Profile type not selected'}</p>
                        </div>
                        <div className="mt-6 space-y-3 text-sm">
                            <ProfileInfo icon={<IoMailOutline />} label={user.email || 'No email found'} />
                            <ProfileInfo icon={<IoCallOutline />} label={user.phone_no || 'Add a Bangladeshi mobile number'} />
                            <ProfileInfo icon={<IoLocationOutline />} label={user.address?.street ? `${user.address.street}, ${user.address.landmark || ''}` : 'Add your city or area'} />
                            <ProfileInfo icon={<IoPersonOutline />} label={user.bio || 'Write a short profile bio so vendors can understand your wedding needs.'} />
                        </div>
                    </aside>

                <div className="w-full py-8 bg-white border border-zinc-200 rounded-md lg:col-span-2">
                    <div className="w-[92%] mx-auto mb-6">
                        <p className="text-sm font-pmedium text-logo uppercase tracking-wider">Profile section</p>
                        <h2 className="text-2xl font-psmbold text-zinc-950 mt-1">Personal and contact details</h2>
                        <p className="text-sm text-zinc-500 mt-2">Keep this complete so vendors can respond to booking requests quickly.</p>
                    </div>

                    <Formik onSubmit={onBasicProfileUpdateHandler} validationSchema={validationSchema} initialValues={initialValues}>
                        {({ handleSubmit, values, setFieldValue }) => (
                            <form onSubmit={handleSubmit} className='w-[92%] mx-auto grid grid-cols-1 md:grid-cols-2 gap-x-4'>
                                <div className="mb-3">
                                    <label htmlFor="name">Name <span className="text-red-500">*</span> </label>
                                    <Field name="name" id="name" type="text" className="w-full py-2 px-4 bg-transaparant border outline-none rounded-md" placeholder='Enter Your Name' />
                                    <ErrorMessage className='text-sm text-red-500' name='name' component={'p'} />
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="email">Email <span className="text-red-500">*</span> </label>
                                    <input id="email" type="email" readOnly defaultValue={user.email} className="w-full py-2 px-4 bg-transaparant border outline-none rounded-md" placeholder='Enter Your Email' />
                           

                                </div>

                                <div className="mb-3">
                                    <label htmlFor="phone_no">Mobile No <span className="text-red-500">*</span> </label>
                                    <Field name="phone_no" id="phone_no" type="text" className="w-full py-2 px-4 bg-transaparant border outline-none rounded-md" placeholder='01XXXXXXXXX' />

                                    <ErrorMessage className='text-sm text-red-500' name='phone_no' component={'p'} />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="gender">Gender <span className="text-red-500">*</span> </label>
                                    <Select onValueChange={(gender) => setFieldValue('gender', gender)} defaultValue={values.gender} >
                                        <SelectTrigger className="w-full py-2 px-4 bg-transaparant border outline-none rounded-md">
                                            <SelectValue placeholder="Select Gender" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="male">Male</SelectItem>
                                            <SelectItem value="female">Female</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <ErrorMessage className='text-sm text-red-500' name='gender' component={'p'} />
                                </div>

                                <div className="mb-3 md:col-span-2">
                                    <label htmlFor="bio">Bio <span className="text-red-500">*</span> </label>

                                    <Textarea
                                        id="bio"
                                        placeholder="Describe yourself in simple words"
                                        className="resize-none w-full py-2 px-4 bg-transaparant border outline-none rounded-md "
                                        onChange={(e) => setFieldValue("bio", e.target.value)}
                                        value={values.bio}
                                    />
                                </div>

                                        <div className="mb-3">
                                    <label htmlFor="street">Area / Street <span className="text-red-500">*</span> </label>
                                    <Field
                                        id="street"
                                        placeholder="Enter Your Street"
                                        className="resize-none w-full py-2 px-4 bg-transaparant border outline-none rounded-md " 
                                        name="address.street"  
                                    />
                                    <ErrorMessage className='text-sm text-red-500' name='address.street' component={'p'} />

                                        </div>

                                        <div className="mb-3">
                                    <label htmlFor="pincode">Postal Code <span className="text-red-500">*</span> </label>
                                    <Field
                                        id="pincode"
                                        placeholder="Enter Your Pin Code"
                                        className="resize-none w-full py-2 px-4 bg-transaparant border outline-none rounded-md " 
                                        name="address.pincode"  
                                    />
                                    <ErrorMessage className='text-sm text-red-500' name='address.pincode' component={'p'} />

                                        </div>

                                        <div className="mb-3">
                                    <label htmlFor="landmark">City / Landmark <span className="text-red-500">*</span> </label>
                                    <Field
                                        id="landmark"
                                        placeholder="Enter Your Landmark"
                                        className="resize-none w-full py-2 px-4 bg-transaparant border outline-none rounded-md " 
                                        name="address.landmark"  
                                    />
                                    <ErrorMessage className='text-sm text-red-500' name='address.landmark' component={'p'} />

                                        </div>


                                <div className="mb-3 md:col-span-2">
                                    <CustomButton isLoading={loading} label={'Update Profile'} />
                                </div>
                            </form>
                        )}
                    </Formik>

                </div>
                </div>

            </div>

        </>
    )
}

export default ProfilePage

const ProfileInfo = ({ icon, label }) => (
    <div className="flex items-start gap-x-3 rounded-md bg-zinc-50 px-3 py-3 text-zinc-700">
        <span className="mt-0.5 text-lg text-logo">{icon}</span>
        <span className="leading-relaxed">{label}</span>
    </div>
)


const ImageUpdateComponent = () => {


    const [image, setImage] = useState(null);
    const [loading,setLoading] = useState(false)
    const user = useSelector(UserSlicePath)
    const {fetchUserProfile} = useMainContext()
        console.log(user)
    const updateProfleAvatar =async(file)=>{
        try {
            setLoading(true)
            const form_data  = new FormData()
            form_data.append('image', file)
            const response = await axiosClient.put("/auth/update-avatar",form_data,{
                headers:{
                    Authorization:`Bearer ${localStorage.getItem("token") || ''}`
                },
            })

            const data = await response.data 
            toast.success(data.msg)
            await fetchUserProfile()

        } catch (error) {
                toast.error( error.response.data.message ||error.message)
        }finally{
            setLoading(false)
        }
    }

    const onDrop = useCallback(acceptedFiles => {
        if (acceptedFiles[0]) {
            setImage(acceptedFiles[0]);
            updateProfleAvatar(acceptedFiles[0])

        }
        // Do something with the files
    }, [])
    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })
    return <>

       {loading ? <>
                <div className="w-[200px] mx-auto py-10  h-[200px] rounded-full ">
                        <CgSpinner className='animate-spin text-8xl' />

                </div>
       </>: <div {...getRootProps()} className='w-[200px] mx-auto '>
            <input {...getInputProps()} />
            {


                image ? 
                <div className="relative mx-auto  w-[200px] h-[200px] object-cover  ">
                    <img src={URL.createObjectURL(image)} className=' object-cover w-full h-full rounded-full mx-auto' alt="profile avatar" />
                    <button className='bottom-[15px] right-0 absolute text-xl p-2 shadow text-black bg-white  rounded-full'>
                        <PiPencilSimple />
                    </button>
                </div> : 

                    isDragActive ?  <div className="flex items-center rounded-full mx-auto shadow  flex-col justify-center w-[200px] h-[200px] object-cover ">
                    <IoCloudUploadOutline className="text-8xl text-gray-500" />
                    <p className="mt-2 text-gray-700 text-sm">Drag and drop  </p>
                </div> : 
                <div className="relative mx-auto  w-[200px] h-[200px] object-cover  ">
                <Image width={1000} height={1000}  src={user && user.avatar ?user.avatar : DefaultPic} className=' object-cover w-full h-full rounded-full mx-auto' alt="Profile Pic" />
                <button className='bottom-[15px] right-0 absolute text-xl p-2 shadow text-black bg-white  rounded-full'>
                    <PiPencilSimple />
                </button>
            </div>


              
 
      }
        </div>}

    </>
}
