import axios from "axios";


// const BASE_URL = "http://localhost:8990";
const BASE_URL = "https://sdp3.rancardmobility.com";
axios.create({
    headers:{
        "Access-Control-Allow-Origin":"*"
    }
});

export const headerEnriched = () => {
    return axios({
        method: "GET",
        url:`${BASE_URL}/api/v1/subscriber/widget/headerEnrichment`
    })
};

export const fetchUserServices = (providerId, serviceKeyword, msisdn) => {
    return axios({
        method:"GET",
        url: `${BASE_URL}/api/v1/subscriber/widget/services?providerAccountId=${providerId}&keyword=${serviceKeyword}&msisdn=${msisdn}`
    })
};


export const subscribeToService = ({keyword, service,  shortcode}, msisdn, providerId) => {
    console.log(service, msisdn, providerId, shortcode, keyword);
    let shortcode_ = shortcode ? shortcode : null;
    let service_ = keyword ? keyword : service;
    return axios({
        method: "GET",
        url : `${BASE_URL}/api/v1/subscriber/widget/subscription?service=${service_}${shortcode_ ? "&shortcode="+shortcode_ : ""}&msisdn=${msisdn}&providerAccountId=${providerId}`
    })
};

export const retrieveServices = (providerId, msisdn) => {
    return axios({
        method:"GET",
        url: `${BASE_URL}/api/v1/subscriber/widget/services?providerAccountId=${providerId}&msisdn=${msisdn}`
    })
};
