"use client";
import React from 'react'
import  './style.css' 
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
 

// import required modules
import { Pagination,Navigation,Autoplay } from 'swiper/modules';

const reviews = [
  {
    name: "Fatima Rahman",
    profession: "Software Engineer",
    review: "এই ওয়েডিং প্ল্যানার অ্যাপটি আমার জন্য খুবই কাজের ছিল। বাজেট ট্র্যাকিং এবং ভেন্ডর খোঁজা খুব সহজ হয়ে গেছে। আমার বিয়ের প্রস্তুতি নিয়ে অনেক স্ট্রেস কমে গেছে।",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face"
  },
  {
    name: "Rahim Ahmed",
    profession: "Business Owner",
    review: "আমি এবং আমার স্ত্রী দুজনেই এই অ্যাপ ব্যবহার করেছি। ম্যাচমেকার ফিচারটি আমাদের পছন্দ অনুযায়ী ভেন্ডর খুঁজে পেতে অনেক সাহায্য করেছে। সব মিলিয়ে একটি চমৎকার অভিজ্ঞতা।",
    image: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&h=150&fit=crop&crop=face"
  },
  {
    name: "Ayesha Begum",
    profession: "Teacher",
    review: "ভেন্ডর লিস্টিং দেখে আমি খুব খুশি হয়েছি। এখানে ভালো মানের ফটোগ্রাফার এবং ক্যাটারিং সার্ভিস পেয়েছি। দামও যুক্তিসঙ্গত ছিল। সবাইকে এই অ্যাপ ব্যবহার করার পরামর্শ দেব।",
    image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=150&h=150&fit=crop&crop=face"
  },
  {
    name: "Karim Uddin",
    profession: "Bank Manager",
    review: "বাজেট ম্যানেজমেন্ট টুলটি অসাধারণ। আমি সব খরচ ট্র্যাক করতে পেরেছি এবং শেষে বাজেটের মধ্যেই বিয়ে সম্পন্ন করতে পেরেছি। PDF রিপোর্ট ডাউনলোড করার ফিচারটিও খুব কাজের।",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face"
  },
  {
    name: "Nusrat Jahan",
    profession: "Doctor",
    review: "ম্যাচমেকার ফিচারটি আমার পছন্দের। আমার এবং আমার ফিয়ান্সের পছন্দের মিল দেখে ভেন্ডর সিলেক্ট করতে পেরেছি। অ্যাপটি খুব ইউজার ফ্রেন্ডলি এবং ডিজাইনও সুন্দর।",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face"
  }
];

const FeedbackSection = () => {
  return (
    <>
        <section id="Feedbacksection" className="text-gray-600 body-font">
  <div className="container px-5 py-24 mx-auto">
  <div className="flex flex-wrap sm:flex-row flex-col py-6 mb-12">
        <h1 className="sm:w-2/5 text-gray-900 font-psmbold title-font text-2xl mb-2 sm:mb-0">Our Reviews</h1>
       
      
      </div>
    <div className=" ">

    <Swiper
       
        slidesPerView={1} 
        breakpoints={{
            640: {
                slidesPerView: 1,
              },
            
            1024: {
                slidesPerView: 2,
              },
            
            1440: {
                slidesPerView: 3,
              },
        }}

        spaceBetween={30}
        
        autoplay={{
            delay: 2500,
            disableOnInteraction: false,
          }}
          pagination={{
            clickable: true,
            dynamicBullets:true
          }}
          loop={true}
          navigation={true}
        modules={[Pagination,Navigation,Autoplay]}
        className="mySwiper"
      >
       {
        reviews.map((review, i)=>{
            return <SwiperSlide key={i}>
                <Card review={review} />
            </SwiperSlide>
        })
       }
      </Swiper>

      
    </div>
  </div>
</section>
    </>
  )
}

export default FeedbackSection


const Card = ({review})=>{
    return <>
 <div className=" w-full">
        <div className="h-full w-full p-8 rounded bg-white shadow-sm border border-zinc-100">
          
          <p className="leading-relaxed mb-6 text-sm lg:text-base text-gray-700">{review.review}</p>
          <a className="inline-flex items-center">
            <img alt="testimonial" src={review.image} className="w-12 h-12 rounded-full flex-shrink-0 object-cover object-center border-2 border-logo" />
            <span className="flex-grow flex flex-col pl-4">
              <span className="title-font text-base lg:font-medium text-gray-900">{review.name}</span>
              <span className="text-gray-500 text-xs lg:text-sm">{review.profession}</span>
            </span>
          </a>
        </div>
      </div>
    </>
}