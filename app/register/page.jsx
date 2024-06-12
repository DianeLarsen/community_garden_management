import React from 'react'

const Register = () => {
  return (
    <div>
       <h2 className="text-xl font-bold">Register</h2>
      <form className="mt-4">
        <label className="block">
          Name:
          <input type="text" name="name" className="border p-2 w-full mt-1" />
        </label>
        <label className="block mt-4">
          Email:
          <input type="email" name="email" className="border p-2 w-full mt-1" />
        </label>
        <label className="block mt-4">
          Password:
          <input type="password" name="password" className="border p-2 w-full mt-1" />
        </label>
        <button type="submit" className="bg-blue-600 text-white p-2 mt-4">Register</button>
      </form>
    </div>
  )
}

export default Register
