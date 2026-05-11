import { jwtDecode } from "jwt-decode";
import { Navigate, Outlet } from "react-router-dom";

type rutasVigilante = {children?: any};
export const Vigilante = ({children}: rutasVigilante) =>{
    const token = localStorage.getItem("TOKEN_AUTORIZACION")
    if(token){
        try{
            jwtDecode(token);
        }catch(error){
            return <Navigate to="/login"></Navigate>
        }       

    }else{
        return <Navigate to="/login"/>
    }
    return children ? children: <Outlet></Outlet>

}
