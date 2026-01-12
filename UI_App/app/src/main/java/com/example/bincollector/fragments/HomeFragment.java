package com.example.bincollector.fragments;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.example.bincollector.R;
import com.example.bincollector.adapters.WardAdapter;
import com.example.bincollector.models.Ward;

import java.util.ArrayList;
import java.util.List;

public class HomeFragment extends Fragment {

    private RecyclerView recyclerView;
    private WardAdapter adapter;
    private List<Ward> wardList;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_home, container, false);

        recyclerView = view.findViewById(R.id.recyclerWards);
        recyclerView.setLayoutManager(new LinearLayoutManager(getContext()));

        // FIX: Initialize the list BEFORE adding data to it
        wardList = new ArrayList<>();

        // Now you can safely add your Ward objects
        // Format: new Ward(WardNumber, TotalBins, PendingBins, isCollected)
        wardList.add(new Ward("Ward 12", 6, 4, false)); // Matches Homepage.pdf [cite: 30, 31, 36]
        wardList.add(new Ward("Ward 14", 5, 0, true));  // Example completed trip [cite: 39]

        adapter = new WardAdapter(wardList, getContext());
        recyclerView.setAdapter(adapter);

        return view;
    }
}