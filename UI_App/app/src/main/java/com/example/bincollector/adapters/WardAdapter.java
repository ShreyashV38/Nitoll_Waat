package com.example.bincollector.adapters;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.CheckBox;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.example.bincollector.R;
import com.example.bincollector.models.Ward;
import java.util.List;
import com.example.bincollector.MainActivity;

public class WardAdapter extends RecyclerView.Adapter<WardAdapter.ViewHolder> {

    private List<Ward> wardList;
    private Context context;

    public WardAdapter(List<Ward> wardList, Context context) {
        this.wardList = wardList;
        this.context = context;
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(context).inflate(R.layout.item_ward, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        Ward ward = wardList.get(position);
        holder.tvWard.setText(ward.getWardNo());
        holder.cbCollected.setChecked(ward.isCollected());

        holder.tvOpenMap.setOnClickListener(v -> {
            // This checks if the context is the MainActivity so we can call its methods
            if (context instanceof MainActivity) {
                ((MainActivity) context).openMapWithRoute();
            }
        });

        // Handle checkbox logic here later
    }

    @Override
    public int getItemCount() {
        return wardList.size(); // This fixes the "does not override getItemCount" error
    }

    // This MUST be inside the WardAdapter class braces to fix "cannot find symbol"
    public static class ViewHolder extends RecyclerView.ViewHolder {
        TextView tvWard;
        CheckBox cbCollected;
        TextView tvOpenMap;

        public ViewHolder(@NonNull View itemView) {
            super(itemView);
            tvWard = itemView.findViewById(R.id.tvWard);
            cbCollected = itemView.findViewById(R.id.cbCollected);
            tvOpenMap = itemView.findViewById(R.id.tvOpenMap);
        }
    }
}