package com.example.bincollector.network;

import com.example.bincollector.models.BinUpdateRequest;
import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.POST;

public interface ApiService {
    @POST("bins/update") // Replace with your actual endpoint
    Call<Void> sendBinUpdate(@Body BinUpdateRequest request);
}