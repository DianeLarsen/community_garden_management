import React from 'react'

const Login = () => {
  return (
    <div>
      <h2 className="text-xl font-bold">Login</h2>
      <form className="mt-4">
        <label className="block">
          Email:
          <input type="email" name="email" className="border p-2 w-full mt-1" />
        </label>
        <label className="block mt-4">
          Password:
          <input type="password" name="password" className="border p-2 w-full mt-1" />
        </label>
        <button type="submit" className="bg-blue-600 text-white p-2 mt-4">Login</button>
      </form>
    </div>
  )
}

export default Login
