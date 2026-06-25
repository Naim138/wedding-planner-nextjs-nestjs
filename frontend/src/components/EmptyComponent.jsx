import Image from 'next/image'
import React from 'react'
import EMptyImage from '@/assets/images/empty.jpg'
const EmptyComponent = ({ title = 'Nothing to show yet', message = 'New wedding services will appear here soon.' }) => {
  return (
    <>
            <div className="min-h-[320px] col-span-full w-full bg-white border border-zinc-200 rounded-md flex-col flex items-center justify-center px-6 text-center">
                <Image src={EMptyImage} width={1000} height={1000} alt='empty-image' className='w-full max-w-[220px] mx-auto opacity-80' />
                <h3 className="mt-4 text-lg font-psmbold text-zinc-900">{title}</h3>
                <p className="mt-2 text-sm text-zinc-500 max-w-md">{message}</p>
            </div>
    </>
  )
}

export default EmptyComponent
