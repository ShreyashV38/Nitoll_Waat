import BrandingSection from "../components/BrandingSection"
import LoginForm from "../components/LoginForm"
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