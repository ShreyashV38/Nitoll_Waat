import BrandingSection from "../components/Auth/BrandingSection"
import SignupForm from "../components/Auth/SignupForm"
import LoginForm from "../components/Auth/SignupForm"
import "../style/LoginPage.css"
function SignupPage(){
    return(
        <div className="Login-container">
            <div className="BrandSection">
                <BrandingSection/>
            </div>
            <div className="FormSection">
            <SignupForm/>
            </div>
        </div>
    )
}

export default SignupPage