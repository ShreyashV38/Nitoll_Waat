import { useState } from "react";
import Google from "../assets/google.png"
import Apple from "../assets/apple-logo.png"
import Facebook from "../assets/facebook.png"
import "../style/LoginForm.css"

function LoginForm(){
    //States to store user inputs
    const [phoneNumber,setPhoneNumber]=useState("")
    const [otp,setOtp]=useState("")
    const [sendOtp,setSendOtp]=useState(false)

    //function to handle sendOtp Click
    const handleSendOtp=()=>{
        if(phoneNumber==="" || phoneNumber.length<10){
            alert("please enter a valid number")
            return
        }
        setSendOtp(true)
        alert("OTP sent!")
        console.log("Otp sent to:",phoneNumber)
    }

    //function to handle next Button click
    const handleNext=()=>{
        if(otp===""){
            alert("Please Enter OTP")
            return
        }
        console.log("Login with:", { phoneNumber, otp });   
    }

    return (
    <div className="login-page-wrapper">
        {/* Top Section: Sign Up Button */}
        <div className="switchToSignUp">
            <h3>No Account yet?</h3>
            <button>Sign Up</button>
        </div>
        
        {/* Middle Section: Centered Form */}
        <div className="form-wrap-center">
            <div className="form-container">
                <div className="Greetings">
                    <h2>Welcome to </h2>
                    <h1>NitollWaat</h1>
                </div>

                <div className="loginForm">
                    <h3>Welcome back!</h3>
                    <p className="subtitle">Authenticate to access your account</p>                
                    <div className="inputFields">
                    
                            <input type="tel" placeholder="Phone Number" value={phoneNumber} 
                            onChange={(e)=>setPhoneNumber(e.target.value)}  className="input-field" disabled={sendOtp}/>  

                            {!sendOtp && (<button 
                                            onClick={handleSendOtp} 
                                            className="sendOtp-btn">Send OTP</button>)}
                            
                            {sendOtp && (
                            <input type="text" placeholder="OTP" value={otp} 
                            onChange={(e)=>setOtp(e.target.value)}  className="input-field" />   )
                            }

                            {sendOtp && (
                            <button onClick={handleNext} className="next-btn">Next</button>
                            )}

                            <div className="otherMethods">
                                <p>Or do it via other accounts</p>
                                <div className="methods">
                                    <a href="#"><img src={Google} alt="Google" /></a>
                                    <a href="#"><img src={Apple} alt="Apple" /></a>
                                    <a href="#"><img src={Facebook} alt="Facebook" /></a>
                                </div>
                            </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    )
}

export default LoginForm