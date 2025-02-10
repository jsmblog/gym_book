import { API_KEY_GOOGLE } from './../FirebaseEnv/firebaseEnv';
const API_KEY = API_KEY_GOOGLE
const GET_LOCATION = async (locationQuery) => {
try {
    const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(locationQuery)}&key=${API_KEY}`
      );
    const data = await response.json();
    return data;
} catch (error) {
    console.log(error.message)
}
}

  export default GET_LOCATION;