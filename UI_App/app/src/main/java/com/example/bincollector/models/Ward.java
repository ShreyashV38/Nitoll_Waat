package com.example.bincollector.models;

public class Ward {
    private String wardNo;
    private int totalBins;
    private int pendingBins;
    private boolean isCollected;

    // Updated Constructor
    public Ward(String wardNo, int totalBins, int pendingBins, boolean isCollected) {
        this.wardNo = wardNo;
        this.totalBins = totalBins;
        this.pendingBins = pendingBins;
        this.isCollected = isCollected;
    }

    // Getters
    public String getWardNo() { return wardNo; }
    public int getTotalBins() { return totalBins; }
    public int getPendingBins() { return pendingBins; } // This fixes your error
    public boolean isCollected() { return isCollected; }

    // Setters
    public void setWardNo(String wardNo) { this.wardNo = wardNo; }
    public void setTotalBins(int totalBins) { this.totalBins = totalBins; }
    public void setPendingBins(int pendingBins) { this.pendingBins = pendingBins; }
    public void setCollected(boolean collected) { isCollected = collected; }
}