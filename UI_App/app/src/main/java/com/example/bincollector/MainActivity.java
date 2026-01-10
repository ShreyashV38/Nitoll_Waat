package com.example.bincollector;

import android.os.Bundle;

import androidx.appcompat.app.AppCompatActivity;
import androidx.fragment.app.Fragment;
import com.example.bincollector.fragments.HomeFragment;
import com.example.bincollector.fragments.MapFragment;
import com.example.bincollector.fragments.ProfileFragment;
import com.google.android.material.bottomnavigation.BottomNavigationView;

public class MainActivity extends AppCompatActivity {

    public void openMapWithRoute() {
        MapFragment mapFragment = new MapFragment();

        // Pass a signal to the fragment using Arguments
        Bundle bundle = new Bundle();
        bundle.putBoolean("draw_route", true);
        mapFragment.setArguments(bundle);

        loadFragment(mapFragment);

        // Update Bottom Nav selection visually
        BottomNavigationView bottomNav = findViewById(R.id.bottomNav);
        bottomNav.setSelectedItemId(R.id.nav_map);
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        BottomNavigationView bottomNav = findViewById(R.id.bottomNav);

        // Default Fragment
        loadFragment(new HomeFragment());

        bottomNav.setOnItemSelectedListener(item -> {
            Fragment selectedFragment = null;
            int id = item.getItemId();

            if (id == R.id.nav_home) selectedFragment = new HomeFragment();
            else if (id == R.id.nav_map) selectedFragment = new MapFragment();
            else if (id == R.id.nav_profile) selectedFragment = new ProfileFragment();

            return loadFragment(selectedFragment);
        });
    }

    private boolean loadFragment(Fragment fragment) {
        if (fragment != null) {
            getSupportFragmentManager()
                    .beginTransaction()
                    .replace(R.id.fragmentContainer, fragment)
                    .commit();
            return true;
        }
        return false;
    }
}