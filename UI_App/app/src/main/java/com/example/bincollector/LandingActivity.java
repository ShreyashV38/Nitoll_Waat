package com.example.bincollector;

import android.content.Intent;
import android.os.Bundle;
import android.widget.Button;
import androidx.appcompat.app.AppCompatActivity;

public class LandingActivity extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // 1. Point to your mate's new design
        setContentView(R.layout.activity_start);

        // 2. The ID 'btnGetStarted' is the same in both, so this code still works
        Button btnGetStarted = findViewById(R.id.btnGetStarted);
        btnGetStarted.setOnClickListener(v -> {
            Intent intent = new Intent(LandingActivity.this, AuthActivity.class);
            startActivity(intent);
        });
    }
}