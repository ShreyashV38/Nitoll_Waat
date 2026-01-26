package com.example.bincollector.models;

import com.google.gson.annotations.SerializedName;
import java.util.List;

public class OptimizedRouteResponse {

    @SerializedName("success")
    public boolean success;

    @SerializedName("data")
    public RouteResult data;

    @SerializedName("summary")
    public RouteSummary summary;

    // Getters
    public boolean isSuccess() {
        return success;
    }

    public RouteResult getData() {
        return data;
    }

    public RouteSummary getSummary() {
        return summary;
    }

    // Inner class: RouteResult
    public static class RouteResult {
        @SerializedName("route_points")
        public List<RoutePoint> route_points;

        @SerializedName("other_bins")
        public List<RoutePoint> other_bins;

        @SerializedName("blocked_bins")
        public List<RoutePoint> blocked_bins;

        @SerializedName("meta")
        public RouteMeta meta;

        public List<RoutePoint> getRoutePoints() {
            return route_points;
        }

        public List<RoutePoint> getOtherBins() {
            return other_bins;
        }

        public List<RoutePoint> getBlockedBins() {
            return blocked_bins;
        }

        public RouteMeta getMeta() {
            return meta;
        }
    }

    // Inner class: RouteMeta
    public static class RouteMeta {
        @SerializedName("total_stops")
        public int total_stops;

        @SerializedName("bins_to_collect")
        public int bins_to_collect;

        @SerializedName("bins_blocked")
        public int bins_blocked;

        @SerializedName("bins_monitored")
        public int bins_monitored;

        @SerializedName("critical_now")
        public int critical_now;

        @SerializedName("predicted_soon")
        public int predicted_soon;
    }

    // Inner class: RouteSummary
    public static class RouteSummary {
        @SerializedName("message")
        public String message;

        @SerializedName("collection_window")
        public String collection_window;
    }

    // IMPORTANT: This allows backward compatibility
    // If you already have RoutePoint as a separate class, you can keep it
    // Otherwise, use the RoutePoint class I created above
}