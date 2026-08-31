const API_URL = "/reception";

export async function apiFetch(
    endpoint,
    options = {}
) {

    const token =
        localStorage.getItem("token");


    const headers = {
        ...(options.headers || {})
    };


    if (token) {

        headers.Authorization =
            `Bearer ${token}`;

    }


    const response = await fetch(
        `${API_URL}${endpoint}`,
        {
            ...options,
            headers
        }
    );


    if (response.status === 401 ||
        response.status === 403) {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        window.location.reload();

        return;

    }


    return response;

}


export { API_URL };