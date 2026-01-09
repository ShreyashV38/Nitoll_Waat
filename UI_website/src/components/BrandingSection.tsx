import React from "react"
import Goa from "../assets/Goa.png"
import "../style/BrandingSection.css"
function BrandingSection(){
    return <div className="brandingSection">
        <img className="BrandLogo" src={Goa} alt="BrandLogo" />
    </div>
}
export default BrandingSection