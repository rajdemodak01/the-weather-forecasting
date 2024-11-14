import React, {useEffect, useState} from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'


export default function AuthLayout({children, authentication=true}) {
    const navigate=useNavigate()
    const [loader, setLoader]=useState(true)
    const authStatus=useSelector(state=>state.auth.status)

    useEffect(()=>{
        if(authentication && !authStatus){
            navigate('/login')
        }else if(!authentication && authStatus){
            navigate('/home')
        }
        setLoader(false)
    }, [authStatus, navigate, authentication])
  return loader? <h1>Loading...</h1>: <>{children}</>
}
