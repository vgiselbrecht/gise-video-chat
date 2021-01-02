
export class Cookie{
    /*
    * General utils for managing cookies in Typescript.
    */
   static setCookie(name: string, val: string) {
        const date = new Date();
        const value = val;

        // Set it expire in 1 year
        date.setTime(date.getTime() + (365 * 24 * 60 * 60 * 1000));

        // Set it
        document.cookie = name+"="+value+"; expires="+date.toUTCString()+"; path=/";
    }

    static getCookie(name: string) {
        const value = "; " + document.cookie;
        const parts = value.split("; " + name + "=");
        
        if (parts.length == 2) {
            return parts.pop().split(";").shift();
        }
    }

    static deleteCookie(name: string) {
        const date = new Date();

        // Set it expire in -1 days
        date.setTime(date.getTime() + (-1 * 24 * 60 * 60 * 1000));

        // Set it
        document.cookie = name+"=; expires="+date.toUTCString()+"; path=/";
    }
}