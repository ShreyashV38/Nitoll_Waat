package com.example.bincollector.models;

public class IgnoreRequest {
    private String bin_id;
    private String reason;

    public IgnoreRequest(String bin_id, String reason) {
        this.bin_id = bin_id;
        this.reason = reason;
    }
}