package com.example.bincollector.fragments;

import android.content.Context;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.cardview.widget.CardView;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.example.bincollector.R;
import com.example.bincollector.adapters.WardAdapter;
import com.example.bincollector.models.LoginResponse;
import com.example.bincollector.models.ProfileResponse; // ✅ Import ProfileResponse
import com.example.bincollector.models.Ward;
import com.example.bincollector.network.ApiService;
import com.example.bincollector.network.RetrofitClient;
import com.google.gson.Gson;

import java.util.ArrayList;
import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class HomeFragment extends Fragment {

    // Common Views
    private TextView tvSectionTitle;

    // Admin Views
    private RecyclerView recyclerView;
    private WardAdapter adapter;
    private List<Ward> wardList;

    // Driver Views
    private CardView cardRoute;
    private TextView tvWardName, tvVehicle, tvTotalBins, tvPendingBins, tvNoRoute;
    private Button btnStartRoute;

    private boolean isDriver = false;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_home, container, false);

        // 1. Initialize Common Views
        tvSectionTitle = view.findViewById(R.id.tvSectionTitle);

        // 2. Initialize Admin Views
        recyclerView = view.findViewById(R.id.recyclerWards);
        recyclerView.setLayoutManager(new LinearLayoutManager(getContext()));
        wardList = new ArrayList<>();
        adapter = new WardAdapter(wardList, getContext());
        recyclerView.setAdapter(adapter);

        // 3. Initialize Driver Views
        cardRoute = view.findViewById(R.id.cardRoute);
        tvNoRoute = view.findViewById(R.id.tvNoRoute);
        tvWardName = view.findViewById(R.id.tvWardName);
        tvVehicle = view.findViewById(R.id.tvVehicle);
        tvTotalBins = view.findViewById(R.id.tvTotalBins);
        tvPendingBins = view.findViewById(R.id.tvPendingBins);
        btnStartRoute = view.findViewById(R.id.btnStartRoute);


        // 4. Check Role
        checkUserRole();

        // 5. Setup UI
        if (isDriver) {
            setupDriverUI();
        } else {
            setupAdminUI();
        }

        return view;
    }

    @Override
    public void onResume() {
        super.onResume();
        if (isDriver) {
            loadDriverProfile(); // ✅ Changed from loadDriverRoute to loadDriverProfile
        } else {
            loadWardData();
        }
    }

    private void checkUserRole() {
        try {
            SharedPreferences sp = getActivity().getSharedPreferences("BinCollectorSession", Context.MODE_PRIVATE);
            String userJson = sp.getString("USER_DATA", "{}");

            Gson gson = new Gson();
            LoginResponse.User user = gson.fromJson(userJson, LoginResponse.User.class);

            if (user != null && "DRIVER".equalsIgnoreCase(user.getRole())) {
                isDriver = true;
            } else {
                isDriver = false;
            }
        } catch (Exception e) {
            Log.e("HomeFragment", "Role Check Failed", e);
            isDriver = false;
        }
    }

    private void setupAdminUI() {
        tvSectionTitle.setText("All Wards Status");
        recyclerView.setVisibility(View.VISIBLE);
        cardRoute.setVisibility(View.GONE);
        tvNoRoute.setVisibility(View.GONE);
    }

    private void setupDriverUI() {
        tvSectionTitle.setText("My Assignment");
        recyclerView.setVisibility(View.GONE);
        // Initial state
        cardRoute.setVisibility(View.GONE);
        tvNoRoute.setVisibility(View.VISIBLE);
        tvNoRoute.setText("Loading assignment...");

        btnStartRoute.setOnClickListener(v -> {
            // 1. Find the BottomNavigationView in the MainActivity
            com.google.android.material.bottomnavigation.BottomNavigationView bottomNav =
                    requireActivity().findViewById(R.id.bottomNav); // ID matches activity_main.xml

            if (bottomNav != null) {
                // 2. Programmatically click the "Map" item
                // ID 'nav_map' matches bottom_nav_menu.xml
                bottomNav.setSelectedItemId(R.id.nav_map);
            } else {
                Toast.makeText(getContext(), "Error: Navigation not found", Toast.LENGTH_SHORT).show();
            }
        });
    }

    // ✅ NEW: Loads Profile to get Assigned Ward & Vehicle
    private void loadDriverProfile() {
        ApiService apiService = RetrofitClient.getApiService(getContext());
        apiService.getProfile().enqueue(new Callback<ProfileResponse>() {
            @Override
            public void onResponse(Call<ProfileResponse> call, Response<ProfileResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    ProfileResponse profile = response.body();
                    LoginResponse.User user = profile.getUser();
                    ProfileResponse.VehicleInfo vehicle = profile.getVehicle();

                    // Check if Ward is assigned
                    String wardName = (user != null) ? user.getWardName() : null;

                    if (wardName != null && !wardName.isEmpty()) {
                        // Show Assignment Card
                        cardRoute.setVisibility(View.VISIBLE);
                        tvNoRoute.setVisibility(View.GONE);

                        tvWardName.setText(wardName);

                        // Set Vehicle Info
                        if (vehicle != null) {
                            tvVehicle.setText("Vehicle: " + vehicle.getLicensePlate());
                        } else {
                            tvVehicle.setText("No Vehicle Assigned");
                        }

                        // For now, we can hide specific bin counts or set them to 0
                        // until a specific route endpoint is called, or leave placeholders.
                        tvTotalBins.setText("--");
                        tvPendingBins.setText("--");

                        btnStartRoute.setVisibility(View.VISIBLE);
                    } else {
                        // No Ward Assigned
                        cardRoute.setVisibility(View.GONE);
                        tvNoRoute.setVisibility(View.VISIBLE);
                        tvNoRoute.setText("No Ward Assigned. Contact Admin.");
                        btnStartRoute.setVisibility(View.GONE);
                    }
                } else {
                    cardRoute.setVisibility(View.GONE);
                    tvNoRoute.setVisibility(View.VISIBLE);
                    tvNoRoute.setText("Failed to load assignment");
                }
            }

            @Override
            public void onFailure(Call<ProfileResponse> call, Throwable t) {
                Log.e("HomeFragment", "Profile Error: " + t.getMessage());
                cardRoute.setVisibility(View.GONE);
                tvNoRoute.setVisibility(View.VISIBLE);
                tvNoRoute.setText("Connection Error");
            }
        });
    }

    private void loadWardData() {
        ApiService apiService = RetrofitClient.getApiService(getContext());
        apiService.getWardStats().enqueue(new Callback<List<Ward>>() {
            @Override
            public void onResponse(Call<List<Ward>> call, Response<List<Ward>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    wardList.clear();
                    wardList.addAll(response.body());
                    adapter.notifyDataSetChanged();
                }
            }

            @Override
            public void onFailure(Call<List<Ward>> call, Throwable t) {
                Log.e("HomeFragment", "Admin Ward Error: " + t.getMessage());
            }
        });
    }
}