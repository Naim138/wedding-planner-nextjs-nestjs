"use client";

import React from 'react';
import ServiceSlider from './__+(components)/Slider';
import MarkdownViewCompoents from '@/components/reuseable/MarkdownViewComponents';
import EnquieryForm from './__+(components)/EnquieryForm';
import { FaPhone } from 'react-icons/fa6';
import { useGetServiceBySlugQuery } from '@/app/redux/queries/PublicQuery';
import Loader from '@/components/Loader';
import ErrorComponent from '@/components/ErrorComponent';
import DefaultPic from '@/assets/images/default_icon.avif';
import Image from 'next/image';

const ServiceViewClient = ({ params }) => {
  const { slug, service } = params;
  const { data, isLoading, isError } = useGetServiceBySlugQuery({
    category: slug,
    service,
  });

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <ErrorComponent />
      </div>
    );
  }

  return (
    <>
      <div className="py-10 w-full">
        <ServiceSlider images={data.images} />
      </div>
      <div className="container mx-auto py-10 grid lg:grid-cols-3 gap-y-7 items-start relative">
        <div className="col-span-1 lg:col-span-2">
          <section className="pb-8 px-4">
            <p className="text-sm font-pmedium text-logo uppercase tracking-wider">Booking package</p>
            <h1 className="text-3xl font-psmbold text-zinc-950 mt-2">{data.title}</h1>
            <p className="text-zinc-600 mt-3 leading-relaxed">{data.desc}</p>
            <p className="text-2xl font-psmbold text-zinc-950 mt-4">BDT {Number(data.budget || 0).toLocaleString()}/-</p>
          </section>
          {data.sections && data.sections.length > 0 &&
            data.sections.map((cur, i) => (
              <section key={i} className="pb-10 px-4">
                <h2 className="text-2xl font-psmbold py-4">{cur.title}</h2>
                <MarkdownViewCompoents data={cur.content} />
              </section>
            ))}
        </div>
        <div className="col-span-1 lg:sticky lg:top-24">
          <EnquieryForm serviceId={data._id} />

          <div className="mt-3">
            <div className="card border w-[98%] lg:w-[90%] mx-auto rounded-sm py-4 flex items-start justify-between bg-white px-3 gap-x-3">
              <div className="w-[20%]">
                <Image
                  alt="vendor image"
                  width={1000}
                  height={1000}
                  src={data.user.avatar || DefaultPic}
                  className="rounded-full"
                />
              </div>
              {data.user && (
                <div className="w-full">
                  <h3>{data?.user?.name}</h3>
                  <h3 className="text-sm font-pmedium text-zinc-500">{data?.user?.email}</h3>
                  {data?.user?.phone_no ? (
                    <a
                      href={`tel:${data?.user?.phone_no}`}
                      className="bg-logo w-full flex items-center justify-center gap-x-2 py-2 mt-3 text-white"
                    >
                      <span>Call Now</span>
                      <FaPhone className="text-xl" />
                    </a>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ServiceViewClient;
