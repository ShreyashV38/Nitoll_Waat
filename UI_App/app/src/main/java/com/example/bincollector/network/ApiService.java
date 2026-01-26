package com.example.bincollector.network;

import com.example.bincollector.models.BinUpdateRequest;
import com.example.bincollector.models.DriverRoute;
import com.example.bincollector.models.DumpingZone;
import com.example.bincollector.models.IgnoreRequest;
import com.example.bincollector.models.LoginRequest;
import com.example.bincollector.models.LoginResponse;
import com.example.bincollector.models.OptimizedRouteResponse;
import com.example.bincollector.models.ProfileResponse;
import com.example.bincollector.models.RegisterRequest;
import com.example.bincollector.models.RouteGenRequest;
import com.example.bincollector.models.VerifyRequest;
import com.example.bincollector.models.VerifyResponse;
import com.example.bincollector.models.VehicleRequest;
import com.example.bincollector.models.Ward;

import java.util.List;

import okhttp3.ResponseBody;
import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.GET;
import retrofit2.http.POST;
import retrofit2.http.Path;

public interface ApiService {

    // 1. Bin Update (Existing)
    @POST("bins/update")
    Call<Void> sendBinUpdate(@Body BinUpdateRequest request);

    // 2. Login (Email + Pass -> Sends OTP)
    @POST("auth/login")
    Call<LoginResponse> login(@Body LoginRequest request);

    // 3. Register (Name + Email + Pass + Role='DRIVER')
    @POST("auth/register")
    Call<LoginResponse> register(@Body RegisterRequest request);

    // 4. Verify OTP (Email + OTP -> Returns Token)
    @POST("auth/verify")
    Call<VerifyResponse> verifyOtp(@Body VerifyRequest request);

    @POST("fleet/register")
    Call<LoginResponse> registerVehicle(@Body VehicleRequest request);

    @GET("wards/stats")
    Call<List<Ward>> getWardStats();

    @GET("fleet/driver/active")
    Call<DriverRoute> getMyRoute();

    @GET("auth/profile")
    Call<ProfileResponse> getProfile();

    @GET("dumping-zones") // Ensure this endpoint exists or create it in dumpingZoneController
    Call<List<DumpingZone>> getDumpingZones();

    @POST("fleet/driver/generate-route")
    Call<OptimizedRouteResponse> generateRoute(@Body RouteGenRequest request);

    @POST("fleet/driver/ignore-bin")
    Call<ResponseBody> ignoreBin(@Body IgnoreRequest request);

    //to test predictions
    @GET("fleet/bins/need-collection")
    Call<ResponseBody> getBinsNeedingCollection();

    @POST("/api/bins/{id}/collect")
    Call<ResponseBody> collectBin(@Path("id") String binId);

}