package com.example.bincollector;

import android.content.Intent;
import android.os.Bundle;
import android.widget.ArrayAdapter;
import android.widget.EditText;
import android.widget.Spinner;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;

import com.example.bincollector.models.LoginResponse;
import com.example.bincollector.models.VehicleRequest;
import com.example.bincollector.network.ApiService;
import com.example.bincollector.network.RetrofitClient;
import com.google.android.material.button.MaterialButton;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class VehicleRegistrationActivity extends AppCompatActivity {

    private EditText etLicensePlate;
    private Spinner spinnerVehicleType;
    private MaterialButton btnSave;
    private ApiService apiService;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_vehicle_registration);

        apiService = RetrofitClient.getApiService(this);

        etLicensePlate = findViewById(R.id.etLicensePlate);
        spinnerVehicleType = findViewById(R.id.spinnerVehicleType);
        btnSave = findViewById(R.id.btnSaveVehicle);

        // Setup Dropdown
        String[] types = {"Open Truck", "Mini Truck", "Compactor", "Tipper"};
        ArrayAdapter<String> adapter = new ArrayAdapter<>(this, android.R.layout.simple_spinner_item, types);
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        spinnerVehicleType.setAdapter(adapter);

        btnSave.setOnClickListener(v -> saveVehicle());
    }

    private void saveVehicle() {
        String plate = etLicensePlate.getText().toString().trim();
        String typeSelection = spinnerVehicleType.getSelectedItem().toString();

        if (plate.isEmpty()) {
            Toast.makeText(this, "Please enter License Plate", Toast.LENGTH_SHORT).show();
            return;
        }

        // Map Selection to Database ENUM values
        String dbType = "OPEN_TRUCK"; // Default
        if (typeSelection.equals("Mini Truck")) dbType = "MINI_TRUCK"; // Adjust based on your DB ENUM
        else if (typeSelection.equals("Compactor")) dbType = "COMPACTOR";
        else if (typeSelection.equals("Tipper")) dbType = "TIPPER";

        // If your DB only accepts 'OPEN_TRUCK', ensure this matches exactly

        VehicleRequest request = new VehicleRequest(plate, dbType);

        apiService.registerVehicle(request).enqueue(new Callback<LoginResponse>() {
            @Override
            public void onResponse(Call<LoginResponse> call, Response<LoginResponse> response) {
                if (response.isSuccessful()) {
                    Toast.makeText(VehicleRegistrationActivity.this, "Vehicle Added!", Toast.LENGTH_SHORT).show();
                    // Go to Home
                    startActivity(new Intent(VehicleRegistrationActivity.this, MainActivity.class));
                    finish();
                } else {
                    Toast.makeText(VehicleRegistrationActivity.this, "Failed: " + response.message(), Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<LoginResponse> call, Throwable t) {
                Toast.makeText(VehicleRegistrationActivity.this, "Error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }
}