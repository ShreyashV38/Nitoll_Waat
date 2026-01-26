package com.example.bincollector.models;

import com.google.gson.annotations.SerializedName;

public class RoutePoint {

    @SerializedName("type")
    public String type; // START, COLLECTION_POINT, END

    @SerializedName("bin_id")
    public String bin_id;

    @SerializedName("name")
    public String name;

    @SerializedName("latitude")
    public double latitude;

    @SerializedName("longitude")
    public double longitude;

    @SerializedName("fill")
    public double fill;

    @SerializedName("weight")
    public double weight;

    @SerializedName("reason")
    public String reason;

    // NEW: Prediction fields
    @SerializedName("urgency")
    public String urgency; // HIGH, MEDIUM, LOW

    @SerializedName("predicted_overflow_at")
    public String predicted_overflow_at;

    @SerializedName("hours_until_overflow")
    public Double hours_until_overflow;

    @SerializedName("current_status")
    public String current_status;

    // For tracking collection in the app
    public boolean isHandled = false;

    // Constructor
    public RoutePoint() {}

    // Getters and Setters (optional, but good practice)
    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getBinId() {
        return bin_id;
    }

    public void setBinId(String bin_id) {
        this.bin_id = bin_id;
    }
}