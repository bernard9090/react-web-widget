import React, {createRef} from 'react';
import "./App.css"
import IosClose from "react-ionicons/lib/IosClose"
import MdRefresh from "react-ionicons/lib/MdRefresh"
import MdArrowRoundForward from "react-ionicons/lib/MdArrowRoundForward"
import MdArrowRoundBack from "react-ionicons/lib/MdArrowRoundBack"
import {TimelineLite, Power4, TweenMax } from "gsap/all";
import {services} from "./dummyData";
import swal from 'sweetalert';
import PinInput from "react-pin-input";
import Countdown from 'react-countdown';
import {isMobile} from "react-device-detect"
// import {Loader} from "./components";
import Loader from "./components/Loader"
const queryString = require('query-string');


const PAGINATE_NUMBER = 3;

import {confirmSubscriptionAIRTELTIGO, headerEnriched,widgetSubscriptionLookup, subscribeToService, retrieveServices, fetchWidgetData, fetchSingleServiceDetails, headerEnrichedAirtelTigoMtn} from "./restService";




class App extends React.Component {

    _isMounted = false;

    constructor(props) {
        super(props);

        this.state = {
            show:false,
            data:[],
            index:0,
            loading:true,
            providerId:null,
            keyword:null,
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
            page:"main",
            pin:null,
            urlCallback:"",
            adId:null
        };

        this.widget = createRef();
        this.button = createRef();
        this.testFadeIn = createRef();
        this.container = createRef();


        this.closeWidget = this.closeWidget.bind(this);

        this.subscribe = this.subscribe.bind(this);
        this.getAllUserServices = this.getAllUserServices.bind(this);
        this.onChange = this.onChange.bind(this)

    }



