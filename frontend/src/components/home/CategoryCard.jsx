import Link from 'next/link'
import React from 'react'


const CategoryCard =({data})=>{
    const description = data?.desc || 'Browse trusted wedding vendors in this category.';
    const image = data?.image?.image_uri || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80';
    return <Link href={`/service/category?slug=${encodeURIComponent(data.slug)}`} className="p-3 xl:p-4 w-full bg-white rounded-md hover:shadow transition-all duration-300 border border-zinc-200 hover:border-logo cursor-pointer">
    <div className="h-full flex flex-col items-center text-center">
      <img alt={data?.name || 'Wedding category'} className="flex-shrink-0 rounded-md w-full h-56 object-cover object-center mb-4" src={image} />
      <div className="w-full">
        <h2 className="title-font text-lg text-gray-900 capitalize font-pmedium">{data.name}</h2>
        {/* <h3 className="text-gray-500 mb-3">UI Developer</h3> */}
        <p className="mb-4 text-start text-zinc-600">{description.length > 100 ? `${description.substring(0,100)}...` : description}</p>
       
      </div>
    </div>
  </Link>
}
export default CategoryCard
