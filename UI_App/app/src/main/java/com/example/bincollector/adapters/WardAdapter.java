package com.example.bincollector.adapters;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import android.widget.Button;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.example.bincollector.R;
import com.example.bincollector.models.Ward;
import com.example.bincollector.MainActivity;

import java.util.List;

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
        // Inflates the white card item_ward.xml design
        View view = LayoutInflater.from(context).inflate(R.layout.item_ward, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        Ward ward = wardList.get(position);

        // Bind data to the modern UI elements as seen in Homepage.pdf
        holder.tvWardName.setText(ward.getWardNo()); // e.g., "Ward 12" [cite: 30]
        holder.tvBinCount.setText("Total bins: " + ward.getTotalBins()); // [cite: 31]

        // Use a dynamic value for pending bins if your model has it, or a placeholder for now
        holder.tvPendingStatus.setText("Pending: " + ward.getPendingBins()); //

        holder.btnOpenMap.setOnClickListener(v -> {
            // Check if context is MainActivity to call fragment switching logic
            if (context instanceof MainActivity) {
                ((MainActivity) context).openMapWithRoute(); // [cite: 32]
            }
        });
    }

    @Override
    public int getItemCount() {
        return wardList.size();
    }

    public static class ViewHolder extends RecyclerView.ViewHolder {
        TextView tvWardName;
        TextView tvBinCount;
        TextView tvPendingStatus; // Matches the new ID in XML
        Button btnOpenMap;

        public ViewHolder(@NonNull View itemView) {
            super(itemView);
            // These IDs must match your item_ward.xml exactly to prevent crashes
            tvWardName = itemView.findViewById(R.id.tvWardName);
            tvBinCount = itemView.findViewById(R.id.tvBinCount);
            tvPendingStatus = itemView.findViewById(R.id.tvPendingStatus); // Fixed the typo from 'Satus'
            btnOpenMap = itemView.findViewById(R.id.btnOpenMap);
        }
    }
}