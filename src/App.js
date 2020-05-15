import React from 'react';
import "./App.css"
import {AnimateOnChange} from 'react-animation'


class App extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            show:false
        }
    }

    toggle = () =>{
        this.setState(()=>{
            return {show: !this.state.show}
        })
    };


    render() {
        return(
            <div>
                <AnimateOnChange
                    animationIn="bounceIn"
                    animationOut="bounceOut"

                >
                {
                    this.state.show &&


                        <div className={"enrichment-container"}>
                            <p className={"en_info"}>
                                Get daily news from BBCNEWS direct to your mobile! @GHS1/day*
                            </p>

                            <p className={"en_instruction"}>Please enter your phone number</p>
                            <input  className={"en_input"} type="number"/>

                            <button className={"en_sub_btn"}>Subscribe</button>

                        </div>

                }
                </AnimateOnChange>

                <div onClick={()=>this.toggle()} className={"app"}>
                    A.B
                </div>
            </div>
        );
    }
}
export default App


