package com.example.bincollector.fragments;

import android.Manifest;
import android.content.Context;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.PorterDuff;
import android.graphics.PorterDuffColorFilter;
import android.graphics.drawable.BitmapDrawable;
import android.graphics.drawable.Drawable;
import android.location.Location;
import android.location.LocationManager;
import android.os.Bundle;
import android.preference.PreferenceManager;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ProgressBar;
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AlertDialog;
import androidx.core.app.ActivityCompat;
import androidx.fragment.app.Fragment;

import com.example.bincollector.R;
import com.example.bincollector.models.DumpingZone;
import com.example.bincollector.models.IgnoreRequest;
import com.example.bincollector.models.OptimizedRouteResponse;
import com.example.bincollector.models.RouteGenRequest;
import com.example.bincollector.models.RoutePoint;
import com.example.bincollector.network.ApiService;
import com.example.bincollector.network.RetrofitClient;
import com.example.bincollector.models.RouteDrawHelper;
import com.google.android.material.bottomsheet.BottomSheetDialog;
import com.google.android.material.floatingactionbutton.FloatingActionButton;

import org.osmdroid.config.Configuration;
import org.osmdroid.tileprovider.tilesource.TileSourceFactory;
import org.osmdroid.util.GeoPoint;
import org.osmdroid.views.MapView;
import org.osmdroid.views.overlay.Marker;
import org.osmdroid.views.overlay.Polyline;
import org.osmdroid.views.overlay.mylocation.GpsMyLocationProvider;
import org.osmdroid.views.overlay.mylocation.MyLocationNewOverlay;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import okhttp3.ResponseBody;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class MapFragment extends Fragment {

    private MapView map;
    private MyLocationNewOverlay mLocationOverlay;

    // UI
    private Spinner spinnerZones;
    private Button btnGenerate;
    private FloatingActionButton btnRecenter;
    private ProgressBar progressBar;

    // State
    private List<DumpingZone> zones = new ArrayList<>();
    private Map<String, RoutePoint> markerMap = new HashMap<>();
    private int totalCriticalBins = 0;
    private int handledBins = 0;
    private boolean isNavigationMode = true;

    // CONFIG: Icon Size in Pixels (Adjust this if still too big/small)
    private static final int BIN_ICON_SIZE = 60;

    @Override
    public void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Context ctx = getContext();
        if (ctx != null) {
            Configuration.getInstance().load(ctx, PreferenceManager.getDefaultSharedPreferences(ctx));
        }
    }

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_map, container, false);

        // 1. SETUP MAP
        map = view.findViewById(R.id.mapView);
        map.setTileSource(TileSourceFactory.MAPNIK);
        map.setMultiTouchControls(true);
        map.getController().setZoom(15.0);
        map.getController().setCenter(new GeoPoint(15.4909, 73.8278));

        // In onCreateView, before setupLocationOverlay();
        if (ActivityCompat.checkSelfPermission(getContext(), Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            // Request permission if not granted
            requestPermissions(new String[]{Manifest.permission.ACCESS_FINE_LOCATION}, 1);
        }

        // 2. SETUP LOCATION
        setupLocationOverlay();

        // 3. UI BINDING
        spinnerZones = view.findViewById(R.id.spinnerZones);
        btnGenerate = view.findViewById(R.id.btnGenerateRoute);
        btnRecenter = view.findViewById(R.id.btnRecenter);
        progressBar = view.findViewById(R.id.progressBar);

        btnGenerate.setOnClickListener(v -> generateRoute());

        btnRecenter.setOnClickListener(v -> {
            isNavigationMode = !isNavigationMode;
            if (isNavigationMode) {
                centerOnUser();
                btnRecenter.setImageResource(android.R.drawable.ic_menu_mylocation);
                Toast.makeText(getContext(), "Navigation Mode: ON", Toast.LENGTH_SHORT).show();
            } else {
                if (mLocationOverlay != null) mLocationOverlay.disableFollowLocation();
                btnRecenter.setImageResource(android.R.drawable.ic_menu_compass);
                Toast.makeText(getContext(), "Free Roam Mode", Toast.LENGTH_SHORT).show();
            }
        });

        loadDumpingZones();

        return view;
    }

    private void setupLocationOverlay() {
        GpsMyLocationProvider provider = new GpsMyLocationProvider(getContext());
        provider.addLocationSource(LocationManager.GPS_PROVIDER);
        provider.addLocationSource(LocationManager.NETWORK_PROVIDER);

        mLocationOverlay = new MyLocationNewOverlay(provider, map);
        mLocationOverlay.enableMyLocation();
        if(isNavigationMode) mLocationOverlay.enableFollowLocation();
        mLocationOverlay.setDrawAccuracyEnabled(true);

        mLocationOverlay.runOnFirstFix(() -> {
            if (getActivity() != null) {
                getActivity().runOnUiThread(() -> {
                    map.getController().animateTo(mLocationOverlay.getMyLocation());
                    map.getController().setZoom(18.0);
                });
            }
        });

        map.getOverlays().add(mLocationOverlay);
    }

    private void centerOnUser() {
        GeoPoint myLoc = mLocationOverlay.getMyLocation();
        if (myLoc == null) {
            LocationManager lm = (LocationManager) getContext().getSystemService(Context.LOCATION_SERVICE);
            if (ActivityCompat.checkSelfPermission(getContext(), Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
                Location lastLoc = lm.getLastKnownLocation(LocationManager.GPS_PROVIDER);
                if (lastLoc == null) lastLoc = lm.getLastKnownLocation(LocationManager.NETWORK_PROVIDER);
                if (lastLoc != null) myLoc = new GeoPoint(lastLoc.getLatitude(), lastLoc.getLongitude());
            }
        }

        if (myLoc != null) {
            map.getController().animateTo(myLoc);
            map.getController().setZoom(18.0);
            mLocationOverlay.enableFollowLocation();
        } else {
            Toast.makeText(getContext(), "Waiting for GPS...", Toast.LENGTH_SHORT).show();
        }
    }

    private void loadDumpingZones() {
        ApiService api = RetrofitClient.getApiService(getContext());
        api.getDumpingZones().enqueue(new Callback<List<DumpingZone>>() {
            @Override
            public void onResponse(Call<List<DumpingZone>> call, Response<List<DumpingZone>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    zones = response.body();
                    ArrayAdapter<DumpingZone> adapter = new ArrayAdapter<>(getContext(),
                            R.layout.spinner_item, zones);
                    adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
                    spinnerZones.setAdapter(adapter);
                } else {
                    Toast.makeText(getContext(), "Failed to load zones", Toast.LENGTH_SHORT).show();
                }
            }
            @Override
            public void onFailure(Call<List<DumpingZone>> call, Throwable t) {
                Log.e("MapFragment", "Zone Load Error", t);
            }
        });
    }

    private void generateRoute() {
        // 1. Validate Zone Selection
        if (spinnerZones.getSelectedItem() == null) {
            Toast.makeText(getContext(), "Please select a Zone first!", Toast.LENGTH_SHORT).show();
            return;
        }

        // 2. Get Location (Safe Mode)
        GeoPoint myLoc = mLocationOverlay.getMyLocation();

        // FIX: If GPS is not ready (null), use a default location so the app doesn't stop.
        if (myLoc == null) {
            // Using a default location (e.g., Panjim, Goa) for testing
            myLoc = new GeoPoint(15.4909, 73.8278);
            Toast.makeText(getContext(), "GPS pending... Using default location.", Toast.LENGTH_SHORT).show();
        }

        // 3. Prepare the Request
        DumpingZone selectedZone = (DumpingZone) spinnerZones.getSelectedItem();
        progressBar.setVisibility(View.VISIBLE);

        // This log confirms the request is actually being sent
        Log.d("MapFragment", "Requesting Route -> Lat: " + myLoc.getLatitude() + " Zone: " + selectedZone.getId());

        RouteGenRequest req = new RouteGenRequest(myLoc.getLatitude(), myLoc.getLongitude(), selectedZone.getId());

        // 4. Call the API
        RetrofitClient.getApiService(getContext()).generateRoute(req).enqueue(new Callback<OptimizedRouteResponse>() {
            @Override
            public void onResponse(Call<OptimizedRouteResponse> call, Response<OptimizedRouteResponse> response) {
                progressBar.setVisibility(View.GONE);
                if (response.isSuccessful() && response.body() != null) {
                    // Success: Draw the route and bins
                    renderRouteOnMap(response.body().getData());
                    Toast.makeText(getContext(), "Route Generated!", Toast.LENGTH_SHORT).show();
                } else {
                    Toast.makeText(getContext(), "Server Error: " + response.code(), Toast.LENGTH_LONG).show();
                }
            }

            @Override
            public void onFailure(Call<OptimizedRouteResponse> call, Throwable t) {
                progressBar.setVisibility(View.GONE);
                Toast.makeText(getContext(), "Connection Failed: " + t.getMessage(), Toast.LENGTH_LONG).show();
            }
        });
    }

    private void renderRouteOnMap(OptimizedRouteResponse.RouteResult result) {
        if (map == null || result == null) return;

        map.getOverlays().clear();
        if (mLocationOverlay != null) map.getOverlays().add(mLocationOverlay);
        markerMap.clear();

        List<GeoPoint> waypointSequence = new ArrayList<>();
        totalCriticalBins = 0;
        handledBins = 0;

        if (result.route_points != null) {
            for (RoutePoint pt : result.route_points) {
                GeoPoint gp = new GeoPoint(pt.latitude, pt.longitude);
                waypointSequence.add(gp);

                if ("COLLECTION_POINT".equals(pt.type)) {
                    totalCriticalBins++;
                    addEnhancedMarker(gp, pt);
                } else if ("START".equals(pt.type)) {
                    addMarker(gp, pt, "Start");
                } else if ("END".equals(pt.type)) {
                    addMarker(gp, pt, "Dump Zone");
                }
            }
        }

        if (waypointSequence.size() >= 2) {
            progressBar.setVisibility(View.VISIBLE);
            RouteDrawHelper.fetchAndDrawRoute(waypointSequence, map, new RouteDrawHelper.RouteCallback() {
                @Override
                public void onRouteReady(Polyline routeLine, double distanceKm, int durationMinutes) {
                    progressBar.setVisibility(View.GONE);
                    map.getOverlays().add(0, routeLine);
                    map.invalidate();
                }
                @Override
                public void onRouteFailed(String error) {
                    progressBar.setVisibility(View.GONE);
                    drawStraightLineRoute(waypointSequence);
                }
            });
        }

        if (result.other_bins != null) {
            for (RoutePoint pt : result.other_bins) {
                pt.type = "OPTIONAL";
                addMarker(new GeoPoint(pt.latitude, pt.longitude), pt, "Optional");
            }
        }

        if (result.blocked_bins != null) {
            for (RoutePoint pt : result.blocked_bins) {
                pt.type = "BLOCKED";
                addEnhancedMarker(new GeoPoint(pt.latitude, pt.longitude), pt);            }
        }

        if(isNavigationMode) centerOnUser();
    }

    // --- HELPER TO RESIZE ICONS ---
    private Drawable resizeAndColorDrawable(int resId, int w, int h, int color) {
        try {
            Drawable icon = getResources().getDrawable(resId).mutate();
            Bitmap bitmap = Bitmap.createBitmap(w, h, Bitmap.Config.ARGB_8888);
            Canvas canvas = new Canvas(bitmap);
            icon.setBounds(0, 0, canvas.getWidth(), canvas.getHeight());
            icon.setColorFilter(new PorterDuffColorFilter(color, PorterDuff.Mode.SRC_IN));
            icon.draw(canvas);
            return new BitmapDrawable(getResources(), bitmap);
        } catch (Exception e) {
            return getResources().getDrawable(resId);
        }
    }

    private void addEnhancedMarker(GeoPoint gp, RoutePoint data) {
        Marker m = new Marker(map);
        m.setPosition(gp);
        m.setAnchor(Marker.ANCHOR_CENTER, Marker.ANCHOR_BOTTOM);
        m.setTitle(data.name);
        m.setId(data.bin_id);
        markerMap.put(m.getId(), data);

        int color;
        String snippet;
        boolean isPredictedCritical = (data.hours_until_overflow != null && data.hours_until_overflow < 24);

        if (data.fill >= 50 || isPredictedCritical) {
            color = Color.RED;
            snippet = isPredictedCritical ? "⚠️ Overflow Soon!" : "🔴 CRITICAL: " + (int)data.fill + "%";
        } else if (data.fill >= 40) {
            color = Color.parseColor("#FFA500"); // Orange
            snippet = "🟠 High: " + (int)data.fill + "%";
        } else {
            color = Color.parseColor("#4CAF50"); // Green
            snippet = "🟢 Normal: " + (int)data.fill + "%";
        }

        m.setSnippet(snippet);
        // ✅ USE RESIZED ICON
        m.setIcon(resizeAndColorDrawable(R.drawable.bin_ic, BIN_ICON_SIZE, BIN_ICON_SIZE, color));

        m.setOnMarkerClickListener((marker, mapView) -> {
            RoutePoint point = markerMap.get(marker.getId());
            if (point != null) showEnhancedBinSheet(point, marker);
            return true;
        });

        map.getOverlays().add(m);
    }

    private void addMarker(GeoPoint gp, RoutePoint data, String type) {
        Marker m = new Marker(map);
        m.setPosition(gp);
        m.setAnchor(Marker.ANCHOR_CENTER, Marker.ANCHOR_BOTTOM);
        m.setTitle(data.name);
        m.setId(data.bin_id);
        markerMap.put(m.getId(), data);

        if ("Dump Zone".equals(type)) {
            m.setIcon(getResources().getDrawable(android.R.drawable.ic_menu_compass));
            m.setSnippet("Dumping Destination");
        } else if ("Start".equals(type)) {
            m.setIcon(getResources().getDrawable(android.R.drawable.ic_menu_mylocation));
            m.setSnippet("Start Point");
        } else if ("Optional".equals(type)) {
            // ✅ USE RESIZED GRAY ICON
            m.setIcon(resizeAndColorDrawable(R.drawable.bin_ic, BIN_ICON_SIZE, BIN_ICON_SIZE, Color.GRAY));
            m.setSnippet("Optional - " + (int)data.fill + "%");
        } else {
            m.setIcon(getResources().getDrawable(android.R.drawable.ic_delete));
            m.setSnippet("Blocked Sensor");
        }

        m.setOnMarkerClickListener((marker, mapView) -> {
            RoutePoint point = markerMap.get(marker.getId());
            if (point != null && !"END".equals(point.type) && !"START".equals(point.type)) {
                showEnhancedBinSheet(point, marker);
            } else {
                marker.showInfoWindow();
            }
            return true;
        });

        map.getOverlays().add(m);
    }

    private void showEnhancedBinSheet(RoutePoint bin, Marker marker) {
        BottomSheetDialog dialog = new BottomSheetDialog(getContext());
        View view = getLayoutInflater().inflate(R.layout.bottom_sheet_bin, null);

        TextView name = view.findViewById(R.id.tvBinName);
        TextView fill = view.findViewById(R.id.tvFill);
        TextView weight = view.findViewById(R.id.tvWeight);
        TextView prediction = view.findViewById(R.id.tvPrediction);
        Button btnCollect = view.findViewById(R.id.btnCollect);
        Button btnIgnore = view.findViewById(R.id.btnIgnore);

        name.setText(bin.name);
        fill.setText(String.format("Fill Level: %d%%", (int)bin.fill));

        if (bin.fill >= 90) fill.setTextColor(Color.RED);
        else if (bin.fill >= 75) fill.setTextColor(Color.parseColor("#FFA500"));
        else fill.setTextColor(Color.GREEN);

        if (weight != null) weight.setText(String.format("Weight: %.1f kg", bin.weight));

        if (prediction != null && bin.hours_until_overflow != null) {
            prediction.setVisibility(View.VISIBLE);
            prediction.setText(String.format("Overflow in ~%d hrs", bin.hours_until_overflow.intValue()));
        } else if (prediction != null) {
            prediction.setVisibility(View.GONE);
        }

        if ("BLOCKED".equals(bin.type)) {
            btnCollect.setText("Clear Blockage");
            if (btnIgnore != null) btnIgnore.setVisibility(View.GONE);
        }

        btnCollect.setOnClickListener(v -> markBinAsCollected(bin, marker, dialog));

        if (btnIgnore != null) {
            btnIgnore.setOnClickListener(v -> {
                dialog.dismiss();
                showIgnoreDialog(bin, marker);
            });
        }

        dialog.setContentView(view);
        dialog.show();
    }

    private void markBinAsCollected(RoutePoint bin, Marker marker, BottomSheetDialog dialog) {
        if (map != null) {
            map.getOverlays().remove(marker);
            map.invalidate();
        }
        dialog.dismiss();

        RetrofitClient.getApiService(getContext()).collectBin(bin.bin_id).enqueue(new Callback<ResponseBody>() {
            @Override
            public void onResponse(Call<ResponseBody> call, Response<ResponseBody> response) {
                if (response.isSuccessful()) {
                    bin.isHandled = true;
                    handledBins++;
                    Toast.makeText(getContext(), "Collected! Finding next...", Toast.LENGTH_SHORT).show();
                    findAndZoomToNextBin();
                } else {
                    if (map != null) map.getOverlays().add(marker);
                    Toast.makeText(getContext(), "Sync Failed", Toast.LENGTH_SHORT).show();
                }
            }
            @Override
            public void onFailure(Call<ResponseBody> call, Throwable t) {
                if (map != null) map.getOverlays().add(marker);
                Toast.makeText(getContext(), "Network Error", Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void findAndZoomToNextBin() {
        if (mLocationOverlay == null || map == null) return;

        GeoPoint myLoc = mLocationOverlay.getMyLocation();
        if (myLoc == null) return;

        double minDist = Double.MAX_VALUE;
        RoutePoint nextBin = null;

        for (RoutePoint p : markerMap.values()) {
            if ("COLLECTION_POINT".equals(p.type) && !p.isHandled) {
                GeoPoint binLoc = new GeoPoint(p.latitude, p.longitude);
                double d = myLoc.distanceToAsDouble(binLoc);
                if (d < minDist) {
                    minDist = d;
                    nextBin = p;
                }
            }
        }

        if (nextBin != null) {
            map.getController().animateTo(new GeoPoint(nextBin.latitude, nextBin.longitude));
            map.getController().setZoom(20.0);
            Toast.makeText(getContext(), "Next: " + nextBin.name, Toast.LENGTH_SHORT).show();
        } else {
            checkRouteCompletion();
        }
    }

    private void drawStraightLineRoute(List<GeoPoint> points) {
        Polyline line = new Polyline();
        line.setPoints(points);
        line.setColor(Color.BLUE);
        line.setWidth(5.0f);
        map.getOverlays().add(0, line);
        map.invalidate();
    }

    private void showIgnoreDialog(RoutePoint bin, Marker marker) {
        AlertDialog.Builder builder = new AlertDialog.Builder(getContext());
        EditText input = new EditText(getContext());
        input.setHint("Reason");
        builder.setTitle("Skip Bin").setView(input)
                .setPositiveButton("Submit", (d, w) -> submitIgnore(bin.bin_id, input.getText().toString(), marker))
                .setNegativeButton("Cancel", null).show();
    }

    private void submitIgnore(String binId, String reason, Marker marker) {
        RetrofitClient.getApiService(getContext()).ignoreBin(new IgnoreRequest(binId, reason)).enqueue(new Callback<ResponseBody>() {
            @Override
            public void onResponse(Call<ResponseBody> call, Response<ResponseBody> r) {
                if (r.isSuccessful()) {
                    handledBins++;
                    if(map != null) {
                        map.getOverlays().remove(marker);
                        map.invalidate();
                    }
                    checkRouteCompletion();
                    Toast.makeText(getContext(), "Skipped", Toast.LENGTH_SHORT).show();
                }
            }
            @Override public void onFailure(Call<ResponseBody> c, Throwable t) {}
        });
    }

    private void checkRouteCompletion() {
        if (totalCriticalBins > 0 && handledBins >= totalCriticalBins) {
            new AlertDialog.Builder(getContext())
                    .setTitle("Route Complete!")
                    .setMessage("All critical bins handled.")
                    .setPositiveButton("OK", null)
                    .show();
        }
    }

    @Override
    public void onResume() {
        super.onResume();
        if (map != null) map.onResume();
        if (ActivityCompat.checkSelfPermission(getContext(), Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
            if (mLocationOverlay != null) mLocationOverlay.enableMyLocation();
        }
    }

    @Override
    public void onPause() {
        super.onPause();
        if (map != null) map.onPause();
        if (mLocationOverlay != null) mLocationOverlay.disableMyLocation();
    }
}