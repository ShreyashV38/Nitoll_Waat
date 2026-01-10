package com.example.bincollector;

import android.os.Bundle;
import androidx.appcompat.widget.SwitchCompat; // Change Switch to SwitchCompat
import com.google.android.material.button.MaterialButton; // Change Button to MaterialButton
import androidx.appcompat.app.AppCompatActivity;
import android.content.Intent;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import androidx.appcompat.widget.SwitchCompat;
public class AuthActivity extends AppCompatActivity {
    private String generatedOtp = "1234";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_auth);

        SwitchCompat switchAuth = findViewById(R.id.switchAuth);
        EditText etFirstName = findViewById(R.id.etFirstName);
        EditText etLastName = findViewById(R.id.etLastName);
        EditText etOtp = findViewById(R.id.etOtp);
        Button btnSubmit = findViewById(R.id.btnSubmit);

        // Toggle Visibility in Java
        switchAuth.setOnCheckedChangeListener((buttonView, isChecked) -> {
            int visibility = isChecked ? View.VISIBLE : View.GONE;
            etFirstName.setVisibility(visibility);
            etLastName.setVisibility(visibility);
        });

        btnSubmit.setOnClickListener(v -> {
            if (etOtp.getText().toString().equals(generatedOtp)) {
                // Redirect to the NEW MainActivity (the one with Bottom Nav)
                Intent intent = new Intent(AuthActivity.this, MainActivity.class);
                startActivity(intent);
                finish();
            }
        });
    }
}