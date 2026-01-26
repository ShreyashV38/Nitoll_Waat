package com.example.bincollector.models;

import android.graphics.Color;
import android.os.AsyncTask;
import android.util.Log;

import org.json.JSONArray;
import org.json.JSONObject;
import org.osmdroid.util.GeoPoint;
import org.osmdroid.views.MapView;
import org.osmdroid.views.overlay.Polyline;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;

/**
 * Helper class to fetch and draw actual road routes using OSRM (Open Source Routing Machine)
 * Free alternative to Google Directions API
 */
public class RouteDrawHelper {

    private static final String TAG = "RouteDrawHelper";
    private static final String OSRM_BASE_URL = "https://router.project-osrm.org/route/v1/driving/";

    public interface RouteCallback {
        void onRouteReady(Polyline routeLine, double distanceKm, int durationMinutes);
        void onRouteFailed(String error);
    }

    /**
     * Fetch route between multiple waypoints
     * @param waypoints List of GeoPoints (start, bins, dump zone)
     * @param mapView The map to draw on
     * @param callback Callback with route result
     */
    public static void fetchAndDrawRoute(List<GeoPoint> waypoints, MapView mapView, RouteCallback callback) {
        if (waypoints == null || waypoints.size() < 2) {
            callback.onRouteFailed("Need at least 2 points for routing");
            return;
        }

        new FetchRouteTask(waypoints, mapView, callback).execute();
    }

    /**
     * AsyncTask to fetch route from OSRM API
     */
    private static class FetchRouteTask extends AsyncTask<Void, Void, RouteResult> {
        private List<GeoPoint> waypoints;
        private MapView mapView;
        private RouteCallback callback;

        FetchRouteTask(List<GeoPoint> waypoints, MapView mapView, RouteCallback callback) {
            this.waypoints = waypoints;
            this.mapView = mapView;
            this.callback = callback;
        }

        @Override
        protected RouteResult doInBackground(Void... voids) {
            try {
                // Build OSRM URL with waypoints
                StringBuilder coords = new StringBuilder();
                for (int i = 0; i < waypoints.size(); i++) {
                    GeoPoint p = waypoints.get(i);
                    coords.append(p.getLongitude()).append(",").append(p.getLatitude());
                    if (i < waypoints.size() - 1) coords.append(";");
                }

                String urlString = OSRM_BASE_URL + coords.toString() +
                        "?overview=full&geometries=geojson&steps=false";

                Log.d(TAG, "Fetching route: " + urlString);

                URL url = new URL(urlString);
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("GET");
                conn.setConnectTimeout(10000);
                conn.setReadTimeout(10000);

                int responseCode = conn.getResponseCode();
                if (responseCode != 200) {
                    return new RouteResult("HTTP Error: " + responseCode);
                }

                // Read response
                BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream()));
                StringBuilder response = new StringBuilder();
                String line;
                while ((line = reader.readLine()) != null) {
                    response.append(line);
                }
                reader.close();

                // Parse JSON
                JSONObject json = new JSONObject(response.toString());

                if (!json.getString("code").equals("Ok")) {
                    return new RouteResult("OSRM Error: " + json.optString("message", "Unknown"));
                }

                JSONArray routes = json.getJSONArray("routes");
                if (routes.length() == 0) {
                    return new RouteResult("No route found");
                }

                JSONObject route = routes.getJSONObject(0);
                JSONObject geometry = route.getJSONObject("geometry");
                JSONArray coordinates = geometry.getJSONArray("coordinates");

                // Convert coordinates to GeoPoints
                List<GeoPoint> routePoints = new ArrayList<>();
                for (int i = 0; i < coordinates.length(); i++) {
                    JSONArray coord = coordinates.getJSONArray(i);
                    double lon = coord.getDouble(0);
                    double lat = coord.getDouble(1);
                    routePoints.add(new GeoPoint(lat, lon));
                }

                // Extract distance and duration
                double distanceMeters = route.getDouble("distance");
                double durationSeconds = route.getDouble("duration");

                RouteResult result = new RouteResult();
                result.points = routePoints;
                result.distanceKm = distanceMeters / 1000.0;
                result.durationMinutes = (int) (durationSeconds / 60);
                result.success = true;

                return result;

            } catch (Exception e) {
                Log.e(TAG, "Route fetch error", e);
                return new RouteResult("Error: " + e.getMessage());
            }
        }
        /**
         * Add this to RouteDrawHelper.java for handling routes with many waypoints
         */

        public static void fetchAndDrawRouteBatched(List<GeoPoint> waypoints, MapView mapView, RouteCallback callback) {
            if (waypoints.size() <= 25) {
                // OSRM supports up to 100 waypoints, but for performance use 25
                fetchAndDrawRoute(waypoints, mapView, callback);
                return;
            }

            // Split into segments if too many waypoints
            List<List<GeoPoint>> batches = new ArrayList<>();
            int batchSize = 20;

            for (int i = 0; i < waypoints.size(); i += batchSize - 1) {
                int end = Math.min(i + batchSize, waypoints.size());
                List<GeoPoint> batch = waypoints.subList(i, end);
                batches.add(batch);
            }

            // Fetch all batches and combine
            new CombinedRouteTask(batches, mapView, callback).execute();
        }

        private static class CombinedRouteTask extends AsyncTask<Void, Void, List<RouteResult>> {
            private List<List<GeoPoint>> batches;
            private MapView mapView;
            private RouteCallback callback;

            CombinedRouteTask(List<List<GeoPoint>> batches, MapView mapView, RouteCallback callback) {
                this.batches = batches;
                this.mapView = mapView;
                this.callback = callback;
            }

            @Override
            protected List<RouteResult> doInBackground(Void... voids) {
                List<RouteResult> results = new ArrayList<>();

                for (List<GeoPoint> batch : batches) {
                    FetchRouteTask task = new FetchRouteTask(batch, mapView, null);
                    RouteResult result = task.doInBackground();

                    if (!result.success) {
                        return null; // Abort on first failure
                    }
                    results.add(result);
                }

                return results;
            }

            @Override
            protected void onPostExecute(List<RouteResult> results) {
                if (results == null || results.isEmpty()) {
                    callback.onRouteFailed("Failed to fetch route segments");
                    return;
                }

                // Combine all route segments
                List<GeoPoint> combinedPoints = new ArrayList<>();
                double totalDistance = 0;
                int totalDuration = 0;

                for (RouteResult r : results) {
                    combinedPoints.addAll(r.points);
                    totalDistance += r.distanceKm;
                    totalDuration += r.durationMinutes;
                }

                // Create combined polyline
                Polyline polyline = new Polyline(mapView);
                polyline.setPoints(combinedPoints);
                polyline.setColor(Color.parseColor("#2196F3"));
                polyline.setWidth(12.0f);

                callback.onRouteReady(polyline, totalDistance, totalDuration);
            }
        }

        @Override
        protected void onPostExecute(RouteResult result) {
            if (!result.success) {
                callback.onRouteFailed(result.error);
                return;
            }

            // Create polyline
            Polyline polyline = new Polyline(mapView);
            polyline.setPoints(result.points);
            polyline.setColor(Color.parseColor("#2196F3")); // Blue route
            polyline.setWidth(12.0f);

            callback.onRouteReady(polyline, result.distanceKm, result.durationMinutes);
        }
    }

    /**
     * Internal class to hold route result
     */
    private static class RouteResult {
        boolean success = false;
        List<GeoPoint> points;
        double distanceKm;
        int durationMinutes;
        String error;

        RouteResult() {}
        RouteResult(String error) {
            this.error = error;
            this.success = false;
        }
    }
}