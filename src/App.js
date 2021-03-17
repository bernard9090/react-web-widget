import React, {createRef} from 'react';
import "./App.css"
import IosClose from "react-ionicons/lib/IosClose"
import MdRefresh from "react-ionicons/lib/MdRefresh"
import MdArrowRoundForward from "react-ionicons/lib/MdArrowRoundForward"
import MdArrowRoundBack from "react-ionicons/lib/MdArrowRoundBack"
import {TimelineLite, Power4, } from "gsap/all";
import swal from 'sweetalert';
import PinInput from "react-pin-input";
import Countdown from 'react-countdown';
import {isMobile} from "react-device-detect"
import {Loader, UnknownProvider} from "./components"
import CONSTANTS from "./constants"
import { v4 as uuidv4 } from 'uuid';



import {
    confirmSubscriptionAIRTELTIGO,
    widgetSubscriptionLookup,
    subscribeToService,
    retrieveServices,
    fetchWidgetData,
    headerEnrichedAirtelTigoMtn,
    fetchSingleServiceDetails,
    sendSubscriptionAttempt
} from "./restService";
import {close} from "sweetalert2";



const queryString = require('query-string');
const PAGINATE_NUMBER = 3;
const RANCARD_LOGO = "http://sandbox.rancardmobility.com/static/images/rancard_widget.svg";
const MTN_TIMEOUT = 60 * 1000;


class App extends React.Component {

    _isMounted = false;

    constructor(props) {
        super(props);

        this.state = {
            show:false,
            data:[],
            index:0,
            loading:false,
            providerId:"",
            keyword:"",
            subscribeLoading:false,
            msisdn:"",
            msisdnChange:false,
            singleServiceDetails:null,
            msisdnError:false,
            headerEnriched:false,
            singleServiceSubscribed:false,
            asr:"",
            widgetData:{},
            smsc:"",
            page: CONSTANTS.PAGE_MAIN,
            pin:"",
            urlCallback:"",
            adId:null,
            userSubscribedSingleService:false,
            uuid:""
        };

        this.widget = createRef();
        this.button = createRef();
        this.testFadeIn = createRef();
        this.container = createRef();


        this.closeWidget = this.closeWidget.bind(this);

        this.subscribe = this.subscribe.bind(this);
        this.getAllUserServices = this.getAllUserServices.bind(this);
        this.onChange = this.onChange.bind(this);
        this.tl = new TimelineLite();

    }



    componentWillMount() {



        const scripts = document.getElementsByTagName("script");
        console.log(scripts);
        for(let i = 0; i<= scripts.length; i++){
            const script = scripts[i];
            if(script){
                let scriptSrc = script.src;
                if(scriptSrc.includes("sdp-ds-widget.js")){
                    let [_, providerId, serviceKeyword ] = scriptSrc.split("#");


                    console.log("Script Params: ", providerId,serviceKeyword);
                    this.setState( {
                        providerId:providerId,
                        keyword: serviceKeyword
                    });

                    if(providerId !== undefined){
                        this.setState({loading:true});

                        fetchWidgetData(providerId).then(({data})=> {
                           console.log("widget data", data.result);
                           this.setState({widgetData: data.result});

                            if(serviceKeyword !== null){
                                fetchSingleServiceDetails(providerId, serviceKeyword).then(({data})=>{
                                    const {result} =  data;
                                    console.log(result);
                                    if(result){
                                        this.setState({singleServiceDetails:result})
                                    }
                                })
                            }
                        }).catch(error => {
                            this.setState(prevState => {return {page:CONSTANTS.PAGE_INVALID_PROVIDER}})
                        }).finally(()=>{
                            this.setState({loading:false});
                        });
                    }

                }

                break
            }
        }


    //    check if there is a callback in the URL
        const parsed = queryString.parse(location.search);
        console.log(parsed);
        if(parsed){
            const {callback, adId} = parsed;
            this.setState({urlCallback: callback});
            if(adId)
                this.setState({adId:adId})
        }


    }


