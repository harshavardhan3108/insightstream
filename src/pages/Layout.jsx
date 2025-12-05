import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './Home'
const Layout = () => {
  return (
    <div>
      <Routes>
        <Route path='/home/:user' element={<Home />} />
      </Routes>
    </div>
  )
}

export default Layout
