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

public class AuthActivity extends AppCompatActivity {
    private boolean isRegisterMode = false;
    private String hardcodedOtp = "1234";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_auth);

        // 1. Find Views
        Button btnTabLogin = findViewById(R.id.btnTabLogin);
        Button btnTabRegister = findViewById(R.id.btnTabRegister);
        EditText etFirstName = findViewById(R.id.etFirstName);
        EditText etLastName = findViewById(R.id.etLastName);
        EditText etPhone = findViewById(R.id.etPhone);
        EditText etOtp = findViewById(R.id.etOtp);
        TextView tvAuthSubtext = findViewById(R.id.tvAuthSubtext);
        Button btnSubmit = findViewById(R.id.btnSubmit);

        // 2. Tab Toggle Logic
        btnTabLogin.setOnClickListener(v -> {
            isRegisterMode = false;
            toggleUI(btnTabLogin, btnTabRegister, etFirstName, etLastName, tvAuthSubtext, btnSubmit);
        });

        btnTabRegister.setOnClickListener(v -> {
            isRegisterMode = true;
            toggleUI(btnTabRegister, btnTabLogin, etFirstName, etLastName, tvAuthSubtext, btnSubmit);
        });

        // 3. Submit with Indian Phone Validation
        btnSubmit.setOnClickListener(v -> {
            String phone = etPhone.getText().toString();
            String otp = etOtp.getText().toString();

            if (isRegisterMode && etFirstName.getText().toString().isEmpty()) {
                etFirstName.setError("Required");
                return;
            }

            if (!phone.matches("[6-9][0-9]{9}")) {
                etPhone.setError("Invalid Indian Phone");
                return;
            }

            if (otp.equals(hardcodedOtp)) {
                startActivity(new Intent(this, MainActivity.class));
                finish();
            } else {
                etOtp.setError("Wrong OTP");
            }
        });
    }

    private void toggleUI(Button active, Button inactive, View fName, View lName, TextView sub, Button submit) {
        active.setBackgroundTintList(android.content.res.ColorStateList.valueOf(Color.WHITE));
        active.setTextColor(Color.BLACK);

        inactive.setBackgroundTintList(android.content.res.ColorStateList.valueOf(Color.TRANSPARENT));
        inactive.setTextColor(Color.GRAY);

        fName.setVisibility(isRegisterMode ? View.VISIBLE : View.GONE);
        lName.setVisibility(isRegisterMode ? View.VISIBLE : View.GONE);
        sub.setText(isRegisterMode ? "Please enter details to begin" : "Please log in to continue");
        submit.setText(isRegisterMode ? "Register" : "Login");
    }
}