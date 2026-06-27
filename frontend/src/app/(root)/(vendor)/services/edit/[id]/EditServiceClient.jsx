"use client";

import BackButton from '@/components/BackButton';
import BreadCrums from '@/components/BreadCrums';
import { ErrorMessage, Field, FieldArray, Formik } from 'formik';
import { toast } from 'react-toastify';
import * as yup from 'yup';
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { AiOutlineCloudUpload } from 'react-icons/ai';
import { RxCross2 } from 'react-icons/rx';

import CustomButton from '@/components/CustomButton';
import { GoPlus } from 'react-icons/go';
import MarkDownCustomEditor from '@/components/reuseable/MarkdownCustomEditor';
import { SectionsTitles } from '@/utils/constant.vendor';
import { CiTrash } from 'react-icons/ci';
import { useFetchAllCategoriesServiceQuery, useGetServiceByIdQuery, useUpdateServiceByIdMutation } from '@/app/redux/queries/VendorService';
import Loader from '@/components/Loader';
import ErrorComponent from '@/components/ErrorComponent';
import Image from 'next/image';

const EditServiceClient = ({ params }) => {
  const { data: service, isLoading: serviceLoading, isError } = useGetServiceByIdQuery(params.id);
  const [createMutationFunction] = useUpdateServiceByIdMutation();
  const { data: allCategories, isLoading } = useFetchAllCategoriesServiceQuery();

  if (serviceLoading) {
    return (
      <div className="min-h-[50vh] flex w-full bg-white items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-[50vh] flex w-full bg-white items-center justify-center">
        <ErrorComponent />
      </div>
    );
  }

  const initialValues = {
    category: service.category || '',
    budget: service.budget || '',
    title: service.title || '',
    desc: service.desc || '',
    images: [],
    previews_images: service.images || [],
    isPublish: service.isPublish || false,
    removed_image: [],
    sections: service.sections || [{ title: '', content: '' }],
    keywords: service.keywords || '',
  };

  const validationSchema = yup.object({
    category: yup.string().required('Please Select Valid Category'),
    budget: yup.number().required('Enter Valid Budget').min(100, 'Budget Should be greater than ₹ 100/-'),
    title: yup.string().required('Service Name is required'),
    desc: yup.string().required('Description is required'),
    image: yup.array().of(yup.mixed().required('Image is required')),
    sections: yup.array().of(
      yup.object().shape({
        title: yup.string().required('Title is required'),
        content: yup.string().required('Content is required'),
      }),
    ),
    keywords: yup.string().required('Keywords is required'),
    isPublish: yup.boolean().required('Status is Required'),
  });

  const onSubmitHandler = async (values) => {
    try {
      const updateObj = { data: {} };
      if (values?.images?.length > 0) {
        const formData = new FormData();
        formData.append('category', values.category);
        formData.append('title', values.title);
        values.removed_image.forEach((image, index) => {
          formData.append(`removed_image[${index}]`, image);
        });
        formData.append('desc', values.desc);
        formData.append('isPublish', values.isPublish);
        values.images.forEach((image) => {
          formData.append('images', image);
        });
        values.sections.forEach((section, index) => {
          formData.append(`sections[${index}][title]`, section.title);
          formData.append(`sections[${index}][content]`, section.content);
        });
        formData.append('keywords', values.keywords);
        formData.append('budget', values.budget);
        updateObj.data = formData;
      } else {
        updateObj.data = {
          ...values,
          previews_images: undefined,
        };
      }

      const { data, error } = await createMutationFunction({ id: params.id, data: updateObj.data });
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success('Data Updated');
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  return (
    <>
      <BackButton />
      <BreadCrums text={'Update Service'} />

      <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={onSubmitHandler}>
        {({ handleSubmit, values, setFieldValue }) => (
          <form onSubmit={handleSubmit} className="py-10 bg-white container rounded-md shadow px-4 xl:px-10">
            <div className="mb-3">
              <label htmlFor="category">Category <span className="text-red-500">*</span></label>
              <Field as="select" name="category" id="category" className="w-full border-primary border outline-none rounded-md px-3 py-3">
                {isLoading ? <option value="">loading...</option> : <option value="">select</option>}
                {!isLoading && allCategories && allCategories.map((cur, i) => <option key={i} value={cur._id}>{cur.name}</option>)}
              </Field>
              <ErrorMessage className="text-red-500 text-sm" component="p" name="category" />
            </div>

            <div className="mb-3">
              <label htmlFor="title">Name <span className="text-red-500">*</span></label>
              <Field name="title" id="title" className="w-full border-primary border outline-none rounded-md px-3 py-3" placeholder="Enter Service Title" />
              <ErrorMessage className="text-red-500 text-sm" component="p" name="title" />
            </div>

            <div className="mb-3">
              <label htmlFor="desc">Desc <span className="text-red-500">*</span></label>
              <Field as="textarea" name="desc" id="desc" className="w-full border-primary border outline-none rounded-md px-3 py-3" placeholder="Enter Service Description" />
              <ErrorMessage className="text-red-500 text-sm" component="p" name="desc" />
            </div>

            <div className="mb-3">
              <label htmlFor="category_image">Service Images <span className="text-red-500">*</span></label>
              <ImagePicker setFileValue={setFieldValue} values={values.images} />
            </div>

            <div className="mb-3">
              <ShowPreviewImages previews_images={values.previews_images} setFieldValue={setFieldValue} removed_image={values.removed_image} />
            </div>

            <div className="mb-3 w-full">
              <FieldArray
                name="sections"
                render={(arrayHelpers) => {
                  const sectionValues = SectionsTitles;
                  return (
                    <div>
                      <div className="flex items-center justify-between">
                        <h1 className="text-4xl font-pbold py-4">Sections</h1>
                        <button
                          disabled={values?.sections?.length >= sectionValues.length}
                          onClick={() => arrayHelpers.insert(values?.sections?.length > 0 ? values.sections.length : 0, { title: '', content: '' })}
                          type="button"
                          className="p-2 bg-indigo-600 text-3xl cursor-pointer rounded-full disabled:bg-indigo-400 text-white"
                        >
                          <GoPlus />
                        </button>
                      </div>

                      {values.sections && values?.sections?.length > 0 ? (
                        values.sections.map((section, index) => (
                          <AddSectionForm
                            key={index}
                            Titlename={`sections[${index}].title`}
                            Contentname={`sections[${index}].content`}
                            setFieldValue={setFieldValue}
                            removeHandler={() => arrayHelpers.remove(index)}
                            values={values.sections}
                            conent_default_value={section.content}
                          />
                        ))
                      ) : null}
                    </div>
                  );
                }}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="budget">Budget <span className="text-red-500">*</span></label>
              <Field name="budget" id="budget" className="w-full border-primary border outline-none rounded-md px-3 py-3" placeholder="Enter Service Budget" />
              <ErrorMessage className="text-red-500 text-sm" component="p" name="budget" />
            </div>

            <div className="mb-3">
              <label htmlFor="keywords">Keywords <span className="text-red-500">*</span></label>
              <Field name="keywords" id="keywords" className="w-full border-primary border outline-none rounded-md px-3 py-3" placeholder="Enter keywords" />
              <ErrorMessage className="text-red-500 text-sm" component="p" name="keywords" />
            </div>

            <div className="mb-3">
              <Field type="checkbox" name="isPublish" />
              <label className="ml-2">Publish</label>
            </div>

            <CustomButton type="submit" isLoading={false} label="Update Service" />
          </form>
        )}
      </Formik>
    </>
  );
};

export default EditServiceClient;

const ImagePicker = ({ setFileValue, values }) => {
  const onDrop = useCallback((files) => {
    if (files?.[0]) {
      setFileValue('images', [...values, files[0]]);
    }
  }, [setFileValue, values]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 5,
  });

  return (
    <div>
      <div {...getRootProps()} className="border border-dashed p-6 text-center cursor-pointer">
        <input {...getInputProps()} />
        <AiOutlineCloudUpload className="text-5xl mx-auto text-primary" />
        <p>{isDragActive ? 'Uploading...' : 'Drop image here'}</p>
      </div>
    </div>
  );
};

const ShowPreviewImages = ({ previews_images, setFieldValue, removed_image }) => {
  const removeImage = (image) => {
    setFieldValue('removed_image', [...removed_image, image]);
    setFieldValue('previews_images', previews_images.filter((img) => img !== image));
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      {previews_images?.map((image, index) => (
        <div key={index} className="relative">
          <Image src={image} alt="preview" width={400} height={300} className="rounded-md object-cover" />
          <button type="button" onClick={() => removeImage(image)} className="absolute top-2 right-2 bg-white rounded-full p-1">
            <RxCross2 />
          </button>
        </div>
      ))}
    </div>
  );
};

const AddSectionForm = ({ Titlename, Contentname, setFieldValue, removeHandler, values, conent_default_value }) => {
  const [value, setValue] = useState('');

  return (
    <div className="border rounded-md p-4 mb-4">
      <div className="flex justify-end">
        <button type="button" onClick={removeHandler} className="text-red-500">
          <CiTrash />
        </button>
      </div>
      <div className="mb-3">
        <label>Title</label>
        <Field name={Titlename} className="w-full border border-gray-300 rounded-md px-3 py-2" />
      </div>
      <div className="mb-3">
        <label>Content</label>
        <MarkDownCustomEditor name={Contentname} value={conent_default_value} setFieldValue={setFieldValue} />
      </div>
    </div>
  );
};