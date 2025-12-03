package com.tmdt.shop_noithat_vp.service;

import com.tmdt.shop_noithat_vp.model.Order;
import com.tmdt.shop_noithat_vp.model.Payment;
import com.tmdt.shop_noithat_vp.model.enums.PaymentStatus;
import com.tmdt.shop_noithat_vp.repository.OrderRepository;
import com.tmdt.shop_noithat_vp.repository.PaymentRepository;
import com.tmdt.shop_noithat_vp.util.MoMoUtil;
import org.apache.hc.client5.http.classic.methods.HttpPost;
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.CloseableHttpResponse;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.core5.http.io.entity.StringEntity;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;

@Service
public class PaymentService {
    
    @Autowired
    private PaymentRepository paymentRepository;
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private MoMoUtil moMoUtil;
    
    @Transactional
    public Payment createMoMoPayment(Long orderId) throws Exception {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        
        String requestId = moMoUtil.generateRequestId();
        String orderIdStr = order.getOrderCode();
        String amount = String.valueOf(order.getTotalAmount().longValue());
        String orderInfo = "Thanh toan don hang " + order.getOrderCode();
        String returnUrl = moMoUtil.getRedirectUrl();
        String notifyUrl = moMoUtil.getIpnUrl();
        String extraData = "";
        
        String signature = moMoUtil.generateSignature(
            moMoUtil.getAccessKey(),
            moMoUtil.getPartnerCode(),
            requestId,
            orderIdStr,
            amount,
            orderInfo,
            returnUrl,
            notifyUrl,
            extraData
        );
        
        JSONObject requestBody = new JSONObject();
        requestBody.put("partnerCode", moMoUtil.getPartnerCode());
        requestBody.put("partnerName", "Shop Noi That VP");
        requestBody.put("storeId", "MomoTestStore");
        requestBody.put("requestId", requestId);
        requestBody.put("amount", amount);
        requestBody.put("orderId", orderIdStr);
        requestBody.put("orderInfo", orderInfo);
        requestBody.put("redirectUrl", returnUrl);
        requestBody.put("ipnUrl", notifyUrl);
        requestBody.put("lang", "vi");
        requestBody.put("extraData", extraData);
        requestBody.put("requestType", "captureWallet");
        requestBody.put("signature", signature);
        
        // Call MoMo API
        CloseableHttpClient httpClient = HttpClients.createDefault();
        HttpPost httpPost = new HttpPost(moMoUtil.getApiEndpoint());
        httpPost.setHeader("Content-Type", "application/json");
        httpPost.setEntity(new StringEntity(requestBody.toString(), StandardCharsets.UTF_8));
        
        CloseableHttpResponse response = httpClient.execute(httpPost);
        BufferedReader reader = new BufferedReader(
            new InputStreamReader(response.getEntity().getContent(), StandardCharsets.UTF_8));
        StringBuilder result = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) {
            result.append(line);
        }
        
        JSONObject responseJson = new JSONObject(result.toString());
        
        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setRequestId(requestId);
        payment.setTransactionId(responseJson.optString("transId", null));
        payment.setAmount(order.getTotalAmount());
        payment.setPartnerCode(moMoUtil.getPartnerCode());
        payment.setPaymentMethod("MOMO");
        payment.setPaymentStatus(PaymentStatus.PENDING);
        payment.setPayUrl(responseJson.optString("payUrl", null));
        payment.setMessage(responseJson.optString("message", null));
        payment.setResponseTime(responseJson.optLong("responseTime", 0));
        payment.setSignature(responseJson.optString("signature", null));
        
        payment = paymentRepository.save(payment);
        
        return payment;
    }
    
    @Transactional
    public void handleMoMoCallback(JSONObject callbackData) {
        String orderId = callbackData.getString("orderId");
        String resultCode = callbackData.getString("resultCode");
        String transId = callbackData.getString("transId");
        
        Payment payment = paymentRepository.findByRequestId(callbackData.getString("requestId"))
                .orElseThrow(() -> new RuntimeException("Payment not found"));
        
        Order order = payment.getOrder();
        
        payment.setCallbackData(callbackData.toString());
        payment.setTransactionId(transId);
        
        if ("0".equals(resultCode)) {
            payment.setPaymentStatus(PaymentStatus.SUCCESS);
            order.setPaymentStatus(com.tmdt.shop_noithat_vp.model.enums.PaymentStatus.SUCCESS);
            order.setOrderStatus(com.tmdt.shop_noithat_vp.model.enums.OrderStatus.CONFIRMED);
        } else {
            payment.setPaymentStatus(PaymentStatus.FAILED);
            order.setPaymentStatus(com.tmdt.shop_noithat_vp.model.enums.PaymentStatus.FAILED);
        }
        
        paymentRepository.save(payment);
        orderRepository.save(order);
    }
}

