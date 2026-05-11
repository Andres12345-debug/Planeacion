import { toast, ToastOptions } from "react-toastify";


const configuracion: ToastOptions = {
    position: 'top-center',
    autoClose: 5000,
    hideProgressBar: false,
    draggable: true,
    closeButton: true,
    theme: "colored"
}


export const crearMensaje = (tipo: string, mensaje: string) => {

    switch (tipo.toLowerCase()) {
        case "success":
            toast.success(mensaje, configuracion);
            break;
        case "error":
            toast.error(mensaje, configuracion);
            break;
        case "info":
            toast.info(mensaje, configuracion);
            break;
        case "warning":
            toast.warning(mensaje, configuracion);
            break;
        default:
            toast.warn(mensaje, configuracion);
            break;
    }

}