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



    // return new Promise(((resolve, reject) => {
    //
    //     var myHeaders = new Headers();
    //     myHeaders.append("rancard", " 87bcb331c06328fe911cc795");
    //     myHeaders.append("Cookie", "JSESSIONID=1ADD9D73846A7C2300DF7A729427495F");
    //     myHeaders.append("Access-Control-Allow-Origin", "*");
    //
    //     var requestOptions = {
    //         method: 'GET',
    //         headers: myHeaders,
    //         mode:"no-cors"
    //     };
    //
    //     fetch("https://sandbox.rancardmobility.com/api/v1/subscriber/widget/headerEnrichment-vodafone", requestOptions)
    //         .then(response => response.text())
    //         .then(result => console.log(result))
    //         .catch(error => console.log('error', error));
    //
    //
    // }))
    const config = {
        method: 'get',
        url: 'http://sandbox.rancardmobility.com/he/decrypt',
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
