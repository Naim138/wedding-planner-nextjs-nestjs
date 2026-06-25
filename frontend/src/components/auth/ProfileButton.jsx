import React from 'react'
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
  } from "@/components/ui/avatar"
  import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
import Link from 'next/link'
import { useMainContext } from '@/context/MainContext'
import { useSelector } from 'react-redux'
import { UserSlicePath } from "@/app/redux/slices/UserSlice"

const ProfileButton = () => {
    const user = useSelector(UserSlicePath)
    const {logoutHandler}= useMainContext()

  return (
    <>
         

                <DropdownMenu >
  <DropdownMenuTrigger >
  <Avatar className={'cursor-pointer'}>
                <AvatarImage src={user && user.avatar ? user.avatar : "https://github.com/shadcn.png"} alt={user?.name || "User Avatar"} />
                <AvatarFallback>{user?.name ? user.name.slice(0,2).toUpperCase() : "CN"}</AvatarFallback>
                </Avatar>
  </DropdownMenuTrigger>
  <DropdownMenuContent  className={''} >
    <DropdownMenuLabel>My Account</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem>
                <Link href={'/profile'}>Profile</Link>
        </DropdownMenuItem> 
        <DropdownMenuItem>
        <Link href={'/dashboard'}>Dashboard</Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={logoutHandler} className={'cursor-pointer'}>Logout</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
    </>
  )
}

export default ProfileButton