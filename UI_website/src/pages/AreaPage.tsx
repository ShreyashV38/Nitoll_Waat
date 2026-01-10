import BrandingSection from "../components/BrandingSection"
import AreaSelector from "../components/AreaSelector"
import "../style/LoginPage.css" // Reusing the split-screen layout

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