package org.example.datn.config;

import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.example.datn.exception.*;
import org.example.datn.model.ErrorModel;
import org.springframework.context.MessageSource;
import org.springframework.context.NoSuchMessageException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingRequestHeaderException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;

import java.lang.reflect.UndeclaredThrowableException;
import java.util.Locale;

import static org.springframework.http.HttpStatus.*;
import static org.springframework.http.HttpStatus.BAD_REQUEST;

@ControllerAdvice
@Slf4j
public class ExceptionHandlerAdviceConfig {
    private final MessageSource messageSource;

    public ExceptionHandlerAdviceConfig(MessageSource messageSource) {
        this.messageSource = messageSource;
    }

    @ExceptionHandler(NotFoundEntityException.class)
    @ResponseStatus(NOT_FOUND)
    public @ResponseBody ErrorModel notFound(Exception e, Locale locale) {
        return ofErrorModel(NOT_FOUND, e.getMessage(), getTextMessage(e, locale));
    }

//    @ExceptionHandler(ExpiredJwtTokenException.class)
//    @ResponseStatus(GONE)
//    public @ResponseBody ErrorModel expiredToken(Exception e, Locale locale) {
//        log.error(e.getMessage(), e);
//        return ofErrorModel(GONE, e.getMessage(), getTextMessage(e, locale));
//    }

    @ExceptionHandler(DuplicatedException.class)
    @ResponseStatus(CONFLICT)
    public @ResponseBody ErrorModel conflict(Exception e, Locale locale) {
        return ofErrorModel(CONFLICT, e.getMessage(), getTextMessage(e, locale));
    }

    @ExceptionHandler(AccessDeniedException.class)
    @ResponseStatus(value = FORBIDDEN)
    public @ResponseBody ErrorModel forbidden(Exception e, Locale locale) {
        return ofErrorModel(FORBIDDEN, e.getMessage(), getTextMessage(e, locale));
    }

    @ExceptionHandler(org.springframework.security.access.AccessDeniedException.class)
    @ResponseStatus(value = FORBIDDEN)
    public @ResponseBody ErrorModel accesDenied(Exception e, Locale locale) {
        return ofErrorModel(FORBIDDEN, StringUtils.isBlank(e.getMessage()) ? e.getCause().getMessage() : e.getMessage(), "Không có quyền truy cập");
    }

    @ExceptionHandler(LockedException.class)
    @ResponseStatus(value = LOCKED)
    public @ResponseBody ErrorModel locked(Exception e, Locale locale) {
        return ofErrorModel(LOCKED, e.getMessage(), getTextMessage(e, locale));
    }

    @ExceptionHandler({InputInvalidException.class, IllegalArgumentException.class})
    @ResponseStatus(BAD_REQUEST)
    public @ResponseBody ErrorModel notAcceptable(Exception e, Locale locale) {
        return ofErrorModel(BAD_REQUEST, e.getMessage(), getTextMessage(e, locale));
    }

    @ExceptionHandler(ActionNotAllowAttemptException.class)
    @ResponseStatus(NOT_ACCEPTABLE)
    public @ResponseBody ErrorModel notAllowed(Exception e, Locale locale) {
        return ofErrorModel(NOT_ACCEPTABLE, e.getMessage(), getTextMessage(e, locale));
    }

    @ExceptionHandler(NotSupportedException.class)
    @ResponseStatus(INTERNAL_SERVER_ERROR)
    public @ResponseBody ErrorModel notAllowed(NotSupportedException e, Locale locale) {
        return ofErrorModel(INTERNAL_SERVER_ERROR, e.getMessage(), getTextMessage(e, locale));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(BAD_REQUEST)
    public @ResponseBody ErrorModel methodArgumentNotValid(MethodArgumentNotValidException e, Locale locale) {
        var message = (String) null;
        var field = (String) null;
        var fieldError = e.getBindingResult().getFieldError();
        if (fieldError != null) {
            message = fieldError.getDefaultMessage();
            field = fieldError.getField();
        }
        log.warn("Message: {}, Field: {}", message, field);
        return ofErrorModel(BAD_REQUEST, field, getTextMessage(message, locale));
    }

    @ExceptionHandler(MissingRequestHeaderException.class)
    @ResponseStatus(BAD_REQUEST)
    public @ResponseBody ErrorModel missingRequestHeader(MissingRequestHeaderException e, Locale locale) {
        log.error(e.getMessage(), e);
        return ofErrorModel(BAD_REQUEST, e.getHeaderName(), getTextMessage("missing.request-header", locale));
    }

    @ExceptionHandler(Exception.class)
    @ResponseStatus(INTERNAL_SERVER_ERROR)
    public @ResponseBody
    ErrorModel internalChecked(Exception e, Locale locale) {
        log.error(e.getMessage(), e);
        return ofErrorModel(INTERNAL_SERVER_ERROR, null, getTextMessage("internal.error", locale));
    }

    @ExceptionHandler(UndeclaredThrowableException.class)
    @ResponseStatus(BAD_REQUEST)
    public @ResponseBody
    ErrorModel undeclaredThrow(UndeclaredThrowableException e) {
        log.error(e.getMessage(), e);
        return ofErrorModel(BAD_REQUEST, null, e.getUndeclaredThrowable().getMessage());
    }

    private static ErrorModel ofErrorModel(HttpStatus code, String error, String message) {
        return ErrorModel.of(String.valueOf(code.value()), error, message, code.getReasonPhrase());
    }

    private String getTextMessage(Exception exp, Locale locale) {
        return getTextMessage(exp.getMessage(), locale);
    }

    private String getTextMessage(String messageCode, Locale locale) {
        try {
            return messageSource.getMessage(messageCode, null, locale);
        } catch (NoSuchMessageException e) {
            log.warn(e.getMessage());
            return messageCode;
        }
    }
}
