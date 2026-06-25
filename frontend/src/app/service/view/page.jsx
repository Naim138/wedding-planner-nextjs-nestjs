"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ServiceViewClient from "../[slug]/[service]/ServiceViewClient";
import ErrorComponent from "@/components/ErrorComponent";
import Loader from "@/components/Loader";

const ServiceViewContent = () => {
  const searchParams = useSearchParams();
  const slug = searchParams.get("category");
  const service = searchParams.get("service");

  if (!slug || !service) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <ErrorComponent />
      </div>
    );
  }

  return <ServiceViewClient params={{ slug, service }} />;
};

const ServiceViewPage = () => (
  <Suspense fallback={<Loader />}>
    <ServiceViewContent />
  </Suspense>
);

export default ServiceViewPage;
