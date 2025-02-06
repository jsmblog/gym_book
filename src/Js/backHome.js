import { useNavigate } from "react-router-dom";

const navigate = useNavigate();
const backHome = () => {
    navigate(-1, { replace: true });
};
export default backHome;