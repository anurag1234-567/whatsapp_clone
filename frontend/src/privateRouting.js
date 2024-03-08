import { Outlet, Navigate} from "react-router-dom";

function PrivateRouting(){
    const userId = sessionStorage.getItem('userId');

    return userId ? <Outlet /> : <Navigate to='/login' />
}
export default PrivateRouting;