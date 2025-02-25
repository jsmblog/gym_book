
const CurrentYear = new Date().getFullYear();
import '../Styles/stylesFooter.css'
const Footer = () => {
  return (
    <>
        <footer className="footer back-blue-dark">
            <p>© {CurrentYear} All rights reserved</p>
            <p>Developed with ❤️ by <a id='link-my-portfolio' href="https://cv-jsm.netlify.app/" target="_blank" rel="noopener noreferrer">Joel mera</a> </p>
        </footer>
    </>
  )
}

export default Footer