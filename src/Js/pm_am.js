const is_am_or_pm = (time) =>{
   return time >= "12:00" && time < "24:00" ? "pm" : "am"
}
export default is_am_or_pm; 