import React, { useState } from 'react'
import { createContext } from "react";

    export const AtricleContext = createContext();

    const usersApi = "http://localhost:3000/users"
    const mediaApi = ""
const ArticleContext = () => {
    const [article,setArticle] = useState([]);
  return (
    <div>
      
    </div>
  )
}

export default ArticleContext
