
'use client'
import React from 'react'
import { useAppDispatch } from '@/store/hooks'
import { updateUser } from '@/store/features/userSlice'
const temp = () => {
    const dispatch = useAppDispatch();
  return (
    <div>
      <button onClick={() => {
        dispatch(updateUser("new user"));
      }}>Click here</button>
    </div>
  )
}

export default temp
