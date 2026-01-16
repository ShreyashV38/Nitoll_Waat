import BrandingSection from "../components/Auth/BrandingSection"
import LoginForm from "../components/Auth/LoginForm"
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