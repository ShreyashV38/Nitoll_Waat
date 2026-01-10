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

        // Mock Data
        wardList = new ArrayList<>();
        wardList.add(new Ward("Ward 01", 15, false));
        wardList.add(new Ward("Ward 02", 8, true));
        wardList.add(new Ward("Ward 03", 20, false));

        adapter = new WardAdapter(wardList, getContext());
        recyclerView.setAdapter(adapter);

        return view;
    }
}