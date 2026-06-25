"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import EditCategoryClient from "../[slug]/edit/EditCategoryClient";
import ErrorComponent from "@/components/ErrorComponent";
import Loader from "@/components/Loader";

const EditCategoryContent = () => {
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug");

  if (!slug) {
    return (
      <div className="min-h-screen flex items-center justify-center w-full">
        <ErrorComponent />
      </div>
    );
  }

  return <EditCategoryClient params={{ slug }} />;
};

const EditCategoryPage = () => (
  <Suspense fallback={<Loader />}>
    <EditCategoryContent />
  </Suspense>
);

export default EditCategoryPage;
