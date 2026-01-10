package com.example.bincollector.models;
public class Ward {
    private String wardNo;
    private int totalBins;
    private boolean isCollected;

    public Ward(String wardNo, int totalBins, boolean isCollected) {
        this.wardNo = wardNo;
        this.totalBins = totalBins;
        this.isCollected = isCollected;
    }

    // Getters
    public String getWardNo() { return wardNo; }
    public int getTotalBins() { return totalBins; }
    public boolean isCollected() { return isCollected; }

    // Setters
    public void setCollected(boolean collected) { isCollected = collected; }
}