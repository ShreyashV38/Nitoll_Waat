package com.example.bincollector.models;

import com.google.gson.annotations.SerializedName;

public class DriverRoute {
    @SerializedName("route_id")
    private String routeId;

    @SerializedName("ward_name")
    private String wardName;

    @SerializedName("license_plate")
    private String licensePlate;

    @SerializedName("total_bins")
    private int totalBins;

    @SerializedName("pending_bins")
    private int pendingBins;

    @SerializedName("status")
    private String status;

    // Getters
    public String getRouteId() { return routeId; }
    public String getWardName() { return wardName; }
    public String getLicensePlate() { return licensePlate; }
    public int getTotalBins() { return totalBins; }
    public int getPendingBins() { return pendingBins; }
    public String getStatus() { return status; }
}