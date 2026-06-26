"use client";
import BackButton from '@/components/BackButton'
import BreadCrums from '@/components/BreadCrums'
import { ErrorMessage, Field, Formik } from 'formik' 
import { toast } from 'react-toastify'
import * as yup from 'yup'
import React, {useCallback, useState} from 'react'
import {useDropzone} from 'react-dropzone'
import { AiOutlineCloudUpload } from "react-icons/ai";
import { RxCross2 } from "react-icons/rx";

import CustomButton from '@/components/CustomButton';
import { useCreateCategoryMutation } from '@/app/redux/queries/AdminCategory';

const CategoryCreatePage = () => {
  const [createCategory, createCategoryResponse] = useCreateCategoryMutation()

  const initialValues = {
    name:'',
    desc:'',
    image:null
  }

  const validationSchema = yup.object({
    name: yup.string().required('Name is required'),
    desc: yup.string().required('Description is required'),
    image: yup.mixed().required('Image is required')
  });

  const onSubmitHandler = async(values,helpers)=>{
    try {
      const formData = new FormData()
      formData.append('name', values.name)
      formData.append('desc', values.desc)
      formData.append('image', values.image)

      const data = await createCategory(formData).unwrap()
      toast.success(data.msg)

      helpers.resetForm()
    } catch (error) {
        toast.error(error?.data?.message || error?.message || 'Failed to add category')
    } finally {
      helpers.setSubmitting(false)
    }
  }

  return (
    <>
        <BackButton/>

        <BreadCrums text={'Add Category'} />


    <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={onSubmitHandler}
    >

          {({handleSubmit,values,setFieldValue})=>(
             <form onSubmit={handleSubmit} className="py-10 bg-white container rounded-md shadow px-4 xl:px-10"> 

             <div className="mb-3">
                    <label htmlFor="name">Name <span className="text-red-500">*</span></label>
                    <Field name="name" id="name" className="w-full border-primary border outline-none rounded-md px-3 py-3" placeholder="Enter Category Name" />
                    <ErrorMessage className='text-red-500 text-sm ' component={'p'} name='name' />
             </div>

             <div className="mb-3">
                    <label htmlFor="desc">Desc <span className="text-red-500">*</span></label>
                    <Field as="textarea" name="desc" id="desc" className="w-full border-primary border outline-none rounded-md px-3 py-3" placeholder="Enter Category Description" />
                    <ErrorMessage className='text-red-500 text-sm ' component={'p'} name='desc' />
             </div>   

             <div className="mb-3">
             <label htmlFor="category_image">Category Image <span className="text-red-500">*</span></label>

              <ImagePicker setFileValue={setFieldValue}  values={values.image} />
              <ErrorMessage className='text-red-500 text-sm ' component={'p'} name='image' />
             </div>
             <div className="mb-3">
              <CustomButton type="submit" isLoading={createCategoryResponse.isLoading} label={'Add Category'} />
             </div>

             
             
             </form>
          )}
   
    </Formik>

    </>
  )
}

export default CategoryCreatePage

const ImagePicker = ({setFileValue,values})=>{
  // const [image,setImage] = useState(null)
  const onDrop = useCallback(acceptedFiles => {
    // Do something with the files
   if(acceptedFiles[0]){
    // setImage(acceptedFiles[0])
    setFileValue('image',acceptedFiles[0])
   }
  }, [setFileValue])
  const {getRootProps, getInputProps, isDragActive} = useDropzone({
    onDrop,
    maxFiles:1,
    accept: {
      'image/*':['.jpg','.png','.jpeg','.svg']
    }
  })


  const onDeleteImage =()=>{
    // setImage(null)
    setFileValue('image',null)
  }
  return <>
    {values? <>    
            <div className=" w-[90%] xl:1/2 2xl:w-1/3 mx-auto   py-3 flex items-center justify-center relative">
                <img src={URL.createObjectURL(values)} alt="" />
                <button type="button" onClick={onDeleteImage} className='text-4xl p-3 text-black bg-white rounded-full shadow absolute top-[12px] right-[-4px] cursor-pointer'><RxCross2/></button>
            </div>
    </>: <div {...getRootProps()} className='w-full py-10 border border-dashed border-primary flex items-center justify-center flex-col'>
      <input {...getInputProps()} />
      {
        isDragActive ?
         <>
  <AiOutlineCloudUpload className='text-7xl text-primary'/>
  <p>uploading...</p>
         </> :
         <AiOutlineCloudUpload className='text-7xl text-primary'/>

      }
    </div>}
  </>
}
