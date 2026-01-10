package com.example.bincollector.fragments;

import android.content.Intent;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.EditText;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;

import com.example.bincollector.LandingActivity;
import com.example.bincollector.R;

public class ProfileFragment extends Fragment {

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_profile, container, false);

        // Updated IDs from the new layout
        EditText etName = view.findViewById(R.id.etProfileName);
        EditText etPhone = view.findViewById(R.id.etProfilePhone);
        Button btnLogout = view.findViewById(R.id.btnLogout);

        // Mock User Data
        // Tip: Later we can fetch this from SharedPreferences
        etName.setText("John Doe");
        etPhone.setText("+91 9876543210");

        btnLogout.setOnClickListener(v -> {
            // Navigate back to LandingActivity and clear the backstack
            Intent intent = new Intent(getActivity(), LandingActivity.class);
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
            startActivity(intent);
        });

        return view;
    }
}