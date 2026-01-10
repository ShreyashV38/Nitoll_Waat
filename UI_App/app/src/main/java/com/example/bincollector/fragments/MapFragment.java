package com.example.bincollector.fragments;

import android.graphics.Paint;
import android.graphics.drawable.Drawable;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Toast;

import androidx.core.content.ContextCompat;
import androidx.fragment.app.Fragment;
import androidx.preference.PreferenceManager;

import com.example.bincollector.R;

import org.osmdroid.api.IMapController;
import org.osmdroid.config.Configuration;
import org.osmdroid.tileprovider.tilesource.TileSourceFactory;
import org.osmdroid.util.GeoPoint;
import org.osmdroid.views.MapView;
import org.osmdroid.views.overlay.Marker;
import org.osmdroid.views.overlay.Polyline;

import android.graphics.Color;

import java.util.ArrayList;
import java.util.List;

public class MapFragment extends Fragment {

    private MapView map;

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        // Use the new design layout
        View view = inflater.inflate(R.layout.fragment_map, container, false);

        Configuration.getInstance().load(getContext(),
                PreferenceManager.getDefaultSharedPreferences(getContext()));

        map = view.findViewById(R.id.map);
        map.setTileSource(TileSourceFactory.MAPNIK);
        map.setMultiTouchControls(true);

        IMapController mapController = map.getController();
        mapController.setZoom(14.0);
        GeoPoint goaCenter = new GeoPoint(15.4612, 73.8325);
        mapController.setCenter(goaCenter);

        // UI Interactions from your mate's design
        View btnFinish = view.findViewById(R.id.btnFinishRoute);
        if (btnFinish != null) {
            btnFinish.setOnClickListener(v -> {
                map.getOverlays().removeIf(o -> o instanceof Polyline);
                map.invalidate();
                Toast.makeText(getContext(), "Route Completed!", Toast.LENGTH_SHORT).show();
            });
        }

        // Check for navigation arguments
        if (getArguments() != null && getArguments().getBoolean("draw_route")) {
            drawWardRoute();
        }

        // Call the methods that were missing
        addSpecificMarkers();

        return view;
    }

    // --- THESE ARE THE METHODS THAT WERE MISSING ---

    private void drawWardRoute() {
        Polyline line = new Polyline(map);
        line.setTitle("Ward 10 Route");

        line.getOutlinePaint().setColor(Color.parseColor("#1A73E8"));
        line.getOutlinePaint().setStrokeWidth(15f);
        line.getOutlinePaint().setStrokeCap(android.graphics.Paint.Cap.ROUND);
        line.getOutlinePaint().setStrokeJoin(Paint.Join.ROUND);

        List<GeoPoint> routePoints = new ArrayList<>();
        routePoints.add(new GeoPoint(15.4612, 73.8325)); // GU
        routePoints.add(new GeoPoint(15.4643, 73.8584)); // GMC
        routePoints.add(new GeoPoint(15.460, 73.824));   // GBS

        line.setPoints(routePoints);
        map.getOverlays().removeIf(overlay -> overlay instanceof Polyline);
        map.getOverlays().add(line);

        map.getController().animateTo(routePoints.get(0));
        map.getController().setZoom(15.0);
        map.invalidate();
    }

    private void addSpecificMarkers() {
        List<GeoPoint> points = new ArrayList<>();
        points.add(new GeoPoint(15.4612, 73.8325)); // GU
        points.add(new GeoPoint(15.4643, 73.8584)); // GMC
        points.add(new GeoPoint(15.460, 73.824));   // GBS

        Drawable binIcon = ContextCompat.getDrawable(getContext(), R.drawable.bin_ic);

        for (int i = 0; i < points.size(); i++) {
            Marker marker = new Marker(map);
            marker.setPosition(points.get(i));
            marker.setAnchor(Marker.ANCHOR_CENTER, Marker.ANCHOR_BOTTOM);
            marker.setTitle("Bin #" + (i + 1));

            if (binIcon != null) {
                marker.setIcon(binIcon);
            }

            map.getOverlays().add(marker);
        }
        map.invalidate();
    }

    @Override public void onResume() { super.onResume(); if(map != null) map.onResume(); }
    @Override public void onPause() { super.onPause(); if(map != null) map.onPause(); }
}