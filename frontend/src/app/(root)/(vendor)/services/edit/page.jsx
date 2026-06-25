"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import EditServiceClient from "./[id]/EditServiceClient";
import ErrorComponent from "@/components/ErrorComponent";
import Loader from "@/components/Loader";

const EditServiceContent = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  if (!id) {
    return (
      <div className="min-h-[50vh] flex w-full bg-white items-center justify-center">
        <ErrorComponent />
      </div>
    );
  }

  return <EditServiceClient params={{ id }} />;
};

const EditServicePage = () => (
  <Suspense fallback={<Loader />}>
    <EditServiceContent />
  </Suspense>
);

export default EditServicePage;
