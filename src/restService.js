var axios = require('axios');
import $ from "jquery"

// const BASE_URL = "http://localhost:8990";
//http://header.rancardmobility.com/decrypt
// http://sandbox.rancardmobility.com/widget/decrypt
const BASE_URL = "https://sdp3.rancardmobility.com";
axios.create({
    headers:{
        "Access-Control-Allow-Origin":"*"
    }
});

export const headerEnriched = () => {
    const config = {
        method: 'get',
        url: 'http://header.rancardmobility.com/decrypt',
        headers: {
            'Access-Control-Allow-Origin': '*',
            // "MSISDN": "233261213507",
            "IMSI":"somethinghere"
        }
    };
    return axios(config)
};

export const headerEnrichedAirtelTigoMtn = () => {
    const config = {
        method: 'get',
        url: 'http://header.rancardmobility.com/decrypt',
        headers: {
            'Access-Control-Allow-Origin': '*',
            "msisdn": "233209380064",
            "IMSI":"somethinghere"

        }
    };

    return axios(config)
};

export const fetchUserServices = (providerId, serviceKeyword, msisdn) => {
    return axios({
        method:"GET",
        url: `${BASE_URL}/api/v1/subscriber/widget/services?providerAccountId=${providerId}&keyword=${serviceKeyword}&msisdn=${msisdn}`
    })
};


export const subscribeToService = ({keyword, service,  shortcode}, msisdn, providerAccountId, smsc) => {
    console.log(service, msisdn, providerAccountId, shortcode, keyword);
    let shortcode_ = shortcode ? shortcode : null;
    let service_ = keyword ? keyword : service;
    return axios({
        method: "GET",
        url : `${BASE_URL}/api/v1/subscriber/widget/subscription`,
        params:{
            service:service_,
            msisdn,
            shortcode:shortcode_? shortcode :"",
            providerAccountId,
            smsc
        }
    })
};

export const fetchWidgetData = (providerId) => {
    return axios({
        method:"GET",
        url:`${BASE_URL}/api/v1/subscriber/widgetData?providerAccountId=${providerId}`
    })
};

export const retrieveServices = (providerId, msisdn) => {
    return axios({
        method:"GET",
        url: `${BASE_URL}/api/v1/subscriber/widget/services?providerAccountId=${providerId}&msisdn=${msisdn}`
    })
};

export const fetchSingleServiceDetails = (providerId, keyword) => {
    return axios({
        method:"GET",
        url: `${BASE_URL}/api/v1/subscriber/widget/service/details?keyword=${keyword}&providerAccountId=${providerId}`
    })
};


export const confirmSubscriptionAIRTELTIGO = (otp, msisdn, providerAccountId, service) => {
    return axios({
        method:"GET",
        url:`${BASE_URL}/api/v1/subscriber/widget/subscription/tigo/confirmation`,
        params:{
            otp,
            service:service,
            msisdn,
            providerAccountId
        }
    })
};


export const widgetSubscriptionLookup = (keyword, msisdn) => {
    return axios({
        method:"GET",
        url:`${BASE_URL}/widget/subscription/lookup`,
        params:{
            keyword,
            msisdn
        }
    })
};
