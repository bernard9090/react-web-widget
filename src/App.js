import React, {createRef} from 'react';
import "./App.css"
import IosClose from "react-ionicons/lib/IosClose"
import MdRefresh from "react-ionicons/lib/MdRefresh"
import MdArrowRoundForward from "react-ionicons/lib/MdArrowRoundForward"
import MdArrowRoundBack from "react-ionicons/lib/MdArrowRoundBack"
import {TimelineLite, Power4, } from "gsap/all";
import {services} from "./dummyData";
import swal from 'sweetalert';



import {fetchUserServices, headerEnriched, subscribeToService, retrieveServices} from "./restService";


class App extends React.Component {

    _isMounted = false;

    constructor(props) {
        super(props);

        this.state = {
            show:false,
            data:[],
            index:0,
            loading:false,
            providerId:null,
            keyword:null,
            subscribeLoading:false,
            msisdn:"",
            msisdnChange:false,
            selectedService:{},
            msisdnError:false,
            headerEnriched:false,
            singleServiceSubscribed:false,
            asr:""
        };

        this.widget = createRef();
        this.button = createRef();
        this.testFadeIn = createRef();
        this.container = createRef();

        this.tl = new TimelineLite();

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

                    console.log("provider", providerId, serviceKeyword);

                    if(providerId !== undefined){
                        console.log("anaon functions");
                        this.setState(()=>{
                            return {
                                providerId:providerId,
                                keyword: serviceKeyword
                            }
                        });

                        // undefined keyword means multi service
                        // if(serviceKeyword !== undefined){
                        //     retrieveServices(providerId).then(({data})=>{
                        //         console.log("retrieve", data);
                        //     })
                        // }
                    }




                }
            }
        }

        headerEnriched().then(({data})=> {
            console.log("header enriched", data);
            const {code, result, message} = data;
            if(result !== ""){
                this.setState({msisdn: result,headerEnriched: true});
                const {providerId, keyword} = this.state;

                // fetchUserServices(providerId, keyword, result).then(({data})=>{
                //     console.log("subscriptions", data)
                // })

            }else{
                this.setState({headerEnriched: false})
            }
        })
    }


    componentDidMount() {


        this._isMounted = true;
        // this.showModal()



    }


    componentWillUnmount() {
        this._isMounted = false;
    }

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


        const {index, data, subscribeLoading, selectedService, msisdnError, keyword} = this.state;



        return(
            <div ref={this.container} className={"sdp_widget__container"}>

                <div ref={this.widget} className={"enrichment_container"}>

                    <div style={{
                        display:"flex",
                        justifyContent:"space-between",
                        alignItems:"center"
                    }}>
                        <div>
                            {
                                subscribeLoading && <div style={{ display:"flex",alignItems:"center"}}> <MdRefresh rotate={true} color={"teal"} fontSize={"30px"} /> Subscribing to {selectedService.service}</div>

                            }
                        </div>

                        <IosClose color={"red"}  fontSize={"40px"} onClick={()=>{
                            console.log("request to close");
                            this.tl.reverse();
                            this.container.current.style.visibility = "hidden";
                            this.widget.current.style.visibility = "hidden";
                            window.location =`https://ppreports.vuclip.com/tool/test/redirect.php?asr=${this.state.asr}`
                        }}/>
                    </div>



                    {
                        keyword !== null ?
                            <p ref={this.testFadeIn} className={"en_info"}>
                                Get {selectedService.service} content directly to your phone @ Ghs {selectedService.tariff} / day
                            </p>:
                            <p ref={this.testFadeIn} className={"en_info"}>
                            Get Content directly to your mobile!
                        </p>
                    }


                    <div>
                        <p className={"wd__input-label-desc"}>Please enter your phone number</p>
                        <input
                            placeholder={"Phone Number"}
                            disabled={this.state.headerEnriched}  style={{
                            border: msisdnError ? "2px solid red" : null
                        }}

                            value={this.state.msisdn}
                            onChange={e=> this.setState({msisdn:e.target.value, msisdnChange:true, msisdnError:false})}
                               className={"wd__msisdn-input"} type="tel"/>

                        {
                            data.length < 1 && <div>
                                <button  onClick={()=>{
                                    const {providerId, keyword, msisdn} = this.state;
                                    console.log(providerId, keyword, msisdn);
                                    if(msisdn.length < 10){
                                        this.setState({msisdnError:true})
                                    }else{
                                        this.setState({loading:true});
                                        if(keyword !== null){

                                            subscribeToService({service: keyword}, msisdn, providerId).then(({data})=>{
                                                // this.setState({subscribeLoading:false});
                                                this.setState({loading:true});
                                                console.log(data);

                                                const {result, message, code} = data;
                                                const {asr} = result;
                                                this.setState({asr:asr});
                                                if(code === 200){
                                                    this.setState({loading:false});
                                                    this.tl.reverse();
                                                    this.container.current.style.visibility = "hidden";
                                                    this.widget.current.style.visibility = "hidden";

                                                    window.location =`https://ppreports.vuclip.com/tool/test/redirect.php?asr=${asr}`
                                                    // swal({
                                                    //     title: "Subscription Successful",
                                                    //     text: `You have successfully subscribed to ${selectedService.service} @ ${selectedService.tariff}`,
                                                    //     icon: "success",
                                                    // });
                                                }else{
                                                    swal({
                                                        title: "Subscription Unsuccessful",
                                                        text: message,
                                                        icon: "error",
                                                    });
                                                    this.setState({loading:false});
                                                }
                                            }).catch(err => {
                                                // this.setState({subscribeLoading:false});
                                                this.setState({loading:false});
                                                swal({
                                                    title: "Subscription Unsuccessful",
                                                    text: "You clicked the button!",
                                                    icon: "error",
                                                });
                                            });
                                        }else{
                                            retrieveServices(providerId, msisdn).then(({data}) => {
                                                console.log("retrieve service", data);
                                                const {code, result, message} = data;
                                                const {msisdn, serviceData, asr} = result;

                                                if(code === 200){
                                                    this.setState({loading:false, msisdn:msisdn, data:serviceData, asr: asr});
                                                }else {
                                                    swal({
                                                        title: "Error fetching services",
                                                        text: "You clicked the button!",
                                                        icon: "error",
                                                    });
                                                    this.setState({loading:false, msisdn:msisdn});

                                                }



                                            }).catch(err => {
                                                this.setState({loading:false});
                                            })
                                        }
                                    }

                                }} className={"wd__btn-subscribe"}>Subscribe</button>
                            </div>
                        }
                    </div>





                    {
                        this.state.loading ? <div style={{margin:16, textAlign:"center"}}>Loading</div> : data.length > 0 ?
                        <div>
                            <div>
                                {
                                     data.slice(index, index + 3).map((item, index)=>{
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
                                                    const {msisdn, msisdnChange, providerId} = this.state;
                                                    console.log(providerId);
                                                    if(msisdn !== ""){
                                                        this.setState({selectedService:item, subscribeLoading:true, msisdnError:false});

                                                        subscribeToService(item, msisdn, this.state.providerId).then(({data})=>{
                                                            this.setState({subscribeLoading:false});
                                                            console.log(data);

                                                            this.setState({loading:false});
                                                            this.tl.reverse();
                                                            this.container.current.style.visibility = "hidden";
                                                            this.widget.current.style.visibility = "hidden";

                                                            const {result, message, code} = data;
                                                            const {asr} = result;
                                                            this.setState({asr:asr});

                                                            console.log(result);

                                                            if(code === 200){
                                                            //    do the redirect
                                                                window.location =`https://ppreports.vuclip.com/tool/test/redirect.php?asr=${asr}`
                                                            }

                                                            if(code !== 200){
                                                                swal({
                                                                    title: "Subscription Unsuccessful",
                                                                    text: message,
                                                                    icon: "error",
                                                                });

                                                                // swal({
                                                                //     title: "Subscription Successful",
                                                                //     text: `You have successfully subscribed to ${selectedService.service} @ ${selectedService.tariff}`,
                                                                //     icon: "success",
                                                                // });
                                                            }
                                                        }).catch(err => {
                                                            this.setState({subscribeLoading:false});
                                                            swal({
                                                                title: "Subscription Unsuccessful",
                                                                text: "An error occured when subscribing, try again later!",
                                                                icon: "error",
                                                            });
                                                        });
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
                                data.length > 3 && <div className={"wd__service-nav"}>

                                    <MdArrowRoundBack onClick={()=> this.moveBack()}/>

                                    <MdArrowRoundForward onClick={()=> this.moveNext()}/>

                                </div>
                            }

                            {
                                !this.state.singleServiceSubscribed && <div style={{float:"right", marginRight:"1em"}}>
                                    <button onClick={()=>{
                                        this.tl.reverse();
                                        this.container.current.style.visibility = "hidden";
                                        this.widget.current.style.visibility = "hidden";
                                        window.location =`https://ppreports.vuclip.com/tool/test/redirect.php?asr=${this.state.asr}`

                                    }} className="wd__btn-service-item-btn">DONE</button>
                                </div>
                            }

                        </div>
                            :
                           null
                    }



                    <div style={{marginTop:"4em", color:"gainsboro", textAlign:"center"}}>Powered by Rancard</div>
                </div>


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




    fetchUserServices = (providerId, serviceKeyword, msisdn) => {
        fetchUserServices(providerId, serviceKeyword, msisdn).then(({data}) => {

            if (this._isMounted) {

                console.log(data);
                const {result, code} =  data;
                console.log(code);
                if(result !== "FAILED"){
                    const {serviceData, msisdn} = result;
                    if(code === 200){
                        this.setState({loading:false,msisdn:msisdn, data:serviceData[0]});
                        console.log("setting provider state  "+ providerId );
                        this.setState({providerId:providerId})

                    }else{
                        this.setState({loading:false})

                    }
                }
            }

        }).catch(err =>{
            console.log(err);
            this.setState({loading:false})
        })
    };



}

export default App