    componentDidMount() {
        headerEnrichedAirtelTigoMtn()
            .then(({data})=> {
                console.log("header enriched:", data);
                if(data){
                    let {msisdn, smsc} = data;

                    console.log("header enriched:",msisdn, smsc);


                    this.setState({msisdn: msisdn ,headerEnriched: true, smsc:smsc});
                    const {providerId, keyword} = this.state;

                    if(msisdn !== "" && keyword == null){
                        retrieveServices(providerId, msisdn, smsc, keyword).then(({data}) => {
                            console.log("retrieve service", data);
                            const {code, result, message} = data;
                            const {msisdn, serviceData, asr} = result;
                            console.log(serviceData);

                            if(code === 200){
                                this.setState({loading:false, data:serviceData, asr: asr});
                            }else {
                                this.setState({loading:false});
                            }
                        }).catch(err => {
                            this.setState({loading:false});
                        }).finally(()=>{
                            this.setState({loading:false});
                        });


                    }
                    //perform lookup to check if user is already subbed
                    else if(msisdn!== "" && keyword){
                        widgetSubscriptionLookup(keyword, msisdn).then(({data}) => {
                            const {result, code} = data;

                            if(result && code === 200){
                                const {asr, subscribed} = result;
                                if(subscribed){
                                    this.setState({asr:asr, userSubscribedSingleService:subscribed}, ()=>{

                                    });
                                }
                            }
                        });
                        const attemptId = uuidv4();
                        this.setState({uuid:attemptId});
                        // sendSubscriptionAttempt(msisdn, null, keyword, providerId, smsc,attemptId).then((response) => {
                        //     const {data} = response;
                        //     console.log(data)
                        // }).catch(error => {})
                    }
                    else{
                        this.setState({headerEnriched: false});
                    }

                }else{
                    this.setState({headerEnriched: false});
                    console.log("no header enrichment")
                }
            }).catch((e)=>{
                console.log(e)

        }).finally(()=>{
            this.setState({loading:false})
        })


    }

    closeWidget = (redirect = false) => {
        const {widgetData} = this.state;
        this.setState({loading:false});
        // this.tl.reverse();
        // this.widget.current.style.visibility = "hidden";
        this.container.current.style.visibility = "hidden";

        const urlParams = `asr=${encodeURIComponent(this.state.asr)}&adId=${this.state.adId}&keyword=${this.state.keyword}`;

        let path;


        if(this.state.urlCallback && this.state.urlCallback.length > 0){
            path  =`${this.state.urlCallback}?${urlParams}`;
        }else{
            path = `${widgetData.frontendSyncUrl}?${urlParams}`;
        }

        console.log(path);

        if(redirect){

            window.location = path
        }



    };

    onChange = pin => {
        console.log(pin);
        this.setState({pin: pin});
    };

    subscribe = (service, msisdn, providerAccountId, smsc) => {
        const closeWd = this.closeWidget;
        this.setState({loading:true});
        subscribeToService(service, msisdn, providerAccountId,this.state.uuid, smsc, this.state.adId).then(({data})=>{


            const {result, message, code} = data;
            // console.log("sub code",result);

            if(code < 400){
                const {asr, status} = result;

                this.setState({asr:asr});


                if(status !== "ALREADY_SUBSCRIBED"){
                    if(smsc === "AIRTELTIGO"){
                        this.setState({page:CONSTANTS.PAGE_ENTER_PIN})
                    }

                    else if(smsc === "MTNGH"){

                        this.setState({page:CONSTANTS.PAGE_AWAITING_VERIFICATION, asr:msisdn});


                        let sublookupDebounce = setInterval(function() {

                            widgetSubscriptionLookup(service.service, msisdn).then(({data})=>{
                                console.log("regular check data ", data);

                                if(data.result){
                                    clearInterval(sublookupDebounce);
                                    closeWd(true)
                                }
                            });
                        },  10 * 1000);

                        setTimeout(()=>{
                            swal({
                                title: "Processing Subscription",
                                text: "Your subscription is being finalized",
                                icon: "info",
                                confirmButtonText: "View Content"
                            }).then(ok=>{
                                this.closeWidget(true)
                            });
                            clearInterval(sublookupDebounce);
                            this.setState({page: CONSTANTS.PAGE_MAIN})
                        }, MTN_TIMEOUT)
                    }
                    else{
                        this.closeWidget(true);
                    }
                }else{
                    console.log("Already subbed, redirecting");
                    this.closeWidget(true)
                }

            }else{
                swal({
                    title: "Subscription Unsuccessful",
                    text: message,
                    icon: "error",
                    confirmButtonText: "OK"
                });
            }
            this.setState({loading:false});

        }).catch(err => {
            this.setState({loading:false});
            swal({
                title: "Subscription Unsuccessful",
                text: "An error occurred while subscribing to this service, please try again later!",
                icon: "error"});
        }).finally(()=>{
            this.setState({loading:false})
        });
    };

    getAllUserServices = (providerId, msisdn) =>{
        this.setState({loading:true});
        retrieveServices(providerId, msisdn).then(({data}) => {
            // console.log("retrieve service", data);
            const {code, result, message} = data;
            const {msisdn, serviceData, asr} = result;

            if(code === 200){
                this.setState({loading:false, data:serviceData, asr: asr});
            }else {
                swal({
                    title: "Error fetching services",
                    text: "You clicked the button!",
                    icon: "error",
                });
                this.setState({loading:false});

            }



        }).catch(err => {
            this.setState({loading:false});
        }).finally(()=>{
            this.setState({loading:false});
        })
    };










