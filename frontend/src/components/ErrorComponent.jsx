import React from 'react'

const ErrorComponent = ({ title = 'Something went wrong', message = 'We could not load this section. Please try again after a moment.' }) => {
  return (
    <div className="w-full min-h-[220px] bg-white border border-zinc-200 rounded-md flex flex-col items-center justify-center px-6 text-center">
      <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center text-2xl font-psmbold mb-4">!</div>
      <h3 className="text-lg font-psmbold text-zinc-900">{title}</h3>
      <p className="text-sm text-zinc-500 mt-2 max-w-md">{message}</p>
    </div>
  )
}

export default ErrorComponent
