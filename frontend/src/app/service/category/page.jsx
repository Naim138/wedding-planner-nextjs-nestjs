"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import AllServicesBySlugClient from "../[slug]/AllServicesBySlugClient";
import ErrorComponent from "@/components/ErrorComponent";
import Loader from "@/components/Loader";

const ServiceCategoryContent = () => {
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug");

  if (!slug) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <ErrorComponent />
      </div>
    );
  }

  return <AllServicesBySlugClient params={{ slug }} />;
};

const ServiceCategoryPage = () => (
  <Suspense fallback={<Loader />}>
    <ServiceCategoryContent />
  </Suspense>
);

export default ServiceCategoryPage;
