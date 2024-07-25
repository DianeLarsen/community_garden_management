import Link from "next/link";

const Footer = () => {
  return (

      <footer className="bg-blue-600 text-white p-4 text-center">
          <p>&copy; 2024 Community Garden</p>
          <p>123 Garden Lane, Monroe, WA 98272</p>
          <p>Contact us at info@communitygarden.com | (425) 555-1234</p>
          <div className="flex justify-center space-x-4 mt-2">
            <Link
              href="https://www.facebook.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Facebook
            </Link>
            <Link
              href="https://www.twitter.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Twitter
            </Link>
            <Link
              href="https://www.instagram.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Instagram
            </Link>
          </div>
        </footer>

  )
}

export default Footer
