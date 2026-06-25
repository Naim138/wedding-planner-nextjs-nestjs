"use client";

import BackButton from "@/components/BackButton";
import BreadCrums from "@/components/BreadCrums";
import { ErrorMessage, Field, Formik } from "formik";
import { toast } from "react-toastify";
import * as yup from "yup";
import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { AiOutlineCloudUpload } from "react-icons/ai";
import { RxCross2 } from "react-icons/rx";

import CustomButton from "@/components/CustomButton";
import {
  useEditCategoryMutation,
  useGetCategoryQuery,
} from "@/app/redux/queries/AdminCategory";

import Loader from "@/components/Loader";
import ErrorComponent from "@/components/ErrorComponent";
import Image from "next/image";

const EditCategoryClient = ({ params }) => {
  const slug = params?.slug;

  const [editCategoryFn, EditCategoryResponse] = useEditCategoryMutation();

  const { data, isLoading, isError } = useGetCategoryQuery(slug, {
    skip: !slug,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center w-full">
        <Loader />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center w-full">
        <ErrorComponent />
      </div>
    );
  }

  const initialValues = {
    name: data?.name || "",
    desc: data?.desc || "",
    image: null,
    preview_image: data?.image?.image_uri || "",
    status: data?.isPublic || false,
  };

  const validationSchema = yup.object({
    name: yup.string().required("Name is required"),
    desc: yup.string().required("Description is required"),
    image: yup.mixed().nullable(),
    status: yup.boolean().required("Status is Required"),
  });

  const onSubmitHandler = async (values) => {
    try {
      let payload;

      if (values.image) {
        const formData = new FormData();
        formData.append("name", values.name);
        formData.append("desc", values.desc);
        formData.append("image", values.image);
        formData.append("status", values.status);

        payload = formData;
      } else {
        payload = {
          ...values,
          preview_image: undefined,
        };
      }

      const { data: res, error } = await editCategoryFn({
        id: data._id,
        data: payload,
      });

      if (error) {
        toast.error(error?.data?.message || "Error");
        return;
      }

      toast.success(res?.msg || "Updated successfully");
    } catch (err) {
      toast.error(err?.message || "Something went wrong");
    }
  };

  return (
    <>
      <BackButton />
      <BreadCrums text={"Edit Category"} />

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={onSubmitHandler}
        enableReinitialize
      >
        {({ handleSubmit, values, setFieldValue }) => (
          <form
            onSubmit={handleSubmit}
            className="py-10 bg-white container rounded-md shadow px-4 xl:px-10"
          >
            <div className="mb-3">
              <label>
                Name <span className="text-red-500">*</span>
              </label>
              <Field
                name="name"
                className="w-full border border-primary rounded-md px-3 py-3"
              />
              <ErrorMessage
                name="name"
                component="p"
                className="text-red-500 text-sm"
              />
            </div>

            <div className="mb-3">
              <label>
                Desc <span className="text-red-500">*</span>
              </label>
              <Field
                as="textarea"
                name="desc"
                className="w-full border border-primary rounded-md px-3 py-3"
              />
              <ErrorMessage
                name="desc"
                component="p"
                className="text-red-500 text-sm"
              />
            </div>

            <div className="mb-3">
              <label>Category Image</label>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <ImagePicker
                  setFieldValue={setFieldValue}
                  value={values.image}
                />

                {values.preview_image && (
                  <div className="h-[20vh]">
                    <Image
                      src={values.preview_image}
                      alt="preview"
                      width={500}
                      height={500}
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="mb-3">
              <Field type="checkbox" name="status" />
              <label className="ml-2">Category Status</label>
            </div>

            <CustomButton
              type="submit"
              isLoading={EditCategoryResponse.isLoading}
              label="Edit Category"
            />
          </form>
        )}
      </Formik>
    </>
  );
};

export default EditCategoryClient;

const ImagePicker = ({ setFieldValue, value }) => {
  const onDrop = useCallback((files) => {
    if (files?.[0]) {
      setFieldValue("image", files[0]);
    }
  }, [setFieldValue]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: {
      "image/*": [".jpg", ".jpeg", ".png", ".svg"],
    },
  });

  const removeImage = () => {
    setFieldValue("image", null);
  };

  return (
    <div>
      {value ? (
        <div className="relative w-full flex justify-center">
          <img
            src={URL.createObjectURL(value)}
            alt="upload"
            className="w-full h-[250px] object-contain rounded-md border"
          />
          <button
            type="button"
            onClick={removeImage}
            className="absolute top-2 right-2 bg-white rounded-full p-1 shadow"
          >
            <RxCross2 />
          </button>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className="w-full h-[250px] border border-dashed border-gray-400 rounded-md flex flex-col items-center justify-center cursor-pointer"
        >
          <input {...getInputProps()} />
          <AiOutlineCloudUpload className="text-3xl mb-2" />
          <p className="text-center text-sm text-gray-500">
            {isDragActive ? "Drop the image here" : "Drag & drop or click to upload"}
          </p>
        </div>
      )}
    </div>
  );
};