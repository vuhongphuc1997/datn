package org.example.datn.contract;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;
import org.example.datn.contract.decoder.FacebookDecoder;
import org.example.datn.exception.CommonException;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "FacebookServiceClient", url = "${env.facebook.url}", configuration = {FacebookDecoder.class})
public interface FacebookServiceClient {

    @GetMapping("/me?fields=id%2Cname%2Cemail")
    FbUser getInfo(@RequestParam("access_token") String accessToken) throws CommonException;

    @Getter
    @Setter
    @FieldDefaults(level = AccessLevel.PRIVATE)
    class FbUser {
        String id;
        String name;
        String email;
    }

    @Getter @Setter
    @FieldDefaults(level = AccessLevel.PRIVATE)
    class FbError {
        FbErrorDetail error;
    }

    @Getter @Setter
    @FieldDefaults(level = AccessLevel.PRIVATE)
    class FbErrorDetail {
        String message, type;
        Integer code;
        @JsonProperty("fbtrace_id")
        String fbTraceId;
    }
}

