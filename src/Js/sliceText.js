const sliceText = (text,lengthToSlice) => {
    return text.length > lengthToSlice ? `${text.slice(0,lengthToSlice)}...` : text 
    }
    export default sliceText