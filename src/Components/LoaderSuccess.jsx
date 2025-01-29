import React from 'react'
import '../Styles/stylesLoaderSuccess.css'

const LoaderSuccess = ({loaderMessageSuccess,text}) => {
  return (
    <>
    {
        loaderMessageSuccess && (
          <div className='loaderSucces'>
            <span>{text}</span>
            <div className="loader-success-register"></div>    
            </div>
        )
      }
    </>
  )
}

export default LoaderSuccess