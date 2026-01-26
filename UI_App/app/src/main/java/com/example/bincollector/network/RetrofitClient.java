package com.example.bincollector.network;

import android.content.Context;
import android.content.SharedPreferences;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;

public class RetrofitClient {
    // ⚠️ DOUBLE CHECK THIS IP matches your server!
    private static final String BASE_URL = "http://10.135.254.166:5000/api/";

    // 1. Authenticated Client (Sends Token)
    // Use this for Profile, Home, and anything requiring login
    public static ApiService getApiService(Context context) {
        OkHttpClient client = new OkHttpClient.Builder().addInterceptor(chain -> {
            Request original = chain.request();

            SharedPreferences prefs = context.getSharedPreferences("BinCollectorSession", Context.MODE_PRIVATE);
            // FIX: Changed "TOKEN" to "ACCESS_TOKEN" to match AuthActivity
            String token = prefs.getString("ACCESS_TOKEN", null);

            Request.Builder builder = original.newBuilder();
            if (token != null) {
                builder.header("Authorization", "Bearer " + token);
            }

            return chain.proceed(builder.build());
        }).build();

        Retrofit retrofit = new Retrofit.Builder()
                .baseUrl(BASE_URL)
                .client(client)
                .addConverterFactory(GsonConverterFactory.create())
                .build();

        return retrofit.create(ApiService.class);
    }

    // 2. Public Client (No Token needed)
    // Use ONLY for Login/Register
    public static ApiService getApiService() {
        Retrofit retrofit = new Retrofit.Builder()
                .baseUrl(BASE_URL)
                .addConverterFactory(GsonConverterFactory.create())
                .build();
        return retrofit.create(ApiService.class);
    }
}