package com.tmdt.shop_noithat_vp.util;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.UUID;

@Component
public class MoMoUtil {
    
    @Value("${momo.partnerCode}")
    private String partnerCode;
    
    @Value("${momo.accessKey}")
    private String accessKey;
    
    @Value("${momo.secretKey}")
    private String secretKey;
    
    @Value("${momo.apiEndpoint}")
    private String apiEndpoint;
    
    @Value("${momo.redirectUrl}")
    private String redirectUrl;
    
    @Value("${momo.ipnUrl}")
    private String ipnUrl;
    
    public String generateRequestId() {
        return UUID.randomUUID().toString();
    }
    
    public String generateSignature(String accessKey, String partnerCode, String requestId, 
                                   String orderId, String amount, String orderInfo, 
                                   String returnUrl, String notifyUrl, String extraData) 
            throws NoSuchAlgorithmException, InvalidKeyException {
        String rawHash = "accessKey=" + accessKey +
                        "&amount=" + amount +
                        "&extraData=" + extraData +
                        "&ipnUrl=" + notifyUrl +
                        "&orderId=" + orderId +
                        "&orderInfo=" + orderInfo +
                        "&partnerCode=" + partnerCode +
                        "&redirectUrl=" + returnUrl +
                        "&requestId=" + requestId +
                        "&requestType=captureWallet";
        
        Mac mac = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKeySpec = new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        mac.init(secretKeySpec);
        byte[] hashBytes = mac.doFinal(rawHash.getBytes(StandardCharsets.UTF_8));
        
        StringBuilder hexString = new StringBuilder();
        for (byte b : hashBytes) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) {
                hexString.append('0');
            }
            hexString.append(hex);
        }
        return hexString.toString();
    }
    
    public String getPartnerCode() {
        return partnerCode;
    }
    
    public String getAccessKey() {
        return accessKey;
    }
    
    public String getSecretKey() {
        return secretKey;
    }
    
    public String getApiEndpoint() {
        return apiEndpoint;
    }
    
    public String getRedirectUrl() {
        return redirectUrl;
    }
    
    public String getIpnUrl() {
        return ipnUrl;
    }
}



