//package com.example.bincollector.models;
//
//public class LoginResponse {
//    private boolean success;
//    private String message;
//    private String token; // <--- ADD THIS
//
//    public boolean isSuccess() {
//        return success;
//    }
//
//    public String getMessage() {
//        return message;
//    }
//
//    // <--- ADD THIS GETTER
//    public String getToken() {
//        return token;
//    }
//}

// main/java/com/example/bincollector/models/LoginResponse.java
package com.example.bincollector.models;

import com.google.gson.annotations.SerializedName;

public class LoginResponse {
    private String token;
    private User user; // Add this field to match backend response

    public String getToken() { return token; }
    public User getUser() { return user; } // Add this getter

    public static class User {
        private String name;
        private String email;
        private String mobile;
        private String role;
        @SerializedName("ward_name")
        private String wardName;

        public String getName() { return name; }
        public String getEmail() { return email; }
        public String getMobile() { return mobile; }
        public String getRole() { return role; }
        public String getWardName() { return wardName; }
    }
}