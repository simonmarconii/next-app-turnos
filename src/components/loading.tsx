import React from 'react'

function Loading() {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-2">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#6f8f82] border-t-transparent"></div>
        <p>Cargando...</p>
    </div> 
  )
}

export default Loading