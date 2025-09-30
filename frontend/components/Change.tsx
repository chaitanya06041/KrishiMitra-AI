import React from 'react'

import { useAppDispatch } from '@/store/hooks'
import { updateUser } from '@/store/features/userSlice'
import { toast } from "sonner"
const Change = () => {
    const dispatch = useAppDispatch();
  return (
    <div>
      <button onClick={() => {
        dispatch(updateUser("new user"));
        toast.success("User updated successfully!", {
          duration: 2000
        });
      }}>Click here</button>
    </div>
  )
}

export default Change
