import '../Styles/stylesDisplayMessage.css'
const DisplayMessage = ({message}) => {
  return (
    <>
    <div id='cont-messageError'>
      {message && (
        <div className="messageError flip-in-hor-bottom">
          <p >{message}</p>
        </div>
      )}
    </div>
    </>
  )
}

export default DisplayMessage