import React from 'react';
import ReactDOM from 'react-dom';
import App from "./App";

const item  =  document.createElement("div");
const attr = document.createAttribute("id");
attr.value = "root";
item.setAttributeNode(attr);
document.body.appendChild(item);

ReactDOM.render( <App/>, document.getElementById('root') );