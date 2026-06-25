"use client";
import React from 'react'
import { MdCallMade } from "react-icons/md";
import Typewriter from 'typewriter-effect';
import Link from 'next/link';
const HeroSection = () => {
  return (
    <>
            
          <section className="text-gray-700 body-font bg-white">
  <div className="container mx-auto flex px-5 pt-28 pb-12 lg:py-28 gap-y-8 md:flex-row flex-col-reverse items-center">
    <div className="lg:flex-grow md:w-1/2 lg:pr-24 md:pr-16 flex flex-col md:items-start md:text-left mb-16 md:mb-0 items-center text-center">
      <h1 className="title-font sm:text-4xl text-3xl mb-4 font-medium text-gray-900">
        <Typewriter
  options={{
    strings: ['Wedding Planner', 'Book Your Marriage Venue', 'Find Trusted BD Vendors'],
    autoStart: true,
    wrapperClassName:' sm:text-4xl md:text-6xl text-3xl font-pbold',
    cursorClassName:'text-logo text-4xl',
    loop: true,
  }}
/>
        <br className="hidden lg:inline-block" /> 
      </h1>
      <p className="mb-8 leading-relaxed font-pregular">WeddingSphere helps Bangladeshi couples compare venues, photographers, decorators, caterers, makeup artists, and planners in one place, then send a booking enquiry directly to the vendor.</p>
      <div className="   w-full">
        <Link href="/service" className="inline-flex text-white bg-logo border-0 py-3 px-6 focus:outline-none hover:bg-[#ff4000] rounded text-lg items-center gap-x-3"><span>Book Now</span> <MdCallMade/> </Link>
 
      </div>
    </div>
    <div className="lg:max-w-lg lg:w-full md:w-1/2 w-5/6">
      <img className="object-cover object-center rounded" alt="hero" src="https://www.athiniphotos.in/wp-content/uploads/2022/11/AP_M9190-Jaiganesh-Brindha-Engagement-scaled.jpg" />
    </div>
  </div>
</section>
    </>
  )
}

export default HeroSection
