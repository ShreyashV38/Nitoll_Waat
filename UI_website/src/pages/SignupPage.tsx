import BrandingSection from "../components/BrandingSection"
import LoginForm from "../components/SignupForm"
import "../style/LoginPage.css"
function SignupPage(){
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

export default SignupPage