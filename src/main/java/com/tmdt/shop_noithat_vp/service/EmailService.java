package com.tmdt.shop_noithat_vp.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {
    
    @Autowired
    private JavaMailSender mailSender;
    
    @Value("${spring.mail.username}")
    private String fromEmail;
    
    public void sendSimpleEmail(String to, String subject, String text) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(to);
        message.setSubject(subject);
        message.setText(text);
        mailSender.send(message);
    }
    
    public void sendHtmlEmail(String to, String subject, String htmlContent) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        helper.setFrom(fromEmail);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlContent, true);
        mailSender.send(message);
    }
    
    // === ĐÃ SỬA PHẦN NÀY ===
    // Thêm tham số 'name' để email thân thiện hơn
    public void sendVerificationEmail(String to, String name, String token) throws MessagingException {
        // QUAN TRỌNG: Trỏ về Frontend (Port 3000) thay vì Backend
        String verificationUrl = "http://localhost:3000/verify-email?code=" + token;
        
        String htmlContent = "<div style='font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;'>" +
                "<h2 style='color: #007bff;'>Xác thực tài khoản Shop Nội Thất VP</h2>" +
                "<p>Xin chào <strong>" + name + "</strong>,</p>" +
                "<p>Cảm ơn bạn đã đăng ký tài khoản. Vui lòng nhấn vào nút bên dưới để kích hoạt tài khoản của bạn:</p>" +
                "<p><a href=\"" + verificationUrl + "\" style=\"background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;\">Xác thực ngay</a></p>" +
                "<p>Hoặc copy link sau vào trình duyệt:</p>" +
                "<p style='color: #666; font-size: 12px;'>" + verificationUrl + "</p>" +
                "<p>Link này sẽ hết hạn sau 24 giờ.</p>" +
                "</div>";
                
        sendHtmlEmail(to, "Xác thực tài khoản của bạn", htmlContent);
    }
    
    public void sendOrderConfirmationEmail(String to, String orderCode) throws MessagingException {
        String htmlContent = "<h2>Cảm ơn bạn đã đặt hàng!</h2>" +
                "<p>Mã đơn hàng của bạn: <strong>" + orderCode + "</strong></p>" +
                "<p>Chúng tôi sẽ xử lý đơn hàng của bạn sớm nhất có thể.</p>";
        sendHtmlEmail(to, "Xác nhận đơn hàng", htmlContent);
    }
    
    // Sửa luôn cái này cho đồng bộ (trỏ về Frontend)
    public void sendResetPasswordEmail(String to, String token) throws MessagingException {
        // Trỏ về Frontend port 3000
        String resetUrl = "http://localhost:3000/reset-password?token=" + token;
        
        String htmlContent = "<h2>Yêu cầu đặt lại mật khẩu</h2>" +
                "<p>Bạn đã yêu cầu đặt lại mật khẩu. Vui lòng click vào link sau để đặt lại mật khẩu:</p>" +
                "<p><a href=\"" + resetUrl + "\" style=\"background-color: #dc3545; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;\">Đặt lại mật khẩu</a></p>" +
                "<p>Hoặc copy link sau vào trình duyệt:</p>" +
                "<p>" + resetUrl + "</p>" +
                "<p><strong>Lưu ý:</strong> Link này sẽ hết hạn sau 1 giờ.</p>";
        sendHtmlEmail(to, "Đặt lại mật khẩu", htmlContent);
    }
}