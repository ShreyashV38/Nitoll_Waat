import BrandingSection from "../components/BrandingSection"
import SignupForm from "../components/SignupForm"
import LoginForm from "../components/SignupForm"
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