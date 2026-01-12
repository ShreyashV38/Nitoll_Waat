package com.example.bincollector;

import android.content.Intent;
import android.graphics.Color;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import com.google.android.material.button.MaterialButton;

public class AuthActivity extends AppCompatActivity {
    private boolean isRegisterMode = false;
    private final String hardcodedOtp = "1234";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_auth);

        // 1. Find Views
        MaterialButton btnTabLogin = findViewById(R.id.btnTabLogin);
        MaterialButton btnTabRegister = findViewById(R.id.btnTabRegister);
        EditText etFirstName = findViewById(R.id.etFirstName);
        EditText etLastName = findViewById(R.id.etLastName);
        EditText etPhone = findViewById(R.id.etPhone);
        EditText etOtp = findViewById(R.id.etOtp);
        TextView tvGenerateOtp = findViewById(R.id.tvGenerateOtp);
        TextView tvAuthSubtext = findViewById(R.id.tvAuthSubtext);
        Button btnSubmit = findViewById(R.id.btnSubmit);

        // 2. Initial State
        // Ensure OTP field is hidden until generated
        etOtp.setVisibility(View.GONE);

        // 3. Tab Toggle Logic
        btnTabLogin.setOnClickListener(v -> {
            isRegisterMode = false;
            etOtp.setVisibility(View.GONE); // Reset OTP field on tab switch
            toggleUI(btnTabLogin, btnTabRegister, etFirstName, etLastName, tvAuthSubtext, btnSubmit);
        });

        btnTabRegister.setOnClickListener(v -> {
            isRegisterMode = true;
            etOtp.setVisibility(View.GONE); // Reset OTP field on tab switch
            toggleUI(btnTabRegister, btnTabLogin, etFirstName, etLastName, tvAuthSubtext, btnSubmit);
        });

        // 4. Generate OTP Logic
        tvGenerateOtp.setOnClickListener(v -> {
            String phone = etPhone.getText().toString().trim();

            // Validate phone number before "sending"
            if (phone.isEmpty() || !phone.matches("[6-9][0-9]{9}")) {
                etPhone.setError("Please enter a valid phone number first");
                return;
            }

            // Show Toast as requested
            Toast.makeText(AuthActivity.this, "OTP sent successfully!", Toast.LENGTH_SHORT).show();

            // Reveal the OTP input field
            etOtp.setVisibility(View.VISIBLE);
            etOtp.requestFocus();
        });

        // 5. Submit Logic
        btnSubmit.setOnClickListener(v -> {
            String phone = etPhone.getText().toString().trim();
            String otp = etOtp.getText().toString().trim();

            // Ensure OTP has been generated
            if (etOtp.getVisibility() != View.VISIBLE) {
                Toast.makeText(this, "Please generate OTP first", Toast.LENGTH_SHORT).show();
                return;
            }

            // Validation for Register Mode
            if (isRegisterMode && etFirstName.getText().toString().trim().isEmpty()) {
                etFirstName.setError("First Name is required");
                return;
            }

            // Indian Phone Number Validation
            if (!phone.matches("[6-9][0-9]{9}")) {
                etPhone.setError("Invalid Indian Phone Number");
                return;
            }

            // OTP Verification
            if (otp.equals(hardcodedOtp)) {
                // Success - Navigate to MainActivity
                startActivity(new Intent(AuthActivity.this, MainActivity.class));
                finish();
            } else {
                etOtp.setError("Wrong OTP. Hint: 1234");
            }
        });
    }

    /**
     * Handles the visual transition between Login and Register tabs.
     */
    private void toggleUI(MaterialButton active, MaterialButton inactive, View fName, View lName, TextView sub, Button submit) {
        // Set active tab to Green with White text
        active.setBackgroundTintList(android.content.res.ColorStateList.valueOf(Color.parseColor("#4CAF50")));
        active.setTextColor(Color.WHITE);

        // Set inactive tab to Transparent with Gray text
        inactive.setBackgroundTintList(android.content.res.ColorStateList.valueOf(Color.TRANSPARENT));
        inactive.setTextColor(Color.parseColor("#666666"));

        // Toggle visibility of Name fields
        fName.setVisibility(isRegisterMode ? View.VISIBLE : View.GONE);
        lName.setVisibility(isRegisterMode ? View.VISIBLE : View.GONE);

        // Update subtext and button labels based on references [cite: 7, 15, 19, 25]
        sub.setText(isRegisterMode ? "Please enter the details to begin." : "Welcome again! Please log in.");
        submit.setText(isRegisterMode ? "Register" : "Login");
    }
}