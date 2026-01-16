import BrandingSection from "../components/Auth/BrandingSection"
import AreaSelector from "../components/Auth/AreaSelector"
import "../style/LoginPage.css" 

function AreaPage() {
    return (
        <div className="Login-container">
            <div className="BrandSection">
                <BrandingSection />
            </div>
            <div className="FormSection">
                <AreaSelector />
            </div>
        </div>
    )
}

export default AreaPage