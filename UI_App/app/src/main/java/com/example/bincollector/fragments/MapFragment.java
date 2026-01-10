package com.example.bincollector.fragments;

<<<<<<< HEAD
import android.graphics.Paint;
=======
>>>>>>> cef0e403baf70c3149252becbd7d3f5b075ac772
import android.graphics.drawable.Drawable;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

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

<<<<<<< HEAD
import org.osmdroid.views.overlay.Polyline;
import android.graphics.Color;

=======
>>>>>>> cef0e403baf70c3149252becbd7d3f5b075ac772
import java.util.ArrayList;
import java.util.List;

public class MapFragment extends Fragment {

    private MapView map;

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_map, container, false);

        Configuration.getInstance().load(getContext(),
                PreferenceManager.getDefaultSharedPreferences(getContext()));

        map = view.findViewById(R.id.map);
        map.setTileSource(TileSourceFactory.MAPNIK);
        map.setMultiTouchControls(true);

        IMapController mapController = map.getController();
        mapController.setZoom(11.0);
        GeoPoint goaCenter = new GeoPoint(15.4909, 73.8278); // Centered near Panjim
        mapController.setCenter(goaCenter);

<<<<<<< HEAD
        if (getArguments() != null && getArguments().getBoolean("draw_route")) {
            drawWardRoute();
        }
=======
>>>>>>> cef0e403baf70c3149252becbd7d3f5b075ac772
        // Add Specific Bin Locations
        addSpecificMarkers();

        return view;
    }

<<<<<<< HEAD
    private void drawWardRoute() {
        Polyline line = new Polyline(map);
        line.setTitle("Ward 10 Route");

        // Styling the line to look like GMaps
        line.getOutlinePaint().setColor(Color.parseColor("#1A73E8")); // GMaps Blue
        line.getOutlinePaint().setStrokeWidth(15f); // Thicker for better visibility
        line.getOutlinePaint().setStrokeCap(android.graphics.Paint.Cap.ROUND); // Makes ends rounded
        line.getOutlinePaint().setStrokeJoin(Paint.Join.ROUND); // Makes corners smooth

        List<GeoPoint> routePoints = new ArrayList<>();
        routePoints.add(new GeoPoint(15.4612, 73.8325)); // GU
        routePoints.add(new GeoPoint(15.4643, 73.8584)); // GMC
        routePoints.add(new GeoPoint(15.460, 73.824));   // GBS

        line.setPoints(routePoints);
        // 3. Clear old lines before adding new one (optional, prevents overlap)
        map.getOverlays().removeIf(overlay -> overlay instanceof Polyline);
        map.getOverlays().add(line);

        // Zoom into the route
        map.getController().animateTo(routePoints.get(0));
        map.getController().setZoom(14.0);
        map.invalidate();
    }
=======
>>>>>>> cef0e403baf70c3149252becbd7d3f5b075ac772
    private void addSpecificMarkers() {
        // Create a list of your specific coordinates
        List<GeoPoint> points = new ArrayList<>();
        points.add(new GeoPoint(15.4612, 73.8325)); // GU
        points.add(new GeoPoint(15.4643, 73.8584)); // GMC
        points.add(new GeoPoint(15.460, 73.824)); // GBS
        //points.add(new GeoPoint(15.3991, 74.0124)); // Ponda

        // Load your custom image from the drawable folder
        // Replace 'ic_bin' with your actual image filename
        Drawable binIcon = ContextCompat.getDrawable(getContext(), R.drawable.bin_ic);

        for (int i = 0; i < points.size(); i++) {
            Marker marker = new Marker(map);
            marker.setPosition(points.get(i));
            marker.setAnchor(Marker.ANCHOR_CENTER, Marker.ANCHOR_BOTTOM);
            marker.setTitle("Bin #" + (i + 1));

            // Set the custom image
            if (binIcon != null) {
                marker.setIcon(binIcon);
            }

            map.getOverlays().add(marker);
        }
        map.invalidate();
    }

    @Override public void onResume() { super.onResume(); map.onResume(); }
    @Override public void onPause() { super.onPause(); map.onPause(); }
}