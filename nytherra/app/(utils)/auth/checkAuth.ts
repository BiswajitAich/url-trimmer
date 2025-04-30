import { jwtDecode } from 'jwt-decode';

const isUserLoggedIn = (): boolean => {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
        const decoded: { exp: number } = jwtDecode(token);
        const isValid = decoded.exp * 1000 > Date.now();

        if (!isValid) {
            localStorage.removeItem('token');
        }

        return isValid;
    } catch {
        localStorage.removeItem('token');
        return false;
    }
};

export default isUserLoggedIn;
