// // middleware.ts
// import { NextResponse } from 'next/server'
// import type { NextRequest } from 'next/server'

// export function middleware(request: NextRequest) {
//   // Assume a "Cookie:vercel=fast" header to be present on the incoming request
//   // Getting cookies from the request using the `RequestCookies` API
//   const cookie = request.cookies.get('nextjs')?.value
//   console.log(cookie) // => 'fast'
//   const allCookies = request.cookies.getAll()
//   console.log(allCookies) // => [{ name: 'vercel', value: 'fast' }]

//   response.cookies.has('nextjs') // => true
//   response.cookies.delete('nextjs')
//   response.cookies.has('nextjs') // => false

//   // Setting cookies on the response using the `ResponseCookies` API
//   const response = NextResponse.next()
//   response.cookies.set('vercel', 'fast')
//   response.cookies.set({
//     name: 'vercel',
//     value: 'fast',
//     path: '/test',
//   })
//   const cookie = response.cookies.get('vercel')
//   console.log(cookie) // => { name: 'vercel', value: 'fast', Path: '/test' }
//   // The outgoing response will have a `Set-Cookie:vercel=fast;path=/test` header.

//   return response
// }