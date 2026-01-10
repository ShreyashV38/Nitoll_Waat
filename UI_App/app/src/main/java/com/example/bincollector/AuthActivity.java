package com.example.bincollector;

import android.content.Intent;
import android.os.Bundle;
import android.text.TextUtils;
import android.view.View;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.SwitchCompat;
import com.google.android.material.button.MaterialButton;

public class AuthActivity extends AppCompatActivity {
    private String hardcodedOtp = "1234";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_auth);

        SwitchCompat switchAuth = findViewById(R.id.switchAuth);
        EditText etFirstName = findViewById(R.id.etFirstName);
        EditText etLastName = findViewById(R.id.etLastName);
        EditText etPhone = findViewById(R.id.etPhone);
        EditText etOtp = findViewById(R.id.etOtp);
        TextView tvGenerateOtp = findViewById(R.id.tvGenerateOtp);
        MaterialButton btnSubmit = findViewById(R.id.btnSubmit);

        // Toggle Visibility
        switchAuth.setOnCheckedChangeListener((buttonView, isChecked) -> {
            int visibility = isChecked ? View.VISIBLE : View.GONE;
            etFirstName.setVisibility(visibility);
            etLastName.setVisibility(visibility);
            btnSubmit.setText(isChecked ? "Sign Up" : "Login");
        });

        // Generate OTP Click
        tvGenerateOtp.setOnClickListener(v -> {
            String phone = etPhone.getText().toString();
            if (isValidIndianPhone(phone)) {
                Toast.makeText(this, "OTP Sent to " + phone, Toast.LENGTH_SHORT).show();
            } else {
                etPhone.setError("Enter valid 10-digit Indian number");
            }
        });

        // Final Submit Validation
        btnSubmit.setOnClickListener(v -> {
            String firstName = etFirstName.getText().toString();
            String phone = etPhone.getText().toString();
            String otp = etOtp.getText().toString();

            // 1. Mandatory First Name (Only if Registering)
            if (switchAuth.isChecked() && TextUtils.isEmpty(firstName)) {
                etFirstName.setError("First name is mandatory");
                return;
            }

            // 2. Phone Validation
            if (!isValidIndianPhone(phone)) {
                etPhone.setError("Invalid Phone Number");
                return;
            }

            // 3. OTP Validation
            if (otp.equals(hardcodedOtp)) {
                startActivity(new Intent(AuthActivity.this, MainActivity.class));
                finish();
            } else {
                etOtp.setError("Wrong OTP. Hint: 1234");
            }
        });
    }

    private boolean isValidIndianPhone(String phone) {
        // Regex: Starts with 6,7,8,9 and exactly 10 digits
        return phone != null && phone.matches("[6-9][0-9]{9}");
    }
}