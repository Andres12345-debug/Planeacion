export class Acceso{
    public codUsuario: number;
    public claveAcceso: string;

    constructor(cod: number,  cla: string) {
        this.codUsuario = cod;
        this.claveAcceso = cla;
    }
}