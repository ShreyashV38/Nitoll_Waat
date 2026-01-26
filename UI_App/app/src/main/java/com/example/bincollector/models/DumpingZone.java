package com.example.bincollector.models;

import com.google.gson.annotations.SerializedName; // Optional if you use Gson, but standard naming is safer

public class DumpingZone {
    private String id;

    // FIX: Changed from 'zone_name' to 'name' to match your PostgreSQL column
    private String name;

    private double latitude;
    private double longitude;

    public String getId() { return id; }
    public String getName() { return name; }
    public double getLatitude() { return latitude; }
    public double getLongitude() { return longitude; }

    // This decides what text shows in the Spinner
    @Override
    public String toString() {
        return name;
    }
}