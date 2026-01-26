package com.example.bincollector.fragments;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
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

import com.example.bincollector.AuthActivity;
import com.example.bincollector.R;
import com.example.bincollector.models.LoginResponse;
import com.example.bincollector.models.ProfileResponse;
import com.example.bincollector.network.ApiService;
import com.example.bincollector.network.RetrofitClient;
import com.google.android.material.textfield.TextInputEditText;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class ProfileFragment extends Fragment {

    private TextInputEditText etName, etPhone, etEmail;
    private Button btnLogout;

    // Vehicle Views
    private CardView cardVehicle;
    private TextView tvLicensePlate, tvVehicleType, tvVehicleStatus;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_profile, container, false);

        // 1. Bind Personal Views
        etName = view.findViewById(R.id.etProfileName);
        etPhone = view.findViewById(R.id.etProfilePhone);
        etEmail = view.findViewById(R.id.etProfileEmail);
        btnLogout = view.findViewById(R.id.btnLogout);

        // 2. Bind Vehicle Views
        cardVehicle = view.findViewById(R.id.cardVehicleInfo);
        tvLicensePlate = view.findViewById(R.id.tvLicensePlate);
        tvVehicleType = view.findViewById(R.id.tvVehicleType);
        tvVehicleStatus = view.findViewById(R.id.tvVehicleStatus);

        // 3. Logout Logic
        btnLogout.setOnClickListener(v -> logout());

        // 4. Load Data
        fetchProfileData();

        return view;
    }

    private void fetchProfileData() {
        // FIX: Passed getContext() to ensure token is sent
        ApiService apiService = RetrofitClient.getApiService(getContext());

        apiService.getProfile().enqueue(new Callback<ProfileResponse>() {
            @Override
            public void onResponse(Call<ProfileResponse> call, Response<ProfileResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    ProfileResponse data = response.body();
                    LoginResponse.User user = data.getUser();

                    // A. Populate User Info
                    if (user != null) {
                        etName.setText(user.getName());
                        etPhone.setText(user.getMobile());
                        etEmail.setText(user.getEmail());
                    }

                    // B. Populate Vehicle Info (If Driver)
                    ProfileResponse.VehicleInfo vehicle = data.getVehicle();
                    if (vehicle != null) {
                        cardVehicle.setVisibility(View.VISIBLE);
                        tvLicensePlate.setText(vehicle.getLicensePlate());
                        tvVehicleType.setText("Type: " + vehicle.getType());
                        tvVehicleStatus.setText("Status: " + vehicle.getStatus());
                    } else {
                        cardVehicle.setVisibility(View.GONE);
                    }
                } else {
                    Toast.makeText(getContext(), "Failed to load profile", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<ProfileResponse> call, Throwable t) {
                Toast.makeText(getContext(), "Network Error", Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void logout() {
        SharedPreferences sp = getActivity().getSharedPreferences("BinCollectorSession", Context.MODE_PRIVATE);
        sp.edit().clear().apply();

        Intent intent = new Intent(getActivity(), AuthActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        startActivity(intent);
    }
}