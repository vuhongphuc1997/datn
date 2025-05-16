package org.example.datn.config;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.example.datn.entity.User;
import org.example.datn.model.enums.UserRoles;
import org.example.datn.repository.UserRepository;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ApplicationInitConfig {

    PasswordEncoder passwordEncoder;
    AdminProperties adminProperties;

    @Bean
    @ConditionalOnProperty(
            prefix = "spring",
            value = "datasource.driverClassName",
            havingValue = "com.microsoft.sqlserver.jdbc.SQLServerDriver")
    ApplicationRunner applicationRunner(UserRepository userRepository) {
        log.info("Initializing application.....");
        return args -> {
            if (userRepository.findByUserName(adminProperties.getUsername()).isEmpty()) {
                User user = User.builder()
                        .userName(adminProperties.getUsername())
                        .password(passwordEncoder.encode(adminProperties.getPassword()))
                        .role(UserRoles.ADMIN)
                        .build();

                userRepository.save(user);
                log.warn("Admin user has been created with configured credentials");
            }
            log.info("Application initialization completed .....");
        };
    }
}
