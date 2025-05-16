package org.example.datn.controller.viewController;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping()
public class ProfileController {
    @GetMapping("/profile")
    public String register() {
        return "customer/profile/profile";
    }
}