    render() {

        // const tl = new TimelineLite({paused:false});
        // tl.fromTo(this.container.current, 0.25, {opacity:0}, {opacity:1});

        const {
            index,
            data,
            loading,
            selectedService,
            msisdnError,
            keyword,
            singleServiceDetails,
            page,
            userSubscribedSingleService,
            pin} = this.state;

       const WaitingVerificationPage = () => {
            return (
                <div className={"enrichment_container"}>
                    <div className={"pin-wrapper"}>
                        <h2>Awaiting subscription verification</h2>
                        <p>Your subscription is being processed, do not close this page.</p>
                        <p style={{fontSize:18, color:"red"}}> <Countdown date={Date.now() + MTN_TIMEOUT}/></p>
                    </div>

                </div>
            )
        };




        return(


            <div ref={this.container}  className={"sdp_widget__container"}>

                {
                    page === CONSTANTS.PAGE_MAIN ?
                        <div ref={this.widget}  className={"enrichment_container"}>

                            <div style={{
                                width:"100%",
                                display:"flex",
                                justifyContent:"space-between",
                                alignItems:"center"}}
                            >
                                <IosClose color={"red"}  fontSize={"40px"} onClick={()=>{
                                    // this.closeWidget(true)
                                }}/>
                            </div>



                            {
                                singleServiceDetails !== null ?
                                    <p ref={this.testFadeIn} className={"en_info"}>
                                        Get {singleServiceDetails && singleServiceDetails.service} content directly to your phone {singleServiceDetails && singleServiceDetails.tariff ? `@ Ghs ${singleServiceDetails && singleServiceDetails.tariff}` : "."}
                                    </p>:
                                    <p ref={this.testFadeIn} className={"en_info"}>
                                        Get Content directly to your mobile!
                                    </p>
                            }


                            <div className={"wd__input-label-container"}>
                                <p className={"wd__input-label-desc"}>Please enter your phone number</p>
                                <input
                                    readOnly={true}
                                    placeholder={"Phone Number"}
                                    disabled={this.state.headerEnriched}  style={{
                                    border: msisdnError ? "2px solid red" : null
                                }}

                                    defaultValue={this.state.msisdn}
                                    onChange={(e) => {this.setState({msisdn:e.target.value, msisdnChange:true, msisdnError:false})}}
                                    className={"wd__msisdn-input"} type="tel"/>

                                {
                                    data.length < 1 &&
                                    <div className={"sub_btn_container"}>
                                        <button style={{width:"100% "}} disabled={loading}  onClick={()=>{

                                            const {providerId, keyword, msisdn, smsc} = this.state;
                                            // console.log(providerId, keyword, msisdn);

                                            if(msisdn.length < 10){
                                                this.setState({msisdnError:true})
                                            }else{
                                                this.setState({loading:true});
                                                if(userSubscribedSingleService){
                                                    this.closeWidget(true)
                                                }else{
                                                    this.subscribe({service:keyword}, msisdn, providerId, smsc)
                                                }
                                            }

                                        }} className={"wd__btn-subscribe"}>{userSubscribedSingleService ? "Continue": "Subscribe"}</button>

                                    </div>
                                }
                            </div>





                            {
                               data.length > 0 ?
                                    <div className={"services_container"}>
                                        <div style={{width:"100%"}}>
                                            {
                                                data.slice(index, index + PAGINATE_NUMBER).map((item, index)=>{
                                                    if(item.status === "subscribed"){
                                                        this.setState({singleServiceSubscribed: true})
                                                    }
                                                    return(
                                                        <div key={index} className={"wd__service-item-container"}>
                                                            <div >
                                                                <div className={"wd__service-name"}>{item.service}</div>
                                                                <span className={"wd__service-tarrif"}>Ghs {item.tariff !== null ? item.tariff : "0.00"} / day</span>
                                                            </div>

                                                            <button
                                                                style={{backgroundColor:item.status !== null ? "green": "#181818"}}
                                                                onClick={()=>{
                                                                    let {msisdn, providerId, smsc} = this.state;
                                                                    this.setState((prevState => ({keyword: item.keyword})), ()=>{
                                                                        if(msisdn !== ""){
                                                                            this.setState({selectedService:item, loading:true, msisdnError:false});
                                                                            this.subscribe(item, msisdn, providerId, smsc)
                                                                        }else{
                                                                            this.setState({msisdnError:true})
                                                                        }
                                                                    });

                                                                }} className={"wd__btn-service-item-btn"}>{item.status === null ? "Subscribe" : "Enjoy Content"}</button>
                                                        </div>
                                                    )
                                                })
                                            }
                                        </div>


                                        {
                                            data.length > PAGINATE_NUMBER && <div className={"wd__service-nav"}>

                                                <MdArrowRoundBack color={index <= 0 ? "gray":"black"} onClick={()=> {
                                                    const cannotGoBack = index <= 0;
                                                    if(cannotGoBack)
                                                        return;
                                                    this.setState({index: index - PAGINATE_NUMBER})
                                                }
                                                }/>

                                                <MdArrowRoundForward color={index + PAGINATE_NUMBER >= data.length ? "gray":"black"} onClick={()=> {
                                                    const cannotShowMoreItems = index + PAGINATE_NUMBER >= data.length;
                                                    if(cannotShowMoreItems)
                                                        return;
                                                    this.setState({index: index+PAGINATE_NUMBER})
                                                }}/>

                                            </div>
                                        }

                                        {
                                            this.state.singleServiceSubscribed && <div >
                                                <button onClick={()=>{
                                                    this.closeWidget(true)
                                                }} className="wd__btn-subscribe">DONE</button>
                                            </div>
                                        }

                                    </div>
                                    :
                                    null
                            }
                            {
                                loading && <Loader/>
                            }
                            <div className={"footer-rancard"} style={{marginTop:"4em", color:"gainsboro", textAlign:"center", display:"flex", alignItems:"center"}}>Powered by
                                <img src={RANCARD_LOGO} style={{height:20, marginLeft:8}} alt="rancard"/>
                                <div className={"rancard_image"}/>
                            </div>
                        </div>
                        :

                        page === CONSTANTS.PAGE_ENTER_PIN ?

                            <div className={"enrichment_container"}>
                                <div className={"pin-wrapper"}>
                                    <p>We’ve sent a confirmation code to your phone <Countdown date={Date.now() + 30 * 1000}/></p>

                                    <div style={{margin:"1.4em"}}>


                                        <div className={"pin-input-container"}>
                                            <div>
                                                <p>Please enter your confirmation PIN</p>
                                            </div>
                                            <PinInput
                                                length={4}
                                                focus
                                                value={this.state.pin}
                                                inputStyle={{
                                                    width: isMobile ? 40 :  64,
                                                    height: isMobile ? 40 : 64,
                                                    background: "#F8F8F8",
                                                    border: "1px solid #E3E3E3",
                                                    boxSizing: "border-box",
                                                    borderRadius:isMobile? 4: 10,
                                                    fontSize:isMobile ? 16 : 18,
                                                    margin:"8px"
                                                }}
                                                ref={p => (this.pin = p)}
                                                type="numeric"
                                                onChange={(pin) => this.onChange(pin)}
                                            />
                                        </div>
                                    </div>

                                    <button disabled={this.pin === "" || loading} onClick={()=>{
                                        const {pin, msisdn, providerId, keyword} = this.state;
                                        if(pin !== "" && pin.length === 4){
                                            this.setState({loading:true});
                                            confirmSubscriptionAIRTELTIGO(pin, msisdn, providerId, keyword).then(({data})=>{
                                                const {result, message, code} = data;
                                                console.log(data);
                                                const {asr} = result;
                                                // this.setState({asr:asr});
                                                if(code < 400){
                                                    this.closeWidget(true)
                                                }else{
                                                    swal({
                                                        icon:"error",
                                                        title:"Pin verification failed",
                                                        text:message
                                                    })
                                                }
                                            }).catch((response) => {
                                                console.log("response log ",response);
                                                swal({
                                                    icon:"error",
                                                    title:"Pin verification failed",
                                                    // text:response.message
                                                })
                                            }).finally(()=>{
                                                this.setState({loading:false})
                                            })
                                        }
                                    }} className={"btn-confirm"}>Confirm</button>
                                    {this.state.loading && <Loader/>}
                                </div>
                                <div className={"footer-rancard"} style={{marginTop:"4em", color:"gainsboro", textAlign:"center", display:"flex", alignItems:"center"}}>Powered by
                                    <img src={RANCARD_LOGO} style={{height:20, marginLeft:8}} alt="rancard"/>
                                    <div className={"rancard_image"}/>
                                </div>
                            </div>

                            :
                            page === CONSTANTS.PAGE_AWAITING_VERIFICATION?
                                <WaitingVerificationPage/>:
                                page === CONSTANTS.PAGE_INVALID_PROVIDER ? <UnknownProvider/> : null


                }


                <style>
                    {
                        `.enrichment_container{}`
                    }
                </style>


            </div>
        );


    }


    showModal = () => {
        console.log("showing modal");
        this.tl.fromTo(this.container.current,0.1, {
            visibility:"hidden"
        },{
            visibility:"visible"
        })
            .fromTo(
                this.widget.current,
                0.7,
                {
                    opacity:0,
                    visibility:"hidden",

                }, {
                    opacity:1,
                    visibility:"visible",
                    ease:Power4.easeInOut,
                    onComplete: args => {
                        // headerEnriched().then(({data})=>{
                        //     this.fetchUserServices()
                        // }).catch(err => {
                        //
                        // })
                    }

                });
    };






}

export default App


