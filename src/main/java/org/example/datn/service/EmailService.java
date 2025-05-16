package org.example.datn.service;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.example.datn.entity.HoaDonChiTiet;
import org.example.datn.model.response.HoaDonChiTietDTO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Component
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class EmailService {

    @Getter
    JavaMailSender emailSender;
    TemplateEngine templateEngine;

    @Value("spring.mail.username")
    @NonFinal
    String fromEmailAddress;

    int OTP_EXPIRED_MIN = 15;

    public void sendResetPasswordEmail(String receiverEmail, String name, String otp) {
        send(receiverEmail, name, otp, "email-forgot-password", "Quên mật khẩu");
    }

    private void send(String receiverEmail, String name, String otp, String emailTemplate, String subject) {
        try {
            var ctx = new Context();
            ctx.setVariable("name", name);
            ctx.setVariable("expiredMin", OTP_EXPIRED_MIN);
            ctx.setVariable("otp", otp);

            var mimeMessage = emailSender.createMimeMessage();
            var message = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            message.setSubject("ZIAZA - " + subject);
            message.setFrom(fromEmailAddress);
            message.setTo(receiverEmail);

            var htmlContent = templateEngine.process(emailTemplate, ctx);
            message.setText(htmlContent, true);

            emailSender.send(mimeMessage);
        } catch (Exception e) {
            log.error("Send register email to: " + receiverEmail + " fail. Exception: " + e.getMessage(), e);
        }
    }
    public void sendOrderSuccessfully(String receiverEmail, String name, List<HoaDonChiTietDTO> hoaDonChiTietList, BigDecimal tongTien, LocalDateTime orderDate) {
        sendOrder(receiverEmail, name, hoaDonChiTietList, tongTien, orderDate, "email-order-successful", "Đặt hàng thành công");
    }


    private void sendOrder(String receiverEmail, String name, List<HoaDonChiTietDTO> hoaDonChiTietList, BigDecimal tongTien, LocalDateTime orderDate, String emailTemplate, String subject) {
        try {
            var ctx = new Context();
            ctx.setVariable("name", name);
            ctx.setVariable("orderDate", orderDate);  // Thêm ngày đặt hàng vào context
            ctx.setVariable("tongTien", tongTien);    // Thêm tổng tiền vào context
            ctx.setVariable("companyName", "ZIAZA");  // Tên công ty
            ctx.setVariable("companyContact", "hoangkhong1211@gmail.com");  // Thông tin liên hệ công ty
            ctx.setVariable("products", hoaDonChiTietList);  // Danh sách các sản phẩm trong đơn hàng

            var mimeMessage = emailSender.createMimeMessage();
            var message = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            message.setSubject("ZIAZA - " + subject);
            message.setFrom(fromEmailAddress);
            message.setTo(receiverEmail);

            var htmlContent = templateEngine.process(emailTemplate, ctx);
            message.setText(htmlContent, true);

            emailSender.send(mimeMessage);
        } catch (Exception e) {
            log.error("Send order confirmation email to: " + receiverEmail + " failed. Exception: " + e.getMessage(), e);
        }
    }


}
