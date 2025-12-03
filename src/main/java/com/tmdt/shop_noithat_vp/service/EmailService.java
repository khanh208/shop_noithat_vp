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
    
    public void sendVerificationEmail(String to, String token) throws MessagingException {
        String verificationUrl = "http://localhost:8080/auth/verify?token=" + token;
        String htmlContent = "<h2>Xác thực email của bạn</h2>" +
                "<p>Vui lòng click vào link sau để xác thực email:</p>" +
                "<a href=\"" + verificationUrl + "\">" + verificationUrl + "</a>";
        sendHtmlEmail(to, "Xác thực email", htmlContent);
    }
    
    public void sendOrderConfirmationEmail(String to, String orderCode) throws MessagingException {
        String htmlContent = "<h2>Cảm ơn bạn đã đặt hàng!</h2>" +
                "<p>Mã đơn hàng của bạn: <strong>" + orderCode + "</strong></p>" +
                "<p>Chúng tôi sẽ xử lý đơn hàng của bạn sớm nhất có thể.</p>";
        sendHtmlEmail(to, "Xác nhận đơn hàng", htmlContent);
    }
    
    public void sendResetPasswordEmail(String to, String token) throws MessagingException {
        String resetUrl = "http://localhost:8080/auth/reset-password?token=" + token;
        String htmlContent = "<h2>Yêu cầu đặt lại mật khẩu</h2>" +
                "<p>Bạn đã yêu cầu đặt lại mật khẩu. Vui lòng click vào link sau để đặt lại mật khẩu:</p>" +
                "<p><a href=\"" + resetUrl + "\" style=\"background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;\">Đặt lại mật khẩu</a></p>" +
                "<p>Hoặc copy link sau vào trình duyệt:</p>" +
                "<p>" + resetUrl + "</p>" +
                "<p><strong>Lưu ý:</strong> Link này sẽ hết hạn sau 1 giờ. Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>";
        sendHtmlEmail(to, "Đặt lại mật khẩu", htmlContent);
    }
}

