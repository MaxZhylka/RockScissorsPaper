import axios from 'axios';
const BASE_URL= process.env.BASE_URL;

const $api = axios.create(
    {
        withCredentials: true,
        baseURL: BASE_URL
    }
);
$api.interceptors.request.use((config)=>
{
    config.headers.Authorization= `Bearer ${localStorage.getItem('token')}`;
    return config;
});
export default $api;
$api.interceptors.response.use(
    (config)=>
    {
        return config;
    },
    async (error)=>
    {
        if(error.response.status===401&&error.config&& !error.config._isRetry)
            {
                const originalRequest=error.config;
                originalRequest._isRetry=true;
                try {
                    const response= await axios.get(`${BASE_URL}/refresh`, {withCredentials:true});
                    localStorage.setItem('token',response.data.accessToken);
                    return $api.request(originalRequest);
                } catch (error) {
                    console.log(error);
                    throw new Error('Unauthorized');
                }
                
            }
            throw error;
    }
);