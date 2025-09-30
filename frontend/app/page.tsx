'use client'
import React from 'react'
import { useAppSelector } from '@/store/hooks'
import { selectUser } from '@/store/features/userSlice'
import Change from '@/components/Change'
import { toast } from "sonner"
const page = () => {
  const user = useAppSelector(selectUser);
  return (
    <div>
      <p>Hello {user}</p>
      <Change />
    </div>
  )
}

export default page
