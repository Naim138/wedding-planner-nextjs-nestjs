"use client";
import Link from 'next/link';
import React, { useEffect, useState } from 'react'
import { Sidebar, Menu, MenuItem, SubMenu } from 'react-pro-sidebar';
import { IoIosArrowForward } from "react-icons/io";

import {MdOutlineContactSupport, MdOutlineSpaceDashboard, MdOutlinePerson, MdOutlineCategory, MdOutlineExplore} from 'react-icons/md'
import { usePathname, useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { SidebarSlicePath, toggleCollapse, toggleSidebar } from '../redux/slices/SidebarSlice';
import { UserSlicePath } from '../redux/slices/UserSlice';
import Loader from '@/components/Loader';
import { VscFeedback } from "react-icons/vsc";
import { IoHeartOutline, IoListOutline, IoCardOutline, IoAddCircleOutline } from "react-icons/io5";

import { GoGear } from "react-icons/go";

const CustomMenuItem = ({title,link,Icon})=>{
    const pathname = usePathname()
    return (
        <MenuItem
        active={pathname===link}
        style={{
            backgroundColor:pathname ===link?'#3f00ff':'',
            borderRadius:'5px',
            color:pathname === link?'white':'black',
            textDecoration:'none',
            padding:'10px 15px',
            transition:'background-color 0.3s ease',
            fontFamily:'Poppins-Medium'
    

        }}
        component={<Link href={link}/>} icon={<Icon className="text-3xl" />} >
                {title}
         
        </MenuItem>
    )
}

const RootTemplalate = ({children}) => {

  const {isToggle,isCollapsed} = useSelector(SidebarSlicePath)
  const user = useSelector(UserSlicePath)
  const dispatch = useDispatch()
  const [loading,setLoading] = useState(true)
  const router = useRouter()

  useEffect(()=>{
    if(user && user.email){
      setLoading(false) 
    }else{
      router.push("/login")
    }
  },[user])

  if(loading){
    return <div className='min-h-screen w-full flex items-center justify-center'>
      <Loader/>
    </div>
  }


  return (
    <>
            <section className="flex items-start gap-x-4">

              <aside className='relative'>
              <Sidebar breakPoint='lg' collapsed={isCollapsed} toggled={isToggle} 
                onBackdropClick={()=>dispatch(toggleSidebar())}
              >
  <Menu className='min-h-screen py-10 bg-whitesmoke'>
    {/* <SubMenu label="Charts">
      <MenuItem> Pie charts </MenuItem>
      <MenuItem> Line charts </MenuItem>
    </SubMenu> */}
    <CustomMenuItem Icon={MdOutlineSpaceDashboard } link={'/dashboard'} title={'Dashboard'} />  
    <CustomMenuItem Icon={MdOutlinePerson} link={'/profile'} title={'Profile'} />
    <CustomMenuItem Icon={MdOutlineExplore} link={'/service'} title={'Browse Services'} />
    <CustomMenuItem Icon={MdOutlineCategory} link={'/all-categories'} title={'All Categories'} />


            {user &&user?.role ==="user" ?<>
              <UserMenus/>
            </>: 
            user &&user?.role ==="admin"?<>
              <AdminMenus/>
            </>:
            user &&user?.role ==="vendor"?<>
                <VendorMenus/>
            </>:
            <>

            </>
            
            } 



  </Menu>
</Sidebar>
<button onClick={()=>dispatch(toggleCollapse())} className={`  
  p-1 text-xl border-black text-black border z-10 rounded-full absolute right-0 top-0 ${!isCollapsed?'rotate-180':''}
  `}>
  <IoIosArrowForward/> 
</button>
              </aside>

            <main className='w-full'>{children}</main>
            </section>
    </>
  )
}

export default RootTemplalate


const UserMenus=()=>{
  return <>
  <CustomMenuItem link={'/my-enquiries'} title={'My Enquiries'}  Icon={MdOutlineContactSupport }/>
  <CustomMenuItem link={'/checklist'} title={'Checklist'}  Icon={IoListOutline }/>
  <CustomMenuItem link={'/budget'} title={'Budget Tracker'}  Icon={IoCardOutline }/>
  <CustomMenuItem link={'/matchmaker'} title={'AI Matchmaker'}  Icon={IoHeartOutline }/>
  </>
}
const AdminMenus=()=>{
 return  <>
  <CustomMenuItem link={'/categories'} title={'Categories'}  Icon={GoGear }/>
  <CustomMenuItem link={'/categories/create'} title={'Create Category'}  Icon={IoAddCircleOutline }/>
  <CustomMenuItem link={'/admin/users'} title={'Manage Users'}  Icon={MdOutlinePerson}/>
  <CustomMenuItem link={'/admin/services'} title={'Manage Services'}  Icon={GoGear}/>
  <CustomMenuItem link={'/admin/enquiries'} title={'Manage Enquiries'}  Icon={MdOutlineContactSupport}/>
  </>
}
const VendorMenus=()=>{
 return  <>
  <CustomMenuItem link={'/services'} title={'Services'}  Icon={GoGear }/>
  <CustomMenuItem link={'/services/create'} title={'Create Service'}  Icon={IoAddCircleOutline }/>
  <CustomMenuItem link={'/queries'} title={'Queries'}  Icon={MdOutlineContactSupport  }/>
 
 </>
}
