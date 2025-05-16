package org.example.datn.contract.decoder;

import feign.Response;
import feign.codec.ErrorDecoder;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import org.example.datn.exception.InputInvalidException;
import org.example.datn.exception.UnknownException;
import org.example.datn.model.ErrorModel;
import org.example.datn.utils.JsonMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;

import java.util.Objects;

@FieldDefaults(level = AccessLevel.PROTECTED, makeFinal = true)
public abstract class AbstractDecoder<T> implements ErrorDecoder {

    Logger log;
    Class<T> clazz;

    public AbstractDecoder(Class<T> clazz) {
        this.log = LoggerFactory.getLogger(getClass());

        this.clazz = clazz;
    }

    @Override
    public Exception decode(String s, Response response) {
        try {
            var errorObj = Objects.requireNonNull(JsonMapper.read(response, clazz));
            var status = HttpStatus.valueOf(response.status());
            switch (status) {
                case BAD_REQUEST:
                    return InputInvalidException.of(badRequest(errorObj));

                default:
                    log.warn("Does not map to an exception. status: {}", status);
                    return UnknownException.of();
            }
        } catch (Exception e) {
            log.warn(e.getMessage());
            log.trace(e.getMessage(), e);
            return UnknownException.of();
        }
    }

    protected abstract ErrorModel badRequest(T error);
}
