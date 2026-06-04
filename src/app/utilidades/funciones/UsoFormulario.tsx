import { useState, ChangeEvent } from "react"

export const useFormulario = <T extends Object>(objetoInicial: T) => {
    const [objeto, setObjeto] = useState(objetoInicial);

    const dobleEnlace = ({ target }: ChangeEvent<any>) => {
        const { name, value } = target;
        // Sanitización básica: remover caracteres potencialmente peligrosos
        const sanitizedValue = value.replace(/[<>\"'&]/g, '');
        setObjeto({ ...objeto, [name]: sanitizedValue });
    }

    return {
        objeto,
        dobleEnlace,
        ...objeto
    }
}