    componentWillMount() {




        const scripts = document.getElementsByTagName("script");
        for(let i = 0; i<= scripts.length; i++){
            const script = scripts[i];
            if(script){
                let scriptSrc = script.src;
                if(scriptSrc.includes("sdp-ds-widget.js")){
                    let params = scriptSrc.split("#");

                    let providerId = params[1];
                    let serviceKeyword = params[2] ? params[2] : null;

                    console.log("Script Params: ", providerId,serviceKeyword);
                    this.setState( {
                        providerId:providerId,
                        keyword: serviceKeyword
                    });



                    if(providerId !== undefined){
                        fetchWidgetData(providerId).then(({data})=> {
                           console.log("widget data", data.result);
                           this.setState({widgetData: data.result})
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


        this._isMounted = true;

        headerEnrichedAirtelTigoMtn()
            .then(({data})=> {
                const {providerId, keyword} = this.state;
                // console.log("header enriched:", data, providerId, keyword);
                if(data !== "none"){
                    // console.log("I entered here");
                    let {msisdn, smsc} = data;

                    // console.log("header enriched:",msisdn, smsc);


                    this.setState({msisdn: msisdn ,headerEnriched: true, smsc:smsc});
                    const {providerId, keyword} = this.state;

                    if(msisdn && keyword == null){
                        retrieveServices(providerId, msisdn, smsc, keyword).then(({data}) => {
                            // console.log("retrieve service", data);
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
                        })
                    }else{
                        this.setState({headerEnriched: false});
                        // console.log("no header enrichment")
                    }

                    // if(keyword !== null){
                    //     // this.subscribe({service:keyword}, msisdn, providerId, smsc);
                    // }
                    // else{
                    //
                    // }
                }else{
                    this.setState({headerEnriched: false});
                    // console.log("no header enrichment")
                }
            }).catch(()=>{

        })


    }


    componentWillUnmount() {
        this._isMounted = false;
    }



    closeWidget = (redirect = false) => {
        const {widgetData} = this.state;
        // console.log("Closing widget", widgetData);
        this.setState({loading:false});
        this.tl.reverse();
        // this.widget.current.style.visibility = "hidden";
        this.container.current.style.visibility = "hidden";

        if(redirect){
            if(this.state.urlCallback && this.state.urlCallback.length > 0){
                window.location =`${this.state.urlCallback}?asr=${encodeURIComponent(this.state.asr)}`;
            }else{
                window.location =`${widgetData.frontendSyncUrl}?asr=${encodeURIComponent(this.state.asr)}`;
            }
        }

        // swal({
        //     title: "Subscription Successful",
        //     text: `You have successfully subscribed to ${selectedService.service} @ ${selectedService.tariff}`,
        //     icon: "success",
        // });
    };

    onChange = pin => {
        console.log(pin);
        this.setState(()=>({pin: pin}) );
    };

    subscribe = (service, msisdn, providerAccountId, smsc) => {
        // console.log(service);
        const closeWd = this.closeWidget;
        subscribeToService(service, msisdn, providerAccountId, smsc, this.state.adId).then(({data})=>{


            const {result, message, code} = data;
            console.log("sub code",code);

            if(code < 400){
                const {asr, status} = result;

                this.setState({asr:asr});

                // console.log("code 200", asr, status);

                if(status !== "ALREADY_SUBSCRIBED"){
                    if(smsc === "AIRTELTIGO"){
                        this.setState({loading:false, page:"pin"})
                    }

                    else if(smsc === "MTNGH"){

                        this.setState({loading:false, page:"waiting-verification", asr:msisdn});


                        let sublookup = setInterval(function() {

                            widgetSubscriptionLookup(service.service, msisdn).then(({data})=>{
                                // console.log("regular check data ", data);

                                if(data.result){
                                    clearInterval(sublookup);
                                    closeWd(true)
                                }
                            });
                            // console.log("checking for verification")
                        },  10 * 1000);

                        setTimeout(()=>{
                            swal({
                                title: "Subscription Unsuccessful",
                                text: "An error occurred while subscribing to this service, please try again later!",
                                icon: "error",
                            });
                            clearInterval(sublookup);
                            this.setState({page:"main"})
                        }, 30 * 1000)
                    }
                    else{
                        this.closeWidget(true);
                    }
                }else{
                    this.closeWidget(true)

                }

            }else{
                swal({
                    title: "Subscription Unsuccessful",
                    text: message,
                    icon: "error",
                });
            }
            this.setState({loading:false});

        }).catch(err => {
            this.setState({loading:false});
            swal({
                title: "Subscription Unsuccessful",
                text: "An error occurred while subscribing to this service, please try again later!",
                icon: "error",
            });
        });
    };

    getAllUserServices = (providerId, msisdn) =>{
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
        })
    };

    onClear = () => {
        this.setState({
            value: ""
        });
        this.pin.clear();
    };


    moveNext = () =>{
        const {index} = this.state;
        if(index + 3 > services.length)
            return;

        this.setState(()=>{
            return {
                index:index + 3
            }
        })
    };

    moveBack = () => {
        const {index} = this.state;
        if(index - 3 < 0)
            return;

        this.setState(()=>{
            return {
                index:index - 3
            }
        })
    };











    render() {

        // const tl = new TimelineLite({paused:false});
        // tl.fromTo(this.container.current, 0.25, {opacity:0}, {opacity:1});

        const {index, data, subscribeLoading,loading, selectedService, msisdnError, keyword, singleServiceDetails, page} = this.state;

       const WaitingVerificationPage = () => {
            return (
                <div className={"enrichment_container"}>
                    <div className={"pin-wrapper"}>
                        <h2>Awaiting subscription verification</h2>
                        <p> <Countdown date={Date.now() + 30000}/></p>
                    </div>

                </div>
            )
        };


        return(


            <div ref={this.container} className={"sdp_widget__container"}>

                {
                    page === "main" ?
                        <div ref={this.widget} className={"enrichment_container"}>

                            <div style={{
                                width:"100%",
                                display:"flex",
                                justifyContent:"space-between",
                                alignItems:"center"}}
                            >
                                <IosClose color={"red"}  fontSize={"40px"} onClick={()=>{
                                    this.closeWidget(true)
                                }}/>
                            </div>



                            {
                                keyword !== null ?
                                    <p ref={this.testFadeIn} className={"en_info"}>
                                        Get {singleServiceDetails && singleServiceDetails.service} content directly to your phone {singleServiceDetails && singleServiceDetails.tariff ? `@ Ghs ${singleServiceDetails && singleServiceDetails.tariff} / day` : "."}
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
                                        <button style={{width:"100% "}}  onClick={()=>{
                                            const {providerId, keyword, msisdn, smsc} = this.state;
                                            // console.log(providerId, keyword, msisdn);

                                            if(msisdn.length < 10){
                                                this.setState({msisdnError:true})
                                            }else{
                                                this.setState({loading:true});
                                                if(keyword !== null){
                                                    this.subscribe({service:keyword}, msisdn, providerId, smsc)
                                                }else{
                                                    getAllUserServices(providerId, msisdn)
                                                }
                                            }

                                        }} className={"wd__btn-subscribe"}>Subscribe</button>
                                    </div>
                                }
                            </div>





                            {
                                this.state.loading ? <div style={{margin:16, textAlign:"center"}}><Loader/></div> : data.length > 0 ?
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
                                                                disabled={item.status !== null}
                                                                onClick={()=>{
                                                                    let {msisdn, msisdnChange, providerId, smsc} = this.state;
                                                                    if(msisdn !== ""){

                                                                        this.setState({selectedService:item, loading:true, msisdnError:false});

                                                                        this.subscribe(item, msisdn, providerId, smsc)
                                                                    }else{
                                                                        this.setState({msisdnError:true})
                                                                    }
                                                                }} className={"wd__btn-service-item-btn"}>{item.status === null ? "Subscribe" : "Subscribed"}</button>
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
                            <div className={"footer-rancard"} style={{marginTop:"4em", color:"gainsboro", textAlign:"center", display:"flex", alignItems:"center"}}>Powered by
                                <img src={"http://sandbox.rancardmobility.com/static/images/rancard_widget.svg"} style={{height:20, marginLeft:8}} alt="rancard"/>
                                <div className={"rancard_image"}/>
                            </div>
                        </div>
                        :

                        page === "pin" ?

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
                                                // value={this.state.pin}
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

                                    <button disabled={loading} onClick={()=>{
                                        const {pin, msisdn, providerId, keyword} = this.state;
                                        if(pin !== "" && pin.length === 4){
                                            this.setState({loading:true});
                                            confirmSubscriptionAIRTELTIGO(pin, msisdn, providerId, keyword).then(({data})=>{
                                                const {result, message, code} = data;
                                                // console.log(data);
                                                const {asr} = result;
                                                // this.setState({asr:asr});
                                                if(code === 200){
                                                    this.closeWidget(true)
                                                }else{
                                                    swal.fire({
                                                        icon:"error",
                                                        text:message
                                                    })
                                                }
                                            }).catch(e => {
                                                swal.fire({
                                                    icon:"error",
                                                    text:"Please try again."
                                                })
                                            }).finally(()=>{
                                                this.setState({loading:false})
                                            })
                                        }
                                    }} className={"btn-confirm"}>Confirm</button>
                                </div>
                                <div className={"footer-rancard"} style={{marginTop:"4em", color:"gainsboro", textAlign:"center", display:"flex", alignItems:"center"}}>Powered by
                                    <img src={"http://sandbox.rancardmobility.com/static/images/rancard_widget.svg"} style={{height:20, marginLeft:8}} alt="rancard"/>
                                    <div className={"rancard_image"}/>
                                </div>
                            </div>

                             :
                          page === "waiting-verification"?
                              <WaitingVerificationPage/>: null


                }




            </div>
        );


    }






}

export default App


