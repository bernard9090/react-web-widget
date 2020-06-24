import React from 'react';
import "./App.css"
import {TimelineLite} from "gsap";

class App extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            show:false
        };

        this.widget = null;

    }

    toggle = () =>{
        this.setState(()=>{
            return {show: !this.state.show}
        })
    };


    render() {
        return(
            <div className={"widget__container"}>

                {
                    this.state.show &&


                        <div ref={(div) => this.widget = div} className={"enrichment-container"}>
                            <p className={"en_info"}>
                                Get daily news from BBCNEWS direct to your mobile! @GHS1/day*
                            </p>

                            <p className={"en_instruction"}>Please enter your phone number</p>
                            <input  className={"en_input"} type="number"/>

                            <button className={"en_sub_btn"}>Subscribe</button>

                        </div>

                }


                <div onClick={()=>this.toggle()} className={"app"}>
                    A.B
                </div>
            </div>
        );
    }
}
export default App


