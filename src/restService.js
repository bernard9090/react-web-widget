var axios = require('axios');
import $ from "jquery"

// const BASE_URL = "http://localhost:8990";
const BASE_URL = "https://sdp3.rancardmobility.com";
axios.create({
    headers:{
        "Access-Control-Allow-Origin":"*"
    }
});

export const headerEnriched = () => {


    // $.ajax({
    //     url: 'http://sandbox.rancardmobility.com/api/v1/subscriber/widget/headerEnrichment',
    //     method: 'GET',
    //     headers:{
    //         'Access-Control-Allow-Origin':"**"
    //     },
    //     success: function (response) {
    //         console.log(response);
    //     },
    //     error: function (error) {
    //         console.log(error);
    //     }
    // });



    // return new Promise((async (resolve, reject) => {
    //
    //     const data = await fetch("http://sandbox.rancardmobility.com/api/v1/subscriber/widget/headerEnrichment", {
    //         mode:"no-cors"
    //     }).then();
    //
    //     resolve({})
    //
    //
    // }))
    var config = {
        method: 'get',
        url: 'https://sandbox.rancardmobility.com/api/v1/subscriber/widget/headerEnrichment',
        headers: {
            'Access-Control-Allow-Origin': '*',
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
