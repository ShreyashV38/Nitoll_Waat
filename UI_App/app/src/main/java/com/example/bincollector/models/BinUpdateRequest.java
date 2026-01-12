package com.example.bincollector.models;

public class BinUpdateRequest {
    private String userId;
    private String wardNo;
    private int binLevel;
    private boolean collected;

    public BinUpdateRequest(String userId, String wardNo, int binLevel, boolean collected) {
        this.userId = userId;
        this.wardNo = wardNo;
        this.binLevel = binLevel;
        this.collected = collected;
    }

    // Getters (Required by GSON)
    public String getUserId() { return userId; }
    public String getWardNo() { return wardNo; }
    public int getBinLevel() { return binLevel; }
    public boolean isCollected() { return collected; }
}