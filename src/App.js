import React, {createRef} from 'react';
import "./App.css"
import {TimelineLite,TimelineMax, TweenLite, Power4, Bounce} from "gsap/all";

class App extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            show:false
        };

        this.widget = createRef();
        this.button = createRef();
        this.testFadeIn = createRef();
    }


    toggle = () =>{
        this.setState(()=>{
            return {show: !this.state.show}
        })
    };

    componentDidMount() {

        const scripts = document.getElementsByTagName("script");
        for(let i = 0; i<= scripts.length; i++){
            const script = scripts[i];
            if(script){
                let scriptSrc = script.src;
                if(scriptSrc.includes("ds-widget.js")){
                    let providerId = scriptSrc.split("?")[1];
                    console.log(providerId);
                }
                console.log("item", script.src)
            }
        }
    }


    render() {

        const tl = new TimelineLite();
        tl.fromTo(this.button.current,0.3, {
            scale:1,
            opacity:1
        }, {
            scale:0,
            opacity:0
        })
            .fromTo(
            this.widget.current,
            0.5,
            {
                opacity:0,
                visibility:"hidden",
                height:0,
                width:0
            }, {
                opacity:1,
                visibility:"visible",
                height:"26rem",
                width:"20rem",
                ease:Power4.easeInOut
            }).fromTo(
                this.testFadeIn.current,
            0.1,
            {
                marginBottom:"-10px",
                opacity:0,
            },
            {
                marginBottom:"0px",
                opacity:1,
                ease:Power4.easeIn
            }
        );



        return(
            <div>

                <div ref={this.widget} className={"enrichment_container"}>
                    <p onClick={()=>{
                        tl.reverse();
                    }} style={{color:"red", fontWeight:"bold"}}>Close</p>
                    <p ref={this.testFadeIn} className={"en_info"}>
                        Get daily news from BBCNEWS direct to your mobile! @GHS1/day*
                    </p>

                    <p className={"en_instruction"}>Please enter your phone number</p>
                    <input  className={"en_input"} type="number"/>

                    <button className={"en_sub_btn"}>Subscribe</button>

                </div>

                <div ref={this.button} onClick={()=>{
                    this.toggle();

                    tl.play();


                }} className={"app"}>
                    <img src="https://r2mp.scdn5.secure.raxcdn.com/images/pc.png" alt="" style={{
                        height:20,
                        width:20
                    }}/>
                </div>
            </div>
        );
    }
}
export default App


