import BrandingSection from "../components/BrandingSection"
import LoginForm from "../components/LoginForm"
import "../style/LoginPage.css"
function LoginPage(){
    return(
        <div className="Login-container">
            <BrandingSection/>
            <div className="FormSection">
            <LoginForm/>
            </div>
        </div>
    )
}

export default LoginPage