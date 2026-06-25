"use client";
import Link from 'next/link'
import { useParams } from 'next/navigation'
import React from 'react'  
const ServiceCard = ({data}) => {
  const { slug} = useParams()
  const categorySlug = data?.category?.slug || slug;
  const description = data?.desc || 'Trusted wedding service for Bangladeshi couples.';
  const image = data?.images || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80';
  return (
    <>
         <Link href={`/service/view?category=${encodeURIComponent(categorySlug)}&service=${encodeURIComponent(data.slug)}`}  id='service_card' className="p-4 sm:mb-0 mb-6 bg-white border border-zinc-200 rounded-md hover:border-logo transition-all duration-300 block">
        <div className="rounded-md h-64 overflow-hidden bg-zinc-100">
          
          <img alt={data?.title || 'Wedding service'} className="object-cover object-center h-full w-full hover:scale-105 transition-all duration-300" src={image} />
        </div>
        <h2 className="text-xl font-pmedium title-font text-gray-900 mt-5">{data?.title}</h2>
        <p className="text-base leading-relaxed mt-2 text-zinc-600">{description.length > 180 ? `${description.substring(0,180)}...` : description}</p>
         
            <p className='text-xl font-psmbold py-3'> BDT {Number(data?.budget || 0).toLocaleString()}/- <del className='text-red-600 text-sm'>
            {Number((data?.budget || 0) + ((data?.budget || 0)/10)).toLocaleString()}/-
              </del> </p> 
              <span className="inline-flex w-full items-center justify-center rounded bg-logo px-4 py-2 text-sm font-pmedium text-white">Book this vendor</span>
              {/* <Rating   onClick={()=>{}} emptyColor='#FF4500' className='flex' ratingValue={5} readonly  /> */}


      </Link>
     
    </>
  )
}

export default ServiceCard
