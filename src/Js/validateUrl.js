const validateUrl = (url) => {
    const urlPattern = /^(ftp|http|https):\/\/[^ "]+$/;
    return urlPattern.test(url);
  };
  export default validateUrl;