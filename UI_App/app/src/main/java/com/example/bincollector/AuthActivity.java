package com.example.bincollector;

import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.os.Bundle;
import android.view.View;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.Spinner;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;

import com.example.bincollector.models.LoginRequest;
import com.example.bincollector.models.LoginResponse;
import com.example.bincollector.models.RegisterRequest;
import com.example.bincollector.models.VerifyRequest;
import com.example.bincollector.models.VerifyResponse;
import com.example.bincollector.network.ApiService;
import com.example.bincollector.network.RetrofitClient;
import com.google.android.material.button.MaterialButton;
import com.google.gson.Gson;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class AuthActivity extends AppCompatActivity {
    private boolean isRegisterMode = false;
    private boolean isOtpSent = false;

    // UI References
    private EditText etName, etMobile, etEmail, etPassword, etOtp;
    private Spinner spinnerDistrict, spinnerTaluka, spinnerVillage;
    private LinearLayout locationContainer;

    private MaterialButton btnTabLogin, btnTabRegister;
    private Button btnSubmit;

    private ApiService apiService;
    private SharedPreferences sharedPreferences;

    // Selected Data
    private String selectedDistrict = "";
    private String selectedTaluka = "";
    private String selectedVillage = "";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        sharedPreferences = getSharedPreferences("BinCollectorSession", MODE_PRIVATE);

        // FIX 1: Check for "ACCESS_TOKEN" instead of "TOKEN"
        if (sharedPreferences.contains("ACCESS_TOKEN")) {
            startActivity(new Intent(AuthActivity.this, MainActivity.class));
            finish();
            return;
        }

        setContentView(R.layout.activity_auth);

        // Use Public Client for Auth calls
        apiService = RetrofitClient.getApiService();

        // 1. Find Views
        btnTabLogin = findViewById(R.id.btnTabLogin);
        btnTabRegister = findViewById(R.id.btnTabRegister);

        etName = findViewById(R.id.etFirstName);
        etMobile = findViewById(R.id.etMobile);
        etEmail = findViewById(R.id.etEmail);
        etPassword = findViewById(R.id.etPassword);
        etOtp = findViewById(R.id.etOtp);

        locationContainer = findViewById(R.id.locationContainer);
        spinnerDistrict = findViewById(R.id.spinnerDistrict);
        spinnerTaluka = findViewById(R.id.spinnerTaluka);
        spinnerVillage = findViewById(R.id.spinnerVillage);

        btnSubmit = findViewById(R.id.btnSubmit);

        // 2. Setup Logic
        setupDropdowns();

        btnTabLogin.setOnClickListener(v -> { isRegisterMode = false; toggleUI(); });
        btnTabRegister.setOnClickListener(v -> { isRegisterMode = true; toggleUI(); });

        toggleUI();

        // 3. Submit Logic
        btnSubmit.setOnClickListener(v -> {
            String email = etEmail.getText().toString().trim();
            String password = etPassword.getText().toString().trim();

            if (email.isEmpty() || password.isEmpty()) {
                Toast.makeText(this, "Email and Password required", Toast.LENGTH_SHORT).show();
                return;
            }

            if (isRegisterMode) {
                // REGISTER FLOW
                String name = etName.getText().toString().trim();
                String mobile = etMobile.getText().toString().trim();

                if (name.isEmpty() || mobile.isEmpty() || selectedVillage.isEmpty()) {
                    Toast.makeText(this, "Please select District, Taluka and Village!", Toast.LENGTH_SHORT).show();
                    return;
                }

                registerUser(name, email, mobile, password, selectedDistrict, selectedTaluka, selectedVillage);

            } else {
                // LOGIN FLOW
                if (!isOtpSent) loginUser(email, password);
                else verifyOtp(email, etOtp.getText().toString().trim());
            }
        });
    }

    private void setupDropdowns() {
        List<String> districts = Arrays.asList("North Goa", "South Goa");
        ArrayAdapter<String> districtAdapter = new ArrayAdapter<>(this, android.R.layout.simple_spinner_item, districts);
        districtAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        spinnerDistrict.setAdapter(districtAdapter);

        spinnerDistrict.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {
            @Override
            public void onItemSelected(AdapterView<?> parent, View view, int position, long id) {
                selectedDistrict = districts.get(position);
                updateTalukas(selectedDistrict);
            }
            @Override
            public void onNothingSelected(AdapterView<?> parent) {}
        });
    }

    private void updateTalukas(String district) {
        List<String> talukas = new ArrayList<>();
        if (district.equals("North Goa")) {
            talukas.addAll(Arrays.asList("Bardez", "Bicholim", "Pernem", "Ponda", "Sattari", "Tiswadi"));
        } else {
            talukas.addAll(Arrays.asList("Canacona", "Mormugao", "Quepem", "Salcete", "Sanguem", "Dharbandora"));
        }

        ArrayAdapter<String> talukaAdapter = new ArrayAdapter<>(this, android.R.layout.simple_spinner_item, talukas);
        talukaAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        spinnerTaluka.setAdapter(talukaAdapter);

        spinnerTaluka.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {
            @Override
            public void onItemSelected(AdapterView<?> parent, View view, int position, long id) {
                selectedTaluka = talukas.get(position);
                updateVillages(selectedTaluka);
            }
            @Override
            public void onNothingSelected(AdapterView<?> parent) {}
        });
    }

    private void updateVillages(String taluka) {
        List<String> villages = new ArrayList<>();
        switch (taluka) {
            case "Bardez": villages.addAll(Arrays.asList("Mapusa", "Calangute", "Candolim", "Anjuna", "Porvorim", "Siolim")); break;
            case "Tiswadi": villages.addAll(Arrays.asList("Panaji", "Old Goa", "Dona Paula", "Bambolim", "Merces")); break;
            case "Salcete": villages.addAll(Arrays.asList("Margao", "Colva", "Benaulim", "Fatorda", "Verna")); break;
            case "Mormugao": villages.addAll(Arrays.asList("Vasco da Gama", "Dabolim", "Cansaulim")); break;
            case "Ponda": villages.addAll(Arrays.asList("Ponda City", "Farmagudi", "Shiroda")); break;
            default: villages.addAll(Arrays.asList(taluka + " Center", taluka + " Rural")); break;
        }
        Collections.sort(villages);

        ArrayAdapter<String> villageAdapter = new ArrayAdapter<>(this, android.R.layout.simple_spinner_item, villages);
        villageAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        spinnerVillage.setAdapter(villageAdapter);

        spinnerVillage.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {
            @Override
            public void onItemSelected(AdapterView<?> parent, View view, int position, long id) {
                selectedVillage = villages.get(position);
            }
            @Override
            public void onNothingSelected(AdapterView<?> parent) {}
        });
    }

    private void registerUser(String name, String email, String mobile, String pass, String d, String t, String a) {
        RegisterRequest req = new RegisterRequest(name, email, mobile, pass, d, t, a);
        apiService.register(req).enqueue(new Callback<LoginResponse>() {
            @Override
            public void onResponse(Call<LoginResponse> call, Response<LoginResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    LoginResponse data = response.body();

                    // FIX 2: Save as "ACCESS_TOKEN" to match RetrofitClient
                    sharedPreferences.edit().putString("ACCESS_TOKEN", data.getToken()).apply();

                    // Save User Data too
                    Gson gson = new Gson();
                    String userJson = gson.toJson(data.getUser());
                    sharedPreferences.edit().putString("USER_DATA", userJson).apply();

                    Toast.makeText(AuthActivity.this, "Registration Success! Please add vehicle.", Toast.LENGTH_LONG).show();
                    Intent intent = new Intent(AuthActivity.this, VehicleRegistrationActivity.class);
                    startActivity(intent);
                    finish();
                } else {
                    Toast.makeText(AuthActivity.this, "Registration Failed", Toast.LENGTH_SHORT).show();
                }
            }
            @Override
            public void onFailure(Call<LoginResponse> call, Throwable t) {
                Toast.makeText(AuthActivity.this, "Network Error", Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void toggleUI() {
        MaterialButton active = isRegisterMode ? btnTabRegister : btnTabLogin;
        MaterialButton inactive = isRegisterMode ? btnTabLogin : btnTabRegister;

        active.setBackgroundTintList(android.content.res.ColorStateList.valueOf(Color.parseColor("#4CAF50")));
        active.setTextColor(Color.WHITE);
        inactive.setBackgroundTintList(android.content.res.ColorStateList.valueOf(Color.TRANSPARENT));
        inactive.setTextColor(Color.parseColor("#666666"));

        etName.setVisibility(isRegisterMode ? View.VISIBLE : View.GONE);
        etMobile.setVisibility(isRegisterMode ? View.VISIBLE : View.GONE);
        locationContainer.setVisibility(isRegisterMode ? View.VISIBLE : View.GONE);
        etOtp.setVisibility(View.GONE);
        etPassword.setVisibility(View.VISIBLE);

        btnSubmit.setText(isRegisterMode ? "Register" : "Login");
        isOtpSent = false;
    }

    private void loginUser(String email, String password) {
        apiService.login(new LoginRequest(email, password)).enqueue(new Callback<LoginResponse>() {
            @Override
            public void onResponse(Call<LoginResponse> call, Response<LoginResponse> response) {
                if (response.isSuccessful()) {
                    isOtpSent = true;
                    etOtp.setVisibility(View.VISIBLE);
                    locationContainer.setVisibility(View.GONE);
                    etPassword.setVisibility(View.GONE);
                    btnSubmit.setText("Verify & Login");
                } else {
                    Toast.makeText(AuthActivity.this, "Invalid Credentials", Toast.LENGTH_SHORT).show();
                }
            }
            @Override
            public void onFailure(Call<LoginResponse> call, Throwable t) {
                Toast.makeText(AuthActivity.this, "Network Error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void verifyOtp(String email, String otp) {
        // Use Public Client here, we don't have a token yet
        apiService.verifyOtp(new VerifyRequest(email, otp)).enqueue(new Callback<VerifyResponse>() {
            @Override
            public void onResponse(Call<VerifyResponse> call, Response<VerifyResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    VerifyResponse data = response.body();

                    SharedPreferences.Editor editor = sharedPreferences.edit();

                    // FIX 3: Ensure this matches RetrofitClient key
                    editor.putString("ACCESS_TOKEN", data.getToken());

                    Gson gson = new Gson();
                    String userJson = gson.toJson(data.getUser());
                    editor.putString("USER_DATA", userJson);

                    editor.apply();

                    Toast.makeText(AuthActivity.this, "Login Successful!", Toast.LENGTH_SHORT).show();
                    startActivity(new Intent(AuthActivity.this, MainActivity.class));
                    finish();
                } else {
                    Toast.makeText(AuthActivity.this, "Invalid OTP", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<VerifyResponse> call, Throwable t) {
                Toast.makeText(AuthActivity.this, "Network Error", Toast.LENGTH_SHORT).show();
            }
        });
    }
}