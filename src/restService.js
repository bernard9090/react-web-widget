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
            // "IMSI":"somethingher"
        }
    };
    return axios(config)
};

export const headerEnrichedAirtelTigoMtn = () => {
    console.log("header called");
    const config = {
        method: 'GET',
        url: 'http://header.rancardmobility.com/decrypt',
        headers: {
            'Access-Control-Allow-Origin': '*',
            "MSISDN": "233504662043",
            // "IMSI":"somethinghere"
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


export const subscribeToService = ({keyword, service,  shortcode}, msisdn, providerAccountId, smsc, adId=0) => {
    console.log(service, msisdn, providerAccountId, shortcode, keyword);
    let service_ = keyword ? keyword : service;
    return axios({
        method: "GET",
        url : `${BASE_URL}/api/v1/subscriber/widget/subscription`,
        params:{
            service:service_,
            msisdn,
            shortcode:shortcode,
            providerAccountId,
            smsc,
            advertisingId:adId
        }
    })
};

export const fetchWidgetData = (providerId) => {
    return axios({
        method:"GET",
        url:`${BASE_URL}/api/v1/subscriber/widgetData`,
        params:{
            providerAccountId: providerId
        }
    })
};

export const retrieveServices = (providerId, msisdn,smsc, keyword) => {
    return axios({
        method:"GET",
        url: `${BASE_URL}/api/v1/subscriber/widget/services`,
        params:{
            providerAccountId:providerId,
            msisdn,
            keyword,
            smsc
        }
    })
};

export const fetchSingleServiceDetails = (providerId, keyword) => {
    return axios({
        method:"GET",
        url: `${BASE_URL}/api/v1/subscriber/widget/service/details`,
        params:{
            keyword,
            providerAccountId: providerId
        }
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


export const widgetSubscriptionLookup = (service, msisdn) => {
    return axios({
        method:"GET",
        url:`${BASE_URL}/api/v1/subscriber/widget/subscription/lookup`,
        params:{
            service,
            msisdn
        }
    })
};
