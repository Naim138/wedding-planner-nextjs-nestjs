import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const LogoComponent = () => {
  return (
    <>
     <Link href={'/'} className='inline-flex items-center'>
     <img src={'/logo.png'}  alt='WeddingSphere logo' className='h-12 w-auto object-contain sm:h-14' />
     </Link>
        </>
  )
}

export default LogoComponent
