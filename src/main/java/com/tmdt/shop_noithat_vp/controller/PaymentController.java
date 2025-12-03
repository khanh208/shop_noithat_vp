package com.tmdt.shop_noithat_vp.controller;

import com.tmdt.shop_noithat_vp.model.Payment;
import com.tmdt.shop_noithat_vp.service.PaymentService;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/payment")
public class PaymentController {
    
    @Autowired
    private PaymentService paymentService;
    
    @PostMapping("/momo/create/{orderId}")
    public ResponseEntity<Payment> createMoMoPayment(@PathVariable Long orderId) {
        try {
            Payment payment = paymentService.createMoMoPayment(orderId);
            return ResponseEntity.ok(payment);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/callback")
    public String handleMoMoCallback(
            @RequestParam(required = false) String orderId,
            @RequestParam(required = false) String resultCode,
            @RequestParam(required = false) String message) {
        // Handle redirect from MoMo
        if ("0".equals(resultCode)) {
            return "redirect:/orders?status=success";
        } else {
            return "redirect:/orders?status=failed&message=" + message;
        }
    }
    
    @PostMapping("/webhook")
    public ResponseEntity<String> handleMoMoWebhook(@RequestBody Map<String, Object> callbackData) {
        try {
            JSONObject jsonObject = new JSONObject(callbackData);
            paymentService.handleMoMoCallback(jsonObject);
            return ResponseEntity.ok("OK");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error processing webhook");
        }
    }
}



