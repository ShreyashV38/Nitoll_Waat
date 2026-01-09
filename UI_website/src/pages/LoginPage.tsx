import BrandingSection from "../components/BrandingSection"
import LoginForm from "../components/LoginForm"
import "../style/LoginPage.css"
function LoginPage(){
    return(
        <div className="Login-container">
            <div className="BrandSection">
                <BrandingSection/>
            </div>
            <div className="FormSection">
            <LoginForm/>
            </div>
        </div>
    )
}

export default LoginPage