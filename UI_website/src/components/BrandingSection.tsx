import React from "react"
import Goa from "../assets/Goa.png"
import Garbage from "../assets/Garbage.png"
import "../style/BrandingSection.css"
function BrandingSection(){
    return <div className="brandingSection">
        <img className="BrandLogo" src={Goa} alt="BrandLogo" />
        <img className="GarbageBin" src={Garbage} alt="GarbageBin" />
        <img  className="GarbageBinSmall" src={Garbage} alt="GarbageBin" />
    </div>
}
export default BrandingSection