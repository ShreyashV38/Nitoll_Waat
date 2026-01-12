package com.example.bincollector;

import android.content.Intent;
import android.os.Bundle;
import com.google.android.material.button.MaterialButton; // Update this
import androidx.appcompat.app.AppCompatActivity;

public class LandingActivity extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_start);

        // Cast to MaterialButton for modern styling access
        MaterialButton btnGetStarted = findViewById(R.id.btnGetStarted);

        btnGetStarted.setOnClickListener(v -> {
            Intent intent = new Intent(LandingActivity.this, AuthActivity.class);
            startActivity(intent);
            // Add a smooth transition
            overridePendingTransition(android.R.anim.fade_in, android.R.anim.fade_out);
        });
    }
}