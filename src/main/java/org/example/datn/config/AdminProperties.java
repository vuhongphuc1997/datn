package org.example.datn.config;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@ConfigurationProperties(prefix = "app.admin")
@Configuration
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
class AdminProperties {
    private String username = "admin";
    private String password = "admin";
}
